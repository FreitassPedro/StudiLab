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

export const getCachedHistoryAnalysis = async (userId: string, startDateStr: string, endDateStr: string) => {
    return unstable_cache(
        async () => {
            const normalizedStart = new Date(startDateStr);
            const normalizedEnd = new Date(endDateStr);

            console.log("Fetching Data from DB", normalizedStart, normalizedEnd);

            // UNICA QUERY AO BANCO: Busca todos os logs no intervalo com as relações necessárias
            const logs = await prisma.studyLogs.findMany({
                where: {
                    study_date: {
                        gte: normalizedStart,
                        lte: normalizedEnd,
                    },
                    topic: {
                        subject: {
                            userId: userId,
                        },
                    },
                },
                include: {
                    topic: {
                        include: {
                            subject: true,
                        },
                    },
                },
                orderBy: {
                    start_time: "asc",
                },
            });

            console.log("Logs found:", logs.length);

            // --- PROCESSAMENTO EM MEMÓRIA (MUITO MAIS RÁPIDO QUE MÚLTIPLAS QUERIES) ---

            // 1. Inicializar estruturas
            const subjectStats = new Map<string, { id: string; name: string; color: string; totalMinutes: number; totalSessions: number }>();
            const areaChartMap = new Map<string, { totalMinutes: number; materiaMap: Map<string, { name: string; color: string; minutes: number }> }>();
            const heatMap: Record<string, number> = {};
            let totalMinutes = 0;
            let longestSession = 0;

            // 2. Passagem única pelos logs
            logs.forEach(log => {
                const minutes = log.duration_minutes;
                totalMinutes += minutes;

                if (minutes > longestSession) longestSession = minutes;

                const subject = log.topic.subject;
                const dateKey = formatDateFromDB(log.study_date);

                // Stats por Matéria (para Pie e Summary)
                let sbjStats = subjectStats.get(subject.id);
                if (!sbjStats) {
                    sbjStats = {
                        id: subject.id,
                        name: subject.name,
                        color: subject.color,
                        totalMinutes: 0,
                        totalSessions: 0
                    };
                    subjectStats.set(subject.id, sbjStats);
                }
                sbjStats.totalMinutes += minutes;
                sbjStats.totalSessions += 1;

                // Area Chart Data
                let dayArea = areaChartMap.get(dateKey);
                if (!dayArea) {
                    dayArea = { totalMinutes: 0, materiaMap: new Map<string, { name: string; color: string; minutes: number }>() };
                    areaChartMap.set(dateKey, dayArea);
                }
                dayArea.totalMinutes += minutes;

                let areaMateria = dayArea.materiaMap.get(subject.id);
                if (!areaMateria) {
                    areaMateria = { name: subject.name, color: subject.color, minutes: 0 };
                    dayArea.materiaMap.set(subject.id, areaMateria);
                }
                areaMateria.minutes += minutes;

                // HeatMap (por dia)
                heatMap[dateKey] = (heatMap[dateKey] || 0) + minutes;
            });
            const sortedSubjects = Array.from(subjectStats.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
            const topSubjectData = sortedSubjects[0] || null;

            const totalSessions = logs.length;
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
    )();
};

export async function getHistoryAnalysisAction(startDateStr: string, endDateStr: string): Promise<HistoryAnalysis> {
    const user = await requireAuth();
    return getCachedHistoryAnalysis(user.id, startDateStr, endDateStr);
}