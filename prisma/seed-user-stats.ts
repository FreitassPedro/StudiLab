/**
 * Script de inicialização de UserStats para usuários existentes.
 *
 * Execute após o `prisma db push` / `prisma migrate dev`:
 *   npx dotenv -e .env.test -- tsx prisma/seed-user-stats.ts
 *   (ou sem o dotenv se usar o banco de produção)
 *
 * O que faz:
 *   1. Busca todos os usuários sem UserStats ainda.
 *   2. Para cada um, calcula métricas via aggregates direcionados.
 *   3. Persiste em UserStats em lote.
 *
 * Complexidade: O(U × D) onde U = nº de usuários e D = dias únicos de estudo.
 * Pode ser executado múltiplas vezes sem problema (upsert idempotente).
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/app/generated/prisma/client";

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
if (!connectionString) throw new Error("DIRECT_DATABASE_URL or DATABASE_URL must be set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedUserStats() {
    console.log("🚀 Iniciando seed de UserStats...");

    // Buscar todos os usuários que ainda não têm UserStats
    const usersWithoutStats = await prisma.user.findMany({
        where: { stats: null },
        select: { id: true, name: true },
    });

    console.log(`📊 ${usersWithoutStats.length} usuário(s) sem UserStats encontrado(s).`);

    if (usersWithoutStats.length === 0) {
        console.log("✅ Todos os usuários já têm UserStats. Nada a fazer.");
        return;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dayOfWeek = today.getUTCDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today.getTime() - daysFromMonday * 86400000);

    let processed = 0;
    const errors: string[] = [];

    for (const user of usersWithoutStats) {
        try {
            const [totals, weeklyAgg, distinctDays] = await Promise.all([
                prisma.studyLogs.aggregate({
                    where: { topic: { subject: { userId: user.id } } },
                    _sum: { duration_minutes: true },
                    _count: { id: true },
                }),
                prisma.studyLogs.aggregate({
                    where: {
                        topic: { subject: { userId: user.id } },
                        study_date: { gte: weekStart, lte: today },
                    },
                    _sum: { duration_minutes: true },
                }),
                prisma.studyLogs.findMany({
                    where: { topic: { subject: { userId: user.id } } },
                    select: { study_date: true },
                    distinct: ["study_date"],
                    orderBy: { study_date: "desc" },
                }),
            ]);

            const studyDays = distinctDays.length;
            const lastStudyDate = distinctDays[0]?.study_date ?? null;

            // Calcular streak
            const dayTimes = new Set(distinctDays.map((d) => d.study_date.getTime()));
            const msInDay = 86400000;
            let currentStreak = 0;
            let longestStreak = 0;
            let tempStreak = 0;
            let prevTime: number | null = null;

            // Iterar dias em ordem crescente para calcular longestStreak
            const sortedDays = [...distinctDays].sort(
                (a, b) => a.study_date.getTime() - b.study_date.getTime()
            );

            for (const day of sortedDays) {
                const dTime = day.study_date.getTime();
                if (prevTime === null || dTime - prevTime === msInDay) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
                if (tempStreak > longestStreak) longestStreak = tempStreak;
                prevTime = dTime;
            }

            // currentStreak: dias consecutivos até hoje (ou ontem)
            for (let i = 0; i < 3650; i++) {
                const dTime = today.getTime() - i * msInDay;
                if (dayTimes.has(dTime)) {
                    currentStreak++;
                } else if (i === 0) {
                    // Ainda não estudou hoje — não quebra
                } else {
                    break;
                }
            }
            longestStreak = Math.max(longestStreak, currentStreak);

            await prisma.userStats.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
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

            processed++;
            console.log(
                `  ✅ ${user.name} (${user.id.slice(0, 8)}…) — streak: ${currentStreak}, total: ${totals._sum.duration_minutes ?? 0}min, dias: ${studyDays}`
            );
        } catch (err) {
            const msg = `  ❌ Erro ao processar usuário ${user.id}: ${err}`;
            console.error(msg);
            errors.push(msg);
        }
    }

    console.log(`\n🏁 Seed concluído! ${processed}/${usersWithoutStats.length} usuário(s) processado(s).`);
    if (errors.length > 0) {
        console.error(`\n⚠️  ${errors.length} erro(s) encontrado(s):`);
        errors.forEach((e) => console.error(e));
    }
}

seedUserStats()
    .catch((e) => {
        console.error("Erro fatal no seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
