import { requireGuest } from "@/server/actions/requireGuest";
import { Suspense } from "react";

async function AuthGuard({ children }: { children: React.ReactNode }) {
    await requireGuest();
    return <>{children}</>;
}

export default function AuthLayout({
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