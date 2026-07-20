"use client";

import { useState } from "react";

const DAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function formatDurationShort(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}m`;
}

interface DayLoad {
    dayIndex: number;
    dayLabel: string;
    plannedMinutes: number;
    doneMinutes: number;
    completionPct: number;
}

interface WeekBarChartProps {
    dayLoads: DayLoad[];
}

export function WeekBarChart({ dayLoads }: WeekBarChartProps) {
    const [hovered, setHovered] = useState<number | null>(null);

    const maxMins = Math.max(...dayLoads.map((d) => d.plannedMinutes), 60);
    const W = 200;
    const H = 60;
    const PAD = { t: 6, b: 18, l: 4, r: 4 };
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const barW = innerW / 7 - 4;

    return (
        <div className="w-full select-none mt-2">
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}
                role="img" aria-label="Carga diária: planejado vs concluído por dia da semana">
                {dayLoads.map((d, i) => {
                    const x = PAD.l + i * (innerW / 7) + 2;
                    const plannedH = (d.plannedMinutes / maxMins) * innerH;
                    const doneH = d.plannedMinutes > 0 ? (d.doneMinutes / maxMins) * innerH : 0;
                    const yBase = PAD.t + innerH;
                    const isHov = hovered === i;
                    const ttX = Math.min(Math.max(x - 10, 2), W - 72);
                    const ttY = yBase - plannedH - 30;

                    return (
                        <g key={i}>
                            {/* Planned bar */}
                            {d.plannedMinutes > 0 && (
                                <rect x={x} y={yBase - plannedH} width={barW} height={plannedH} rx={3}
                                    fill={isHov ? "#94a3b8" : "#e2e8f0"}
                                    style={{ transition: "fill 0.12s" }} />
                            )}
                            {/* Done bar */}
                            {doneH > 0 && (
                                <rect x={x} y={yBase - doneH} width={barW} height={doneH} rx={3}
                                    fill="#10b981" opacity={isHov ? 1 : 0.85}
                                    style={{ transition: "opacity 0.12s" }} />
                            )}
                            {/* Empty tick */}
                            {d.plannedMinutes === 0 && (
                                <rect x={x + barW / 2 - 1} y={yBase - 4} width={2} height={4} rx={1} fill="#cbd5e1" />
                            )}
                            {/* Hover region */}
                            <rect x={x - 1} y={PAD.t} width={barW + 2} height={innerH + 4}
                                fill="transparent" style={{ cursor: "default" }}
                                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
                            {/* Day label */}
                            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize={9}
                                fill={isHov ? "#64748b" : "#94a3b8"}>
                                {d.dayLabel}
                            </text>
                            {/* Tooltip */}
                            {isHov && d.plannedMinutes > 0 && (
                                <g>
                                    <rect x={ttX} y={ttY} width={68} height={24} rx={4} fill="#0f172a" opacity={0.88} />
                                    <text x={ttX + 34} y={ttY + 10} textAnchor="middle" fontSize={9} fill="#f8fafc">
                                        {formatDurationShort(d.doneMinutes)}/{formatDurationShort(d.plannedMinutes)}
                                    </text>
                                    <text x={ttX + 34} y={ttY + 20} textAnchor="middle" fontSize={8} fill="#94a3b8">
                                        {d.completionPct}% concluído
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
            <div className="flex items-center gap-3 mt-1 justify-center">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-600" />
                    Planejado
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    Concluído
                </span>
            </div>
        </div>
    );
}

export { DAY_NAMES };
