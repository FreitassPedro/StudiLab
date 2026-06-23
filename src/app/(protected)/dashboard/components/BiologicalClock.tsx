"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboard";
import { Brain, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const BiologicalClockView = dynamic(() => import("./BiologicalClockView"), {
    ssr: false,
    loading: () => <div className="h-40 w-full mt-4 flex items-center justify-center text-xs text-muted-foreground">Carregando relógio...</div>
});

export function BiologicalClock() {
    const { data: dashboardData } = useDashboardData();
    const chartData = useMemo(() => {
        if (!dashboardData?.logs) return [];

        const clock = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            minutes: 0,
            label: `${i}h`,
        }));

        dashboardData?.logs.forEach((log: any) => {
            const start = new Date(log.start_time);
            const end = new Date(log.end_time);
            let current = new Date(start);

            while (current < end) {
                const hour = current.getHours();
                const nextHour = new Date(current);
                nextHour.setHours(hour + 1, 0, 0, 0);
                const segmentEnd = nextHour < end ? nextHour : end;
                const segDuration = (segmentEnd.getTime() - current.getTime()) / (1000 * 60);
                clock[hour].minutes += Math.round(segDuration);
                current = segmentEnd;
            }
        });

        return clock;
    }, [dashboardData?.logs]);

    const peakHour = useMemo(() => [...chartData].sort((a, b) => b.minutes - a.minutes)[0], [chartData]);

    return (
        <Card className="border-none bg-linear-to-br from-primary/5 to-secondary/5 shadow-md overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Ritmo Circadiano
                </CardTitle>
                <p className="text-xs text-muted-foreground">Distribuição de foco nas 24h do dia</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <BiologicalClockView chartData={chartData} peakHour={peakHour} />
            </CardContent>
        </Card>
    );
}
