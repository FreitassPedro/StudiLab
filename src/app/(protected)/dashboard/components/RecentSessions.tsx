"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/useDashboard';
import { BookOpen, Clock, FileText, Trash2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const StudyLogItemResume = ({
    log,
}: {
    log: {
        id: string;
        start_time: string | Date;
        end_time: Date | string;
        notes?: string | null;
        duration_minutes: number;
        topic: {
            id: string;
            name: string;
            subject: {
                id: string;
                name: string;
                color: string;
            };
        };
    };
}) => {
    const subject = log.topic.subject;
    const topic = log.topic;

    return (
        <div className="group relative flex items-center gap-4 p-4 bg-card border border-border/50 hover:border-primary/30 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5">
            {/* Subject Color Indicator (Vertical Pill) */}
            <div
                className="w-1.5 h-12 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: subject?.color || '#ccc' }}
            />

            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="space-y-0.5">
                        <h4 className="font-bold text-foreground flex items-center gap-2">
                            {subject?.name}
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground truncate max-w-[150px]">
                                {topic?.name}
                            </span>
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                {new Date(log.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="bg-secondary/60 px-2 py-0.5 rounded-full font-semibold text-primary/80">
                                {log.duration_minutes} min
                            </span>
                        </div>
                    </div>
                </div>

                {log.notes && (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-1 italic bg-muted/30 px-2 py-1 rounded border-l-2 border-muted">
                        &quot;{log?.notes}&quot;
                    </div>
                )}
            </div>

            {/* Actions (Floating on the right) */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

function RecentSessionsSkeleton() {
    return (
        <div className="space-y-4">
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-xl animate-pulse">
                    <div className="w-1.5 h-12 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function RecentSessions() {
    const { data: dashboardData, isLoading } = useDashboardData();
    const todayLogs = dashboardData?.logs;
    const route = useRouter();

    return (
        <div className="space-y-4">
            {isLoading || !todayLogs ? (
                <RecentSessionsSkeleton />
            ) : todayLogs.length === 0 ? (
                <Card className="border-dashed bg-muted/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                        <div className="p-4 bg-background rounded-full shadow-sm">
                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-semibold text-muted-foreground">Sua mesa está vazia hoje</p>
                            <p className="text-sm text-muted-foreground max-w-[250px]">Comece uma nova sessão para ver seu progresso aparecer aqui!</p>
                        </div>
                        <Button
                            variant="default"
                            size="lg"
                            className="rounded-full px-8 shadow-md"
                            onClick={() => route.push('/nova-sessao')}
                        >
                            Iniciar Estudos
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {todayLogs.slice().reverse().map((log) => (
                        <StudyLogItemResume key={log.id} log={log} />
                    ))}
                </div>
            )}
        </div>
    );
}
