"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboard";
import { Brain, Zap } from "lucide-react";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function BiologicalClock() {
    const { data: dashboardData } = useDashboardData();
    const logs = dashboardData?.logs;
    const biologicalClock = dashboardData?.charts?.biologicalClock;

    const chartData = useMemo(() => {
        if (!biologicalClock) {
            return Array.from({ length: 24 }, (_, i) => ({
                hour: i,
                minutes: 0,
                label: `${i}h`,
            }));
        }
        return biologicalClock.map(item => ({
            ...item,
            label: `${item.hour}h`,
        }));
    }, [biologicalClock]);

    const peakHour = useMemo(() =>
        [...chartData].sort((a, b) => b.minutes - a.minutes)[0]
        , [chartData]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border border-border p-2 rounded-lg shadow-md text-xs font-bold">
                    <p>{payload[0].payload.hour}:00</p>
                    <p className="text-primary">{payload[0].value} min estudados</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="border-none bg-linear-to-br from-primary/5 to-secondary/5 shadow-md overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Ritmo Circadiano
                </CardTitle>
                <p className="text-xs text-muted-foreground">Distribuição de foco nas 24h do dia</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-40 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="hour"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                ticks={[0, 4, 8, 12, 16, 20, 24]}
                                tickFormatter={(value) => `${value}h`}
                            />
                            <YAxis hide domain={[0, 60]} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar
                                dataKey="minutes"
                                radius={[4, 4, 0, 0]}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.minutes >= 60 ? "var(--primary)" : "var(--primary)/40)"}
                                        fillOpacity={entry.minutes >= 60 ? 1 : entry.minutes >= 30 ? 0.6 : 0.4}
                                        className={entry.minutes >= 60 ? "drop-shadow-[0_0_8px_rgba(var(--primary),0.6)]" : ""}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Insight de Pico */}
                {peakHour.minutes > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-background/60 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Brain className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-tight">
                            Seu pico de produtividade hoje foi às <span className="font-bold text-foreground">{peakHour.hour}h</span> com <span className="font-bold text-foreground">{peakHour.minutes} min</span> de foco.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
