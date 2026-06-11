"use client";

import { useState } from "react";
import {
    AreaChart,
    Area,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    RadialBarChart,
    RadialBar,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    LineChart,
    Line,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Flame,
    BookOpen,
    Clock,
    Target,
    Zap,
    Award,
    Brain,
    ChevronRight,
    Star,
} from "lucide-react";

// ─────────────────────────────────────────
//  INTERFACES
// ─────────────────────────────────────────
export type MaterialType = "teoria" | "revisao" | "exercicios" | "resumo";

export interface DashboardMetric {
    label: string;
    value: string | number;
    delta: number;
    description: string;
    trend: "up" | "down" | "neutral";
}

export interface DayActivity {
    day: string;
    hours: number;
    sessions: number;
}

export interface TopicProgress {
    name: string;
    totalHours: number;
    completion: number;
}

// ─────────────────────────────────────────
//  MOCKS
// ─────────────────────────────────────────
const metrics: DashboardMetric[] = [
    {
        label: "Horas de Voo",
        value: "142h",
        delta: 15,
        description: "vs. mês passado",
        trend: "up",
    },
    {
        label: "Média de Foco",
        value: "52min",
        delta: -2,
        description: "por sessão",
        trend: "down",
    },
    {
        label: "Streak Atual",
        value: "12 dias",
        delta: 100,
        description: "Recorde: 24 dias",
        trend: "up",
    },
    {
        label: "Exercícios",
        value: "1.240",
        delta: 8,
        description: "questões resolvidas",
        trend: "up",
    },
];

const dayOfWeekDistribution: DayActivity[] = [
    { day: "Seg", hours: 4.5, sessions: 3 },
    { day: "Ter", hours: 3.2, sessions: 2 },
    { day: "Qua", hours: 5.8, sessions: 5 },
    { day: "Qui", hours: 4.0, sessions: 3 },
    { day: "Sex", hours: 2.5, sessions: 2 },
    { day: "Sáb", hours: 6.2, sessions: 4 },
    { day: "Dom", hours: 1.5, sessions: 1 },
];

const topTopics: TopicProgress[] = [
    { name: "Cálculo Diferencial", totalHours: 24, completion: 85 },
    { name: "React Query Patterns", totalHours: 18, completion: 60 },
    { name: "Mecânica Quântica", totalHours: 42, completion: 40 },
    { name: "História Moderna", totalHours: 12, completion: 95 },
];

// Acumulado mensal gerado a partir dos mocks
const monthlyAccumulated = Array.from({ length: 30 }, (_, i) => {
    const base = (i + 1) * (142 / 30);
    const jitter = Math.sin(i * 0.7) * 2.5;
    return {
        day: i + 1,
        calcDiff: Math.max(0, base * 0.28 + jitter),
        reactQuery: Math.max(0, base * 0.21 + jitter * 0.5),
        mecQuan: Math.max(0, base * 0.35 + jitter * 0.8),
        historia: Math.max(0, base * 0.16),
    };
});

// Heatmap horário
const hourlyHeatmap = Array.from({ length: 24 }, (_, h) => {
    const patterns: Record<number, number> = {
        6: 0.3, 7: 1.2, 8: 2.8, 9: 3.6, 10: 2.1,
        11: 1.5, 12: 0.4, 13: 0.2, 14: 2.9, 15: 4.5,
        16: 3.8, 17: 2.2, 18: 1.1, 19: 3.4, 20: 5.2,
        21: 4.8, 22: 2.6, 23: 0.9,
    };
    return { hour: `${h}h`, sessions: patterns[h] ?? 0 };
});

const peakHour = hourlyHeatmap.reduce((a, b) =>
    a.sessions > b.sessions ? a : b
);

// Sparklines por métrica (últimos 7 dias)
const sparklines = [
    [8, 10, 9, 12, 14, 11, 15],
    [55, 58, 50, 52, 48, 54, 52],
    [7, 8, 9, 10, 11, 12, 12],
    [140, 150, 160, 175, 190, 210, 240],
];

// Goal state
const goalHours = 500;
const currentHours = 142;
const hoursPerDay = 142 / 30;
const daysRemaining = Math.ceil((goalHours - currentHours) / hoursPerDay);
const goalProgress = Math.round((currentHours / goalHours) * 100);
const radialData = [{ name: "Meta", value: goalProgress, fill: "#6366f1" }];

// Topic config
const topicConfig: Record<
    string,
    { color: string; badge: MaterialType; bgGlow: string }
> = {
    "Cálculo Diferencial": {
        color: "#6366f1",
        badge: "exercicios",
        bgGlow: "rgba(99,102,241,0.12)",
    },
    "React Query Patterns": {
        color: "#22d3ee",
        badge: "teoria",
        bgGlow: "rgba(34,211,238,0.12)",
    },
    "Mecânica Quântica": {
        color: "#a78bfa",
        badge: "revisao",
        bgGlow: "rgba(167,139,250,0.12)",
    },
    "História Moderna": {
        color: "#34d399",
        badge: "resumo",
        bgGlow: "rgba(52,211,153,0.12)",
    },
};

