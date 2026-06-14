"use server";

import { AreaChartData } from "@/app/historico/components/charts/StudyAreaChart";
import { prisma } from "@/lib/prisma";
import { formatDateKey } from "@/lib/utils";


export type PieChartData = {
    name: string;
    value: number;
    sessions: number;
    color?: string;
}

export type HeatmapMonthResponse = {
    monthLabel: string;
    monthTotalMinutes: number;
    minutesByDate: Record<string, number>;
};

export async function getPieChartDataActionRaw(startDate: Date, endDate: Date, userId: string): Promise<PieChartData[]> {
    type RawSubjectAggregate = {
        id: string;
        name: string;
        color: string;
        totalMinutes: number | bigint;
        totalSessions: number | bigint;
    };

    const rawData = await prisma.$queryRaw<RawSubjectAggregate[]>`
        SELECT
            s.id,
            s.name,
            s.color,
            COALESCE(SUM(sl."duration_minutes"), 0) AS "totalMinutes",
            COUNT(sl.id) AS "totalSessions"
        FROM
            "Subject" "s"
        INNER JOIN "Topic" "t" ON t."subjectId" = s.id
        INNER JOIN "StudyLogs" "sl" ON sl."topicId" = t.id
            AND sl."study_date" >= ${startDate}
            AND sl."study_date" <= ${endDate}
        WHERE
            s."userId" = ${userId}
        GROUP BY
            s.id, s.name, s.color
        ORDER BY
            "totalMinutes" DESC;
    `;

    const data = rawData.map(item => ({
        name: item.name,
        value: Number(item.totalMinutes),
        sessions: Number(item.totalSessions),
        color: item.color,
    }));

    return data;
};


export async function getAreaChartACtion(startDate: Date, endDate: Date, userId: string) {
    // Normalizar datas para evitar problemas de timezone
    // Quando comparamos com @db.Date, precisamos garantir que estamos comparando apenas a data
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);

    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);

    // Aggregate by study_date and topic with subject relationship
    const aggregated = await prisma.studyLogs.groupBy({
        by: ['study_date', 'topicId'],
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
        _sum: {
            duration_minutes: true,
        },
    });

    console.log("Aggregated Area Chart Data:", aggregated);

    // Fetch necessary topic/subject info
    const topicIds = [...new Set(aggregated.map(agg => agg.topicId))];
    const topics = await prisma.topic.findMany({
        where: { id: { in: topicIds } },
        include: { subject: true },
    });

    const topicMap = new Map(topics.map(t => [t.id, t]));

    // Build chart structure grouped by date
    const chart: AreaChartData = {};

    aggregated.forEach(agg => {
        // formatDateKey agora usa UTC internamente, lidando corretamente com @db.Date
        const dateKey = formatDateKey(agg.study_date);
        const minutes = agg._sum.duration_minutes || 0;

        if (!chart[dateKey]) {
            chart[dateKey] = { totalMinutes: 0, materia: [] };
        }

        chart[dateKey].totalMinutes += minutes;

        const topic = topicMap.get(agg.topicId);
        const subject = topic?.subject;

        if (subject) {
            chart[dateKey].materia.push({
                name: subject.name,
                color: subject.color,
                minutes,
            });
        }
    });
    // Order chart by date
    const sortedChart: AreaChartData = {};
    Object.keys(chart).sort().forEach(key => {
        sortedChart[key] = chart[key];
    });

    return sortedChart;
}

export async function getHeatmapMonthDataAction(monthDate: Date, userId: string): Promise<HeatmapMonthResponse> {
    const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0);
    const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const aggregated = await prisma.studyLogs.groupBy({
        by: ['study_date'],
        where: {
            study_date: {
                gte: startDate,
                lte: endDate,
            },
            topic: {
                subject: {
                    userId,
                },
            },
        },
        _sum: {
            duration_minutes: true,
        },
    });

    const minutesByDate: Record<string, number> = {};
    let monthTotalMinutes = 0;

    aggregated.forEach((agg) => {
        // formatDateKey agora usa UTC internamente, lidando corretamente com @db.Date
        const key = formatDateKey(agg.study_date);
        const minutes = agg._sum.duration_minutes || 0;
        minutesByDate[key] = minutes;
        monthTotalMinutes += minutes;
    });

    return {
        monthLabel: monthDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        monthTotalMinutes,
        minutesByDate,
    };
}

export async function getHeatmapYearDataAction(year: number, userId: string): Promise<HeatmapMonthResponse> {
    const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const aggregated = await prisma.studyLogs.groupBy({
        by: ['study_date'],
        where: {
            study_date: {
                gte: startDate,
                lte: endDate,
            },
            topic: {
                subject: {
                    userId,
                },
            },
        },
        _sum: {
            duration_minutes: true,
        },
    });

    const minutesByDate: Record<string, number> = {};
    let yearTotalMinutes = 0;

    aggregated.forEach((agg) => {
        const key = formatDateKey(agg.study_date);
        const minutes = agg._sum.duration_minutes || 0;
        minutesByDate[key] = minutes;
        yearTotalMinutes += minutes;
    });

    return {
        monthLabel: `${year}`,
        monthTotalMinutes: yearTotalMinutes,
        minutesByDate,
    };
}