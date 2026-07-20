"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { COLOR_MAP } from "../../utils";
import { usePlannerActions } from "../PlannerActionsContext";
import { ColorName } from "../../types";
import { Plus, Trash2, GripVertical, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BacklogGeneratorModal } from "../BacklogGenerator";

export function BacklogList() {
    const { allBlocks, subjects, draggedId, removeBlock, handleDragStart, openAddModal } = usePlannerActions();
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    const unscheduledBlocks = allBlocks.filter((b) => b.dayIndex === -1);

    const onMouseDownBlock = useCallback(
        (e: React.MouseEvent, blockId: string) => {
            e.preventDefault();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            handleDragStart(blockId, offsetY);
        },
        [handleDragStart]
    );

    return (
        <section className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-blue-500" />
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Backlog
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-[10px] gap-1"
                        onClick={() => setIsGeneratorOpen(true)}
                    >
                        <Zap className="w-3 h-3 text-amber-500" />
                        Gerar
                    </Button>
                    <Badge variant="outline" className="text-[10px] px-1.5 h-4 font-mono">
                        {unscheduledBlocks.length}
                    </Badge>
                </div>
            </div>

            <div className="space-y-2">
                {unscheduledBlocks.map((block) => (
                    <div
                        key={block.id}
                        className={cn(
                            "group relative p-2.5 rounded-lg border bg-background hover:shadow-sm transition-all cursor-grab active:cursor-grabbing",
                            COLOR_MAP[block.color as ColorName]?.border ?? COLOR_MAP.blue.border,
                            draggedId === block.id && "opacity-50"
                        )}
                        onMouseDown={(e) => onMouseDownBlock(e, block.id)}
                    >
                        <div className="flex items-start gap-2">
                            <GripVertical className="w-3 h-3 mt-0.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium leading-tight truncate">
                                    {subjects.find((s) => s.id === block.subjectId)?.name || block.subjectId}
                                </p>
                                {block.topic && (
                                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                        {block.topic}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between pl-5">
                            <Badge
                                variant="secondary"
                                className={cn("text-[9px] px-1 h-3.5 font-normal", COLOR_MAP[block.color as ColorName]?.badge ?? COLOR_MAP.blue.badge)}
                            >
                                {block.type}
                            </Badge>
                        </div>
                    </div>
                ))}

                {unscheduledBlocks.length === 0 && (
                    <div className="text-center py-6 px-4 border border-dashed rounded-lg bg-muted/5">
                        <p className="text-[10px] text-muted-foreground">Nenhuma tarefa no backlog.</p>
                        <Button
                            variant="link"
                            size="sm"
                            className="text-[10px] mt-1 h-auto p-0"
                            onClick={() => openAddModal(0)}
                        >
                            + Adicionar bloco
                        </Button>
                    </div>
                )}
            </div>

            {isGeneratorOpen && (
                <BacklogGeneratorModal
                    open={isGeneratorOpen}
                    onClose={() => setIsGeneratorOpen(false)}
                />
            )}
        </section>
    );
}
