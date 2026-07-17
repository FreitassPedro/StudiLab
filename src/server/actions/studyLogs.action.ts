"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "./requireAuth";
import { revalidatePath, revalidateTag } from "next/cache";
import { recomputeUserStats } from "./userStats.action";

const include = {
    topic: {
        include: {
            subject: true,
        },
    },
} as const;

export async function getStudyLogDetailsAction(logId: string) {
    await requireAuth();
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


export interface StudyLogInput {
    topic_id: string;
    study_date: string;
    start_time: Date;
    end_time: Date;
    material_type?: string;
    duration_minutes: number;
    notes?: string;
}

export async function createStudyLogAction(data: StudyLogInput) {
    const user = await requireAuth();
    const result = await prisma.studyLogs.create({
        data: {
            topicId: data.topic_id,
            study_date: new Date(`${data.study_date}T00:00:00Z`),
            start_time: data.start_time,
            end_time: data.end_time,
            duration_minutes: data.duration_minutes,
            notes: data.notes,
            material_type: data.material_type,
        },
        include,
    });
    revalidatePath("/dashboard");
    revalidatePath("/historico");
    revalidateTag(`study-logs-${user.id}`, "max");
    revalidateTag(`profile-stats-${user.id}`, "max");
    // Recalcula e persiste métricas desnormalizadas (streak, totais, semanal)
    await recomputeUserStats(user.id);
    return result;
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
    const user = await requireAuth();
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

    const result = await prisma.studyLogs.update({
        where: { id: data.id },
        data: updateData,
        include,
    });
    revalidatePath("/dashboard");
    revalidatePath("/historico");
    revalidateTag(`study-logs-${user.id}`, "max");
    revalidateTag(`profile-stats-${user.id}`, "max");
    // Recalcula métricas (duração pode ter mudado)
    await recomputeUserStats(user.id);
    return result;
}

export async function deleteStudyLogAction(id: string) {
    const user = await requireAuth();
    const result = await prisma.studyLogs.delete({
        where: { id },
    });
    revalidatePath("/dashboard");
    revalidatePath("/historico");
    revalidateTag(`study-logs-${user.id}`, "max");
    revalidateTag(`profile-stats-${user.id}`, "max");
    // Recalcula métricas (um dia pode ter ficado sem logs)
    await recomputeUserStats(user.id);
    return result;
}

export async function getLastStudyLogAction() {
    const user = await requireAuth();
    return prisma.studyLogs.findFirst({
        where: {
            topic: {
                subject: {
                    userId: user.id,
                },
            },
        },
        orderBy: {
            created_at: "desc",
        },
        include,
    });
}



export async function getRecentLogsByTopicAction(topicId: string, take = 3, skip = 0) {
    await requireAuth();
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
    await requireAuth();
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

export async function getStudyLogsByDateRangeAction(startDate: Date, endDate: Date) {
    const user = await requireAuth();
    return prisma.studyLogs.findMany({
        where: {
            study_date: {
                gte: startDate,
                lte: endDate,
            },
            topic: {
                subject: {
                    userId: user.id,
                }
            }
        },
        include,
        orderBy: {
            start_time: 'asc'
        }
    });
}
