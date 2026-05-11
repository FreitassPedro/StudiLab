import { Suspense } from "react";
import { RecentSessions } from "./components/RecentSessions";
import { TodaySummary } from "./components/TodaySummary";
import { TodayTimeline } from "../nova-sessao/components/TodayTimeline";
import { TodaySummarySkeleton, RecentSessionsSkeleton } from "./components/Skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import Link from "next/link";
import { Play } from "lucide-react";
import Image from "next/image";
import { ComfortSection } from "./components/Comfort";

export default function DashboardPage() {

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p>Bem-vindo ao dashboard! Aqui você pode gerenciar seus estudos.</p>
            <Suspense fallback={<TodaySummarySkeleton />}>
                <TodaySummary />
            </Suspense>

            <Link href="/nova-sessao" className="block">
                <Button variant="default" className="w-full py-8 text-xl font-bold gap-3 shadow-lg hover:shadow-xl transition-all">
                    <Play className="w-6 h-6 fill-current" />
                    Estudar Agora
                </Button>
            </Link>

            <ComfortSection />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

                {/* O Ditador (Coluna 1): Dita a altura matemática da linha inteira no desktop */}
                <div className="h-full md:col-span-2">
                    <RecentSessions />
                </div>

                {/* O Seguidor (Coluna 2): Um container invisível que apenas acompanha a altura da linha */}
                <div className="relative md:h-full md:col-span-1">
                    {/* A Mágica: absolute inset-0 força a div a ter exatamente o tamanho do pai (Coluna 2),
                      mas esconde seu tamanho real do Grid. overflow-y-auto permite rolar os dados em excesso. */}
                    <div className="md:absolute md:inset-0 md:overflow-y-auto [&>*]:min-h-full">
                        <Suspense fallback={<RecentSessionsSkeleton />}>
                            <TodayTimeline />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}