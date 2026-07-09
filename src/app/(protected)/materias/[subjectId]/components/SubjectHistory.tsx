"use client";

import { useMemo } from "react";
import { Clock, ChevronRight, History } from "lucide-react";
import { useActivityAnalysis } from "@/hooks/useActivity";
import { formatDateToLocal } from "@/lib/utils";

interface Props {
    subjectId: string;
    subjectColor: string;
}

function formatDuration(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

function formatTime(dt: string | Date) {
    const d = typeof dt === "string" ? new Date(dt) : dt;
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dt: string | Date) {
    const d = typeof dt === "string" ? new Date(dt) : dt;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

// Pull last 60 days of logs
function useLast60Days() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 60);
    return { start, end };
}

export function SubjectHistory({ subjectId, subjectColor }: Props) {
    const { start, end } = useLast60Days();
    const startUtc = formatDateToLocal(start);
    const endUtc = formatDateToLocal(end);

    const { data: analysis, isLoading } = useActivityAnalysis(start, end);

    const subjectLogs = useMemo(() => {
        if (!analysis?.logs) return [];
        return analysis.logs
            .filter((log) => log.topic?.subjectId === subjectId)
            .sort(
                (a, b) =>
                    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
            )
            .slice(0, 20); // show last 20 logs
    }, [analysis, subjectId]);

    const totalMinutes = useMemo(
        () => subjectLogs.reduce((acc, l) => acc + l.duration_minutes, 0),
        [subjectLogs]
    );

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />
                ))}
            </div>
        );
    }

    if (subjectLogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                    <History size={22} className="text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                    Nenhuma sessão registrada nos últimos 60 dias.
                </p>
                <p className="text-xs text-muted-foreground/60">
                    Inicie uma sessão de estudos para ver seu histórico aqui!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary strip */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/40 border border-border/30">
                <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} style={{ color: subjectColor }} />
                    <span className="font-semibold" style={{ color: subjectColor }}>
                        {formatDuration(totalMinutes)}
                    </span>
                    <span className="text-muted-foreground text-xs">nos últimos 60 dias</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span className="text-xs text-muted-foreground">
                    {subjectLogs.length} sessões
                </span>
            </div>

            {/* Log list */}
            <div className="space-y-2">
                {subjectLogs.map((log) => (
                    <div
                        key={log.id}
                        className="group flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card hover:border-primary/20 hover:shadow-sm transition-all"
                    >
                        {/* Color pill */}
                        <div
                            className="w-1 h-10 rounded-full shrink-0"
                            style={{ backgroundColor: subjectColor }}
                        />

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{log.topic?.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>{formatDate(log.start_time)}</span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="font-mono">
                                    {formatTime(log.start_time)} → {formatTime(log.end_time)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold bg-secondary/60 px-2 py-0.5 rounded-full text-muted-foreground">
                                {log.duration_minutes} min
                            </span>
                        </div>

                        {log.notes && (
                            <div className="hidden group-hover:flex items-center gap-1 text-xs text-muted-foreground italic max-w-[140px] truncate">
                                <ChevronRight size={12} />
                                {log.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
