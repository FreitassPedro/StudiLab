import { requireAuth } from "@/server/actions/requireAuth";
import { Suspense } from "react";

async function AuthGuard({ children }: { children: React.ReactNode }) {
    await requireAuth();
    return <>{children}</>;
}

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Suspense fallback={null}>
            <AuthGuard>{children}</AuthGuard>
        </Suspense>
    );
}