"use client";

import { Suspense, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTodayStudyLogs } from "@/hooks/useStudyLogs";
import { getLocalDateForToday } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Play,
    Clock,
    BookOpen,
    Target,
    FileText,
    Trash2,
    Flame,
    TrendingUp,
    Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StudyLog = {
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

// ─── Comfort Image Config ─────────────────────────────────────────────────────

type ComfortLevel = {
    gif: string;
    label: string;
    message: string;
    badge: string;
    badgeColor: string;
    accent: string;
};

function getComfortLevel(totalMinutes: number): ComfortLevel {
    if (totalMinutes === 0) {
        return {
            gif: "/images/sleeping_cat.gif",
            label: "Hora de começar! 🐾",
            message: "Seu cérebro está descansado e pronto. Bora dar o primeiro passo?",
            badge: "Preguiça mode",
            badgeColor: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
            accent: "from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
        };
    }
    if (totalMinutes < 30) {
        return {
            gif: "/images/bunny_stretch.gif",
            label: "Aquecendo os motores 🐰",
            message: "Ótimo começo! O segredo é a consistência. Continue assim!",
            badge: "Iniciando",
            badgeColor: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
            accent: "from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950",
        };
    }
    if (totalMinutes < 60) {
        return {
            gif: "/images/hamster_run.gif",
            label: "No ritmo certo! 🐹",
            message: "Meio caminho andado! Você tá indo muito bem, continue firme!",
            badge: "Em progresso",
            badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
            accent: "from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950",
        };
    }
    if (totalMinutes < 120) {
        return {
            gif: "/images/dancing_cat.gif",
            label: "Arrasando! 🕺🐱",
            message: "Uma hora de foco! Seu futuro eu vai te agradecer muito por isso.",
            badge: "Focado",
            badgeColor: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
            accent: "from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950",
        };
    }
    if (totalMinutes < 180) {
        return {
            gif: "/images/panda_clap.gif",
            label: "Modo turbo ativado 🐼🔥",
            message: "Duas horas de puro foco? Você é uma máquina de aprender!",
            badge: "Modo turbo",
            badgeColor: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300",
            accent: "from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950",
        };
    }
    return {
        gif: "/images/sleepUnc.gif",
        label: "Lenda do estudo 🏆",
        message: "3h+ de foco? Você merece um descanso VIP. Descanse um pouco, herói!",
        badge: "Lendário",
        badgeColor: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-300",
        accent: "from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950",
    };
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonBox({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-lg bg-muted/60 ${className}`} />;
}

function TodaySummarySkeleton() {
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border/30 bg-card">
                    <SkeletonBox className="h-11 w-11 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                        <SkeletonBox className="h-7 w-20" />
                        <SkeletonBox className="h-3.5 w-28" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function SessionsSkeleton() {
    return (
        <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border/30 animate-pulse">
                    <div className="w-1 h-12 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between gap-2">
                            <SkeletonBox className="h-4 w-1/3" />
                            <SkeletonBox className="h-4 w-1/4" />
                        </div>
                        <SkeletonBox className="h-3 w-full" />
                        <SkeletonBox className="h-3 w-16" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function StatCard({
    icon: Icon,
    value,
    label,
    color,
}: {
    icon: React.ElementType;
    value: string;
    label: string;
    color: string;
}) {
    return (
        <div className="group flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-card hover:border-border hover:shadow-sm transition-all duration-200">
            <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground tracking-tight truncate">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
        </div>
    );
}

function TodaySummaryContent({ logs }: { logs: StudyLog[] }) {
    const today = getLocalDateForToday();
    const totalMinutes = logs.reduce((sum, l) => sum + l.duration_minutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const timeStr = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
    const lastSubject = logs.length > 0 ? (logs[logs.length - 1].topic.subject.name || "—") : "—";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Resumo de Hoje</h2>
                    <p className="text-sm text-muted-foreground">
                        {today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                </div>
                {logs.length > 0 && (
                    <Badge className="gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                        <Flame className="w-3 h-3" />
                        Ativo hoje
                    </Badge>
                )}
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                <StatCard
                    icon={Clock}
                    value={totalMinutes === 0 ? "0min" : timeStr}
                    label="Tempo estudado"
                    color="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                />
                <StatCard
                    icon={BookOpen}
                    value={String(logs.length)}
                    label={logs.length === 1 ? "Sessão registrada" : "Sessões registradas"}
                    color="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
                />
                <StatCard
                    icon={Target}
                    value={lastSubject}
                    label="Última matéria"
                    color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                />
            </div>
        </div>
    );
}

function TodaySummary() {
    const { data: logs, isLoading } = useTodayStudyLogs();
    if (isLoading || !logs) return <TodaySummarySkeleton />;
    return <TodaySummaryContent logs={logs} />;
}

// ─── Comfort Section ──────────────────────────────────────────────────────────

function ComfortSection({ logs }: { logs: StudyLog[] }) {
    const totalMinutes = useMemo(
        () => logs.reduce((sum, l) => sum + l.duration_minutes, 0),
        [logs]
    );
    const level = getComfortLevel(totalMinutes);

    return (
        <div className={`relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br ${level.accent} p-5`}>
            <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-2xl bg-white/40 dark:bg-black/20 blur-sm scale-110" />
                    <Image
                        src={level.gif}
                        alt="Mascote de conforto"
                        width={120}
                        height={120}
                        className="relative rounded-2xl object-cover shadow-sm"
                        unoptimized
                    />
                </div>
                <div className="flex flex-col gap-2 text-center sm:text-left">
                    <span className={`self-center sm:self-start text-xs font-semibold px-2.5 py-1 rounded-full ${level.badgeColor}`}>
                        {level.badge}
                    </span>
                    <h3 className="text-lg font-bold text-foreground leading-tight">{level.label}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{level.message}</p>
                    {totalMinutes > 0 && (
                        <div className="flex items-center gap-1.5 self-center sm:self-start mt-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                {totalMinutes >= 60
                                    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min hoje`
                                    : `${totalMinutes}min hoje`}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ComfortSectionWrapper() {
    const { data: logs, isLoading } = useTodayStudyLogs();
    if (isLoading || !logs) {
        return <SkeletonBox className="h-36 w-full rounded-2xl" />;
    }
    return <ComfortSection logs={logs} />;
}

// ─── Session Item ─────────────────────────────────────────────────────────────

function StudyLogItem({ log }: { log: StudyLog }) {
    const subject = log.topic.subject;
    const startStr = new Date(log.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const endStr = new Date(log.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="group flex items-start gap-3 p-3.5 rounded-xl border border-border/30 hover:border-border bg-card hover:shadow-sm transition-all duration-150">
            <div
                className="w-1 self-stretch min-h-10 rounded-full shrink-0"
                style={{ backgroundColor: subject?.color || "#94a3b8" }}
            />
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground leading-snug truncate">
                            {subject?.name}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <BookOpen className="w-3 h-3 shrink-0" />
                            {log.topic.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                            {startStr} – {endStr}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            {log.duration_minutes}min
                        </span>
                    </div>
                </div>
                {log.notes && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                        <span className="font-medium text-foreground/70">Nota:</span> {log.notes}
                    </p>
                )}
            </div>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-start mt-0.5">
                {log.notes && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Ver anotações">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                    </Button>
                )}
                <Button size="icon" variant="ghost" className="h-7 w-7" title="Excluir">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </Button>
            </div>
        </div>
    );
}

// ─── Sessions List ────────────────────────────────────────────────────────────

function RecentSessions() {
    const { data: logs, isLoading } = useTodayStudyLogs();
    const router = useRouter();

    return (
        <Card className="flex flex-col h-full border-border/40">
            <CardHeader className="pb-3 shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Sessões de Hoje</CardTitle>
                    {logs && logs.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {logs.length} {logs.length === 1 ? "sessão" : "sessões"}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto">
                {isLoading || !logs ? (
                    <SessionsSkeleton />
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                        <div className="p-4 rounded-2xl bg-muted/30">
                            <Sparkles className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Nenhuma sessão ainda</p>
                            <p className="text-xs text-muted-foreground mt-1">Comece a estudar para ver seu progresso aqui.</p>
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => router.push("/nova-sessao")}
                            className="gap-2"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Começar agora
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {logs.map((log) => (
                            <StudyLogItem key={log.id} log={log} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Today Timeline (Placeholder – mantém integração com import original) ─────

// Se TodayTimeline vier de outro arquivo, importe normalmente.
// Aqui deixamos um slot compatível:
import { TodayTimeline } from "../../nova-sessao/components/TodayTimeline";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-6xl px-4 py-8 space-y-7">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                            Painel de estudos
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            Dashboard
                        </h1>
                    </div>
                    <Link href="/nova-sessao">
                        <Button
                            size="lg"
                            className="gap-2.5 font-semibold shadow-sm hover:shadow-md transition-all px-6"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Estudar Agora
                        </Button>
                    </Link>
                </div>

                {/* Summary Cards */}
                <Suspense fallback={<TodaySummarySkeleton />}>
                    <TodaySummary />
                </Suspense>

                {/* Comfort / Mascot Section */}
                <Suspense fallback={<SkeletonBox className="h-36 w-full rounded-2xl" />}>
                    <ComfortSectionWrapper />
                </Suspense>

                {/* Sessions + Timeline Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
                    {/* Sessions ocupa 2 colunas e "dita" a altura da linha */}
                    <div className="md:col-span-2 md:h-[520px] flex flex-col">
                        <RecentSessions />
                    </div>

                    {/* Timeline ocupa 1 coluna, com scroll interno */}
                    <div className="md:col-span-1 md:h-[520px] relative">
                        <div className="md:absolute md:inset-0 md:overflow-y-auto [&>*]:min-h-full">
                            <Suspense fallback={<SessionsSkeleton />}>
                                <TodayTimeline />
                            </Suspense>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}