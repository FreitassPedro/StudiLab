"use server";

import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

const include = {
    topic: {
        include: {
            subject: true,
        },
    },
} as const;


export async function getStudyLogsFeedAction({
    cursor,
    userId,
    fromDate,
}: {
    cursor?: string;
    userId: string;
    fromDate?: Date | string;
}) {
    const limit = 10;

    // Normalizar data para evitar problemas de timezone ao comparar com @db.Date
    const parsedFromDate = fromDate ? new Date(fromDate) : undefined;
    if (parsedFromDate) {
        parsedFromDate.setHours(0, 0, 0, 0);
    }

    const baseWhere = {
        topic: {
            subject: {
                userId: userId,
            },
        },
    } as const;

    const where = {
        ...(parsedFromDate
            ? {
                study_date: {
                    gte: parsedFromDate,
                },
            }
            : {}),
        ...baseWhere,
    } as const;

    let logs = await prisma.studyLogs.findMany({
        take: limit + 1, // Buscar um a mais para verificar se há mais páginas
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        where,
        orderBy: [
            { study_date: "desc" },
            { start_time: "desc" },
            { id: "desc" },
        ],
        include,
    });

    if (!cursor && parsedFromDate && logs.length === 0) {
        logs = await prisma.studyLogs.findMany({
            take: limit + 1,
            orderBy: [
                { study_date: "desc" },
                { start_time: "desc" },
                { id: "desc" },
            ],
            where: baseWhere,
            include,
        });
    }

    let nextCursor: string | undefined = undefined;

    if (logs.length > limit) {
        const nextItem = logs.pop(); // Remove o item extra
        nextCursor = nextItem?.id; // Define o cursor para a próxima página
    }

    return { logs, nextCursor };
}

export async function getStudyLogsByDateAction({
    startDate,
    endDate,
    userId,
}: {
    startDate: Date;
    endDate: Date;
    userId: string;
}) {
    // Normalizar datas para evitar problemas de timezone ao comparar com @db.Date
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);

    return prisma.studyLogs.findMany({
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
        include,
    });
}

export async function getStudyLogDetailsAction(logId: string) {
    return prisma.studyLogs.findUnique({
        where: {
            id: logId,
        },
        include:
        {
            topic: {
                include: {
                    subject: true,
                },
            },
        }
    });
}


export async function getStudyLogsByDateRangeAction(startDate: Date, endDate: Date) {
    // Normalizar datas para evitar problemas de timezone ao comparar com @db.Date
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);

    return prisma.studyLogs.findMany({
        where: {
            study_date: {
                gte: normalizedStart,
                lte: normalizedEnd,
            },
        },
        include,
    });
}
export interface StudyLogInput {
    topic_id: string;
    study_date: Date;
    start_time: Date;
    end_time: Date;
    material_type?: string;
    duration_minutes: number;
    notes?: string;
}

export async function createStudyLogAction(data: StudyLogInput) {
    return prisma.studyLogs.create({
        data: {
            topicId: data.topic_id,
            study_date: data.study_date,
            start_time: data.start_time,
            end_time: data.end_time,
            duration_minutes: data.duration_minutes,
            notes: data.notes,
            material_type: data.material_type,
        },
        include,
    });
}

export interface UpdateStudyLogInput {
    id: string;
    topic_id?: string;
    start_time?: Date;
    end_time?: Date;
    duration_minutes?: number;
    notes?: string;
}

export async function updateStudyLogAction(data: UpdateStudyLogInput) {
    const updateData = {} as {
        topicId?: string;
        start_time?: Date;
        end_time?: Date;
        duration_minutes?: number;
        notes?: string;
    };
    
    
    if (data.topic_id !== undefined) updateData.topicId = data.topic_id;
    if (data.start_time !== undefined) updateData.start_time = data.start_time;
    if (data.end_time !== undefined) updateData.end_time = data.end_time;
    if (data.duration_minutes !== undefined) updateData.duration_minutes = data.duration_minutes;
    if (data.notes !== undefined) updateData.notes = data.notes;
    
    return prisma.studyLogs.update({
        where: { id: data.id },
        data: updateData,
        include,
    });
}

export async function deleteStudyLogAction(id: string) {
    return prisma.studyLogs.delete({
        where: { id },
    });
}

export async function getLastStudyLogAction(userId: string) {
    return prisma.studyLogs.findFirst({
        where: {
            topic: {
                subject: {
                    userId: userId,
                },
            },
        },
        orderBy: {
            created_at: "desc",
        },
        include,
    });
}