const badgeLabel: Record<MaterialType, string> = {
    teoria: "Teoria",
    revisao: "Revisão",
    exercicios: "Exercícios",
    resumo: "Resumo",
};

const badgeColor: Record<MaterialType, string> = {
    teoria: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    revisao: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    exercicios: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    resumo: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const metricIcons = [Clock, Brain, Flame, BookOpen];

// ─────────────────────────────────────────
//  CUSTOM TOOLTIP
// ─────────────────────────────────────────
const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
    return (
        <div className="rounded-xl border border-white/10 bg-[#0f1117]/95 p-3 shadow-2xl backdrop-blur-md">
            <p className="mb-2 text-xs font-semibold text-slate-400">Dia {label}</p>
            {payload.map((p: any) => (
                <div key={p.name} className="flex items-center gap-2 text-xs">
                    <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: p.color }}
                    />
                    <span className="text-slate-300">{p.name}</span>
                    <span className="ml-auto font-mono font-bold text-white">
                        {p.value.toFixed(1)}h
                    </span>
                </div>
            ))}
            <div className="mt-2 border-t border-white/10 pt-2 text-xs font-bold text-white">
                Total: {total.toFixed(1)}h
            </div>
        </div>
    );
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-white/10 bg-[#0f1117]/95 p-2.5 text-xs shadow-xl backdrop-blur-md">
            <p className="font-semibold text-slate-300">{label}</p>
            <p className="font-mono font-bold text-white">
                {payload[0]?.value} sessões
            </p>
        </div>
    );
};

