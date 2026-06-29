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
    const existingSubjects = await prisma.subject.findMany({
        where: { userId: user.id },
        include: {
            topics: {
                select: { name: true }
            }
        },
    });
    const existingSubjectNames = existingSubjects.map(subject => subject.name);
    const existingTopicNames = existingSubjects.flatMap(subject => subject.topics.map(topic => topic.name));

    const validSubjects = data.subjects.filter(subject => !existingSubjectNames.includes(subject.name));

    try {

        await prisma.subject.createMany({
            data:
                validSubjects.map(subject => {
                    return {
                        name: subject.name,
                        color: subject.color,
                        icon: subject.emoji,
                        userId: user.id,
                        isOpen: true,
                        isArchived: false,
                        topics: {
                            create: subject.topics.filter(topic => !existingTopicNames.includes(topic)).map(topic => {
                                return {
                                    name: topic,
                                };
                            }),
                        },
                    }
                })
        });

        return { success: true }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error(`Já existe uma matéria com o nome "${data.subjects.map(subject => subject.name).join(', ')}".`);
        }
        throw new Error("Erro desconhecido ao criar matérias");
    }
}

