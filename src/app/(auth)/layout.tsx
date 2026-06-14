import { requireGuest } from "@/server/actions/requireGuest";

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    await requireGuest();
    return <>{children}</>;
}