import { redirect } from "next/navigation";
import { getCurrentUser } from "./getCurrentUser";

export async function requireAuth() {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        redirect("/sign-in");
    }

    return currentUser;
}