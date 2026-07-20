"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePlannerState } from "./usePlannerState";
import { PlannerActionsProvider } from "./components/PlannerActionsContext";
import { PlannerHeader } from "./components/PlannerHeader";
import { PlannerGrid } from "./components/PlannerGrid";
import { PlannerSkeleton } from "./components/PlannerSkeleton";
import { SidebarTools } from "./components/SidebarTools";
import { WeekStatsBar } from "./components/WeekStatsBar";
import { NewBlockFormModal } from "./components/Blocks";
import { buildHourHeights, parseTimeToMinutes } from "./utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getMondayOfCurrentWeek, getWeekDates } from "../teste/4/components/planner-utils";
import { addWeeks, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Page() {
    // ── Week navigation ───────────────────────────────────────────────────────
    const [weekOffset, setWeekOffset] = useState(0);
    const monday = useMemo(() => {
        const base = getMondayOfCurrentWeek();
        return weekOffset === 0 ? base : addWeeks(base, weekOffset);
    }, [weekOffset]);
    const weekDates = useMemo(() => getWeekDates(monday), [monday]);

    const weekLabel = useMemo(() => {
        const fmt = (d: Date) => format(d, "d MMM", { locale: ptBR });
        return `${fmt(weekDates[0])} – ${fmt(weekDates[6])}`;
    }, [weekDates]);

    // ── Planner state ─────────────────────────────────────────────────────────
    const {
        blocks,
        subjects,
        subjectsSummary,
        toggleViewSubject,
        hiddenSubjects,
        isLoaded,
        form,
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
        updateSubjectLocally,
        showLogs,
        setShowLogs,
        generateBacklog,
    } = usePlannerState(weekDates);

    // ── Timeline metrics ──────────────────────────────────────────────────────
    const hourHeights = useMemo(() => buildHourHeights(blocks), [blocks]);
    const timelineHeightPx = useMemo(() => hourHeights.reduce((t, h) => t + h, 0), [hourHeights]);
    const hourOffsets = useMemo(
        () => hourHeights.map((_, i) => hourHeights.slice(0, i).reduce((t, h) => t + h, 0)),
        [hourHeights]
    );

    // ── Drag state ────────────────────────────────────────────────────────────
    const [dragOffsetY, setDragOffsetY] = useState(0);
    const timelineRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleDragStart = useCallback((id: string, offsetY: number) => {
        setDraggedId(id);
        setDragOffsetY(offsetY);
        dragMovedRef.current = false;
    }, [setDraggedId, dragMovedRef]);

    const handleResizeStart = useCallback((id: string, e: React.MouseEvent) => {
        e.preventDefault();
        setResizingId(id);
    }, [setResizingId]);

    // ── Global mouse events (drag & resize) ───────────────────────────────────
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
                        if (e.clientX >= sRect.left && e.clientX <= sRect.right &&
                            e.clientY >= sRect.top && e.clientY <= sRect.bottom) {
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
    }, [draggedId, resizingId, dragOffsetY, dragMovedRef, blocks, hourHeights, moveBlockByPixel, resizeBlockByPixel, setDraggedId, setResizingId, moveToBacklog]);

    // ── Auto-scroll to morning ────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoaded) return;
        const timer = setTimeout(() => {
            const container = document.getElementById("planner-scroll-container");
            if (container && hourOffsets.length > 8) {
                container.scrollTo({ top: Math.max(0, hourOffsets[8] - 50), behavior: "smooth" });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Derived data ──────────────────────────────────────────────────────────
    const blocksByDay = useMemo(() => {
        const result = Array.from({ length: 7 }, () => [] as typeof blocks);
        blocks.forEach((b) => {
            if (b.dayIndex >= 0 && b.dayIndex < 7) result[b.dayIndex].push(b);
        });
        return result;
    }, [blocks]);

    const totalMinutes = useMemo(
        () => blocks.reduce((total, b) => total + (parseTimeToMinutes(b.endTime) - parseTimeToMinutes(b.startTime)), 0),
        [blocks]
    );

    // ── Context value ─────────────────────────────────────────────────────────
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
        updateSubjectLocally,
        showLogs,
        setShowLogs,
        generateBacklog,
    }), [
        blocks, subjects, hiddenSubjects, subjectsSummary, draggedId, resizingId,
        dragOffsetY, openAddModal, openEditBlock, removeBlock, duplicateBlock,
        handleDragStart, handleResizeStart, toggleBlockStatus, toggleViewSubject,
        moveToBacklog, addQuickBlock, updateSubjectLocally, showLogs, setShowLogs,
        generateBacklog,
    ]);

    // ── Render ────────────────────────────────────────────────────────────────
    if (!isLoaded) return <PlannerSkeleton />;

    return (
        <TooltipProvider delayDuration={200}>
            <PlannerActionsProvider value={actionsValue}>
                <div
                    className="flex flex-col h-screen bg-background text-foreground overflow-hidden"
                    style={{ cursor: draggedId ? "grabbing" : resizingId ? "ns-resize" : undefined }}
                >
                    <PlannerHeader
                        weekLabel={weekLabel}
                        weekOffset={weekOffset}
                        isCurrentWeek={weekOffset === 0}
                        totalMinutes={totalMinutes}
                        onPrevWeek={() => setWeekOffset((w) => w - 1)}
                        onNextWeek={() => setWeekOffset((w) => w + 1)}
                        onGoToCurrentWeek={() => setWeekOffset(0)}
                    />

                    <WeekStatsBar blocks={blocks} subjects={subjects} />

                    <div className="flex flex-1 overflow-hidden min-h-0">
                        <div className="flex-1 flex flex-col min-w-0 bg-muted/5">
                            <PlannerGrid
                                weekDates={weekDates}
                                blocksByDay={blocksByDay}
                                hourHeights={hourHeights}
                                timelineHeightPx={timelineHeightPx}
                                hourOffsets={hourOffsets}
                                timelineRefs={timelineRefs}
                            />
                        </div>

                        <SidebarTools />
                    </div>

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