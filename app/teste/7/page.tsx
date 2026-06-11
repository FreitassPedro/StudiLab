"use client";

import { Prosto_One } from "next/font/google";
import { Bar, BarChart, BarShapeProps, CartesianGrid, Label, LabelList, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
// Heatmap horário
const hourlyHeatmap = Array.from({ length: 24 }, (_, h) => {
    const patterns: Record<number, number> = {
        6: 32, 7: 23, 8: 11,
        9: 3,
        10: 60,
        11: 23,
        12: 12,
        13: 0.2, 14: 12, 15: 0,
        16: 3.8, 17: 60, 18: 55, 19: 32, 20: 12,
        21: 4.8, 22: 2.6, 23: 0.9,
    };
    return { hour: `${h}h`, minutes: patterns[h] ?? 0 };
});


const MyCustomBar = (props: BarShapeProps) => {
    const minutesValue = Array.isArray(props.value) ? props.value[1] : props.value;

    return <Rectangle {...props} fill={
        minutesValue === 60.0
            ? "#f59e0b"
            : minutesValue > 45.0
                ? "#6366f1"
                : minutesValue > 10.0
                    ? "#6366f180"
                    : "#6366f130"
    }
    />
}
export default function EstatisticasPage() {


    return (
        <div className="min-h-screen  mx-auto flex-col bg-card flex items-center justify-center p-4">
            <h1 className="text-2xl font-bold"> Ola mundo</h1>

            <div className="flex min-h-screen w-full h-full">
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
                            interval={2}
                        />
                        <YAxis
                            tick={{ fill: "#475569", fontSize: 9 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip />
                        <Bar dataKey="minutes" shape={MyCustomBar} radius={[3, 3, 2, 0]}>
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
