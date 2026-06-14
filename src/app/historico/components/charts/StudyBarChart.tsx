"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { getAreaChartACtion } from "@/server/actions/charts.action";
import useSearchRangeStore from "@/store/useSearchRangeStore";
import { useAuthStore } from "@/store/useAuthStore";

const formatTime = (minutes: number) => {
    if (minutes === 0) return "0min";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const formatDateLabel = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}`;
};

interface AreaSubject {
    name: string;
    minutes: number;
    color?: string;
}

interface DayStudyData {
    totalMinutes: number;
    materia: AreaSubject[];
}

interface AreaChartData {
    [date: string]: DayStudyData;
}

interface BarDataPoint {
    date: string;
    totalMinutes: number;
    [subjectName: string]: string | number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Filter out non-bar items (like Line components)
        const barPayload = payload.filter((entry: any) => entry.dataKey !== "totalMinutes");
        // Get total from the payload data itself
        const total = payload[0]?.payload?.totalMinutes || 0;
        const sortedPayload = [...barPayload].sort((a, b) => (b.value || 0) - (a.value || 0));

        return (
            <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold mb-1">{formatDateLabel(label)}</p>
                <p className="text-muted-foreground">Total: {formatTime(total)}</p>

                <div className="mt-2 pt-2 border-t space-y-1">
                    {sortedPayload.map((entry: any) => (
                        <div key={entry.name} className="flex items-center justify-between gap-3">
                            <span className="truncate" style={{ color: entry.color }}>
                                {entry.name}
                            </span>
                            <span className="tabular-nums">{formatTime(entry.value || 0)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export const StudyBarChart = () => {
    const { startDate, endDate } = useSearchRangeStore();
    const userId = useAuthStore((state) => state.user?.id);

    const { data: rawData, isLoading } = useQuery({
        queryKey: ["charts", "bar", startDate, endDate, userId],
        queryFn: () => getAreaChartACtion(startDate, endDate, userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });

    const typedData = (rawData || {}) as AreaChartData;

    const { barData, allMaterias, colorByMateria } = useMemo(() => {
        const subjectsSet = new Set<string>();
        const colorMap = new Map<string, string>();

        const points: BarDataPoint[] = Object.entries(typedData).map(([date, info]) => {
            const bySubject = new Map<string, number>();

            info.materia.forEach((item) => {
                subjectsSet.add(item.name);
                if (item.color && !colorMap.has(item.name)) {
                    colorMap.set(item.name, item.color);
                }
                bySubject.set(item.name, (bySubject.get(item.name) || 0) + item.minutes);
            });

            const point: BarDataPoint = {
                date,
                totalMinutes: info.totalMinutes,
            };

            bySubject.forEach((minutes, name) => {
                point[name] = minutes;
            });

            return point;
        });

        points.sort((a, b) => String(a.date).localeCompare(String(b.date)));

        return {
            barData: points,
            allMaterias: Array.from(subjectsSet),
            colorByMateria: colorMap,
        };
    }, [typedData]);

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-emerald-500" />
                        Minutos por Dia
                    </CardTitle>
                    <CardDescription>Barra total diária segmentada por matéria</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-60">
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Carregando...
                    </div>
                </CardContent>
            </Card>
        );
    }

    const hasData = barData.length > 0;

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    Minutos por Dia
                </CardTitle>
                <CardDescription>Barra total diária segmentada por matéria</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-60">
                {!hasData ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Sem dados para exibir neste período
                    </div>
                ) : (
                    <ResponsiveContainer  width="100%" height="80%">
                        <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
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
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />

                            {allMaterias.map((materia, index) => (
                                <Bar
                                    key={materia}
                                    dataKey={materia}
                                    stackId="total"
                                    name={materia}
                                    fill={
                                        colorByMateria.get(materia) ||
                                        ["#22c55e", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"][index % 6]
                                    }
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};