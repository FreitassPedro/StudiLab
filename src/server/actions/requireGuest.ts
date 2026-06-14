import { redirect } from "next/navigation";
import { getCurrentUser } from "./getCurrentUser";

export async function requireGuest() {

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) return null;

    redirect("/dashboard");
}