export async function getTodayStudyLogsAction(userId: string, todayDate?: Date) {
    "use server";
    // 1. Dizemos ao Next.js: "Aguarde a requisição chegar. Isso não é estático."
    await connection();
    
    // Se todayDate não for fornecido, usar a data local do servidor como fallback
    // Idealmente, o cliente deve sempre passar `todayDate` para evitar problemas de timezone
    const today = todayDate ? new Date(todayDate) : new Date();
    
    // Normalizar para dia zero (meia-noite local)
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0, 0, 0, 0
    );
    
    // Normalizar para fim do dia (23:59:59:999)
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23, 59, 59, 999
    );

    return prisma.studyLogs.findMany({
        where: {
            study_date: {
                gte: startOfDay,
                lte: endOfDay,
            },
            topic: {
                subject: {
                    userId: userId,
                },
            },
        },
        include,
        orderBy: {
            start_time: "asc",
        },
    });
}

export async function getRecentLogsByTopicAction(topicId: string, take = 3, skip = 0) {
    return prisma.studyLogs.findMany({
        where: {
            topicId: topicId,
        },
        include: {
            topic: {
                select: {
                    name: true,
                }
            }
        },
        orderBy: {
            study_date: 'desc',
        },
        take,
        skip,
    });
}

export async function getRecentLogsBySubjectAction(subjectId: string, take = 3, skip = 0) {
    return prisma.studyLogs.findMany({
        where: {
            topic: {
                subjectId: subjectId,
            },
        },
        include: {
            topic: {
                select: {
                    name: true,
                }
            }
        },
        orderBy: {
            study_date: 'desc',
        },
        take,
        skip,
    });
}

export type SummaryStats = {
    totalMinutes: number;
    totalSessions: number;
    avgSession: number;
    longestSession: number;
    topSubject: {
        id: string;
        name: string;
        color: string;
    } | null;
    topSubjectMinutes: number;
    avgMinutesPerDay: number;
};

export async function getSummaryStatsAction(
    startDate: Date,
    endDate: Date,
    userId: string
): Promise<SummaryStats> {
    // Normalizar datas para evitar problemas de timezone ao comparar com @db.Date
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(23, 59, 59, 999);

    // Query 1: Estatísticas básicas (total, count, max, avg)
    type BasicStats = {
        totalMinutes: bigint | null;
        totalSessions: bigint;
        longestSession: number | null;
    };

    const basicStatsResult = await prisma.$queryRaw<BasicStats[]>`
        SELECT
            COALESCE(SUM(sl."duration_minutes"), 0) AS "totalMinutes",
            COUNT(sl.id) AS "totalSessions",
            MAX(sl."duration_minutes") AS "longestSession"
        FROM "StudyLogs" sl
        INNER JOIN "Topic" t ON t.id = sl."topicId"
        INNER JOIN "Subject" s ON s.id = t."subjectId"
        WHERE 
            sl."study_date" >= ${normalizedStart}
            AND sl."study_date" <= ${normalizedEnd}
            AND s."userId" = ${userId}
    `;


    
    const basicStats = basicStatsResult[0];
    const totalMinutes = Number(basicStats?.totalMinutes ?? 0);
    const totalSessions = Number(basicStats?.totalSessions ?? 0);
    const longestSession = basicStats?.longestSession ?? 0;
    const avgSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    const avgMinutesPerDay = Math.round(totalMinutes / ((normalizedEnd.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)));

    // Query 2: Matéria com mais minutos
    type TopSubjectResult = {
        id: string;
        name: string;
        color: string;
        totalMinutes: bigint;
    };

    const topSubjectResult = await prisma.$queryRaw<TopSubjectResult[]>`
        SELECT
            s.id,
            s.name,
            s.color,
            SUM(sl."duration_minutes") AS "totalMinutes"
        FROM "Subject" s
        INNER JOIN "Topic" t ON t."subjectId" = s.id
        INNER JOIN "StudyLogs" sl ON sl."topicId" = t.id
        WHERE 
            sl."study_date" >= ${normalizedStart}
            AND sl."study_date" <= ${normalizedEnd}
            AND s."userId" = ${userId}
        GROUP BY s.id, s.name, s.color
        ORDER BY "totalMinutes" DESC
        LIMIT 1
    `;

    const topSubjectData = topSubjectResult[0];
    const topSubject = topSubjectData ? {
        id: topSubjectData.id,
        name: topSubjectData.name,
        color: topSubjectData.color,
    } : null;
    const topSubjectMinutes = topSubjectData ? Number(topSubjectData.totalMinutes) : 0;

    return {
        totalMinutes,
        totalSessions,
        avgSession,
        longestSession,
        topSubject,
        topSubjectMinutes,
        avgMinutesPerDay,
    };
}