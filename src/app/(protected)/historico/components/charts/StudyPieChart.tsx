"use client";

import { Label, LabelList, LabelProps, Pie, PieChart, PieSectorShapeProps, ResponsiveContainer, Sector, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPieChartDataActionRaw } from "@/server/actions/charts.action";
import useSearchRangeStore from "@/store/useSearchRangeStore";
import { useAuthStore } from "@/store/useAuthStore";

const toNumber = (value: number | bigint) => (typeof value === "bigint" ? Number(value) : value);

const formatTime = (minutes: number) => {
    if (minutes === 0) return '0min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const entry = payload[0].payload;
        return (
            <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                </p>
                <p className="text-muted-foreground mt-1">{formatTime(entry.value)}</p>
                <p className="text-muted-foreground">
                    {entry.sessions} {entry.sessions === 1 ? 'sessão' : 'sessões'}
                </p>
            </div>
        );
    }
    return null;
};

const CustomLegend = ({ data, totalMinutes }: { data: any[], totalMinutes: number }) => {
    return (
        <div className="space-y-2 mt-3">
            {data.map((subject, index) => {
                const subjectMinutes = toNumber(subject.value);
                const percentage = totalMinutes > 0
                    ? ((subjectMinutes / totalMinutes) * 100).toFixed(0)
                    : '0';
                return (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <span
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ backgroundColor: subject.color }}
                        />
                        <span className="flex-1 truncate font-medium">{subject.name}</span>
                        <span className="text-muted-foreground tabular-nums text-xs">
                            {formatTime(subjectMinutes)}
                        </span>
                        <span className="text-muted-foreground tabular-nums text-xs w-8 text-right">
                            {percentage}%
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

const MyCustomPie = (props: PieSectorShapeProps) => <Sector {...props} fill={props.fill} />;

const MyCustomLabel = (props: LabelProps) => (
    <>
        <Label {...props} fontSize={11} fontWeight={500}  position="outside" offset={20} />
    </>
);

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) => {
    if (percent < 0.08) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x} y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export const StudyPieChart = () => {
    const { startDate, endDate } = useSearchRangeStore();
    const userId = useAuthStore((state) => state.user?.id);

    const { data: chartData } = useQuery({
        queryKey: ['charts', 'pie', startDate, endDate, userId],
        queryFn: () => getPieChartDataActionRaw(startDate, endDate, userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    if (!chartData) return null;

    // Map data to include 'fill' property for Recharts (modern approach without Cell)
    const data = chartData.map((item) => ({
        ...item,
        value: toNumber(item.value),
        fill: item.color || '#8884d8', // fallback color
    }));
    const totalMinutes = data.reduce((acc, item) => acc + item.value, 0);

    console.log("Dados para o gráfico de pizza:", data);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-cyan-500" />
                    Distribuição por Matéria
                </CardTitle>
                <CardDescription>Tempo dedicado a cada área</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-50 text-sm text-muted-foreground">
                        Sem dados para exibir neste período
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={renderCustomLabel}
                                    innerRadius={50}
                                    outerRadius={85}
                                    paddingAngle={2}
                                    dataKey="value"
                                    shape={MyCustomPie}
                                >
                                    <LabelList dataKey="name" content={MyCustomLabel} />
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        <CustomLegend data={data} totalMinutes={totalMinutes} />
                    </>
                )}
            </CardContent>
        </Card>
    );
};