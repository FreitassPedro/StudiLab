"use client";

import { useEffect, useState } from "react";
import { StudyBlock } from "@/app/planejador/components/mockData";
import { hexToRgba } from "@/app/planejador/utils";
import { CheckCircle2, Circle, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PLANNER_BLOCKS_STORAGE_KEY = "planner.blocks.v1";

export function DailyPlannerSummary() {
    const [blocks, setBlocks] = useState<StudyBlock[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(PLANNER_BLOCKS_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as StudyBlock[];
                setBlocks(parsed);
            } catch {
                console.error("Failed to parse stored planner blocks");
            }
        }
        setIsLoaded(true);
    }, []);

    const todayIndex = (new Date().getDay() + 6) % 7;
    const todaysBlocks = blocks.filter(b => b.dayIndex === todayIndex);
    todaysBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (!isLoaded) return <div className="h-48 bg-muted/20 animate-pulse rounded-2xl" />;

    if (todaysBlocks.length === 0) {
        return (
            <section className="bg-background border border-dashed rounded-2xl p-5 shadow-sm space-y-4 flex flex-col items-center justify-center text-center">
                <Target className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Você não tem metas no planejador para hoje.</p>
                <Link href="/planejador">
                    <Button variant="outline" size="sm">Planejar o dia</Button>
                </Link>
            </section>
        );
    }

    const doneCount = todaysBlocks.filter(b => b.status === "done").length;
    const totalCount = todaysBlocks.length;
    const progress = Math.round((doneCount / totalCount) * 100);

    return (
        <section className="bg-background border rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Metas do Planejador (Hoje)</h3>
                </div>
                <div className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {progress}% concluído
                </div>
            </div>
            
            <div className="space-y-3 max-h-[350px] overflow-auto pr-1">
                {todaysBlocks.map(block => {
                    const baseColor = block.color || "#3b82f6";
                    return (
                        <div 
                            key={block.id} 
                            className={cn(
                                "flex flex-col p-3 rounded-xl border transition-all",
                                block.status === "done" ? "opacity-60 grayscale-[0.5] bg-muted/40" : ""
                            )}
                            style={{
                                backgroundColor: block.status !== "done" ? hexToRgba(baseColor, 0.1) : undefined,
                                borderColor: block.status !== "done" ? hexToRgba(baseColor, 0.3) : undefined,
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 mt-0.5">
                                    {block.status === "done" ? (
                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                    ) : (
                                        <Circle className="w-4 h-4 text-muted-foreground/40" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 
                                        className={cn("text-sm font-semibold truncate", block.status === "done" && "line-through text-muted-foreground")}
                                        style={block.status !== "done" ? { color: baseColor } : undefined}
                                    >
                                        {block.subjectId}
                                    </h4>
                                    {block.topic && (
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{block.topic}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[11px] font-medium text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded">
                                            {block.startTime} - {block.endTime}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <Link href="/planejador" className="block w-full">
                <Button variant="outline" className="w-full text-xs h-8">Abrir Planejador Semanal</Button>
            </Link>
        </section>
    );
}
