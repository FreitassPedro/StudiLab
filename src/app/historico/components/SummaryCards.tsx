import { useSummaryStats } from "@/hooks/useStudyLogs";
import { BookOpen, Clock, Timer, TrendingUp, Trophy } from "lucide-react";
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

interface CardInfo {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    subtitle?: string;
    dotColor?: string;
}
export const SummaryCard = ({ card }: { card: CardInfo }) => {
    const Icon = card.icon;

    return (
        <Card key={card.label} >
            <CardContent>
                <div className="flex items-center gap-2 ">
                    <div className={`p-1.5 rounded-md ${card.bg}`}>
                        <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
                    {card.subtitle && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            {card.dotColor && (
                                <span
                                    className="w-2 h-2 rounded-full inline-block"
                                    style={{ backgroundColor: card.dotColor }}
                                />
                            )}
                            {card.subtitle}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function SummaryCards() {

    const { startDate, endDate } = useSearchRangeStore();

    const { data: stats, error, isLoading } = useSummaryStats(startDate, endDate);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Renderiza 5 cartões falsos piscando */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="animate-pulse">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-muted rounded-md" />
                                <div className="h-3 w-16 bg-muted rounded" />
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="h-6 w-20 bg-muted rounded" />
                                <div className="h-3 w-24 bg-muted/50 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    if (error) {
        return (
            <div className="text-red-500">
                Erro ao carregar os dados: {(error as Error).message}
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const cards = [
        {
            label: 'Tempo Total',
            value: formatDuration(stats.totalMinutes),
            icon: Clock,
            color: 'text-violet-500',
            bg: 'bg-violet-500/10',
        },
        {
            label: 'Sessões',
            value: stats.totalSessions.toString(),
            icon: BookOpen,
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10',
        },
        {
            label: 'Média / Sessão',
            value: formatDuration(stats.avgSession),
            icon: Timer,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
        },
        {
            label: 'Sessão mais Longa',
            value: formatDuration(stats.longestSession),
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {

            label: 'Média de horas / dia',
            value: formatDuration(stats.avgMinutesPerDay),
            icon: Timer,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {
            label: 'Matéria Destaque',
            value: stats.topSubject?.name || '—',
            subtitle: stats.topSubject ? formatDuration(stats.topSubjectMinutes) : undefined,
            icon: Trophy,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            dotColor: stats.topSubject?.color,
        },
    ];

    return (
        <div className="grid sm:grid-cols-2  gap-3">
            {cards.map((card) =>
                <SummaryCard key={card.label} card={card} />
            )}
        </div>
    );
}
