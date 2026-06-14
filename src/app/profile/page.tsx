"use client";

import {
    BookOpen,
    CheckCircle2,
    Circle,
    Clock,
    Edit3,
    Flame,
    Star,
    Target,
    Timer,
    TrendingUp,
    Trophy,
    Zap,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const userData = {
    name: "Caio Martins",
    username: "@caiostudos",
    bio: "Focado no ENEM 2024 e concursos públicos. Estudando todo dia, um passo de cada vez. ☕📚",
    avatar: "CM",
    streak: 15,
    level: 12,
    xp: 3_240,
    xpToNext: 5_000,
    stats: {
        totalHours: 127,
        topicsDone: 84,
        dailyAvg: 2.4,
        pomodoros: 312,
    },
    goals: [
        { id: 1, text: "Estudar 2h de Matemática hoje", done: true },
        { id: 2, text: "Concluir tópico de Redação - Dissertação", done: true },
        { id: 3, text: "Revisar Funções do 2º Grau", done: false },
        { id: 4, text: "Fazer 20 questões de História", done: false },
        { id: 5, text: "Assistir aula de Química Orgânica", done: false },
    ],
    targets: ["ENEM 2024", "Banco do Brasil", "Receita Federal", "IBGE"],
    friends: [
        { id: 1, name: "Ana Lima", avatar: "AL", status: "Estudando História", online: true },
        { id: 2, name: "Bruno Souza", avatar: "BS", status: "Estudando Matemática", online: true },
        { id: 3, name: "Carla Neves", avatar: "CN", status: "Offline", online: false },
        { id: 4, name: "Diego Ramos", avatar: "DR", status: "Estudando Redação", online: true },
        { id: 5, name: "Elisa Mota", avatar: "EM", status: "Offline", online: false },
        { id: 6, name: "Felipe Barros", avatar: "FB", status: "Estudando Física", online: true },
    ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
    return (
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-brand/40 transition-colors duration-200 group">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</span>
                <span className="text-brand opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>
            </div>
            <div>
                <p className="text-primary text-2xl font-bold leading-none">{value}</p>
                {sub && <p className="text-muted-foreground text-xs mt-1">{sub}</p>}
            </div>
        </div>
    );
}

interface FriendRowProps {
    name: string;
    avatar: string;
    status: string;
    online: boolean;
}

function FriendRow({ name, avatar, status, online }: FriendRowProps) {
    return (
        <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-background transition-colors duration-150 group cursor-default">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-brand/20 border border-border flex items-center justify-center text-brand text-xs font-bold">
                    {avatar}
                </div>
                {online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card">
                        <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
                    </span>
                )}
            </div>
            {/* Info */}
            <div className="min-w-0 flex-1">
                <p className="text-primary text-sm font-medium truncate">{name}</p>
                <p className="text-muted-foreground text-xs truncate">
                    {online ? <span className="text-success">🟢 {status}</span> : <span>⚪ Offline</span>}
                </p>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PerfilPage() {
    const user = userData;

    return (
        <div className="min-h-screen bg-background text-primary">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-6">

                {/* ── 1. Hero / Profile Header ─────────────────────────────────────── */}
                <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand/20 border-2 border-brand/40 flex items-center justify-center text-brand text-3xl font-extrabold shadow-lg">
                                {user.avatar}
                            </div>

                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h1 className="text-primary text-2xl sm:text-3xl font-bold tracking-tight">
                                        {user.name}
                                    </h1>
                                    <p className="text-brand text-sm font-medium mt-0.5">{user.username}</p>
                                </div>

                            </div>
                            <p className="text-foreground text-sm mt-3 leading-relaxed max-w-xl">{user.bio}</p>
                        </div>
                    </div>
                </div>
                {/* ── 4. Stats Grid ────────────────────────────────────────────────── */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-brand" />
                        <h2 className="text-primary font-semibold text-base">Estatísticas</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatCard
                            icon={<Clock size={16} />}
                            label="Total Horas"
                            value={`${user.stats.totalHours}h`}
                            sub="desde o início"
                        />

                        <StatCard
                            icon={<Flame size={16} />}
                            label="Média Diária"
                            value={`${user.stats.dailyAvg}h`}
                            sub="por dia"
                        />
                        <StatCard
                            icon={<Flame size={16} />}
                            label="Matéria mais estudada"
                            value={`Matemática`}
                            sub="por dia"
                        />

                    </div>
                </div>
                {/* ── 2. Gamification Row ──────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Streak Card */}
                    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden hover:border-success/40 transition-colors duration-300 group">
                        <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center text-3xl flex-shrink-0">
                                🔥
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">Study Streak</p>
                                <p className="text-success text-4xl font-black leading-none">{user.streak} <span className="text-xl font-bold">Dias</span></p>
                            </div>
                        </div>
                        <div className="relative mt-4 flex gap-1.5">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < (user.streak % 7 || 7) ? "bg-success" : "bg-border"
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="relative text-muted-foreground text-xs mt-1.5 text-right">{user.streak % 7 || 7}/7 dias esta semana</p>
                    </div>

                </div>

                {/* ── 3. Goals & Targets Row ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Exam Targets */}
                    <div className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen size={16} className="text-brand" />
                            <h2 className="text-primary font-semibold text-base">Objetivos</h2>
                        </div>
                        <div className="flex flex-col gap-2 ">
                            {user.targets.map((target) => (
                                <span
                                    key={target}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold"
                                >
                                    <Zap size={10} />
                                    {target}
                                    <span className="ml-auto text-sm font-extralight text-muted-foreground">Meta: Ago 2024</span>
                                </span>
                            ))}
                        </div>


                    </div>
                </div>



                {/* ── 5. Social / Friends ──────────────────────────────────────────── */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">👥</span>
                            <h2 className="text-primary font-semibold text-base">Comunidade de Estudo</h2>
                        </div>
                        <span className="text-xs text-success font-medium bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                            {user.friends.filter((f) => f.online).length} online agora
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                        {user.friends.map((friend) => (
                            <FriendRow
                                key={friend.id}
                                name={friend.name}
                                avatar={friend.avatar}
                                status={friend.status}
                                online={friend.online}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}