// ─────────────────────────────────────────
//  SPARKLINE
// ─────────────────────────────────────────
const Sparkline = ({
    data,
    color,
}: {
    data: number[];
    color: string;
}) => {
    const d = data.map((v, i) => ({ i, v }));
    return (
        <ResponsiveContainer width="100%" height={40}>
            <LineChart data={d} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <Line
                    type="monotone"
                    dataKey="v"
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

// ─────────────────────────────────────────
//  METRIC CARD
// ─────────────────────────────────────────
const MetricCard = ({
    metric,
    index,
}: {
    metric: DashboardMetric;
    index: number;
}) => {
    const Icon = metricIcons[index];
    const sparkColors = ["#6366f1", "#22d3ee", "#f59e0b", "#34d399"];
    const color = sparkColors[index];

    const trendEl =
        metric.trend === "up" ? (
            <span className="flex items-center gap-0.5 text-emerald-400">
                <TrendingUp size={12} />
                +{metric.delta}%
            </span>
        ) : metric.trend === "down" ? (
            <span className="flex items-center gap-0.5 text-red-400">
                <TrendingDown size={12} />
                {metric.delta}%
            </span>
        ) : (
            <span className="flex items-center gap-0.5 text-slate-400">
                <Minus size={12} />
                {metric.delta}%
            </span>
        );

    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#13151f] p-5 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_0_30px_rgba(99,102,241,0.08)]"
        >
            {/* glow top */}
            <div
                className="pointer-events-none absolute -top-6 left-4 h-16 w-16 rounded-full opacity-20 blur-2xl"
                style={{ background: color }}
            />

            <div className="mb-3 flex items-start justify-between">
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: `${color}22` }}
                >
                    <Icon size={16} style={{ color }} />
                </div>
                <span className="text-xs font-medium" style={{ color }}>
                    {trendEl}
                </span>
            </div>

            <div className="mb-1 text-2xl font-bold tracking-tight text-white">
                {metric.value}
            </div>
            <div className="mb-1 text-sm font-medium text-slate-300">
                {metric.label}
            </div>
            <div className="text-xs text-slate-500">{metric.description}</div>

            <div className="mt-3 opacity-60 transition-opacity group-hover:opacity-100">
                <Sparkline data={sparklines[index]} color={color} />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
//  PROGRESS BAR
// ─────────────────────────────────────────
const ProgressBar = ({
    value,
    color,
}: {
    value: number;
    color: string;
}) => (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${value}%`, background: color }}
        />
    </div>
);

// ─────────────────────────────────────────
//  PAGE COMPONENT
// ─────────────────────────────────────────
export default function EstatisticasPage() {
    const [activeMetric, setActiveMetric] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-[#0a0b10] px-4 py-8 text-white sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-indigo-400">
                    <Zap size={12} />
                    Study Intelligence
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Centro de Comando
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Junho 2025 · Última atualização há 3 minutos
                </p>
            </div>

            {/* ── 1. METRIC BENTO GRID ── */}
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {metrics.map((m, i) => (
                    <MetricCard key={m.label} metric={m} index={i} />
                ))}
            </div>

            {/* ── ROW 2: Radar + Area Chart ── */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* Radar de Produtividade */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#13151f] p-5 lg:col-span-2">
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15">
                                <Star size={13} className="text-indigo-400" />
                            </div>
                            <span className="text-sm font-semibold text-slate-200">
                                Radar de Produtividade
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Distribuição semanal de energia
                        </p>
                    </div>

                    {/* Perfil badge */}
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                        <Flame size={11} />
                        Guerreiro de Fim de Semana
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart
                            data={dayOfWeekDistribution}
                            margin={{ top: 5, right: 20, bottom: 5, left: 20 }}
                        >
                            <PolarGrid
                                stroke="rgba(255,255,255,0.06)"
                                strokeDasharray="3 3"
                            />
                            <PolarAngleAxis
                                dataKey="day"
                                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                            />
                            <Radar
                                name="Horas"
                                dataKey="hours"
                                stroke="#6366f1"
                                fill="#6366f1"
                                fillOpacity={0.18}
                                strokeWidth={1.5}
                            />
                            <Radar
                                name="Sessões"
                                dataKey="sessions"
                                stroke="#22d3ee"
                                fill="#22d3ee"
                                fillOpacity={0.1}
                                strokeWidth={1}
                                strokeDasharray="4 2"
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "#0f1117",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: 10,
                                    fontSize: 12,
                                    color: "#e2e8f0",
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>

                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block h-1.5 w-4 rounded-full bg-indigo-500" />
                            Horas
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block h-px w-4 border-t border-dashed border-cyan-400" />
                            Sessões
                        </span>
                    </div>
                </div>

                {/* Gráfico de Montanha Acumulada */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#13151f] p-5 lg:col-span-3">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15">
                                    <TrendingUp size={13} className="text-violet-400" />
                                </div>
                                <span className="text-sm font-semibold text-slate-200">
                                    Acúmulo Mensal
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Horas empilhadas por matéria · Junho 2025
                            </p>
                        </div>
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-300">
                            142h total
                        </span>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart
                            data={monthlyAccumulated}
                            margin={{ top: 5, right: 5, bottom: 0, left: -10 }}
                        >
                            <defs>
                                {[
                                    ["calcDiff", "#6366f1"],
                                    ["reactQuery", "#22d3ee"],
                                    ["mecQuan", "#a78bfa"],
                                    ["historia", "#34d399"],
                                ].map(([key, color]) => (
                                    <linearGradient
                                        key={key}
                                        id={`grad-${key}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.04)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="day"
                                tick={{ fill: "#475569", fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                interval={4}
                            />
                            <YAxis
                                tick={{ fill: "#475569", fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `${v.toFixed(0)}h`}
                            />
                            <Tooltip content={<CustomAreaTooltip />} />
                            {(
                                [
                                    ["historia", "#34d399", "História Moderna"],
                                    ["mecQuan", "#a78bfa", "Mecânica Quântica"],
                                    ["reactQuery", "#22d3ee", "React Query"],
                                    ["calcDiff", "#6366f1", "Cálculo Dif."],
                                ] as const
                            ).map(([key, color, name]) => (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    name={name}
                                    stackId="1"
                                    stroke={color}
                                    strokeWidth={1.5}
                                    fill={`url(#grad-${key})`}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>

                    <div className="mt-3 flex flex-wrap gap-3">
                        {[
                            ["Cálculo Dif.", "#6366f1"],
                            ["React Query", "#22d3ee"],
                            ["Mecânica Q.", "#a78bfa"],
                            ["História", "#34d399"],
                        ].map(([label, color]) => (
                            <span
                                key={label}
                                className="flex items-center gap-1.5 text-xs text-slate-500"
                            >
                                <span
                                    className="inline-block h-2 w-2 rounded-full"
                                    style={{ background: color }}
                                />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── ROW 3: Matérias + Heatmap + Goal ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Matérias em Destaque */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#13151f] p-5 lg:col-span-1">
                    <div className="mb-5">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
                                <BookOpen size={13} className="text-emerald-400" />
                            </div>
                            <span className="text-sm font-semibold text-slate-200">
                                Matérias em Destaque
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Top 4 · este mês</p>
                    </div>

                    <div className="space-y-4">
                        {topTopics.map((topic) => {
                            const cfg = topicConfig[topic.name];
                            return (
                                <div
                                    key={topic.name}
                                    className="group rounded-xl p-3 transition-colors duration-200 hover:bg-white/[0.03]"
                                    style={{ background: `${cfg.bgGlow}` }}
                                >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <span
                                            className="truncate text-sm font-medium"
                                            style={{ color: cfg.color }}
                                        >
                                            {topic.name}
                                        </span>
                                        <span
                                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeColor[cfg.badge]}`}
                                        >
                                            {badgeLabel[cfg.badge]}
                                        </span>
                                    </div>

                                    <ProgressBar value={topic.completion} color={cfg.color} />

                                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                                        <span>{topic.totalHours}h estudadas</span>
                                        <span style={{ color: cfg.color }}>
                                            {topic.completion}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Heatmap Horário */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#13151f] p-5 lg:col-span-1">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15">
                                    <Clock size={13} className="text-amber-400" />
                                </div>
                                <span className="text-sm font-semibold text-slate-200">
                                    Relógio Biológico
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Pico de atividade por hora
                            </p>
                        </div>
                    </div>

                    {/* Peak badge */}
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/8 p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                            <Zap size={14} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-amber-300">
                                Pico de Performance
                            </p>
                            <p className="text-xs text-slate-400">
                                Você rende mais às{" "}
                                <strong className="text-white">{peakHour.hour}</strong> com{" "}
                                <strong className="text-white">
                                    {peakHour.sessions.toFixed(1)}
                                </strong>{" "}
                                sessões
                            </p>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={185}>
                        <BarChart
                            data={hourlyHeatmap}
                            margin={{ top: 0, right: 4, bottom: 0, left: -20 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.04)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="hour"
                                tick={{ fill: "#475569", fontSize: 9 }}
                                tickLine={false}
                                axisLine={false}
                                interval={3}
                            />
                            <YAxis
                                tick={{ fill: "#475569", fontSize: 9 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomBarTooltip />} cursor={false} />
                            <Bar dataKey="sessions" radius={[3, 3, 0, 0]}>
                                {hourlyHeatmap.map((entry, idx) => (
                                    <rect
                                        key={`bar-${idx}`}
                                        fill={
                                            entry.hour === peakHour.hour
                                                ? "#f59e0b"
                                                : entry.sessions > 3
                                                    ? "#6366f1"
                                                    : entry.sessions > 1.5
                                                        ? "#6366f180"
                                                        : "#6366f130"
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-amber-400" /> Pico
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" /> Alta
                            atividade
                        </span>
                    </div>
                </div>

                {/* Previsão de Metas – Gamificação */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#13151f] p-5 lg:col-span-1">
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15">
                                <Target size={13} className="text-violet-400" />
                            </div>
                            <span className="text-sm font-semibold text-slate-200">
                                Previsão de Metas
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Ritmo atual · meta de {goalHours}h
                        </p>
                    </div>

                    {/* Radial gauge */}
                    <div className="relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={180}>
                            <RadialBarChart
                                innerRadius="65%"
                                outerRadius="90%"
                                startAngle={220}
                                endAngle={-40}
                                data={radialData}
                                barSize={10}
                            >
                                <defs>
                                    <linearGradient
                                        id="radialGrad"
                                        x1="0"
                                        y1="0"
                                        x2="1"
                                        y2="1"
                                    >
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a78bfa" />
                                    </linearGradient>
                                </defs>
                                <RadialBar
                                    background={{ fill: "rgba(255,255,255,0.04)" }}
                                    dataKey="value"
                                    fill="url(#radialGrad)"
                                    cornerRadius={6}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        {/* Center label */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-white">
                                {goalProgress}%
                            </span>
                            <span className="text-xs text-slate-400">da meta</span>
                        </div>
                    </div>

                    {/* Insight card */}
                    <div className="mt-2 rounded-xl border border-indigo-500/15 bg-indigo-500/8 p-4">
                        <div className="mb-1 flex items-center gap-1.5">
                            <Award size={13} className="text-indigo-400" />
                            <span className="text-xs font-semibold text-indigo-300">
                                Projeção Inteligente
                            </span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-300">
                            No ritmo atual, você atingirá sua meta de{" "}
                            <strong className="text-white">{goalHours}h</strong> em{" "}
                            <strong className="text-indigo-300">
                                {daysRemaining} dias
                            </strong>
                            . Mantendo esse passo, você conclui antes de agosto! 🎯
                        </p>
                    </div>

                    <div className="mt-4 space-y-2">
                        {[
                            {
                                label: "Concluído",
                                value: `${currentHours}h`,
                                pct: goalProgress,
                                color: "#6366f1",
                            },
                            {
                                label: "Restante",
                                value: `${goalHours - currentHours}h`,
                                pct: 100 - goalProgress,
                                color: "rgba(255,255,255,0.08)",
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center justify-between text-xs"
                            >
                                <span className="flex items-center gap-2 text-slate-400">
                                    <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ background: item.color }}
                                    />
                                    {item.label}
                                </span>
                                <span className="font-mono font-semibold text-slate-200">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 py-2.5 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20">
                        Ajustar Meta <ChevronRight size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}