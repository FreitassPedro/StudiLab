"use client";

import { cn } from "@/lib/utils";
import { COLOR_MAP, formatDuration } from "../utils";
import { Separator } from "@/components/ui/separator";
import { useMemo, useState } from "react";
import { usePlannerActions } from "./PlannerActionsContext";
import { Button } from "@/components/ui/button";
import { Plus, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { usePlannerState } from "../usePlannerState";
import { PlannerAnalytics } from "../plannerAnalytics";

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/5">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700 ease-out",
          progress >= 100
            ? "bg-emerald-500"
            : progress > 60
            ? "bg-emerald-500"
            : progress > 30
            ? "bg-amber-500"
            : "bg-rose-500"
        )}
        style={{ width: `${Math.min(100, progress)}%` }}
      />
    </div>
  );
}

// ── Subject card ──────────────────────────────────────────────────────────────

function SubjectCard({
  subject,
  plannedMinutes,
  doneMinutes,
  color,
  efficiencyPct,
  todoCount,
  pendingTopics,
}: {
  subject: string;
  plannedMinutes: number;
  doneMinutes: number;
  color: string;
  efficiencyPct: number;
  todoCount: number;
  pendingTopics: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const colors = COLOR_MAP[color as keyof typeof COLOR_MAP] ?? COLOR_MAP.blue;
  const progress = plannedMinutes > 0 ? (doneMinutes / plannedMinutes) * 100 : 0;

  return (
    <div className="rounded-lg border border-border/50 bg-background/40 overflow-hidden">
      <div
        className="px-3 py-2 flex flex-col gap-1.5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => todoCount > 0 && setExpanded((e) => !e)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("w-2 h-2 rounded-full shrink-0", colors.badge)} />
            <span className="text-xs font-semibold truncate">{subject}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-muted-foreground">
              {formatDuration(doneMinutes)}/{formatDuration(plannedMinutes)}
            </span>
            <span
              className={cn(
                "text-[10px] font-bold w-7 text-right",
                efficiencyPct >= 80
                  ? "text-emerald-600 dark:text-emerald-400"
                  : efficiencyPct >= 40
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {efficiencyPct}%
            </span>
            {todoCount > 0 && (
              expanded
                ? <ChevronUp className="w-3 h-3 text-muted-foreground" />
                : <ChevronDown className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        </div>
        <ProgressBar progress={progress} />
      </div>

      {/* Expandable: pending topics */}
      {expanded && todoCount > 0 && (
        <div className="px-3 pb-2.5 pt-1 border-t border-border/30 bg-muted/20">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Pendentes
          </p>
          <div className="flex flex-col gap-1">
            {pendingTopics.slice(0, 4).map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                <span className="text-[11px] text-muted-foreground truncate">{t}</span>
              </div>
            ))}
            {pendingTopics.length > 4 && (
              <span className="text-[10px] text-muted-foreground pl-2.5">
                +{pendingTopics.length - 4} tópicos
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export function SidebarTools() {
  const { allBlocks, openAddModal, openEditSubjects } = usePlannerActions();
  const { subjects } = usePlannerState();

  const analytics = useMemo(() => new PlannerAnalytics(allBlocks), [allBlocks]);
  const summaries = useMemo(() => analytics.getSubjectSummaries(), [analytics]);
  const stats = useMemo(() => analytics.getWeekStats(), [analytics]);

  return (
    <aside className="border-l bg-muted/10 flex flex-col h-full px-3 py-4 gap-4 w-64 shrink-0 overflow-y-auto">
      {/* Week summary strip */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/40 rounded-lg px-2.5 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
            Eficiência
          </p>
          <p
            className={cn(
              "text-sm font-bold",
              stats.overallEfficiency >= 70
                ? "text-emerald-600 dark:text-emerald-400"
                : stats.overallEfficiency >= 40
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400"
            )}
          >
            {stats.overallEfficiency}%
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">
            {formatDuration(stats.totalDoneMinutes)} feito
          </p>
        </div>
        <div className="bg-muted/40 rounded-lg px-2.5 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
            Blocos
          </p>
          <p className="text-sm font-bold text-foreground">
            {stats.doneBlocks}
            <span className="text-xs font-normal text-muted-foreground">/{stats.totalBlocks}</span>
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">concluídos</p>
        </div>
      </div>

      <Separator />

      {/* Subjects */}
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Matérias
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={openEditSubjects}
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {summaries.map((s) => (
            <SubjectCard
              key={s.subject}
              subject={s.subject}
              plannedMinutes={s.plannedMinutes}
              doneMinutes={s.doneMinutes}
              color={s.color}
              efficiencyPct={s.efficiencyPct}
              todoCount={s.todoCount}
              pendingTopics={s.pendingTopics}
            />
          ))}

          {summaries.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhum bloco cadastrado.
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Add block */}
      <Button
        variant="outline"
        className="w-full h-9 text-xs"
        onClick={() => openAddModal(0)}
      >
        <Plus className="w-3.5 h-3.5 mr-1.5" />
        Adicionar bloco
      </Button>
    </aside>
  );
}
