import { cn } from "@/lib/utils";
import { COLOR_MAP, formatDuration, } from "../utils";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { usePlannerActions } from "./PlannerActionsContext";
import { Button } from "@/components/ui/button";
import { Calendar,  ChevronsLeft, ChevronsRight, Circle, Plus,  Trash2 } from "lucide-react";
import { ColorName } from "./mockData";

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
        subjects,
        subjectsSummary,
        hiddenSubjects,
        toggleViewSubject,
        removeBlock,
        openAddModal,
    } = usePlannerActions();

    const [isCollapsed, setIsCollapsed] = useState(false);

    if (isCollapsed) {
        return (
            <aside className="border-l flex flex-col w-14 items-center py-4 gap-4">
                <Button
                    variant={"ghost"}
                    size="icon"
                    onClick={() => setIsCollapsed(false)}
                >
                    <ChevronsLeft className="w-4 h-4 shrink-0" />

                </Button>

                <Separator ></Separator>

                <Button
                    variant={"ghost"}
                    size="icon"
                    className="relative w-8 h-8"
                    onClick={() => setIsCollapsed(false)}
                >
                    <Calendar />
                </Button>
            </aside>
        )
    }
    return (
        <aside className={cn("border-l bg-muted/10 flex flex-col h-full p-4 transition-transform duration-300  ",
            isCollapsed ? "w-16" : "md:w-64 lg:w-100")}
        >
            <div>
                <Button
                    variant="outline"
                    className=""
                    onClick={() => setIsCollapsed(prev => !prev)}>
                    <ChevronsRight className="w-4 h-4 shrink-0" />

                </Button>
            </div>
            {!isCollapsed && (
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground  mb-4">Matérias Dedicadas</h2>

                        {subjectsSummary.map(({ subjectId, plannedMinutes, doneMinutes }) => {
                            const subject = subjects.find(s => s.id === subjectId);
                            const progress = plannedMinutes > 0 ? (doneMinutes / plannedMinutes) * 100 : 0;
                            const colors = COLOR_MAP[subject?.color as ColorName] || COLOR_MAP["blue"];
                            const isHidden = hiddenSubjects.has(subjectId);
                            console.log({ subjectId, isHidden });
                            return (
                                <div key={subjectId} className={cn("transition-opacity", isHidden && "opacity-40")}>
                                    <div className="flex justify-between items-center font-semibold text-sm">
                                        <div className="flex flex-row items-center gap-2">
                                            <div className={cn("flex items-center p-1 rounded-full shrink-0", colors.badge)}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleViewSubject(subjectId);
                                                    }}
                                                >
                                                    <Circle className="w-3.5 h-3.5 " />
                                                </button>
                                            </div>

                                            <span className="text-sx font-light truncate">{subject?.name ?? subjectId}</span>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-muted-foreground/60 ">{formatDuration(doneMinutes)} /</span>
                                            <span className="text-[11px] text-muted-foreground">{formatDuration(plannedMinutes)}</span>

                                        </div>
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

                    <Button
                        variant={"outline"}
                        onClick={() => {
                            if (confirm("Tem certeza que deseja limpar todo o planejamento? Esta ação não pode ser desfeita.")) {
                                allBlocks.forEach(block => removeBlock(block.id));
                            }
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="font-medium">Limpar Planejamento</span>

                    </Button>
                </div>
            )}

        </aside>
    )
}