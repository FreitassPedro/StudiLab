"use client";

import { Brain } from "lucide-react";
import { BarShapeProps, Rectangle } from "recharts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

const MyCustomRectangle = (props: BarShapeProps) => {
    const { fill, payload } = props;

    // A cor fica roxa por padrão, clareando/escurecendo de acordo com os minutos (até 60)
    // Se for 60 exato (100%), fica amarela (#eab308)
    const minutes = payload.minutes || 0;
    const isMax = minutes >= 60;
    
    // Calcula a opacidade baseada nos minutos (mínimo 0.2, máximo 1.0)
    const opacity = Math.min(1, Math.max(0.2, minutes / 60));
    const rectFill = isMax ? `rgba(234, 179, 8, 1)` : `rgba(139, 92, 246, ${opacity})`;

    return <Rectangle {...props}
        fill={rectFill}
        radius={[4, 4, 0, 0]}
    />
}

export default function BiologicalClockView({ chartData, peakHour }: { chartData: any[], peakHour: any }) {
    return (
        <>
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
                            shape={MyCustomRectangle}
                        >
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Insight de Pico */}
            {
                peakHour && peakHour.minutes > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-background/60 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Brain className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-tight">
                            Seu pico de produtividade hoje foi às <span className="font-bold text-foreground">{peakHour.hour}h</span> com <span className="font-bold text-foreground">{peakHour.minutes} min</span> de foco.
                        </p>
                    </div>
                )
            }
        </>
    )
}
