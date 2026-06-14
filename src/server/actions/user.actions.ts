"use server";

import { prisma } from "@/lib/prisma";

export async function getUsersAction() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
        },
        orderBy: {
            name: 'asc',
        },
    });
    return users;
}

export async function getUserByIdAction(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
    return user;
}

