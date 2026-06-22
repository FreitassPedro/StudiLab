"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "./requireAuth";
import { AreaChartData } from "@/app/(protected)/historico/components/charts/StudyAreaChart";
import { PieChartData } from "@/types/types";
import { SummaryStats } from "./studyLogs.action";
import { formatDateKey } from "@/lib/utils";

export type HistoryAnalysis = {
    logs: any[];
    summary: SummaryStats;
    charts: {
        heatMap: Record<string, number>;
        barChart: any;
        areaChart: AreaChartData;
        pieChart: PieChartData[];
        biologicalClock: { hour: number; minutes: number }[];
    };
};

export async function getHistoryAnalysisAction(startDate: Date, endDate: Date): Promise<HistoryAnalysis> {
    const user = await requireAuth();

    // Normalizar datas para evitar problemas de timezone ao comparar com @db.Date
    // Construimos datas estritas em UTC baseadas nos componentes locais da data enviada.
    // Usamos getUTC* porque os clientes enviam a data já em UTC midnight correspondente ao fuso local,
    // o que previne bugs quando o servidor está em outro timezone ou lida com datas próximas à meia-noite.
    const normalizedStart = new Date(Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
        0, 0, 0, 0
    ));

    const normalizedEnd = new Date(Date.UTC(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate(),
        0, 0, 0, 0 // Prisma converte @db.Date ignorando hora, então 00:00 é perfeito para lte
    ));

    console.log("Fetching Data", normalizedStart, normalizedEnd);

    // UNICA QUERY AO BANCO: Busca todos os logs no intervalo com as relações necessárias
    const logs = await prisma.studyLogs.findMany({
        where: {
            study_date: {
                gte: normalizedStart,
                lte: normalizedEnd,
            },
            topic: {
                subject: {
                    userId: user.id,
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

    console.log("Logs found:", logs);

    // --- PROCESSAMENTO EM MEMÓRIA (MUITO MAIS RÁPIDO QUE MÚLTIPLAS QUERIES) ---

    // 1. Inicializar estruturas
    const heatMap: Record<string, number> = {};
    const pieMap = new Map<string, number>();
    let totalMinutes = 0;
    let longestSession = 0;

    const subjectStats = new Map<string, { id: string, name: string, color: string, totalMinutes: number, totalSessions: number }>();
    const areaChart: AreaChartData = {};
    const biologicalClock = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        minutes: 0,
    }));

    // 2. Passagem única pelos logs
    logs.forEach(log => {
        const minutes = log.duration_minutes;
        totalMinutes += minutes;
        if (minutes > longestSession) longestSession = minutes;

        const subject = log.topic.subject;
        const topic = log.topic;
        const dateKey = formatDateKey(log.study_date);

        // Stats por Matéria (para Pie e Summary)
        if (!subjectStats.has(subject.id)) {
            subjectStats.set(subject.id, {
                id: subject.id,
                name: subject.name,
                color: subject.color,
                totalMinutes: 0,
                totalSessions: 0
            });
        }
        const s = subjectStats.get(subject.id)!;
        s.totalMinutes += minutes;
        s.totalSessions += 1;

        // Area Chart Data
        if (!areaChart[dateKey]) {
            areaChart[dateKey] = { totalMinutes: 0, materia: [] };
        }
        areaChart[dateKey].totalMinutes += minutes;

        let areaMateria = areaChart[dateKey].materia.find(m => m.name === subject.name);
        if (!areaMateria) {
            areaMateria = { name: subject.name, color: subject.color, minutes: 0 };
            areaChart[dateKey].materia.push(areaMateria);
        }
        areaMateria.minutes += minutes;

        // Biological Clock (Ritmo Circadiano)
        const start = new Date(log.start_time);
        const end = new Date(log.end_time);
        let current = new Date(start);
        while (current < end) {
            const hour = current.getHours();
            const nextHour = new Date(current);
            nextHour.setHours(hour + 1, 0, 0, 0);
            const segmentEnd = nextHour < end ? nextHour : end;
            const segDuration = (segmentEnd.getTime() - current.getTime()) / (1000 * 60);
            biologicalClock[hour].minutes += Math.round(segDuration);
            current = segmentEnd;
        }

        // HeatMap (por dia)
        heatMap[dateKey] = (heatMap[dateKey] || 0) + minutes;
    });

    // 3. Finalizar Summary Stats
    const sortedSubjects = Array.from(subjectStats.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
    const topSubjectData = sortedSubjects[0] || null;

    const totalSessions = logs.length;
    const avgSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // Calcular dias únicos com estudo para média diária real (opcional) ou usar range fixo
    // Como normalizedStart e normalizedEnd agora são ambos à meia-noite (00:00:00.000Z),
    // a diferença em dias entre 15 e 15 é 0, entre 15 e 16 é 1.
    // O total de dias no intervalo inclusivo é a diferença + 1.
    const diffDays = Math.round((normalizedEnd.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24));
    const dayCount = Math.max(1, diffDays + 1);
    const avgMinutesPerDay = Math.round(totalMinutes / dayCount);

    const summary: SummaryStats = {
        totalMinutes,
        totalSessions,
        avgSession,
        longestSession,
        topSubject: topSubjectData ? { id: topSubjectData.id, name: topSubjectData.name, color: topSubjectData.color } : null,
        topSubjectMinutes: topSubjectData?.totalMinutes || 0,
        avgMinutesPerDay,
    };

    // 4. Finalizar Pie Chart
    const pieChart: PieChartData[] = sortedSubjects.map(s => ({
        name: s.name,
        value: Number(s.totalMinutes),
        sessions: Number(s.totalSessions),
        color: s.color,
        fill: s.color ?? "#8884d8",
    }));

    // 5. Ordenar Area Chart por data
    const sortedAreaChart: AreaChartData = {};
    Object.keys(areaChart).sort().forEach(key => {
        sortedAreaChart[key] = areaChart[key];
    });

    return {
        logs,
        summary,
        charts: {
            barChart: areaChart,
            areaChart,
            pieChart,
            heatMap,
            biologicalClock
        },
    };
}

