"use client";

import { cn } from "@/lib/utils";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useMemo, useRef, useState, memo } from "react";
import { StudyBlock } from "./mockData";
import { formatDuration } from "../utils";

import { getDayName } from "../utils";

import { pixelToMinutes, minutesToTimeStr } from "../usePlannerState";
import { parseTimeToMinutes } from "../utils";
import { BlockCard, GhostBlock } from "./Blocks";
import { usePlannerActions } from "./PlannerActionsContext";


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

    // Abbreviated day name: "Seg", "Ter", etc.
    const shortDay = getDayName(date).slice(0, 3);
    const dayNum = date.getDate();

    return (
        <div className="flex flex-col min-w-0 relative">
            {/* Header */}
            <div
                className={cn(
                    "sticky top-0 z-50 bg-background/95 backdrop-blur-sm px-2 pt-2 pb-2.5 border-b",
                    isToday && "border-primary/30"
                )}
            >
                <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                        {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                        <span
                            className={cn(
                                "text-[11px] font-bold uppercase tracking-wider",
                                isToday ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {shortDay}
                        </span>
                        <span
                            className={cn(
                                "text-sm font-bold tabular-nums",
                                isToday ? "text-primary" : "text-foreground"
                            )}
                        >
                            {dayNum}
                        </span>
                    </div>
                    {dayMinutes > 0 && (
                        <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums">
                            {formatDuration(dayMinutes)}
                        </span>
                    )}
                </div>
            </div>

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
                        : "bg-muted/5 hover:bg-muted/10",
                    blocks.length === 0 && !isDragOver && "opacity-60 hover:opacity-100 transition-opacity"
                )}
                style={{ height: `${timelineHeightPx}px` }}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onDoubleClick={handleColumnDoubleClick}
            >
                {/* 1h dividers */}
                <div className="absolute inset-0 pointer-events-none">
                    {hourHeights.map((h, i) =>
                        i % 1 === 0 ? (
                            <div
                                key={i}
                                className="absolute left-0 w-full border-b border-border/40"
                                style={{ top: hourOffsets[i] }}
                            />
                        ) : null
                    )}
                </div>

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