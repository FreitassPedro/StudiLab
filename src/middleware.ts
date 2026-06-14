import { authClient } from "./lib/auth-client";

export async function middleware() {
    const session = await authClient.getSession({
    });