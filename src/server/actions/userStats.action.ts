"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "./requireAuth";
import { unstable_cache, revalidateTag } from "next/cache";

export type UserStatsData = {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: Date | null;
    totalMinutes: number;
    totalSessions: number;
    weeklyMinutes: number;
    studyDays: number;
};

/**
 * Recalcula e persiste as métricas de um usuário na tabela `UserStats`.
 *
 * Estratégia de performance:
 *  - 3 queries paralelas pequenas (aggregates + distinct dates) em vez de 1 query massiva.
 *  - O streak é calculado iterando sobre datas únicas (máx. ~3650 itens para 10 anos).
 *  - Deve ser chamado APENAS durante mutações de StudyLog (create / update / delete).
 *  - NUNCA chamado em tempo de request de leitura (dashboard, perfil, etc.).
 */
export async function recomputeUserStats(userId: string): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Início da semana corrente (segunda-feira, baseado em UTC)
    const dayOfWeek = today.getUTCDay(); // 0=Dom, 1=Seg, ..., 6=Sáb
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today.getTime() - daysFromMonday * 86400000);

    // 3 queries em paralelo — cada uma é pequena e direcionada
    const [totals, weeklyAgg, distinctDays] = await Promise.all([
        // Aggregate all-time: um único scan de agragação, sem trazer linhas para memória
        prisma.studyLogs.aggregate({
            where: { topic: { subject: { userId } } },
            _sum: { duration_minutes: true },
            _count: { id: true },
        }),
        // Aggregate da semana corrente
        prisma.studyLogs.aggregate({
            where: {
                topic: { subject: { userId } },
                study_date: { gte: weekStart, lte: today },
            },
            _sum: { duration_minutes: true },
        }),
        // Datas únicas ordenadas DESC — usado para streak e contagem de dias.
        // Payload mínimo: apenas 1 campo Date por dia único (max ~3650 linhas para 10 anos).
        prisma.studyLogs.findMany({
            where: { topic: { subject: { userId } } },
            select: { study_date: true },
            distinct: ["study_date"],
            orderBy: { study_date: "desc" },
        }),
    ]);

    const studyDays = distinctDays.length;
    const lastStudyDate = distinctDays[0]?.study_date ?? null;

    // Calcular streak: iterar de hoje para trás nas datas únicas
    // O Set de timestamps torna a busca O(1) por dia
    const dayTimes = new Set(distinctDays.map((d) => d.study_date.getTime()));
    const msInDay = 86400000;
    let currentStreak = 0;

    for (let i = 0; i < 3650; i++) {
        const dTime = today.getTime() - i * msInDay;
        if (dayTimes.has(dTime)) {
            currentStreak++;
        } else if (i === 0) {
            // Ainda não estudou hoje — não quebra a ofensiva
        } else {
            break; // Gap encontrado — ofensiva termina aqui
        }
    }

    // Calcular longestStreak de todo o histórico!
    let allTimeLongestStreak = 0;
    if (distinctDays.length > 0) {
        let tempStreak = 1;
        allTimeLongestStreak = 1;
        for (let i = 0; i < distinctDays.length - 1; i++) {
            const current = distinctDays[i].study_date.getTime();
            const prev = distinctDays[i + 1].study_date.getTime(); // prev in time because array is DESC
            if (current - prev === msInDay) {
                tempStreak++;
                if (tempStreak > allTimeLongestStreak) {
                    allTimeLongestStreak = tempStreak;
                }
            } else {
                tempStreak = 1;
            }
        }
    }

    // longestStreak é o máximo entre a ofensiva atual, a maior ofensiva histórica e o recorde salvo.
    const currentRecord = await prisma.userStats.findUnique({
        where: { userId },
        select: { longestStreak: true },
    });
    const longestStreak = Math.max(currentStreak, allTimeLongestStreak, currentRecord?.longestStreak ?? 0);

    await prisma.userStats.upsert({
        where: { userId },
        create: {
            userId,
            currentStreak,
            longestStreak,
            lastStudyDate,
            totalMinutes: totals._sum.duration_minutes ?? 0,
            totalSessions: totals._count.id ?? 0,
            weeklyMinutes: weeklyAgg._sum.duration_minutes ?? 0,
            studyDays,
        },
        update: {
            currentStreak,
            longestStreak,
            lastStudyDate,
            totalMinutes: totals._sum.duration_minutes ?? 0,
            totalSessions: totals._count.id ?? 0,
            weeklyMinutes: weeklyAgg._sum.duration_minutes ?? 0,
            studyDays,
        },
    });

    // Invalida o cache do Next.js para este usuário
    revalidateTag(`user-stats-${userId}`, "max");
}

/**
 * Action pública e cacheada: lê um único registro de `UserStats`.
 * Custo: O(1) — lookup por chave primária (userId).
 * Usado pelo Dashboard, Perfil e qualquer componente que precise de métricas.
 */
export async function getUserStatsAction(): Promise<UserStatsData> {
    const user = await requireAuth();

    return unstable_cache(
        async () => {
            let stats = await prisma.userStats.findUnique({
                where: { userId: user.id },
            });

            // Lazy Initialization: Se for um usuário antigo sem UserStats, calculamos na hora
            if (!stats) {
                await recomputeUserStats(user.id);
                stats = await prisma.userStats.findUnique({
                    where: { userId: user.id },
                });
                
                // Fallback de segurança se o usuário literalmente não tiver logs
                if (!stats) {
                    return {
                        currentStreak: 0,
                        longestStreak: 0,
                        lastStudyDate: null,
                        totalMinutes: 0,
                        totalSessions: 0,
                        weeklyMinutes: 0,
                        studyDays: 0,
                    };
                }
            }

            return {
                currentStreak: stats.currentStreak,
                longestStreak: stats.longestStreak,
                lastStudyDate: stats.lastStudyDate,
                totalMinutes: stats.totalMinutes,
                totalSessions: stats.totalSessions,
                weeklyMinutes: stats.weeklyMinutes,
                studyDays: stats.studyDays,
            };
        },
        [`user-stats-${user.id}`],
        { tags: [`user-stats-${user.id}`] }
    )();
}
