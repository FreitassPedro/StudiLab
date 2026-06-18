"use server";


import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { Topic } from "@/types/types";
import { requireAuth } from "./requireAuth";

export async function getTopicsAction(): Promise<Topic[]> {
    const user = await requireAuth();
    const topics = await prisma.topic.findMany({
        where: {
            subject: {
                userId: user.id
            }
        }
    });
    return topics;
}


export async function postCreateTopic(name: string, subjectId: string, parentId: string | null): Promise<Topic> {
    await requireAuth();
    const newTopic = await prisma.topic.create({
        data: {
            name,
            subjectId,
            parentId,
        },
    });
    return newTopic;
}

export async function deleteTopicAction(topicId: string): Promise<void> {
    await requireAuth();
    // Verifica se existem StudyLogs vinculadas ao tópico
    const studyLogsCount = await prisma.studyLogs.count({
        where: { topicId },
    });

    if (studyLogsCount > 0) {
        throw new Error(
            `Não é possível excluir este tópico pois existem ${studyLogsCount} registro(s) de estudo vinculado(s). Delete os registros primeiro.`
        );
    }

    await prisma.topic.delete({
        where: { id: topicId },
    });
}

export async function updateTopicAction(topicId: string, name: string): Promise<Topic> {
    await requireAuth();

    try {
        return await prisma.topic.update({
            where: { id: topicId },
            data: { name },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new Error(`Erro ao atualizar tópico: ${name} já existe nesta matéria.`);
            }

            if (error.code === 'P2025') {
                throw new Error(`Erro ao atualizar tópico: tópico com id ${topicId} não encontrado.`);
            }
        }
        throw new Error("Erro desconhecido ao atualizar tópico");
    }
}