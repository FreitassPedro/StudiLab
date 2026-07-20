"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDuration } from "../utils";

interface PlannerHeaderProps {
    weekLabel: string;
    weekOffset: number;
    isCurrentWeek: boolean;
    totalMinutes: number;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onGoToCurrentWeek: () => void;
}

export function PlannerHeader({
    weekLabel,
    weekOffset,
    isCurrentWeek,
    totalMinutes,
    onPrevWeek,
    onNextWeek,
    onGoToCurrentWeek,
}: PlannerHeaderProps) {
    return (
        <header className="flex items-center justify-between px-6 py-3 border-b shrink-0 bg-background/95 backdrop-blur-md z-20">
            <div className="flex items-center gap-4">
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl">
                        <CalendarDays className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight leading-none">Planejador</h1>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                            Semanal
                        </p>
                    </div>
                </div>

                <Separator orientation="vertical" className="h-8" />

                {/* Week navigator pill */}
                <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border">
                    <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 hover:bg-background"
                        onClick={onPrevWeek}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <button
                        className="px-3 py-1 flex flex-col items-center min-w-[130px]"
                        onClick={onGoToCurrentWeek}
                    >
                        <span className="text-[11px] font-bold tabular-nums">{weekLabel}</span>
                        <span className="text-[9px] text-muted-foreground font-medium">
                            {isCurrentWeek ? "Esta semana" : weekOffset > 0 ? `+${weekOffset} sem.` : `${weekOffset} sem.`}
                        </span>
                    </button>
                    <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 hover:bg-background"
                        onClick={onNextWeek}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Right: total planned */}
            <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={13} />
                <span className="text-xs">
                    <strong className="text-foreground">{formatDuration(totalMinutes)}</strong>
                    {" "}planejados
                </span>
            </div>
        </header>
    );
}
