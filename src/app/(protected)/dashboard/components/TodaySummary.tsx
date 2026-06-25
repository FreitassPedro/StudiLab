"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboard";
import { BookOpen, Target } from "lucide-react";
import { TodaySummarySkeleton } from "./Skeletons";
import { DailyProgress } from "./DailyProgress";


export function TodaySummary() {
    const { data: dashboardData, isLoading } = useDashboardData();
    const logs = dashboardData?.logs;
    const summary = dashboardData?.summary;

    if (isLoading || !logs || !summary) {
        return <TodaySummarySkeleton />;
    }


    const lastSubject = summary.topSubject?.name || 'Nenhuma';

    return (
        <div className="grid gap-4 md:grid-cols-4">

            <DailyProgress
                totalMinutes={summary.totalMinutes}
            />

            {/* Quick Stats Cards */}
            <Card className="hover:shadow-md transition-all border-border/40">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="p-2 w-fit bg-orange-500/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{logs.length}</p>
                        <p className="text-sm text-muted-foreground font-medium">Sessões Concluídas</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all border-border/40">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="p-2 w-fit bg-blue-500/10 rounded-lg">
                        <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xl font-bold truncate" title={lastSubject}>
                            {lastSubject}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">Última Matéria</p>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}