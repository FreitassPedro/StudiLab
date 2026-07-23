"use server";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "./requireAuth";
import { AreaChartData } from "@/app/(protected)/historico/components/charts/StudyAreaChart";
import { PieChartData } from "@/types/types";
import { SummaryStats } from "./studyLogs.action";
import { formatDateFromDB } from "@/lib/utils";

export type HistoryAnalysis = {
    logs: any[];
    summary: SummaryStats;
    charts: {
        heatMap: Record<string, number>;
        areaChart: AreaChartData;
        pieChart: PieChartData[];
    };
};

// ── Factory extraída para FORA da função pública ─────────────────────────────
// Problema anterior: unstable_cache era criado DENTRO de getCachedHistoryAnalysis,
// o que gerava nova closure a cada request → Next.js não conseguia de-duplicar chamadas
// concorrentes para o mesmo userId+período, causando queries redundantes ao banco.
//
// Solução: factory definida fora → mesma referência de função → Next.js agrupa
// chamadas concorrentes e executa a query apenas uma vez.
const buildCachedHistoryAnalysis = (userId: string, startDateStr: string, endDateStr: string) =>
    unstable_cache(
        async () => {
            const normalizedStart = new Date(startDateStr);
            const normalizedEnd = new Date(endDateStr);

            // 2 queries paralelas:
            // - UserDailyStats: heatMap e summary numérico (já agregado, sem JOIN)
            // - StudyLogs: logs detalhados com subject/topic para pie chart e timeline
            const [dailyStats, logs] = await Promise.all([
                prisma.userDailyStats.findMany({
                    where: {
                        userId,
                        date: { gte: normalizedStart, lte: normalizedEnd },
                    },
                    select: { date: true, totalMinutes: true, sessions: true },
                }),
                prisma.studyLogs.findMany({
                    where: {
                        study_date: { gte: normalizedStart, lte: normalizedEnd },
                        topic: { subject: { userId } },
                    },
                    // select mínimo com JOIN explícito — retorna apenas campos necessários
                    // para pie chart, area chart e timeline. Evita over-fetching.
                    select: {
                        id: true,
                        study_date: true,
                        start_time: true,
                        end_time: true,
                        duration_minutes: true,
                        notes: true,
                        material_type: true,
                        topicId: true,
                        topic: {
                            select: {
                                id: true,
                                name: true,
                                subjectId: true,
                                subject: {
                                    select: {
                                        id: true,
                                        name: true,
                                        color: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { start_time: "asc" },
                }),
            ]);

            // ── HeatMap — vem diretamente de UserDailyStats, sem processar logs ──
            const heatMap: Record<string, number> = {};
            let totalMinutesFromDaily = 0;
            let totalSessionsFromDaily = 0;

            for (const row of dailyStats) {
                const key = formatDateFromDB(row.date);
                heatMap[key] = row.totalMinutes;
                totalMinutesFromDaily += row.totalMinutes;
                totalSessionsFromDaily += row.sessions;
            }

            // ── Processamento dos logs detalhados (pie chart + area chart) ──
            const subjectStats = new Map<string, { id: string; name: string; color: string; totalMinutes: number; totalSessions: number }>();
            const areaChartMap = new Map<string, { totalMinutes: number; materiaMap: Map<string, { name: string; color: string; minutes: number }> }>();
            let longestSession = 0;

            for (const log of logs) {
                const minutes = log.duration_minutes;
                if (minutes > longestSession) longestSession = minutes;

                const subject = log.topic.subject;
                const dateKey = formatDateFromDB(log.study_date);

                // Stats por matéria
                let sbjStats = subjectStats.get(subject.id);
                if (!sbjStats) {
                    sbjStats = { id: subject.id, name: subject.name, color: subject.color, totalMinutes: 0, totalSessions: 0 };
                    subjectStats.set(subject.id, sbjStats);
                }
                sbjStats.totalMinutes += minutes;
                sbjStats.totalSessions += 1;

                // Area chart data
                let dayArea = areaChartMap.get(dateKey);
                if (!dayArea) {
                    dayArea = { totalMinutes: 0, materiaMap: new Map() };
                    areaChartMap.set(dateKey, dayArea);
                }
                dayArea.totalMinutes += minutes;

                let areaMateria = dayArea.materiaMap.get(subject.id);
                if (!areaMateria) {
                    areaMateria = { name: subject.name, color: subject.color, minutes: 0 };
                    dayArea.materiaMap.set(subject.id, areaMateria);
                }
                areaMateria.minutes += minutes;
            }

            const sortedSubjects = Array.from(subjectStats.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
            const topSubjectData = sortedSubjects[0] || null;

            // Usa totais do UserDailyStats como fonte de verdade (mais preciso que somar logs)
            const totalMinutes = totalMinutesFromDaily;
            const totalSessions = totalSessionsFromDaily || logs.length;
            const avgSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
            const diffDays = Math.round((normalizedEnd.getTime() - normalizedStart.getTime()) / 86400000);
            const dayCount = Math.max(1, diffDays + 1);

            const summary: SummaryStats = {
                totalMinutes,
                totalSessions,
                avgSession,
                longestSession,
                topSubject: topSubjectData ? { id: topSubjectData.id, name: topSubjectData.name, color: topSubjectData.color } : null,
                topSubjectMinutes: topSubjectData?.totalMinutes || 0,
                avgMinutesPerDay: Math.round(totalMinutes / dayCount),
            };

            const pieChart: PieChartData[] = sortedSubjects.map(s => ({
                name: s.name,
                value: s.totalMinutes,
                sessions: s.totalSessions,
                color: s.color,
                fill: s.color ?? "#8884d8",
            }));

            const sortedAreaChart: AreaChartData = {};
            Array.from(areaChartMap.keys()).sort().forEach(key => {
                const day = areaChartMap.get(key)!;
                sortedAreaChart[key] = {
                    totalMinutes: day.totalMinutes,
                    materia: Array.from(day.materiaMap.values()),
                };
            });

            return {
                logs,
                summary,
                charts: {
                    areaChart: sortedAreaChart,
                    pieChart,
                    heatMap,
                },
            };
        },
        [`study-logs-analysis-${userId}-${startDateStr}-${endDateStr}`],
        { tags: [`study-logs-${userId}`] }
    );

// ── Cache público: mapa de factories para evitar recriar closures ─────────────
// Chave composta por userId + período para compartilhar cache entre componentes
// que requisitam o mesmo intervalo no mesmo request.
const analysisCacheMap = new Map<string, ReturnType<typeof buildCachedHistoryAnalysis>>();

export const getCachedHistoryAnalysis = async (userId: string, startDateStr: string, endDateStr: string) => {
    const cacheKey = `${userId}:${startDateStr}:${endDateStr}`;
    if (!analysisCacheMap.has(cacheKey)) {
        analysisCacheMap.set(cacheKey, buildCachedHistoryAnalysis(userId, startDateStr, endDateStr));
    }
    return analysisCacheMap.get(cacheKey)!();
};

export async function getHistoryAnalysisAction(startDateStr: string, endDateStr: string): Promise<HistoryAnalysis> {
    const user = await requireAuth();
    return getCachedHistoryAnalysis(user.id, startDateStr, endDateStr);
}