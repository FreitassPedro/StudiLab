"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
    Play, BarChart2, Flame, Target, Trophy, Clock, Brain, Calendar,
    BookOpen, ChevronRight, Star, TrendingUp, Users, Zap, CheckCircle,
    Sparkles, ArrowRight, Lock, GraduationCap,
} from "lucide-react";

// ─── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_SUBJECTS = [
    { id: "1", name: "Matemática", color: "#6366f1", topics: ["Álgebra", "Cálculo", "Geometria", "Trigonometria"] },
    { id: "2", name: "Física", color: "#f59e0b", topics: ["Mecânica", "Termodinâmica", "Óptica"] },
    { id: "3", name: "Português", color: "#10b981", topics: ["Gramática", "Literatura", "Redação"] },
    { id: "4", name: "Química", color: "#ec4899", topics: ["Orgânica", "Inorgânica", "Físico-Química"] },
    { id: "5", name: "História", color: "#8b5cf6", topics: ["Brasil República", "Idade Média", "Contemporânea"] },
];

const MOCK_WEEKLY_DATA = [
    { name: "Seg", minutes: 120 },
    { name: "Ter", minutes: 95 },
    { name: "Qua", minutes: 180 },
    { name: "Qui", minutes: 60 },
    { name: "Sex", minutes: 210 },
    { name: "Sáb", minutes: 150 },
    { name: "Dom", minutes: 45 },
];

const MOCK_SESSIONS = [
    {
        id: "1",
        subject: "Matemática",
        color: "#6366f1",
        topic: "Cálculo Diferencial",
        duration: 75,
        startTime: "08:30",
        notes: "Revisão de limites e derivadas — fui bem!",
    },
    {
        id: "2",
        subject: "Física",
        color: "#f59e0b",
        topic: "Mecânica Clássica",
        duration: 45,
        startTime: "10:15",
        notes: null,
    },
    {
        id: "3",
        subject: "Português",
        color: "#10b981",
        topic: "Redação — Dissertativa",
        duration: 60,
        startTime: "14:00",
        notes: "Trabalhei a estrutura argumentativa",
    },
    {
        id: "4",
        subject: "Química",
        color: "#ec4899",
        topic: "Química Orgânica",
        duration: 40,
        startTime: "16:30",
        notes: null,
    },
];

const MOCK_RANKING = [
    { id: "1", name: "Ana Silva", username: "anasilva", minutes: 340, isYou: false },
    { id: "2", name: "Carlos Eduardo", username: "carlosedu", minutes: 260, isYou: false },
    { id: "3", name: "Você", username: "voce", minutes: 220, isYou: true },
    { id: "4", name: "Maria Clara", username: "mariac", minutes: 145, isYou: false },
    { id: "5", name: "João Pedro", username: "jopedro", minutes: 90, isYou: false },
];

const MOCK_BIO_CLOCK = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    minutes: [7, 8, 9, 10, 14, 15, 16, 20, 21].includes(i)
        ? Math.floor(Math.random() * 45 + 15)
        : 0,
})).map((d, i) => ({
    ...d,
    minutes: i === 9 ? 60 : i === 14 ? 55 : i === 20 ? 45 : d.minutes,
}));

const MOCK_HEATMAP_DATA = (() => {
    const data: Record<string, number> = {};
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const rand = Math.random();
        data[key] = rand < 0.2 ? 0 : Math.floor(rand * 300 + 30);
    }
    return data;
})();

const TOTAL_MINUTES_TODAY = MOCK_SESSIONS.reduce((a, s) => a + s.duration, 0);
const DAILY_GOAL = 300;
const STREAK = 12;

// ─── Sub-components ───────────────────────────────────────────────────────

