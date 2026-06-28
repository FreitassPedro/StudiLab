"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboard";
import { TodaySummarySkeleton } from "./Skeletons";
import { Flame, Target } from "lucide-react";
import { DailyProgress } from "./DailyProgress";

export function TodaySummary() {
    const { data: dashboardData, isLoading } = useDashboardData();
    const logs = dashboardData?.logs;
    const summary = dashboardData?.summary;

    if (isLoading || !logs || !summary) {
        return <TodaySummarySkeleton />;
    }

    const lastSubject = summary.topSubject?.name || "Nenhuma";
    const streak = 10; // mock — substituir por dado real quando disponível

    return (
        <div className="grid gap-4 md:grid-cols-4 bg-card border-none bg-linear-to-br from-card/50 via-background to-secondary/20 shadow-inner">
            {/* Progress circular — ocupa 2 colunas */}
            <DailyProgress totalMinutes={summary.totalMinutes} />

            {/* Streak / Ofensiva */}
            <Card className="bg-transparent border-none">
                <CardContent className="p-5 h-full flex flex-row items-center justify-center">
                    <div className="p-2 w-fit rounded-xl bg-orange-500/10 mb-3">
                        <Flame className="h-12 w-12 text-orange-500" />
                    </div>
                    <div className="ml-2">
                        <p className="text-3xl font-extrabold leading-none">
                            {streak}
                            <span className="text-base font-semibold text-muted-foreground ml-1">dias</span>
                        </p>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Ofensiva</p>
                    </div>
                    {/* Divisor vertical*/}

                </CardContent>
            </Card>

            <Card className="flex-1 bg-transparent border-none">
                <CardContent className="p-5 h-full flex flex-col justify-between">
                    <div className="p-2 w-fit rounded-xl bg-emerald-500/10 mb-2">
                        <Target className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-base font-bold truncate" title={lastSubject}>{lastSubject}</p>
                        <p className="text-xs text-muted-foreground font-medium">Última matéria</p>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}