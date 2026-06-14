"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTodayStudyLogs } from "@/hooks/useStudyLogs";
import { BookOpen, Clock, Target } from "lucide-react";
import { getLocalDateForToday } from "@/lib/utils";
import { TodaySummarySkeleton } from "./Skeletons";

export function TodaySummary() {
    const { data: logs, isLoading } = useTodayStudyLogs();
    if (isLoading || !logs) return <TodaySummarySkeleton />;

    const today = getLocalDateForToday();

    const totalMinutes = logs.reduce((sum, log) => sum + log.duration_minutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium">Resumo de Hoje - {today.toLocaleDateString('pt-BR')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                            <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {hours}h {minutes}min
                            </p>
                            <p className="text-sm text-muted-foreground">Tempo estudado</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                            <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{logs.length}</p>
                            <p className="text-sm text-muted-foreground">Sessões</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                            <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {logs.length > 0 ? (
                                    logs[logs.length - 1].topic.subject.name || 'N/A'
                                ) : 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground">Última matéria</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}