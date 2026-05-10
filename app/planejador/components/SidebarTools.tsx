import { cn } from "@/lib/utils";
import { COLOR_MAP, formatDuration } from "../utils";
import { Separator } from "@/components/ui/separator";
import { useMemo, useState } from "react";
import { usePlannerActions } from "./PlannerActionsContext";
import { Button } from "@/components/ui/button";
import { LayoutList, Plus } from "lucide-react";

function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/5">
            <div
                className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    progress >= 100 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" :
                        progress > 50 ? "bg-primary" : "bg-amber-500"
                )}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

export function SidebarTools() {
    const {
        allBlocks,
        openAddModal
    } = usePlannerActions();

    const [isCollapsed, setIsCollapsed] = useState(false);


    const subjectsSummary = useMemo(() => {
        const summary = new Map<string, { plannedMinutes: number; doneMinutes: number; color: keyof typeof COLOR_MAP }>();

        for (const block of allBlocks) {
            const [startH, startM] = block.startTime.split(":").map(Number);
            const [endH, endM] = block.endTime.split(":").map(Number);
            const minutes = Math.max(0, (endH * 60 + endM) - (startH * 60 + startM));

            const current = summary.get(block.subject) ?? {
                plannedMinutes: 0,
                doneMinutes: 0,
                color: block.color,
            };

            current.plannedMinutes += minutes;
            if (block.status === "done") {
                current.doneMinutes += minutes;
            }
            summary.set(block.subject, current);
        }

        return Array.from(summary.entries())
            .map(([subject, values]) => ({ subject, ...values }))
            .sort((a, b) => b.plannedMinutes - a.plannedMinutes);
    }, [allBlocks]);

    return (
       
        <aside className={cn("border-l bg-muted/10 flex flex-col h-full p-4 transition-transform duration-300  ",
            isCollapsed ? "w-16" : "md:w-64 lg:w-100")}
        >
            <Button variant="ghost" className="absolute top-2 right-2 p-2 flex" onClick={() => setIsCollapsed(prev => !prev)}>
                <LayoutList
                    className={cn("w-16 h-16 transition-transform border border-border", isCollapsed && "rotate-180")}
                />
            </Button>
            {!isCollapsed && (
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground  mb-4">Matérias Dedicadas</h2>

                        {subjectsSummary.map(({ subject, plannedMinutes, doneMinutes, color }) => {
                            const progress = plannedMinutes > 0 ? (doneMinutes / plannedMinutes) * 100 : 0;
                            const colors = COLOR_MAP[color];
                            return (
                                <div key={subject}>
                                    <div className="flex justify-between items-center font-semibold text-sm">
                                        <div className="flex flex-row items-center gap-2">
                                            <div className={cn("w-2 h-4 rounded-full shrink-0", colors.badge)}></div>
                                            <span className="font-sm font-semibold truncate">{subject}</span>
                                        </div>
                                        <span className="text-[10px] ">{formatDuration(doneMinutes)} / {formatDuration(plannedMinutes)}</span>
                                    </div>
                                    <ProgressBar progress={progress} />
                                </div>
                            );
                        })}
                        {subjectsSummary.map(({ subject, plannedMinutes, doneMinutes, color }) => {
                            const progress = plannedMinutes > 0 ? (doneMinutes / plannedMinutes) * 100 : 0;
                            const colors = COLOR_MAP[color];
                            return (
                                <div key={subject}>
                                    <div className="flex justify-between items-center font-semibold text-sm">
                                        <div className="flex flex-row items-center gap-2">
                                            <div className={cn("w-2 h-4 rounded-full shrink-0", colors.badge)}></div>
                                            <span className="font-sm font-semibold truncate">{subject}</span>
                                        </div>
                                        <span className="text-[10px] ">{formatDuration(doneMinutes)} / {formatDuration(plannedMinutes)}</span>
                                    </div>
                                    <ProgressBar progress={progress} />
                                </div>
                            );
                        })}

                        {subjectsSummary.length === 0 && (
                            <p className="text-xs text-muted-foreground">Nenhum bloco cadastrado ainda.</p>
                        )}
                    </div>

                    <Separator />
                    <Separator />

                    <section>
                        <Button
                            variant={"outline"}
                            className="py-2 px-2 w-full h-auto bg-background flex flex-col"
                            onClick={() => openAddModal(0)}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-medium">Adicionar Matéria</span>
                        </Button>
                    </section>

                </div>
            )}
            
        </aside>
    )
}