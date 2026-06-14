import { requireAuth } from "@/server/actions/requireAuth";

export default async function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    await requireAuth();

    return <>{children}</>;
}