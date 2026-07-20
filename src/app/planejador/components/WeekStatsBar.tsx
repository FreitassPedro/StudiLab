"use client";

import { Clock, CheckCircle2, BarChart2 } from "lucide-react";
import { StudyBlock, Subject } from "./mockData";
import { formatDuration, parseTimeToMinutes, hexToRgba } from "../utils";
import { cn } from "@/lib/utils";

interface WeekStatsBarProps {
    blocks: StudyBlock[];
    subjects: Subject[];
}

export function WeekStatsBar({ blocks, subjects }: WeekStatsBarProps) {
    const totalBlocks = blocks.length;
    const completedBlocks = blocks.filter((b) => b.status === "done").length;
    const completionRate = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

    const totalMinutes = blocks.reduce((acc, b) => {
        return acc + (parseTimeToMinutes(b.endTime) - parseTimeToMinutes(b.startTime));
    }, 0);

    const completedMinutes = blocks
        .filter((b) => b.status === "done")
        .reduce((acc, b) => acc + (parseTimeToMinutes(b.endTime) - parseTimeToMinutes(b.startTime)), 0);

    // Subject breakdown: subjectId → total minutes planned
    const subjectBreakdown: Record<string, number> = {};
    blocks.forEach((b) => {
        const dur = parseTimeToMinutes(b.endTime) - parseTimeToMinutes(b.startTime);
        subjectBreakdown[b.subjectId] = (subjectBreakdown[b.subjectId] ?? 0) + dur;
    });

    const topSubjects = Object.entries(subjectBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    const circumference = 2 * Math.PI * 16; // r=16

    return (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 border-b bg-muted/5 text-sm shrink-0">
            {/* Progress circle */}
            <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18" cy="18" r="16"
                            fill="none" stroke="currentColor" strokeWidth="3.5"
                            className="text-muted/30"
                        />
                        <circle
                            cx="18" cy="18" r="16"
                            fill="none" stroke="currentColor" strokeWidth="3.5"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - (circumference * completionRate) / 100}
                            strokeLinecap="round"
                            className="text-emerald-500 transition-all duration-1000"
                        />
                    </svg>
                    <span className="absolute text-[9px] font-bold tabular-nums">{completionRate}%</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">Progresso</p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {completedBlocks}/{totalBlocks} blocos
                    </p>
                </div>
            </div>

            <div className="h-6 w-px bg-border/50 hidden sm:block shrink-0" />

            {/* Hours planned */}
            <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">Planejado</p>
                    <p className="font-bold text-xs tabular-nums mt-0.5">{formatDuration(totalMinutes)}</p>
                </div>
            </div>

            {/* Hours done */}
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70 shrink-0" />
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">Concluído</p>
                    <p className="font-bold text-xs tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">{formatDuration(completedMinutes)}</p>
                </div>
            </div>

            {/* Subject breakdown */}
            {topSubjects.length > 0 && (
                <>
                    <div className="h-6 w-px bg-border/50 hidden md:block shrink-0" />
                    <div className="hidden md:flex items-center gap-1.5 min-w-0">
                        <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                        <div className="flex items-center gap-4 overflow-hidden">
                            {topSubjects.map(([subjectId, minutes]) => {
                                const subject = subjects.find((s) => s.id === subjectId);
                                const color = subject?.color || "#3b82f6";
                                return (
                                    <div key={subjectId} className="flex items-center gap-1.5 shrink-0">
                                        <div 
                                            className="w-2 h-2 rounded-full shrink-0" 
                                            style={{ backgroundColor: color }}
                                        />
                                        <div>
                                            <p className="text-[10px] font-semibold text-muted-foreground truncate max-w-[80px] leading-none">
                                                {subject?.name ?? subjectId}
                                            </p>
                                            <p className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">{formatDuration(minutes)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
