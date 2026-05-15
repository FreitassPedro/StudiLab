"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayColumn } from "./components/DayColumn";

import { Clock, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { usePlannerState } from "./usePlannerState";
import { SidebarTools } from "./components/SidebarTools";
import { AnalyticsSidebar } from "./components/AnalyticsSidebar";
import { buildHourHeights, formatDuration, parseTimeToMinutes } from "./utils";
import { Button } from "@/components/ui/button";
import { addWeeks } from "date-fns";
import { PlannerActionsProvider } from "./components/PlannerActionsContext";
import { NewBlockFormModal } from "./components/Blocks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getMondayOfCurrentWeek, getWeekDates } from "../4/components/planner-utils";

function formatHourLabel(hour: number) {
    return `${String(hour).padStart(2, "0")}:00`;
}

type SidebarMode = "subjects" | "analytics";

export default function Page() {
    const {
        blocks,
        isLoaded,
        form,
        setForm,
        draggedId,
        subjects,
        setDraggedId,
        dragMovedRef,
        resizingId,
        setResizingId,
        moveBlockByPixel,
        resizeBlockByPixel,
        editingBlock,
        modalOpen,
        removeBlock,
        editingSubjects,
        openEditSubjects,
        duplicateBlock,
        openAddModal,
        openEditBlock,
        closeModal,
        saveBlock,
        deleteBlock,
        toggleBlockStatus,
    } = usePlannerState();

    // ── Week navigation ──────────────────────────────────────────────────────
    const [weekOffset, setWeekOffset] = useState(0);
    const monday = useMemo(() => {
        const base = getMondayOfCurrentWeek();
        return weekOffset === 0 ? base : addWeeks(base, weekOffset);
    }, [weekOffset]);
    const weekDates = useMemo(() => getWeekDates(monday), [monday]);

    // ── Sidebar mode ─────────────────────────────────────────────────────────
    const [sidebarMode, setSidebarMode] = useState<SidebarMode>("subjects");

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
                const relY = e.clientY - rect.top;
                resizeBlockByPixel(resizingId, relY, hourHeights);
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

    // ── Stats ────────────────────────────────────────────────────────────────
    const totalMinutes = useMemo(
        () =>
            blocks.reduce((total, block) => {
                const s = parseTimeToMinutes(block.startTime);
                const e = parseTimeToMinutes(block.endTime);
                return total + (e - s);
            }, 0),
        [blocks]
    );

    const weekLabel = useMemo(() => {
        const start = weekDates[0];
        const end = weekDates[6];
        const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
        return `${start.toLocaleDateString("pt-BR", opts)} – ${end.toLocaleDateString("pt-BR", opts)}`;
    }, [weekDates]);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-sm text-muted-foreground">Carregando...</div>
            </div>
        );
    }

    return (
        <PlannerActionsProvider
            value={{
                allBlocks: blocks,
                draggedId,
                resizingId,
                dragOffsetY,
                openAddModal,
                openEditBlock,
                openEditSubjects,
                removeBlock,
                duplicateBlock,
                handleDragStart,
                handleResizeStart,
                toggleBlockStatus,
            }}
        >
            <div
                className="flex flex-col h-screen"
                style={{ cursor: draggedId ? "grabbing" : resizingId ? "ns-resize" : undefined }}
            >
                {/* ── Header ── */}
                <div className="border-b bg-background/95 backdrop-blur-sm flex items-center justify-between px-6 py-3 shrink-0">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-sm font-semibold tracking-tight">Planejador Semanal</h1>
                            <p className="text-xs text-muted-foreground">{weekLabel}</p>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setWeekOffset((w) => w - 1)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setWeekOffset(0)}
                            >
                                Hoje
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setWeekOffset((w) => w + 1)}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sidebar toggle */}
                        <div className="flex items-center gap-1 rounded-md border p-0.5">
                            <Button
                                variant={sidebarMode === "subjects" ? "secondary" : "ghost"}
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => setSidebarMode("subjects")}
                            >
                                Matérias
                            </Button>
                            <Button
                                variant={sidebarMode === "analytics" ? "secondary" : "ghost"}
                                size="sm"
                                className="h-6 px-2 text-xs gap-1"
                                onClick={() => setSidebarMode("analytics")}
                            >
                                <BarChart3 className="w-3 h-3" />
                                Análise
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock size={14} />
                            <span className="text-xs">
                                Total: <strong className="text-foreground">{formatDuration(totalMinutes)}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex overflow-hidden relative flex-1">
                    {/* ── Main planner ── */}
                    <div className="flex flex-1 min-w-0 bg-background m-4 mr-0 rounded-2xl flex-col">
                        <div className="flex-1 overflow-auto">
                            <div
                                ref={gridRef}
                                className="grid gap-2 h-full px-2 min-w-200"
                                style={{ gridTemplateColumns: "56px repeat(7, minmax(0, 1fr))" }}
                            >
                                {/* Hour labels */}
                                <div className="flex flex-col min-w-0 pt-18">
                                    <div
                                        className="relative text-xs text-muted-foreground"
                                        style={{ height: `${timelineHeightPx}px` }}
                                    >
                                        {hourOffsets.map((top, hour) => (
                                            <div
                                                key={hour}
                                                className="absolute right-2 flex items-center"
                                                style={{ top: `${top}px` }}
                                            >
                                                <span className={hour % 6 === 0 ? "text-foreground/60" : "text-muted-foreground/40"}>
                                                    {formatHourLabel(hour)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Suspense fallback={<div>Loading...</div>}>
                                    {weekDates.map((date, dayIndex) => (
                                        <div key={dayIndex}>
                                            <DayColumn
                                                blocks={blocks.filter((b) => b.dayIndex === dayIndex)}
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

                    {/* ── Right sidebar ── */}
                    {sidebarMode === "subjects" ? (
                        <SidebarTools />
                    ) : (
                        <AnalyticsSidebar />
                    )}
                </div>

                <NewBlockFormModal
                    open={modalOpen}
                    form={form}
                    isEditing={!!editingBlock}
                    onFormChange={(patch) => setForm({ ...form, ...patch })}
                    onSave={saveBlock}
                    onDelete={editingBlock ? () => deleteBlock(editingBlock.id) : undefined}
                    onCloseModal={closeModal}
                />

                <Dialog open={editingSubjects} onOpenChange={(v) => !v && openEditSubjects()}>
                    <DialogHeader>
                        <DialogTitle>Editar Matérias</DialogTitle>
                    </DialogHeader>
                    <DialogContent>
                        {/* Subject editor content here */}
                    </DialogContent>
                </Dialog>
            </div>
        </PlannerActionsProvider>
    );
}
