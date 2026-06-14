"use server";

import { Subject, SubjectTree, TopicNode } from "@/types/types";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

/**
 * Actions garante que os dados do banco não quebrem a UI
 ***/
export async function createSubjectAction(data: { name: string; color: string; userId: string }) {
    try {
        return await prisma.subject.create({
            data: {
                name: data.name,
                color: data.color,
                userId: data.userId,
            },
        });
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error(`Já existe uma matéria com o nome "${data.name}".`);
        }
        throw new Error("Erro desconhecido ao criar matéria");
    }
}

export async function updateSubjectAction(data: { id: string; name: string; color: string; userId: string }) {
    try {
        return await prisma.subject.update({
            where: { id: data.id },
            data: {
                name: data.name,
                color: data.color,
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
    await prisma.subject.delete({
        where: { id },
    });

    return { success: true };
}

export async function getSubjectsTrees(userId: string): Promise<SubjectTree[]> {
    const subjects: { id: string; name: string; color: string; topics: { id: string; name: string; parentId: string | null; subjectId: string }[] }[] = await prisma.subject.findMany({
        where: { userId },
        include: {
            topics: {
                include: {
                    studyLogs: false, // Evita carregar os studyLogs
                },
            },
        },
    });
    // Recebe uma lista de matérias com seus tópicos, e precisamos transformar em uma estrutura de árvore

    return subjects.map((s) => {
        const map = new Map<string, TopicNode>();
        s.topics.forEach((t) => map.set(t.id, { ...t, children: [] }));

        const roots: TopicNode[] = [];
        s.topics.forEach((t) => {
            const node = map.get(t.id)!;

            if (t.parentId) {
                const parent = map.get(t.parentId);
                if (parent) {
                    parent.children.push(node);
                } else {
                    roots.push(node)

                }
            }
            else {
                roots.push(node);
            }
        });

        return {
            subject: {
                id: s.id,
                name: s.name,
                color: s.color,
            },
            topics: roots,
        };

    });
}

    export async function getSubjectsAction(userId: string): Promise<Subject[]> {
        return await prisma.subject.findMany({
            where: { userId }
        });
    }

    export async function getSubjectsWithTopicsAction(userId: string) {
        const subject = await prisma.subject.findMany({
            where: { userId },
            include: {
                topics: {
                    include: {
                        studyLogs: false, // Evita carregar os studyLogs
                    },
                },
            },
        });
        return subject;
    }

export async function createBulkSubjectsWithTopicsAction(data: {
    userId: string;
    subjects: {
        name: string;
        color: string;
        topics: string[];
    }[]
}) {
    try {
        const results = [];
        for (const subjectData of data.subjects) {
            // Check if subject already exists for this user
            const existingSubject = await prisma.subject.findFirst({
                where: {
                    name: subjectData.name,
                    userId: data.userId
                }
            });

            if (existingSubject) {
                // If subject exists, add topics that don't exist yet
                const existingTopics = await prisma.topic.findMany({
                    where: {
                        subjectId: existingSubject.id,
                        parentId: null
                    }
                });

                const existingTopicNames = new Set(existingTopics.map(t => t.name));
                const topicsToCreate = subjectData.topics.filter(tName => !existingTopicNames.has(tName));

                if (topicsToCreate.length > 0) {
                    await prisma.topic.createMany({
                        data: topicsToCreate.map(name => ({
                            name,
                            subjectId: existingSubject.id,
                        }))
                    });
                }
                results.push(existingSubject);
            } else {
                // Create new subject with topics
                const subject = await prisma.subject.create({
                    data: {
                        name: subjectData.name,
                        color: subjectData.color,
                        userId: data.userId,
                        topics: {
                            create: subjectData.topics.map(topicName => ({
                                name: topicName,
                            }))
                        }
                    },
                    include: {
                        topics: true
                    }
                });
                results.push(subject);
            }
        }
        return results;
    } catch (error) {
        console.error("Bulk creation error:", error);
        throw new Error("Erro ao criar matérias em lote");
    }
}

