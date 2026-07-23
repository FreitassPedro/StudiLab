"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "./requireAuth";
import { revalidateTag } from "next/cache";
import { recomputeUserStats } from "./userStats.action";
import { unstable_cache } from "next/cache";

// ── JOIN strategy: resolve topic+subject em 1 query ao invés de 2 queries separadas (N+1) ──
// relationLoadStrategy: "join" instrui o Prisma a usar SQL JOIN ao invés de queries sequenciais.
const topicWithSubjectInclude = {
    topic: {
        include: {
            subject: true,
        },
    },
} as const;

export async function getStudyLogDetailsAction(logId: string) {
    await requireAuth();
    return prisma.studyLogs.findUnique({
        where: { id: logId },
        include: topicWithSubjectInclude,
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
        include: topicWithSubjectInclude,
    });

    // revalidateTag é mais eficiente que revalidatePath (não purga a página inteira).
    // O cache de analysis já usa esta tag → será invalidado automaticamente.
    revalidateTag(`study-logs-${user.id}`, "max");
    revalidateTag(`user-stats-${user.id}`, "max");
    await recomputeUserStats(user.id, [result.study_date]);
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
    const updateData: {
        topicId?: string;
        start_time?: Date;
        end_time?: Date;
        duration_minutes?: number;
        notes?: string;
    } = {};

    if (data.topic_id !== undefined) updateData.topicId = data.topic_id;
    if (data.start_time !== undefined) updateData.start_time = data.start_time;
    if (data.end_time !== undefined) updateData.end_time = data.end_time;
    if (data.duration_minutes !== undefined) updateData.duration_minutes = data.duration_minutes;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const result = await prisma.studyLogs.update({
        where: { id: data.id },
        data: updateData,
        include: topicWithSubjectInclude,
    });

    revalidateTag(`study-logs-${user.id}`, "max");
    revalidateTag(`user-stats-${user.id}`, "max");
    await recomputeUserStats(user.id, [result.study_date]);
    return result;
}

export async function deleteStudyLogAction(id: string) {
    const user = await requireAuth();
    const result = await prisma.studyLogs.delete({
        where: { id },
    });

    revalidateTag(`study-logs-${user.id}`, "max");
    revalidateTag(`user-stats-${user.id}`, "max");
    await recomputeUserStats(user.id, [result.study_date]);
    return result;
}

// ── getLastStudyLogAction — cacheada por 5 min, invalidada junto com study-logs ─
// Usando unstable_cache com factory fora do loop para reutilização de closure.
const buildCachedLastLog = (userId: string) =>
    unstable_cache(
        async () =>
            prisma.studyLogs.findFirst({
                where: { topic: { subject: { userId } } },
                orderBy: { created_at: "desc" },
                // select mínimo: só campos usados pelo StudySessionForm (resume last session)
                // topic.name, topic.subjectId e subject.name são exibidos no card de retomar sessão
                select: {
                    id: true,
                    topicId: true,
                    notes: true,
                    material_type: true,
                    topic: {
                        select: {
                            id: true,
                            name: true,
                            subjectId: true,
                            subject: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
        [`last-study-log-${userId}`],
        { tags: [`study-logs-${userId}`] }  // invalidado automaticamente ao criar/editar/deletar
    );

const lastLogCacheMap = new Map<string, ReturnType<typeof buildCachedLastLog>>();

export async function getLastStudyLogAction() {
    const user = await requireAuth();
    if (!lastLogCacheMap.has(user.id)) {
        lastLogCacheMap.set(user.id, buildCachedLastLog(user.id));
    }
    return lastLogCacheMap.get(user.id)!();
}

// ── Logs paginados por tópico — cacheados 5 min, invalidados ao alterar logs ──
const buildCachedLogsByTopic = (topicId: string, take: number, skip: number) =>
    unstable_cache(
        async () =>
            prisma.studyLogs.findMany({
                where: { topicId },
                select: {
                    id: true,
                    study_date: true,
                    duration_minutes: true,
                    notes: true,
                    topic: { select: { name: true } },
                },
                orderBy: { study_date: "desc" },
                take,
                skip,
            }),
        [`recent-logs-topic-${topicId}-${take}-${skip}`],
        { revalidate: 300 } // TTL 5 min — sem tag pois topicId não é userId
    );

export async function getRecentLogsByTopicAction(topicId: string, take = 3, skip = 0) {
    await requireAuth();
    return buildCachedLogsByTopic(topicId, take, skip)();
}

// ── Logs paginados por matéria — cacheados 5 min ─────────────────────────────
const buildCachedLogsBySubject = (subjectId: string, take: number, skip: number) =>
    unstable_cache(
        async () =>
            prisma.studyLogs.findMany({
                where: { topic: { subjectId } },
                select: {
                    id: true,
                    study_date: true,
                    duration_minutes: true,
                    notes: true,
                    topic: { select: { name: true } },
                },
                orderBy: { study_date: "desc" },
                take,
                skip,
            }),
        [`recent-logs-subject-${subjectId}-${take}-${skip}`],
        { revalidate: 300 } // TTL 5 min
    );

export async function getRecentLogsBySubjectAction(subjectId: string, take = 3, skip = 0) {
    await requireAuth();
    return buildCachedLogsBySubject(subjectId, take, skip)();
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

// ── Logs por período — sem cache pois analysis.action.ts já cuida disso ──────
export async function getStudyLogsByDateRangeAction(startDate: Date, endDate: Date) {
    const user = await requireAuth();
    return prisma.studyLogs.findMany({
        where: {
            study_date: { gte: startDate, lte: endDate },
            topic: { subject: { userId: user.id } },
        },
        include: topicWithSubjectInclude,
        orderBy: { start_time: "asc" },
    });
}
