import { Suspense } from "react";
import { RecentSessions } from "./components/RecentSessions";
import { TodaySummary } from "./components/TodaySummary";
import { TodayTimeline } from "../nova-sessao/components/TodayTimeline";
import { TodaySummarySkeleton, RecentSessionsSkeleton } from "./components/Skeletons";
import { BiologicalClock } from "./components/BiologicalClock";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Play, Calendar, BookOpen, Clock, Lightbulb } from "lucide-react";
import { getCurrentUser } from "@/server/actions/getCurrentUser";

export default async function DashboardPage() {
    const user = await getCurrentUser();
    const firstName = user?.name?.split(' ')[0] || 'Estudante';

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header com Saudação Personalizada */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        Olá, <span className="text-primary">{firstName}</span>!
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Pronto para transformar conhecimento em progresso hoje?
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/nova-sessao">
                        <Button size="lg" className="rounded-full px-8 font-bold shadow-md hover:shadow-lg transition-all gap-2">
                            <Play className="w-5 h-5 fill-current" />
                            Iniciar Sessão
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Resumo Visual e Interativo */}
            <section>
                <Suspense fallback={<TodaySummarySkeleton />}>
                    <TodaySummary />
                </Suspense>
            </section>

            {/* Grid de Atividade e Inteligência */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Coluna Principal: Sessões e Timeline */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Sessões de Hoje
                            </h2>
                            <Link href="/historico">
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    Ver todo o histórico
                                </Button>
                            </Link>
                        </div>
                        <RecentSessions />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 px-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Linha do Tempo
                        </h2>
                        <div className="h-[600px]">
                            <Suspense fallback={<RecentSessionsSkeleton />}>
                                <TodayTimeline />
                            </Suspense>
                        </div>
                    </div>
                </div>

                {/* Coluna Lateral: Insights e Inteligência */}
                <aside className="lg:col-span-4 space-y-6">
                    <Suspense fallback={<div className="h-48 bg-muted animate-pulse rounded-xl" />}>
                        <BiologicalClock />
                    </Suspense>

                    <div className="p-5 bg-linear-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl space-y-3">
                        <h4 className="font-bold flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Insight do Dia
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Você sabia que estudar em blocos de 50 minutos com pausas de 10 aumenta sua retenção em até 30%? Tente hoje!
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}