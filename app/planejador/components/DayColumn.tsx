"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useMemo, useRef, useState, memo } from "react";
import { BlockType, StudyBlock, SubjectColor } from "./mockData";
import { formatDuration } from "../utils";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getDayName } from "../utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { pixelToMinutes, minutesToTimeStr } from "../usePlannerState";
import { parseTimeToMinutes } from "../utils";
import { BlockCard, GhostBlock } from "./Blocks";
import { usePlannerActions } from "./PlannerActionsContext";

// ── Color picker ────────────────────────────────────────────────────────────

const COLOR_OPTIONS: SubjectColor[] = [
    "blue", "emerald", "violet", "amber", "rose", "orange", "teal", "pink",
];

function ColorPicker({
    value,
    onChange,
}: {
    value?: string;
    onChange: (c: SubjectColor) => void;
}) {
    const colorDots: Record<SubjectColor, string> = {
        blue: "bg-blue-400",
        emerald: "bg-emerald-400",
        violet: "bg-violet-400",
        amber: "bg-amber-400",
        rose: "bg-rose-400",
        orange: "bg-orange-400",
        teal: "bg-teal-400",
        pink: "bg-pink-400",
    };
    return (
        <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
                <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    className={cn(
                        "w-6 h-6 rounded-full transition-all ring-offset-2",
                        colorDots[c],
                        value === c
                            ? "ring-2 ring-primary scale-110"
                            : "hover:scale-105 opacity-70 hover:opacity-100"
                    )}
                />
            ))}
        </div>
    );
}

// ── Block Form Modal ─────────────────────────────────────────────────────────

