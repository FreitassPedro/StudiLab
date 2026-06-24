"use client";

import { BookOpen, FolderOpen, CheckSquare, CalendarClock, User, LibraryBig, LogOut, ChartSpline, PencilLine, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeSwitch from './ThemeSwtich';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { authClient } from '@/lib/auth-client';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LibraryBig, isEnabled: true },
    { href: '/nova-sessao', label: 'Nova Sessão', icon: PencilLine, isEnabled: true },
    { href: '/historico', label: 'Estatísticas', icon: ChartSpline, isEnabled: true },
    { href: '/materias', label: 'Matérias', icon: FolderOpen, isEnabled: true },
    { href: '/planejador', label: 'Agenda', icon: CalendarDays, isEnabled: true },
    { href: '/', label: 'Tarefas', icon: CheckSquare, isEnabled: false },
    { href: '/', label: 'Revisões', icon: CalendarClock, isEnabled: false },
    { href: '/', label: 'Ciclos', icon: CalendarClock, isEnabled: false },
];

export default function MainNavbar() {
    const router = useRouter();
    const currentPath = usePathname();

    const { data: session } = authClient.useSession();
    const user = session?.user;

    const enabledItems = navItems.filter(item => item.isEnabled);

    async function handleSignOut() {
        await authClient.signOut({
            fetchOptions: {
                cache: "no-store",
                onSuccess: () => {
                    router.push("/sign-in");
                }
            },

        });
    }

    return (
        <header className="sticky top-0 z-50 w-full">
            <nav className="border-b border-border bg-card">
                <div className="container mx-auto px-2 sm:px-4">
                    <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 shrink-0">
                            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            <h1 className="text-base sm:text-xl font-semibold text-foreground hidden lg:block">
                                StudiLab
                            </h1>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-2xl mx-auto overflow-x-auto">
                            {enabledItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentPath === item.href;

                                return (
                                    <Button
                                        key={item.label}
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className={cn(
                                            "shrink-0",
                                            isActive
                                                ? "bg-primary text-primary-foreground hover:bg-primary/60"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        )}
                                    >
                                        <Link
                                            href={item.href}
                                            className="flex items-center gap-1.5"
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="hidden lg:inline">{item.label}</span>
                                        </Link>
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Mobile Navigation */}
                        <div className="flex md:hidden items-center gap-0.5 flex-1 justify-center overflow-x-auto">
                            {enabledItems.slice(0, 4).map((item) => {
                                const Icon = item.icon;
                                const isActive = currentPath === item.href;

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            "p-2 rounded-md transition-colors shrink-0",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        )}
                                        title={item.label}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Info */}
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="flex items-center gap-1 sm:gap-2 rounded-full border border-border bg-secondary px-2 sm:px-3 py-1 shrink-0 max-w-35 sm:max-w-none">
                                        <span className="text-xs sm:text-sm text-muted-foreground sm:inline truncate max-w-30">
                                            {user.name || user.email}
                                        </span>

                                        <User className="h-4 w-4" />

                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            onClick={() => router.push("/profile")}
                                        >
                                            <User />
                                            Perfil
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <Separator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem variant='destructive'
                                            onSelect={() => handleSignOut()}
                                        >
                                            <LogOut />
                                            Sair
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        )}
                        <ThemeSwitch />
                    </div>
                </div>
            </nav>
        </header>
    );
}
