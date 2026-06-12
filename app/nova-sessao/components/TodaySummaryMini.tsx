"use client";

import { Card } from "@/components/ui/card";
import { useTodayStudyLogs } from "@/hooks/useStudyLogs";
import { Clock, LayoutDashboard } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function TodaySummaryMini() {
    const { data: logs, isLoading } = useTodayStudyLogs();

    if (isLoading) {
        return (
            <div className="space-y-3 animate-pulse">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    <span>Resumo de Hoje</span>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-2">
                    <div className="h-14 bg-muted rounded-lg" />
                    <div className="h-14 bg-muted rounded-lg" />
                </div>
                <div className="space-y-2 mt-4">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                </div>
            </div>
        );
    }

    const totalMinutes = logs?.reduce((sum, log) => sum + log.duration_minutes, 0) || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Agrupar por matéria
    const subjectsData = logs?.reduce((acc, log) => {
        const subjectId = log.topic.subject.id;
        const subjectName = log.topic.subject.name;
        const subjectColor = log.topic.subject.color;

        if (!acc[subjectId]) {
            acc[subjectId] = {
                name: subjectName,
                color: subjectColor,
                minutes: 0,
                sessions: 0
            };
        }

        acc[subjectId].minutes += log.duration_minutes;
        acc[subjectId].sessions += 1;

        return acc;
    }, {} as Record<string, { name: string; color: string; minutes: number; sessions: number }>) || {};

    const subjectsList = Object.values(subjectsData).sort((a, b) => b.minutes - a.minutes);

    const formatDuration = (min: number) => {
        const h = Math.floor(min / 60);
        const m = min % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    <span>Resumo de Hoje</span>
                </div>
                <Separator className="my-2" />
                <Card className="p-3 bg-muted/50 border-none">
                    <div className="flex items-center  gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <div>
                            <p className="text-sm font-bold text-foreground">
                                {hours}h {minutes}m
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold leading-none">Tempo</p>
                        </div>
                    </div>
                </Card>
            </div>

            {subjectsList.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Por Matéria</h4>
                    <div className="space-y-1">
                        {subjectsList.map((subject, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/50">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div
                                        className="w-1.5 h-8 rounded-full shrink-0"
                                        style={{ backgroundColor: subject.color }}
                                    />
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-foreground truncate">{subject.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{subject.sessions} {subject.sessions === 1 ? 'sessão' : 'sessões'}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-semibold text-foreground">
                                        {formatDuration(subject.minutes)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
