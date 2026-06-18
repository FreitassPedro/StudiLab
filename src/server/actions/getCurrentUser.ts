import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Se não houver sessão ou usuário, retorna null
    if (!session?.user) return null;

    return session.user;
});
