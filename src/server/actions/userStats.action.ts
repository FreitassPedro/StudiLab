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
 * Recalcula e persiste as métricas de um usuário nas tabelas `UserDailyStats` e `UserStats`.
 *
 * Estratégia:
 *  - BACKFILL (one-time): Se o usuário não tiver nenhum UserDailyStats, agrega todos os logs
 *    de uma vez usando groupBy no banco e insere via createMany.
 *  - SYNC INCREMENTAL: Para as datas modificadas, faz 1 groupBy em batch e N upserts em paralelo
 *    (Promise.all). Elimina totalmente queries dentro de loop.
 *  - GLOBAL STATS: 4 queries em Promise.all — zero queries sequenciais.
 *  - STREAK: Limitado a 400 dias. Streak > 1 ano é impossível de quebrar, não precisa de 10 anos.
 */
export async function recomputeUserStats(userId: string, modifiedDates: Date[] = []): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // ── 1. BACKFILL (executado no máximo uma vez por usuário) ────────────────────
    // Quando modifiedDates está preenchido, a chamada veio de um CRUD — o usuário já
    // tem UserDailyStats. O findFirst é desnecessário nesse caminho.
    const needsBackfillCheck = modifiedDates.length === 0;
    const hasDailyStats = needsBackfillCheck
        ? await prisma.userDailyStats.findFirst({ where: { userId }, select: { id: true } })
        : true;

    if (!hasDailyStats) {
        // Agrega todos os logs no banco via groupBy — sem trazer linhas para a memória JS.
        const allDayAggregates = await prisma.studyLogs.groupBy({
            by: ["study_date"],
            where: { topic: { subject: { userId } } },
            _sum: { duration_minutes: true },
            _count: { id: true },
        });

        if (allDayAggregates.length > 0) {
            await prisma.userDailyStats.createMany({
                data: allDayAggregates.map((a) => ({
                    userId,
                    date: a.study_date,
                    totalMinutes: a._sum.duration_minutes ?? 0,
                    sessions: a._count.id,
                })),
                skipDuplicates: true,
            });
        }
    }

    // ── 2. SYNC INCREMENTAL das datas modificadas ────────────────────────────────
    // Agora: 1 groupBy em batch + N operações em Promise.all (paralelas).
    if (modifiedDates.length > 0) {
        // Deduplica as datas para evitar redundância
        const uniqueDateTimes = Array.from(new Set(modifiedDates.map((d) => d.getTime())));
        const uniqueDates = uniqueDateTimes.map((t) => new Date(t));

        // Uma única query agrega todos os dias de uma vez
        const batchAgg = await prisma.studyLogs.groupBy({
            by: ["study_date"],
            where: {
                topic: { subject: { userId } },
                study_date: { in: uniqueDates },
            },
            _sum: { duration_minutes: true },
            _count: { id: true },
        });

        // Mapa de timestamp → resultado para O(1) lookup
        const aggByTime = new Map(batchAgg.map((r) => [r.study_date.getTime(), r]));

        // Todos os upserts/deletes em paralelo — sem loop serial
        await Promise.all(
            uniqueDates.map((d) => {
                const found = aggByTime.get(d.getTime());
                if (!found || found._count.id === 0) {
                    // Nenhum log sobrou neste dia — remove a linha
                    return prisma.userDailyStats.deleteMany({ where: { userId, date: d } });
                }
                return prisma.userDailyStats.upsert({
                    where: { userId_date: { userId, date: d } },
                    create: {
                        userId,
                        date: d,
                        totalMinutes: found._sum.duration_minutes ?? 0,
                        sessions: found._count.id,
                    },
                    update: {
                        totalMinutes: found._sum.duration_minutes ?? 0,
                        sessions: found._count.id,
                    },
                });
            })
        );
    }

    // ── 3. RECALCULAR GLOBAIS — 4 queries em paralelo, zero queries sequenciais ──
    const dayOfWeek = today.getUTCDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today.getTime() - daysFromMonday * 86400000);

    const [totals, recentDays, currentRecord] = await Promise.all([
        // Totais históricos completos — 1 aggregate scan na tabela pequena
        prisma.userDailyStats.aggregate({
            where: { userId },
            _sum: { totalMinutes: true, sessions: true },
            _count: { id: true },
        }),
        // Dias para calcular streak — limitado a 400 (>1 ano, prático o suficiente)
        // totalMinutes incluído para calcular weeklyMinutes sem query extra
        prisma.userDailyStats.findMany({
            where: { userId },
            select: { date: true, totalMinutes: true },
            orderBy: { date: "desc" },
            take: 400,
        }),
        // Recorde histórico — folded no Promise.all, era query serial separada antes
        prisma.userStats.findUnique({
            where: { userId },
            select: { longestStreak: true },
        }),
    ]);

    const weeklyMinutes = recentDays
        .filter((d) => d.date >= weekStart && d.date <= today)
        .reduce((sum, d) => sum + d.totalMinutes, 0);

    const studyDays = totals._count.id ?? 0;
    const lastStudyDate = recentDays[0]?.date ?? null;

    // ── 4. CALCULAR STREAK ────────────────────────────────────────────────────────
    const dayTimes = new Set(recentDays.map((d) => d.date.getTime()));
    const msInDay = 86400000;
    let currentStreak = 0;

    for (let i = 0; i < recentDays.length + 1; i++) {
        const dTime = today.getTime() - i * msInDay;
        if (dayTimes.has(dTime)) {
            currentStreak++;
        } else if (i === 0) {
            // Ainda não estudou hoje — não quebra a ofensiva, testa ontem
        } else {
            break;
        }
    }

    let allTimeLongestStreak = 0;
    if (recentDays.length > 0) {
        let tempStreak = 1;
        allTimeLongestStreak = 1;
        for (let i = 0; i < recentDays.length - 1; i++) {
            const curr = recentDays[i].date.getTime();
            const prev = recentDays[i + 1].date.getTime();
            if (curr - prev === msInDay) {
                tempStreak++;
                if (tempStreak > allTimeLongestStreak) allTimeLongestStreak = tempStreak;
            } else {
                tempStreak = 1;
            }
        }
    }

    const longestStreak = Math.max(currentStreak, allTimeLongestStreak, currentRecord?.longestStreak ?? 0);

    // ── 5. PERSISTIR ──────────────────────────────────────────────────────────────
    await prisma.userStats.upsert({
        where: { userId },
        create: {
            userId,
            currentStreak,
            longestStreak,
            lastStudyDate,
            totalMinutes: totals._sum.totalMinutes ?? 0,
            totalSessions: totals._sum.sessions ?? 0,
            weeklyMinutes,
            studyDays,
        },
        update: {
            currentStreak,
            longestStreak,
            lastStudyDate,
            totalMinutes: totals._sum.totalMinutes ?? 0,
            totalSessions: totals._sum.sessions ?? 0,
            weeklyMinutes,
            studyDays,
        },
    });

    revalidateTag(`user-stats-${userId}`, "max");
}

