"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayColumn } from "./components/DayColumn";
import { getMondayOfCurrentWeek, getWeekDates } from "../teste/4/components/planner-utils";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { usePlannerState } from "./usePlannerState";
import { SidebarTools } from "./components/SidebarTools";
import { WeekStatsBar } from "./components/WeekStatsBar";
import { buildHourHeights, formatDuration, parseTimeToMinutes } from "./utils";
import { addWeeks, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlannerActionsProvider } from "./components/PlannerActionsContext";
import { NewBlockFormModal } from "./components/Blocks";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function formatHourLabel(hour: number) {
    return `${String(hour).padStart(2, "0")}:00`;
}

export default function Page() {
    const {
        blocks,
        subjects,
        subjectsSummary,
        toggleViewSubject,
        hiddenSubjects,
        isLoaded,
        form,
        setForm,
        draggedId,
        setDraggedId,
        dragMovedRef,
        resizingId,
        setResizingId,
        moveBlockByPixel,
        resizeBlockByPixel,
        editingBlock,
        modalOpen,
        removeBlock,
        duplicateBlock,
        openAddModal,
        openEditBlock,
        closeModal,
        saveBlock,
        deleteBlock,
        toggleBlockStatus,
        moveToBacklog,
        addQuickBlock,
    } = usePlannerState();

    // ── Week navigation ──────────────────────────────────────────────────────
    const [weekOffset, setWeekOffset] = useState(0);
    const monday = useMemo(() => {
        const base = getMondayOfCurrentWeek();
        return weekOffset === 0 ? base : addWeeks(base, weekOffset);
    }, [weekOffset]);
    const weekDates = useMemo(() => getWeekDates(monday), [monday]);

    // ── Timeline metrics ─────────────────────────────────────────────────────
    const hourHeights = useMemo(() => buildHourHeights(blocks), [blocks]);
    const timelineHeightPx = useMemo(
        () => hourHeights.reduce((t, h) => t + h, 0),
        [hourHeights]
    );
    const hourOffsets = useMemo(
        () => hourHeights.map((_, i) => hourHeights.slice(0, i).reduce((t, h) => t + h, 0)),
        [hourHeights]
    );

    // ── Drag state ───────────────────────────────────────────────────────────
    const [dragOffsetY, setDragOffsetY] = useState(0);
    const gridRef = useRef<HTMLDivElement>(null);
    const timelineRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleDragStart = useCallback((id: string, offsetY: number) => {
        setDraggedId(id);
        setDragOffsetY(offsetY);
        dragMovedRef.current = false;
    }, [setDraggedId, dragMovedRef]);

    useEffect(() => {
        if (!draggedId && !resizingId) return;

        const handleMouseMove = (e: MouseEvent) => {
            dragMovedRef.current = true;
            if (resizingId) {
                const block = blocks.find((b) => b.id === resizingId);
                if (!block) return;
                const timelineEl = timelineRefs.current[block.dayIndex];
                if (!timelineEl) return;
                const rect = timelineEl.getBoundingClientRect();
                resizeBlockByPixel(resizingId, e.clientY - rect.top, hourHeights);
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (draggedId && dragMovedRef.current) {
                let targetDay = -1;
                let relY = 0;
                for (let i = 0; i < 7; i++) {
                    const timelineEl = timelineRefs.current[i];
                    if (!timelineEl) continue;
                    const rect = timelineEl.getBoundingClientRect();
                    if (e.clientX >= rect.left && e.clientX <= rect.right) {
                        targetDay = i;
                        relY = e.clientY - rect.top;
                        break;
                    }
                }
                if (targetDay >= 0) {
                    moveBlockByPixel(draggedId, targetDay, relY - dragOffsetY, hourHeights);
                } else {
                    const sidebarEl = document.getElementById("planner-sidebar");
                    if (sidebarEl) {
                        const sRect = sidebarEl.getBoundingClientRect();
                        if (
                            e.clientX >= sRect.left &&
                            e.clientX <= sRect.right &&
                            e.clientY >= sRect.top &&
                            e.clientY <= sRect.bottom
                        ) {
                            moveToBacklog(draggedId);
                        }
                    }
                }
            }
            setDraggedId(null);
            setResizingId(null);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [draggedId, resizingId, dragOffsetY, dragMovedRef, blocks, hourHeights, moveBlockByPixel, resizeBlockByPixel, setDraggedId, setResizingId]);

    const handleResizeStart = useCallback(
        (id: string, e: React.MouseEvent) => {
            e.preventDefault();
            setResizingId(id);
        },
        [setResizingId]
    );

    // ── Memoized Context & Data ──────────────────────────────────────────────
    const actionsValue = useMemo(() => ({
        allBlocks: blocks,
        subjects,
        hiddenSubjects,
        subjectsSummary,
        draggedId,
        resizingId,
        dragOffsetY,
        openAddModal,
        openEditBlock,
        removeBlock,
        duplicateBlock,
        handleDragStart,
        handleResizeStart,
        toggleBlockStatus,
        toggleViewSubject,
        moveToBacklog,
        addQuickBlock,
    }), [
        blocks, subjects, hiddenSubjects, subjectsSummary, draggedId, resizingId,
        dragOffsetY, openAddModal, openEditBlock, removeBlock, duplicateBlock,
        handleDragStart, handleResizeStart, toggleBlockStatus, toggleViewSubject,
        moveToBacklog, addQuickBlock,
    ]);

    const blocksByDay = useMemo(() => {
        const result = Array.from({ length: 7 }, () => [] as typeof blocks);
        blocks.forEach(b => {
            if (b.dayIndex >= 0 && b.dayIndex < 7) result[b.dayIndex].push(b);
        });
        return result;
    }, [blocks]);

    const totalMinutes = useMemo(
        () => blocks.reduce((total, b) => {
            return total + (parseTimeToMinutes(b.endTime) - parseTimeToMinutes(b.startTime));
        }, 0),
        [blocks]
    );

    // Week label e.g. "30 jun – 6 jul"
    const weekLabel = useMemo(() => {
        const fmt = (d: Date) => format(d, "d MMM", { locale: ptBR });
        return `${fmt(weekDates[0])} – ${fmt(weekDates[6])}`;
    }, [weekDates]);

    const isCurrentWeek = weekOffset === 0;

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-sm text-muted-foreground animate-pulse">Carregando planejador...</div>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={200}>
            <PlannerActionsProvider value={actionsValue}>
                <div
                    className="flex flex-col h-screen bg-background text-foreground overflow-hidden"
                    style={{ cursor: draggedId ? "grabbing" : resizingId ? "ns-resize" : undefined }}
                >
                    {/* ── Header ──────────────────────────────────────────── */}
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
                                    onClick={() => setWeekOffset((w) => w - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <button
                                    className="px-3 py-1 flex flex-col items-center min-w-[130px]"
                                    onClick={() => setWeekOffset(0)}
                                >
                                    <span className="text-[11px] font-bold tabular-nums">{weekLabel}</span>
                                    <span className="text-[9px] text-muted-foreground font-medium">
                                        {isCurrentWeek ? "Esta semana" : weekOffset > 0 ? `+${weekOffset} sem.` : `${weekOffset} sem.`}
                                    </span>
                                </button>
                                <Button
                                    variant="ghost" size="icon"
                                    className="h-7 w-7 hover:bg-background"
                                    onClick={() => setWeekOffset((w) => w + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Right: total */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock size={13} />
                            <span className="text-xs">
                                <strong className="text-foreground">{formatDuration(totalMinutes)}</strong>
                                {" "}planejados
                            </span>
                        </div>
                    </header>

                    {/* ── Stats bar ───────────────────────────────────────── */}
                    <WeekStatsBar blocks={blocks} subjects={subjects} />

                    {/* ── Body ────────────────────────────────────────────── */}
                    <div className="flex flex-1 overflow-hidden min-h-0">
                        {/* Grid */}
                        <div className="flex-1 flex flex-col min-w-0 bg-muted/5">
                            <div className="flex-1 overflow-auto">
                                <div
                                    ref={gridRef}
                                    className="grid gap-px px-2 py-2 min-w-[760px]"
                                    style={{ gridTemplateColumns: "52px repeat(7, minmax(0, 1fr))" }}
                                >
                                    {/* Hour labels — every 1h */}
                                    <div className="flex flex-col min-w-0 pt-10">
                                        <div
                                            className="relative"
                                            style={{ height: `${timelineHeightPx}px` }}
                                        >
                                            {hourOffsets.map((top, hour) =>
                                                hour % 1 === 0 ? (
                                                    <div
                                                        key={hour}
                                                        className="absolute right-2 flex items-center"
                                                        style={{ top: `${top}px` }}
                                                    >
                                                        <span className={cn(
                                                            "tabular-nums",
                                                            hour % 6 === 0
                                                                ? "text-foreground/50 text-[11px] font-semibold"
                                                                : "text-muted-foreground/30 text-[10px]"
                                                        )}>
                                                            {formatHourLabel(hour)}
                                                        </span>
                                                    </div>
                                                ) : null
                                            )}
                                        </div>
                                    </div>

                                    {/* Day columns */}
                                    <Suspense fallback={<div />}>
                                        {weekDates.map((date, dayIndex) => (
                                            <div key={dayIndex}>
                                                <DayColumn
                                                    blocks={blocksByDay[dayIndex]}
                                                    date={date}
                                                    dayIndex={dayIndex}
                                                    hourHeights={hourHeights}
                                                    timelineHeightPx={timelineHeightPx}
                                                    timelineRef={(el) => { timelineRefs.current[dayIndex] = el; }}
                                                />
                                            </div>
                                        ))}
                                    </Suspense>
                                </div>
                            </div>
                        </div>

                        <SidebarTools />
                    </div>

                    {/* ── Modal ───────────────────────────────────────────── */}
                    {modalOpen && (
                        <NewBlockFormModal
                            open={modalOpen}
                            initialData={form}
                            isEditing={!!editingBlock}
                            onSave={saveBlock}
                            onDelete={editingBlock ? () => deleteBlock(editingBlock.id) : undefined}
                            onCloseModal={closeModal}
                        />
                    )}
                </div>
            </PlannerActionsProvider>
        </TooltipProvider>
    );
}