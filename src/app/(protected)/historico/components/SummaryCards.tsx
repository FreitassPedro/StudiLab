"use client";

import { useSummaryStats } from "@/hooks/useStudyLogs";
import { BookOpen, Clock, Timer, TrendingUp, Trophy, Zap, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import useSearchRangeStore from "@/store/useSearchRangeStore";

const formatDuration = (minutes: number) => {
    if (minutes === 0) return '0min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

export function SummaryCards() {
    const { startDate, endDate } = useSearchRangeStore();
    const { data: stats, error, isLoading } = useSummaryStats(startDate, endDate);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse border-none bg-muted/20">
                        <CardContent className="h-32" />
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Esforço Total */}
            <Card className="relative overflow-hidden border-none bg-linear-to-br from-violet-500/10 to-background shadow-md group hover:shadow-lg transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Clock className="w-16 h-16 text-violet-500" />
                </div>
                <CardContent className="p-6 space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-3 h-3" /> Esforço Total
                    </p>
                    <h3 className="text-3xl font-black text-violet-600">
                        {formatDuration(stats.totalMinutes)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Em <span className="font-bold text-foreground">{stats.totalSessions}</span> sessões concluídas.
                    </p>
                </CardContent>
            </Card>

            {/* Média Diária */}
            <Card className="relative overflow-hidden border-none bg-linear-to-br from-emerald-500/10 to-background shadow-md group hover:shadow-lg transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-16 h-16 text-emerald-500" />
                </div>
                <CardContent className="p-6 space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Timer className="w-3 h-3" /> Ritmo Diário
                    </p>
                    <h3 className="text-3xl font-black text-emerald-600">
                        {formatDuration(stats.avgMinutesPerDay)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Sessão média de <span className="font-bold text-foreground">{formatDuration(stats.avgSession)}</span>.
                    </p>
                </CardContent>
            </Card>

            {/* Matéria Destaque */}
            <Card className="relative overflow-hidden border-none bg-linear-to-br from-rose-500/10 to-background shadow-md group hover:shadow-lg transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Trophy className="w-16 h-16 text-rose-500" />
                </div>
                <CardContent className="p-6 space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-3 h-3" /> Foco Principal
                    </p>
                    <h3 className="text-2xl font-black text-rose-600 truncate pr-8">
                        {stats.topSubject?.name || '—'}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {stats.topSubject && (
                            <span 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: stats.topSubject.color }} 
                            />
                        )}
                        Dedicação de <span className="font-bold text-foreground">{formatDuration(stats.topSubjectMinutes)}</span>.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
