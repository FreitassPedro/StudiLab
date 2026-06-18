"use client";

import { Label, LabelList, LabelProps, Pie, PieChart, PieSectorShapeProps, ResponsiveContainer, Sector, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import { PieChartData } from "@/server/actions/charts.action";

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
        <Label {...props} fontSize={11} fontWeight={500} position="outside" offset={20} />
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

export const StudyPieChart = ({ data: dataLoad }: { data: PieChartData[] | undefined }) => {

    const chartData = dataLoad;

    if (!chartData) return null;

    const totalMinutes = chartData.reduce((sum, item) => sum + toNumber(item.value), 0);

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
                                    data={chartData}
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

                        <CustomLegend data={chartData} totalMinutes={totalMinutes} />
                    </>
                )}
            </CardContent>
        </Card>
    );
};