function ConversionBanner() {
    return (
        <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-lg">
            <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-white">
                    <Sparkles className="w-4 h-4 shrink-0 text-yellow-300" />
                    <span className="text-sm font-medium">
                        Você está explorando o <strong>StudiLab</strong> em modo demonstração
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/sign-in"
                        className="text-white/80 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
                    >
                        Já tenho conta
                    </Link>
                    <Link
                        href="/sign-up"
                        className="bg-white text-violet-700 hover:bg-violet-50 text-sm font-bold px-4 py-1.5 rounded-full shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-1.5"
                    >
                        Criar conta grátis
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function DailyProgressCard() {
    const progress = Math.min((TOTAL_MINUTES_TODAY / DAILY_GOAL) * 100, 100);
    const hours = Math.floor(TOTAL_MINUTES_TODAY / 60);
    const minutes = TOTAL_MINUTES_TODAY % 60;
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="md:col-span-2 bg-card border border-border/50 rounded-2xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Progresso Diário
                    </p>
                    <h3 className="text-3xl font-bold">{hours}h {minutes}m</h3>
                    <p className="text-sm text-muted-foreground">
                        Faltam {Math.max(0, DAILY_GOAL - TOTAL_MINUTES_TODAY)} min para a meta
                    </p>
                </div>
                <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8"
                            fill="transparent" className="text-muted/20" />
                        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8"
                            fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset}
                            strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out" />
                    </svg>
                    <span className="absolute text-sm font-bold">{Math.round(progress)}%</span>
                </div>
            </div>
        </div>
    );
}

function StreakCard() {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-row items-center justify-center gap-3">
            <div className="p-2 w-fit rounded-xl bg-orange-500/10">
                <Flame className="h-10 w-10 text-orange-500" />
            </div>
            <div>
                <p className="text-3xl font-extrabold leading-none">
                    {STREAK}
                    <span className="text-base font-semibold text-muted-foreground ml-1">dias</span>
                </p>
                <p className="text-sm text-muted-foreground font-medium mt-1">Ofensiva</p>
            </div>
        </div>
    );
}

function LastSubjectCard() {
    const last = MOCK_SESSIONS[MOCK_SESSIONS.length - 1];
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="p-2 w-fit rounded-xl bg-emerald-500/10 mb-2">
                <Target className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
                <p className="text-base font-bold truncate" style={{ color: last.color }}>{last.subject}</p>
                <p className="text-xs text-muted-foreground font-medium">Última matéria</p>
            </div>
        </div>
    );
}

const CustomWeeklyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const mins = payload[0].value;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return (
            <div className="bg-card border border-border/40 p-3 rounded-xl shadow-xl">
                <p className="text-muted-foreground text-xs mb-1">{label}</p>
                <p className="text-base font-bold text-foreground">{h > 0 ? `${h}h ${m}m` : `${m}m`}</p>
            </div>
        );
    }
    return null;
};

