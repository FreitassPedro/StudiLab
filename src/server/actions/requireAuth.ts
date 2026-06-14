import { redirect } from "next/navigation";
import { getCurrentUser } from "./getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function requireAuth() {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
        redirect("/sign-in");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: currentUser.id,
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true, 
        }
    });

    return user;
}