export function NewBlockFormModal({
    open,
    form,
    onCloseModal,
    onSave,
    onDelete,
    onFormChange,
    isEditing,
}: {
    open: boolean;
    form: Partial<StudyBlock>;
    onCloseModal: () => void;
    onSave: () => void;
    onDelete?: () => void;
    onFormChange: (patch: Partial<StudyBlock>) => void;
    isEditing?: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onCloseModal()}>

            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>

                        {isEditing ? "Editar bloco" : "Novo bloco de estudo"}

                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Matéria</Label>
                        <Input
                            placeholder="Ex: Matemática"
                            value={form.subject ?? ""}
                            onChange={(e) => onFormChange({ subject: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Tópico</Label>
                        <Input
                            placeholder="Ex: Cálculo — Derivadas"
                            value={form.topic ?? ""}
                            onChange={(e) => onFormChange({ topic: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Tipo</Label>
                        <div className="flex gap-2 flex-wrap">
                            {["study", "exercise", "review", "practice"].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => onFormChange({ type: t as BlockType })}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs border transition-all",
                                        form.type === t
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "border-border text-muted-foreground hover:border-primary/50"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Dia</Label>
                        {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((d, i) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => onFormChange({ dayIndex: i })}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs border transition-all",
                                    form.dayIndex === i
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-border text-muted-foreground hover:border-primary/50"
                                )}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Início</Label>
                            <Input
                                type="time"
                                value={form.startTime ?? "09:00"}
                                onChange={(e) => onFormChange({ startTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Fim</Label>
                            <Input
                                type="time"
                                value={form.endTime ?? "10:00"}
                                onChange={(e) => onFormChange({ endTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Cor</Label>
                        <ColorPicker
                            value={form.color as SubjectColor}
                            onChange={(c) => onFormChange({ color: c })}
                        />
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between mt-1">
                    <div>
                        {isEditing && onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={onDelete}
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Excluir
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onCloseModal}>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={onSave}>
                            Salvar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}





// ── DayColumn ────────────────────────────────────────────────────────────────

interface DayColumnProps {
    blocks: StudyBlock[];
    date: Date;
    dayIndex: number;
    hourHeights: number[];
    timelineHeightPx: number;
    timelineRef?: (el: HTMLDivElement | null) => void;
}

export function DayColumn({
    blocks,
    date,
    dayIndex,
    hourHeights,
    timelineHeightPx,
    timelineRef,
}: DayColumnProps) {
    const { draggedId, dragOffsetY, allBlocks, openAddModal } = usePlannerActions();
    const columnRef = useRef<HTMLDivElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [ghostTop, setGhostTop] = useState<number | null>(null);

    console.log(`Renderizando ${getDayName(date)} - ${blocks.length} blocos`);

    const dayMinutes = useMemo(() => {
        return blocks.reduce((total, block) => {
            const s = parseTimeToMinutes(block.startTime);
            const e = parseTimeToMinutes(block.endTime);
            return total + (e - s);
        }, 0);
    }, [blocks]);

    const hourOffsets = useMemo(() => {
        return hourHeights.map((_, index) =>
            hourHeights.slice(0, index).reduce((t, h) => t + h, 0)
        );
    }, [hourHeights]);

    const draggedBlock = draggedId ? allBlocks.find((b) => b.id === draggedId) : null;
    const draggedDuration = draggedBlock
        ? parseTimeToMinutes(draggedBlock.endTime) - parseTimeToMinutes(draggedBlock.startTime)
        : 60;

    const getRelativeY = useCallback(
        (clientY: number) => {
            if (!columnRef.current) return 0;
            const rect = columnRef.current.getBoundingClientRect();
            return clientY - rect.top;
        },
        []
    );

    const getGhostMetrics = useCallback(
        (clientY: number) => {
            const relY = getRelativeY(clientY);
            const adjustedTop = relY - dragOffsetY;
            const startMin = pixelToMinutes(Math.max(0, adjustedTop), hourHeights);
            const snapped = Math.round(startMin / 15) * 15;
            const endMin = snapped + draggedDuration;

            const topPx = hourOffsetForMinutes(snapped, hourHeights, hourOffsets);
            const bottomPx = hourOffsetForMinutes(endMin, hourHeights, hourOffsets);
            const heightPx = Math.max(bottomPx - topPx, 20);

            return { topPx, heightPx, snapped };
        },
        [getRelativeY, dragOffsetY, hourHeights, hourOffsets, draggedDuration]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!draggedId) return;
            const { topPx } = getGhostMetrics(e.clientY);
            setGhostTop(topPx);
        },
        [draggedId, getGhostMetrics]
    );

    const handleMouseEnter = useCallback(
        (e: React.MouseEvent) => {
            if (!draggedId) return;
            setIsDragOver(true);
            const { topPx } = getGhostMetrics(e.clientY);
            setGhostTop(topPx);
        },
        [draggedId, getGhostMetrics]
    );

    const handleMouseLeave = useCallback(() => {
        setIsDragOver(false);
        setGhostTop(null);
    }, []);

    const handleColumnDoubleClick = useCallback(
        (e: React.MouseEvent) => {
            if ((e.target as HTMLElement).closest("[data-block]")) return;
            const relY = getRelativeY(e.clientY);
            const minutes = pixelToMinutes(relY, hourHeights);
            const snapped = Math.round(minutes / 15) * 15;
            openAddModal(dayIndex, minutesToTimeStr(snapped));
        },
        [getRelativeY, hourHeights, dayIndex, openAddModal]
    );

    const ghostLabel = useMemo(() => {
        if (ghostTop === null || !draggedBlock) return "";
        const startMin = pixelToMinutes(ghostTop, hourHeights);
        const snapped = Math.round(startMin / 15) * 15;
        return `${minutesToTimeStr(snapped)} – ${minutesToTimeStr(snapped + draggedDuration)}`;
    }, [ghostTop, draggedBlock, hourHeights, draggedDuration]);

    const isToday = useMemo(() => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }, [date]);

    return (
        <div className="flex flex-col min-w-0">
            {/* Header */}
            <div className={cn("px-2 py-2 rounded-t-lg", isToday && "bg-primary/5")}>
                <p className={cn("text-sm font-semibold", isToday ? "text-primary" : "text-foreground")}>
                    {getDayName(date)}
                    {isToday && (
                        <span className="ml-1.5 text-xs font-normal text-primary/70">Hoje</span>
                    )}
                </p>
                <p className="text-xs text-muted-foreground">{date.toLocaleDateString("pt-BR")}</p>
                <Badge variant={dayMinutes > 0 ? "secondary" : "outline"} className="mt-1">
                    {dayMinutes > 0 ? formatDuration(dayMinutes) : "—"}
                </Badge>
            </div>

            <Separator className="my-1" />

            {/* Timeline */}
            <div
                ref={(el) => {
                    columnRef.current = el;
                    timelineRef?.(el);
                }}
                className={cn(
                    "relative rounded-xl transition-colors duration-150",
                    isDragOver && draggedId
                        ? "bg-primary/8 ring-1 ring-primary/30"
                        : "bg-muted/5 hover:bg-muted/10"
                )}
                style={{ height: `${timelineHeightPx}px` }}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onDoubleClick={handleColumnDoubleClick}
            >
                {/* Hour lines */}
                {hourOffsets.map((top, hour) => (
                    <div
                        key={hour}
                        className={cn(
                            "absolute left-0 right-0 border-t pointer-events-none",
                            hour % 6 === 0
                                ? "border-border/40"
                                : "border-muted/30"
                        )}
                        style={{ top: `${top}px` }}
                    />
                ))}

                {/* Current time indicator */}
                {isToday && <CurrentTimeIndicator hourHeights={hourHeights} />}

                {/* Blocks */}
                {blocks.map((block) => (
                    <div key={block.id} data-block>
                        <BlockCard
                            block={block}
                            hourHeights={hourHeights}
                        />
                    </div>
                ))}

                {/* Ghost block */}
                {isDragOver && ghostTop !== null && draggedBlock && (
                    <GhostBlock
                        topPx={ghostTop}
                        heightPx={Math.max(
                            hourOffsetForMinutes(
                                pixelToMinutes(ghostTop, hourHeights) + draggedDuration,
                                hourHeights,
                                hourOffsets
                            ) - ghostTop,
                            20
                        )}
                        label={ghostLabel}
                    />
                )}

                {/* Empty state */}
                {blocks.length === 0 && !isDragOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-15 pointer-events-none select-none">
                        <Calendar className="w-6 h-6 mb-1" />
                        <p className="text-[10px] font-medium">Vazio</p>
                    </div>
                )}

                {/* Add button at bottom */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 left-1 right-1 h-7 font-medium tracking-tight rounded-md
                        text-muted-foreground/40 border border-dashed border-border/40
                        hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all"
                    onClick={() => openAddModal(dayIndex)}
                >
                    <Plus className="w-3 h-3 mr-1" />
                    <span className="text-xs">Adicionar</span>
                </Button>
            </div>
        </div>
    );
}

// ── Current time indicator ────────────────────────────────────────────────────

function CurrentTimeIndicator({ hourHeights }: { hourHeights: number[] }) {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const hourOffsets = hourHeights.map((_, i) =>
        hourHeights.slice(0, i).reduce((t, h) => t + h, 0)
    );
    const topPx = hourOffsetForMinutes(minutes, hourHeights, hourOffsets);

    return (
        <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: `${topPx}px` }}
        >
            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
            <div className="flex-1 h-px bg-red-400/80" />
        </div>
    );
}

// ── util ─────────────────────────────────────────────────────────────────────

function hourOffsetForMinutes(
    minutes: number,
    hourHeights: number[],
    hourOffsets: number[]
): number {
    const hour = Math.min(Math.floor(minutes / 60), 23);
    const minuteInHour = minutes % 60;
    const base = hourOffsets[hour] ?? 0;
    const fraction = minuteInHour / 60;
    return base + (hourHeights[hour] ?? 0) * fraction;
}

export default memo(DayColumn, (prevProps, nextProps) => {
    return (
        prevProps.dayIndex === nextProps.dayIndex &&
        prevProps.date.getTime() === nextProps.date.getTime() &&
        prevProps.hourHeights === nextProps.hourHeights &&
        prevProps.timelineHeightPx === nextProps.timelineHeightPx &&
        prevProps.blocks === nextProps.blocks
    );
});