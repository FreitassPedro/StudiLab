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
            image: true,
        },
    });
    return user;
}

export async function getEmailByUsernameAction(username: string) {
    const profile = await prisma.profile.findFirst({
        where: { username: { equals: username, mode: "insensitive" } },
        include: { user: true },
    });
    return profile?.user?.email || null;
}
