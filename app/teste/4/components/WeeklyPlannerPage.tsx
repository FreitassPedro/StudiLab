"use client";

import { useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, LayoutDashboard, Settings2, Share2, Printer } from "lucide-react";
import { usePlannerState } from "./use-planner-state";
import {
  getMondayOfCurrentWeek,
  getWeekDates,
  formatDate,
  computeWeekStats,
} from "./planner-utils";
import { DayColumn } from "./DayColumn";
import { BlockFormModal } from "./BlockFormModal";
import { WeekStatsBar } from "./WeekStatsBar";
import { SidebarTools } from "./SidebarTools";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export default function WeeklyPlannerPage() {
  const {
    blocks,
    unscheduledBlocks,
    form,
    setForm,
    modalOpen,
    editingBlock,
    activeDay,
    openAddModal,
    openEditModal,
    closeModal,
    saveBlock,
    deleteBlock,
    moveBlockToDay,
    resizeBlock,
    blocksForDay,
    setDraggedId,
    toggleStatus,
    addUnscheduled,
  } = usePlannerState();

  const monday = useMemo(() => getMondayOfCurrentWeek(), []);
  const weekDates = useMemo(() => getWeekDates(monday), [monday]);

  const todayIndex = useMemo(() => {
    // Current date for comparison: 2026-03-21T... (Saturday)
    const today = "2026-03-21T12:00:00".split("T")[0];
    const todayDay = new Date(today).getDay();
    // Convert: Sun=0 → 6, Mon=1 → 0, ..., Sat=6 → 5
    return todayDay === 0 ? 6 : todayDay - 1;
  }, []);

  const stats = useMemo(() => computeWeekStats(blocks), [blocks]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        {/* ── Top header ── */}
        <header className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-background/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2 rounded-xl">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Organizador Semanal
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                Março 2026 • Monitor de Estudos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-4 py-1 flex flex-col items-center">
                <span className="text-[11px] font-bold tabular-nums">
                  {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
                </span>
                <span className="text-[9px] text-muted-foreground font-medium">Esta Semana</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm font-medium">
                <Printer className="w-4 h-4" />
                <span className="hidden md:inline">Imprimir</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm font-medium">
                <Share2 className="w-4 h-4" />
                <span className="hidden md:inline">Compartilhar</span>
              </Button>
              <Button variant="default" size="sm" className="h-9 gap-2 shadow-md font-medium">
                <Settings2 className="w-4 h-4" />
                <span className="hidden md:inline">Ajustes</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          {/* ── Main Planner Section ── */}
          <div className="flex-1 flex flex-col min-w-0 bg-muted/5">
            {/* ── Stats bar ── */}
            <WeekStatsBar stats={stats} />

            {/* ── Week grid ── */}
            <main className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <div className="grid grid-cols-7 gap-4 min-w-[1000px] h-full pb-8">
                {weekDates.map((date, dayIndex) => (
                  <DayColumn
                    key={dayIndex}
                    dayIndex={dayIndex}
                    date={date}
                    blocks={blocksForDay(dayIndex)}
                    isToday={dayIndex === todayIndex}
                    onAddBlock={openAddModal}
                    onEditBlock={openEditModal}
                    onDeleteBlock={deleteBlock}
                    onResizeBlock={resizeBlock}
                    onDragStart={setDraggedId}
                    onDrop={moveBlockToDay}
                    onToggleStatus={toggleStatus}
                  />
                ))}
              </div>
            </main>
          </div>

          {/* ── Tools Sidebar ── */}
          <SidebarTools
            unscheduledBlocks={unscheduledBlocks}
            subjectBreakdown={stats.subjectBreakdown}
            onAddUnscheduled={addUnscheduled}
            onRemoveUnscheduled={() => { }} // Not implemented yet
            onDragStart={setDraggedId}
            onQuickAdd={(data) => openAddModal(todayIndex, data)}
          />
        </div>

        {/* ── Add/Edit modal ── */}
        <BlockFormModal
          open={modalOpen}
          isEditing={!!editingBlock}
          activeDay={activeDay}
          form={form}
          onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          onSave={saveBlock}
          onClose={closeModal}
        />
      </div>
    </TooltipProvider>
  );
}