function WeeklyChartCard() {
    const [tab, setTab] = useState<"bar" | "line">("bar");
    const totalMins = MOCK_WEEKLY_DATA.reduce((s, d) => s + d.minutes, 0);
    const totalH = Math.floor(totalMins / 60);
    const totalM = totalMins % 60;

    return (
        <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Semana Atual</p>
                    <p className="text-2xl font-semibold text-foreground mt-0.5">{totalH}h {totalM}m</p>
                </div>
                <div className="flex gap-1 bg-muted/40 p-1 rounded-lg">
                    {(["bar", "line"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${tab === t
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {t === "bar" ? "Barras" : "Linha"}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {tab === "bar" ? (
                        <BarChart data={MOCK_WEEKLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} dy={6} />
                            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}m`} />
                            <Tooltip content={<CustomWeeklyTooltip />} />
                            <Bar dataKey="minutes" fill="var(--foreground)" radius={[5, 5, 0, 0]} barSize={26} opacity={0.85} />
                        </BarChart>
                    ) : (
                        <LineChart data={MOCK_WEEKLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} dy={6} />
                            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}m`} />
                            <Tooltip content={<CustomWeeklyTooltip />} />
                            <Line type="monotone" dataKey="minutes" stroke="var(--foreground)" strokeWidth={2.5}
                                dot={{ fill: "var(--muted-foreground)", stroke: "var(--foreground)", strokeWidth: 0.5, r: 4 }}
                                activeDot={{ r: 6, fill: "var(--foreground)", stroke: "var(--muted-foreground)", strokeWidth: 2 }}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function SessionCard({ session }: { session: typeof MOCK_SESSIONS[0] }) {
    return (
        <div className="group relative flex items-center gap-4 p-4 bg-card border border-border/50 hover:border-primary/30 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="w-1.5 h-12 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: session.color }} />
            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="space-y-0.5">
                        <h4 className="font-bold text-foreground flex items-center gap-2">
                            <span style={{ color: session.color }}>{session.subject}</span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground truncate max-w-[160px]">
                                {session.topic}
                            </span>
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" /> {session.startTime}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="bg-secondary/60 px-2 py-0.5 rounded-full font-semibold text-primary/80">
                                {session.duration} min
                            </span>
                        </div>
                    </div>
                </div>
                {session.notes && (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-1 italic bg-muted/30 px-2 py-1 rounded border-l-2 border-muted">
                        &quot;{session.notes}&quot;
                    </div>
                )}
            </div>
        </div>
    );
}

function RankingCard() {
    const formatHours = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const accentColor = "#8b5cf6";

    return (
        <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ranking de Amigos</p>
                    <p className="text-base font-bold text-foreground mt-0.5">Hoje</p>
                </div>
                <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex flex-col space-y-1">
                {MOCK_RANKING.map((friend, index) => {
                    const isFirst = index === 0;
                    const isYou = friend.isYou;
                    return (
                        <div
                            key={friend.id}
                            className={`relative flex items-center gap-3 p-2 rounded-xl overflow-hidden transition-colors ${isYou ? "bg-violet-500/10 border border-violet-500/20" : "hover:bg-white/3"}`}
                        >
                            <div
                                className="relative z-10 h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white"
                                style={{
                                    background: isFirst
                                        ? `linear-gradient(135deg, ${accentColor}, #06b6d4)`
                                        : isYou
                                            ? `linear-gradient(135deg, #8b5cf6, #a78bfa)`
                                            : "rgba(120,120,120,0.15)",
                                }}
                            >
                                {friend.name.charAt(0)}
                            </div>
                            <div className="relative z-10 flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${isYou ? "text-violet-500" : "text-foreground"}`}>
                                    {friend.name} {isYou && <span className="text-xs font-normal">(você)</span>}
                                </p>
                                <p className="text-[11px] text-muted-foreground">@{friend.username}</p>
                            </div>
                            <div className="relative z-10 flex items-center gap-1.5 text-sm shrink-0">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                <span style={{ color: isFirst ? accentColor : undefined }}>{formatHours(friend.minutes)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function BioTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border border-border p-2 rounded-lg shadow-md text-xs font-bold">
                <p>{payload[0].payload.hour}:00</p>
                <p className="text-primary">{payload[0].value} min</p>
            </div>
        );
    }
    return null;
};
function BiologicalClockCard() {
    const peakHour = MOCK_BIO_CLOCK.reduce((a, b) => (a.minutes > b.minutes ? a : b));



    return (
        <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-3">
            <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ritmo Biológico</p>
                <p className="text-base font-bold text-foreground mt-0.5">Pico de Foco</p>
            </div>
            <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_BIO_CLOCK} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false}
                            ticks={[0, 4, 8, 12, 16, 20]} tickFormatter={(v) => `${v}h`} />
                        <YAxis hide domain={[0, 60]} />
                        <Tooltip content={<BioTooltip />} cursor={{ fill: "transparent" }} />
                        <Bar dataKey="minutes" radius={[4, 4, 0, 0]} animationDuration={1500}>
                            {MOCK_BIO_CLOCK.map((entry, index) => {
                                const isMax = entry.minutes >= 55;
                                const opacity = Math.min(1, Math.max(0.15, entry.minutes / 60));
                                const fill = isMax ? `rgba(234, 179, 8, 1)` : `rgba(139, 92, 246, ${opacity})`;
                                return <Cell key={`cell-${index}`} fill={fill} />;
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {peakHour.minutes > 0 && (
                <div className="flex items-center gap-3 p-3 bg-background/60 rounded-xl border border-primary/10">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-tight">
                        Seu pico de produtividade hoje foi às{" "}
                        <span className="font-bold text-foreground">{peakHour.hour}h</span> com{" "}
                        <span className="font-bold text-foreground">{peakHour.minutes} min</span> de foco.
                    </p>
                </div>
            )}
        </div>
    );
}

function HeatmapCard() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const days = Array.from({ length: lastDay.getDate() }, (_, i) => new Date(today.getFullYear(), today.getMonth(), i + 1));
    const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const getColor = (mins: number) => {
        if (mins === 0) return "bg-zinc-100 dark:bg-zinc-800";
        if (mins < 60) return "bg-emerald-200 dark:bg-emerald-900";
        if (mins < 180) return "bg-emerald-400 dark:bg-emerald-700";
        if (mins < 300) return "bg-emerald-500 dark:bg-emerald-600";
        return "bg-emerald-700 dark:bg-emerald-500";
    };

    const getTextColor = (mins: number) => mins >= 120 ? "text-white" : "text-foreground";

    return (
        <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-4">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-500" />
                <p className="text-sm font-semibold">Calendário de Atividades</p>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAYS.map((d) => (
                    <div key={d} className="text-center text-[10px] font-medium text-muted-foreground pb-1">{d}</div>
                ))}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`e-${i}`} className="aspect-square" />
                ))}
                {days.map((date) => {
                    const key = date.toISOString().slice(0, 10);
                    const mins = MOCK_HEATMAP_DATA[key] || 0;
                    const isToday = date.toDateString() === today.toDateString();
                    return (
                        <div
                            key={key}
                            title={`${date.getDate()}/${date.getMonth() + 1} — ${mins}min`}
                            className={`aspect-square rounded-md text-[11px] font-medium flex items-center justify-center cursor-default transition-all
                                ${getColor(mins)} ${getTextColor(mins)}
                                ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}
                                hover:scale-110`}
                        >
                            {date.getDate()}
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-center gap-3 pt-1 border-t">
                <span className="text-[10px] text-muted-foreground">Menos</span>
                <div className="flex gap-1">
                    {[0, 60, 120, 240, 360].map((m, i) => (
                        <div key={i} className={`w-3.5 h-3.5 rounded-sm ${getColor(m)}`} />
                    ))}
                </div>
                <span className="text-[10px] text-muted-foreground">Mais</span>
            </div>
        </div>
    );
}

function SubjectsPreview() {
    const COLORS_PIE = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6"];
    const pieData = MOCK_SUBJECTS.map((s, i) => ({
        name: s.name,
        value: [75, 45, 60, 30, 20][i],
        color: s.color,
    }));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject list */}
                <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Suas Matérias</p>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            {MOCK_SUBJECTS.length} matérias
                        </span>
                    </div>
                    <div className="space-y-2">
                        {MOCK_SUBJECTS.map((subject) => (
                            <div key={subject.id} className="flex items-start gap-3 p-3 bg-background/60 rounded-xl border border-border/30 group hover:border-primary/30 transition-colors">
                                <div className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: subject.color }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground">{subject.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {subject.topics.slice(0, 3).map((t) => (
                                            <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium text-muted-foreground">{t}</span>
                                        ))}
                                        {subject.topics.length > 3 && (
                                            <span className="text-[10px] text-muted-foreground">+{subject.topics.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pie chart */}
                <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-3">
                    <p className="text-sm font-semibold">Distribuição do Tempo</p>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val, name) => [`${val}h`, name]} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {pieData.map((item) => (
                            <div key={item.name} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-muted-foreground truncate">{item.name}</span>
                                <span className="font-semibold text-foreground ml-auto">{item.value}h</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LockedFeatureBanner({ feature }: { feature: string }) {
    return (
        <div className="relative rounded-2xl border border-dashed border-violet-400/40 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-indigo-500/5 p-6 text-center space-y-3">
            <div className="flex items-center justify-center">
                <div className="p-3 bg-violet-500/10 rounded-full">
                    <Lock className="w-6 h-6 text-violet-500" />
                </div>
            </div>
            <div>
                <p className="font-semibold text-foreground">{feature}</p>
                <p className="text-sm text-muted-foreground mt-1">Disponível após criar sua conta gratuita</p>
            </div>
            <Link href="/sign-up"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-violet-500/25">
                Criar conta grátis <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}

function FinalCTA() {
    const features = [
        { icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, text: "Acompanhe seu progresso em tempo real" },
        { icon: <Users className="w-5 h-5 text-blue-500" />, text: "Compare seu desempenho com amigos" },
        { icon: <Brain className="w-5 h-5 text-violet-500" />, text: "Descubra seu ritmo biológico de estudos" },
        { icon: <Calendar className="w-5 h-5 text-orange-500" />, text: "Planejador semanal com arrastar e soltar" },
        { icon: <Zap className="w-5 h-5 text-yellow-500" />, text: "Metas diárias e sistema de ofensiva" },
        { icon: <GraduationCap className="w-5 h-5 text-pink-500" />, text: "Sugestões de matérias do ENEM" },
    ];

    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 md:p-12 text-white">
            {/* decorative blobs */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm font-medium">
                        <Star className="w-4 h-4 text-yellow-300" />
                        100% gratuito para começar
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                        Pronto para transformar seus estudos?
                    </h2>
                    <p className="text-white/80 text-lg">
                        Milhares de estudantes já usam o StudiLab para organizar, monitorar e potencializar seu aprendizado.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Link href="/sign-up"
                            className="flex items-center justify-center gap-2 bg-white text-violet-700 hover:bg-violet-50 font-bold px-7 py-3 rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 text-base">
                            <Sparkles className="w-5 h-5" />
                            Criar conta grátis
                        </Link>
                        <Link href="/sign-in"
                            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3 rounded-full transition-all text-base border border-white/20">
                            Já tenho conta
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-xl px-4 py-3 transition-colors">
                            <div className="shrink-0 p-1.5 bg-white/20 rounded-lg">{f.icon}</div>
                            <span className="text-sm font-medium">{f.text}</span>
                            <CheckCircle className="w-4 h-4 text-white/50 ml-auto shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────

export function DemoContent() {
    return (
        <div className="min-h-screen bg-background">
            <ConversionBanner />

            <div className="container mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-violet-500/20">
                            <Sparkles className="w-3 h-3" /> Modo Demonstração
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            Olá, <span className="text-primary">Visitante</span>!
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Explore como seria sua experiência no StudiLab.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Link href="/sign-up">
                            <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-7 py-3 font-bold shadow-md hover:shadow-lg transition-all text-base hover:-translate-y-0.5">
                                <Play className="w-4 h-4 fill-current" />
                                Começar de verdade
                            </button>
                        </Link>
                        <button
                            onClick={() => alert("Crie uma conta para iniciar sua primeira sessão de estudos!")}
                            className="flex items-center gap-2 border border-border/60 text-foreground rounded-full px-7 py-3 font-semibold hover:bg-muted transition-all text-base"
                        >
                            <BarChart2 className="w-4 h-4" />
                            Histórico
                        </button>
                    </div>
                </header>

                {/* Resumo do Dia */}
                <section>
                    <div className="grid gap-4 md:grid-cols-4">
                        <DailyProgressCard />
                        <StreakCard />
                        <LastSubjectCard />
                    </div>
                </section>

                {/* Grid principal */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Coluna principal */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Gráfico Semanal */}
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 px-1">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Gráfico Semanal
                            </h2>
                            <WeeklyChartCard />
                        </div>

                        {/* Sessões de Hoje */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    Sessões de Hoje
                                </h2>
                                <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                    {MOCK_SESSIONS.length} sessões • {Math.floor(TOTAL_MINUTES_TODAY / 60)}h {TOTAL_MINUTES_TODAY % 60}m
                                </span>
                            </div>
                            <div className="grid gap-3">
                                {MOCK_SESSIONS.map((s) => <SessionCard key={s.id} session={s} />)}
                            </div>
                        </div>

                        {/* Heatmap */}
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 px-1">
                                <Calendar className="w-5 h-5 text-primary" />
                                Calendário de Atividades
                            </h2>
                            <HeatmapCard />
                        </div>

                        {/* Planejador — locked */}
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 px-1">
                                <Calendar className="w-5 h-5 text-primary" />
                                Planejador Semanal
                            </h2>
                            <LockedFeatureBanner feature="Planejador Semanal Interativo (drag & drop)" />
                        </div>
                    </div>

                    {/* Coluna lateral */}
                    <aside className="lg:col-span-4 space-y-6">
                        <RankingCard />
                        <BiologicalClockCard />
                        <LockedFeatureBanner feature="Cronômetro Pomodoro Integrado" />
                    </aside>
                </div>

                {/* Matérias */}
                <section>
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-primary" />
                            Matérias e Tópicos
                        </h2>
                        <button
                            onClick={() => alert("Crie uma conta para adicionar e personalizar suas matérias!")}
                            className="flex items-center gap-2 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary rounded-full px-4 py-2 text-sm font-medium transition-all"
                        >
                            + Adicionar matéria
                        </button>
                    </div>
                    <SubjectsPreview />
                </section>

                {/* CTA Final */}
                <FinalCTA />

                {/* Espaço inferior */}
                <div className="h-8" />
            </div>
        </div>
    );
}
