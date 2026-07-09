"use server";

import { Subject, SubjectTree, TopicNode } from "@/types/types";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { requireAuth } from "./requireAuth";

/**
 * Actions garante que os dados do banco não quebrem a UI
 ***/
export async function createSubjectAction(data: { name: string; color: string }) {
    const user = await requireAuth();
    try {
        const subject = await prisma.subject.create({
            data: {
                name: data.name,
                color: data.color,
                userId: user.id,
                isOpen: true,
                isArchived: false,
                icon: "📚",
                topics: {
                    create: {
                        name: "Sem nome",
                    },
                },
            },
            include: {
                topics: true,
            }
        });


        return subject;
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error(`Já existe uma matéria com o nome "${data.name}".`);
        }
        throw new Error("Erro desconhecido ao criar matéria");
    }
}

export async function updateSubjectStatus(subjectId: string, isOpen: boolean, isArchived: boolean) {
    await requireAuth();
    try {
        return await prisma.subject.update({
            where: { id: subjectId },
            data: {
                isOpen,
                isArchived,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new Error(`Matéria com id "${subjectId}" não encontrada.`);
            }
        }
        throw new Error("Erro desconhecido ao atualizar status da matéria");
    }
}
export async function updateSubjectAction(data: { id: string; name: string; color: string, icon?: string | null, isOpen?: boolean, isArchived?: boolean }) {
    await requireAuth();
    try {
        return await prisma.subject.update({
            where: { id: data.id },
            data: {
                name: data.name,
                color: data.color,
                icon: data.icon,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new Error(`Já existe uma matéria com o nome "${data.name}".`);
            }

            if (error.code === 'P2025') {
                throw new Error(`Matéria com id "${data.id}" não encontrada.`);
            }
        }
        throw new Error("Erro desconhecido ao atualizar matéria");
    }
}
export async function deleteSubjectAction(id: string) {
    await requireAuth();
    await prisma.subject.delete({
        where: { id },
    });

    return { success: true };
}


import { cache } from "react";

export const getSubjectsAction = cache(async (): Promise<Subject[]> => {
    const user = await requireAuth();

    return await prisma.subject.findMany({
        where: { userId: user.id },
        orderBy: { name: 'asc' }
    });

});

export async function createBulkSubjectsWithTopicsAction(data: {
    subjects: {
        name: string;
        color: string;
        emoji: string;
        topics: string[];
    }[]
}) {
    const user = await requireAuth();

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Busca todas as matérias que o usuário já tem de uma só vez (1 query)
            const existingSubjects = await tx.subject.findMany({
                where: { userId: user.id },
                include: { topics: { select: { name: true } } },
            });

            const existingMap = new Map(existingSubjects.map((s) => [s.name, s]));

            const subjectsToCreate = [];
            const topicsToCreate: { name: string; subjectId: string }[] = [];

            // 2. Separa matérias novas vs existentes
            for (const subjectData of data.subjects) {
                const existing = existingMap.get(subjectData.name);
                if (existing) {
                    // Já existe: filtra apenas os tópicos que faltam
                    const existingTopicNames = new Set(existing.topics.map((t) => t.name));
                    const newTopics = subjectData.topics.filter((t) => !existingTopicNames.has(t));
                    
                    for (const t of newTopics) {
                        topicsToCreate.push({ name: t, subjectId: existing.id });
                    }
                } else {
                    // Não existe: vai para a fila de criação em lote
                    subjectsToCreate.push(subjectData);
                }
            }

            // 3. Cria matérias novas em lote (1 query)
            if (subjectsToCreate.length > 0) {
                await tx.subject.createMany({
                    data: subjectsToCreate.map((s) => ({
                        name: s.name,
                        color: s.color,
                        icon: s.emoji,
                        userId: user.id,
                        isOpen: true,
                        isArchived: false,
                    })),
                });

                // Recupera os IDs das matérias recém-criadas para atrelar os tópicos (1 query)
                const newSubjectNames = subjectsToCreate.map((s) => s.name);
                const newlyCreatedSubjects = await tx.subject.findMany({
                    where: { userId: user.id, name: { in: newSubjectNames } },
                    select: { id: true, name: true },
                });

                const newlyCreatedMap = new Map(newlyCreatedSubjects.map((s) => [s.name, s.id]));

                // Adiciona os tópicos dessas matérias novas na fila de criação
                for (const subjectData of subjectsToCreate) {
                    const subjectId = newlyCreatedMap.get(subjectData.name);
                    if (subjectId) {
                        for (const t of subjectData.topics) {
                            topicsToCreate.push({ name: t, subjectId });
                        }
                    }
                }
            }

            // 4. Cria todos os tópicos (novos e de matérias existentes) de uma só vez (1 query)
            if (topicsToCreate.length > 0) {
                await tx.topic.createMany({
                    data: topicsToCreate,
                });
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Erro no createBulkSubjectsWithTopicsAction:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error(`Conflito ao criar uma matéria ou tópico. Tente novamente.`);
        }
        throw new Error("Erro desconhecido ao criar matérias e tópicos em lote");
    }
}

