"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatDuration, parseTimeToMinutes } from "../utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { usePlannerActions } from "./PlannerActionsContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LayoutGrid, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { DonutRing } from "./sidebar/DonutRing";
import { WeekBarChart, DAY_NAMES } from "./sidebar/WeekBarChart";
import { SubjectProgress } from "./sidebar/SubjectProgress";
import { BacklogList } from "./sidebar/BacklogList";

export function SidebarTools() {
    const {
        allBlocks,
        removeBlock,
        openAddModal,
        showLogs,
        setShowLogs,
    } = usePlannerActions();

    const [isCollapsed, setIsCollapsed] = useState(false);

    const unscheduledCount = allBlocks.filter((b) => b.dayIndex === -1).length;

    const dayLoads = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const dayBlocks = allBlocks.filter((b) => b.dayIndex === i);
            const plannedMinutes = dayBlocks.reduce(
                (acc, b) => acc + parseTimeToMinutes(b.endTime) - parseTimeToMinutes(b.startTime), 0
            );
            const doneMinutes = dayBlocks
                .filter((b) => b.status === "done")
                .reduce((acc, b) => acc + parseTimeToMinutes(b.endTime) - parseTimeToMinutes(b.startTime), 0);
            return {
                dayIndex: i,
                dayLabel: DAY_NAMES[i],
                plannedMinutes,
                doneMinutes,
                completionPct: plannedMinutes > 0 ? Math.round((doneMinutes / plannedMinutes) * 100) : 0,
            };
        });
    }, [allBlocks]);

    const totalPlanned = useMemo(() => dayLoads.reduce((acc, d) => acc + d.plannedMinutes, 0), [dayLoads]);
    const totalDone = useMemo(() => dayLoads.reduce((acc, d) => acc + d.doneMinutes, 0), [dayLoads]);
    const overallEfficiency = totalPlanned > 0 ? Math.round((totalDone / totalPlanned) * 100) : 0;
    const effColor = overallEfficiency >= 80 ? "#10b981" : overallEfficiency >= 40 ? "#f59e0b" : "#f43f5e";

    // ── Collapsed state ────────────────────────────────────────────────────────
    if (isCollapsed) {
        return (
            <aside id="planner-sidebar" className="border-l bg-muted/5 flex flex-col items-center py-3 gap-3 w-12 shrink-0 transition-all duration-300">
                <Button variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => setIsCollapsed(false)} title="Expandir sidebar">
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <Separator />
                <Button variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => { setIsCollapsed(false); openAddModal(0); }} title="Adicionar bloco">
                    <Plus className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 relative"
                    onClick={() => setIsCollapsed(false)} title="Backlog">
                    <LayoutGrid className="w-4 h-4" />
                    {unscheduledCount > 0 && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                </Button>
            </aside>
        );
    }

    return (
        <aside id="planner-sidebar" className="border-l bg-muted/5 flex flex-col w-64 lg:w-72 shrink-0 transition-all duration-300 h-full overflow-hidden">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <div className="flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Estatísticas & Ferramentas
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => setIsCollapsed(true)}>
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-8">
                    {/* ── Add block CTA ── */}
                    <Button
                        variant="outline"
                        className="w-full h-9 gap-2 font-medium border-dashed hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                        onClick={() => openAddModal(0)}
                    >
                        <Plus className="w-4 h-4" />
                        Novo Bloco de Estudo
                    </Button>

                    {/* ── Charts ── */}
                    <section className="bg-background border rounded-xl p-4 shadow-sm">
                        <div className="flex justify-center mb-4">
                            <DonutRing
                                value={overallEfficiency}
                                color={effColor}
                                label="Eficiência Geral"
                                sublabel={`${formatDuration(totalDone)} / ${formatDuration(totalPlanned)} concl.`}
                            />
                        </div>
                        <Separator className="my-4" />
                        <WeekBarChart dayLoads={dayLoads} />
                    </section>

                    {/* ── Backlog ── */}
                    <BacklogList />

                    {/* ── Subject progress ── */}
                    <SubjectProgress />
                </div>
            </ScrollArea>

            {/* ── Footer ── */}
            <div className={cn("p-4 border-t shrink-0 space-y-3 bg-muted/20")}>
                <Button
                    variant="ghost" size="sm"
                    className="w-full text-[11px] text-muted-foreground/70 hover:bg-muted/50 h-7 gap-1.5"
                    onClick={() => setShowLogs((prev) => !prev)}
                >
                    {showLogs ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showLogs ? "Ocultar sessões da semana" : "Mostrar sessões da semana"}
                </Button>

                <Button
                    variant="ghost" size="sm"
                    className="w-full text-[11px] text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 h-7 gap-1.5"
                    onClick={() => {
                        if (confirm("Tem certeza que deseja limpar todo o planejamento? Esta ação não pode ser desfeita.")) {
                            allBlocks.filter((b) => !b.isLog).forEach((b) => removeBlock(b.id));
                        }
                    }}
                >
                    <Trash2 className="w-3 h-3" />
                    Limpar planejamento
                </Button>
            </div>
        </aside>
    );
}