// ── Action pública cacheada: O(1) lookup em UserStats ────────────────────────
// Fix: extraída como função nomeada para evitar criar closure nova a cada request.
const buildCachedUserStats = (userId: string) =>
    unstable_cache(
        async (): Promise<UserStatsData> => {
            const stats = await prisma.userStats.findUnique({ where: { userId } });

            // Lazy init + auto-backfill: Se UserStats não existe, o usuário é "antigo" (pré-rollup).
            // Triggera o backfill completo de UserDailyStats e recomputa os globais antes de retornar.
            if (!stats) {
                // Verifica se o usuário tem algum log (para diferenciar "nunca estudou" de "usuário antigo")
                const hasAnyLog = await prisma.studyLogs.findFirst({
                    where: { topic: { subject: { userId } } },
                    select: { id: true },
                });

                if (hasAnyLog) {
                    // Usuário antigo sem rollup — triggera backfill e recompute silenciosamente
                    await recomputeUserStats(userId);
                    const freshStats = await prisma.userStats.findUnique({ where: { userId } });
                    if (freshStats) {
                        return {
                            currentStreak: freshStats.currentStreak,
                            longestStreak: freshStats.longestStreak,
                            lastStudyDate: freshStats.lastStudyDate,
                            totalMinutes: freshStats.totalMinutes,
                            totalSessions: freshStats.totalSessions,
                            weeklyMinutes: freshStats.weeklyMinutes,
                            studyDays: freshStats.studyDays,
                        };
                    }
                }

                // Novo usuário sem logs
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
        [`user-stats-${userId}`],
        { tags: [`user-stats-${userId}`] }
    );

export async function getUserStatsAction(): Promise<UserStatsData> {
    const user = await requireAuth();
    return buildCachedUserStats(user.id)();
}

/**
 * Preenche a tabela UserDailyStats para usuários antigos que ainda não têm dados lá.
 * Pode ser chamada explicitamente pelo usuário ou na inicialização do app.
 * É idempotente — não duplica dados graças ao skipDuplicates.
 *
 * Retorna: { inserted: number, alreadyUpToDate: boolean }
 */
export async function backfillUserDailyStatsAction(): Promise<{ inserted: number; alreadyUpToDate: boolean }> {
    const user = await requireAuth();
    const userId = user.id;

    // Verifica se já existe algum dado
    const hasDailyStats = await prisma.userDailyStats.findFirst({
        where: { userId },
        select: { id: true },
    });

    if (hasDailyStats) {
        return { inserted: 0, alreadyUpToDate: true };
    }

    // Agrega todos os logs no banco via groupBy — zero processamento em JS
    const allDayAggregates = await prisma.studyLogs.groupBy({
        by: ["study_date"],
        where: { topic: { subject: { userId } } },
        _sum: { duration_minutes: true },
        _count: { id: true },
    });

    if (allDayAggregates.length === 0) {
        return { inserted: 0, alreadyUpToDate: false };
    }
    

    const result = await prisma.userDailyStats.createMany({
        data: allDayAggregates.map((a) => ({
            userId,
            date: a.study_date,
            totalMinutes: a._sum.duration_minutes ?? 0,
            sessions: a._count.id,
        })),
        skipDuplicates: true,
    });

    // Com UserDailyStats populado, atualiza o UserStats global
    await recomputeUserStats(userId);

    return { inserted: result.count, alreadyUpToDate: false };
}
