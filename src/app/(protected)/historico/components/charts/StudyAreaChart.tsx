"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, TooltipProps } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAreaChartACtion } from "@/server/actions/charts.action";
import useSearchRangeStore from "@/store/useSearchRangeStore";
import { useAuthStore } from "@/store/useAuthStore";

const formatTime = (minutes: number) => {
    if (minutes === 0) return '0min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const formatDateLabel = (dateString: string) => {
    const parts = dateString.split('-');
    return `${parts[2]}/${parts[1]}`;
};

interface Subject {
    name: string;
    minutes: number;
    color?: string;
}

interface DayStudyData {
    totalMinutes: number;
    materia: Subject[];
}

export interface AreaChartData {
    [date: string]: DayStudyData;
}

interface ChartDataPoint {
    date: string;
    minutes: number;
}
interface CustomToolTipProps extends TooltipProps<number, string> {
    data: AreaChartData;
    payload?: Array<{ payload: { date: string } }>;
}

const CustomTooltip = ({ active, payload, data }: CustomToolTipProps) => {
    // Early returns para casos inválidos
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    // Extrai a data do payload
    const date = payload[0]?.payload?.date;
    if (!date || !data[date]) {
        return null;
    }

    // Extrai dados do dia
    const dayData = data[date];
    const totalMinutes = dayData.totalMinutes || 0;
    const subjects = dayData.materia || [];

    console.log("Tooltip Data:", { date, totalMinutes, subjects });
    console.log("Full Data Object:", data);

    return (
        <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm">
            <p className="font-semibold mb-1">{formatDateLabel(date)}</p>
            <p className="text-muted-foreground">Total: {formatTime(totalMinutes)}</p>
            
            {subjects.length > 0 && (
                <div className="mt-2 pt-2 border-t space-y-1">
                    {subjects.map((subject, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: subject.color || '#8b5cf6' }}
                            />
                            <span>{subject.name}: {formatTime(subject.minutes)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const StudyAreaChart = () => {
    const { startDate, endDate } = useSearchRangeStore();
    const userId = useAuthStore((state) => state.user?.id);

    const { data: rawData, isLoading } = useQuery({
        queryKey: ['charts', 'area', startDate, endDate, userId],
        queryFn: () => getAreaChartACtion(startDate, endDate, userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    const chartData: ChartDataPoint[] = Object.entries(rawData || {}).map(([date, info]) => ({
        date,
        minutes: info.totalMinutes,
    }));

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-violet-500" />
                        Evolução de Estudo
                    </CardTitle>
                    <CardDescription>Tempo total por dia no período</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-50 text-sm text-muted-foreground">
                        Carregando...
                    </div>
                </CardContent>
            </Card>
        );
    }

    const hasData = chartData && chartData.length > 0;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-violet-500" />
                    Evolução de Estudo
                </CardTitle>
                <CardDescription>Tempo total por dia no período</CardDescription>
            </CardHeader>
            <CardContent>
                {!hasData ? (
                    <div className="flex items-center justify-center h-50 text-sm text-muted-foreground">
                        Sem dados para exibir neste período
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradientMinutes" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDateLabel}
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tickFormatter={(v: number) => formatTime(v)}
                                tick={{ fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip data={rawData || {}} />} />
                            <Area
                                type="monotone"
                                dataKey="minutes"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#gradientMinutes)"
                                dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}