import { redirect } from "next/navigation";
import { getCurrentUser } from "./getCurrentUser";

export async function requireGuest() {

    const currentUser = await getCurrentUser();

    // Se já houver um usuário logado, redireciona para o dashboard
    if (currentUser) {
        redirect("/dashboard");
    }

    // Se não houver usuário, permite acesso à rota
    return null;
}