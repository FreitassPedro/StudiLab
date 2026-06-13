"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlannerActions } from "./PlannerActionsContext";
import { COLOR_MAP, formatDuration } from "../utils";
import { PlannerAnalytics, SubjectSummary, GapAlert, WeekInsight, DayLoad } from "../plannerAnalytics";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Info,
  Clock,
  BarChart3,
  Target,
  Zap,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Lightbulb,
  Calendar,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function efficiencyColor(pct: number): string {
  if (pct === 0) return "text-rose-600 dark:text-rose-400";
  if (pct < 50) return "text-amber-600 dark:text-amber-400";
  if (pct < 80) return "text-blue-600 dark:text-blue-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function efficiencyBg(pct: number): string {
  if (pct === 0) return "bg-rose-500";
  if (pct < 50) return "bg-amber-500";
  if (pct < 80) return "bg-blue-500";
  return "bg-emerald-500";
}

function severityBadge(s: GapAlert["severity"]) {
  if (s === "critical")
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300";
  if (s === "warning")
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300";
}

function insightIcon(ins: WeekInsight) {
  const cls = "w-3.5 h-3.5 shrink-0";
  if (ins.type === "danger") return <AlertTriangle className={cn(cls, "text-rose-500")} />;
  if (ins.type === "warning") return <Clock className={cn(cls, "text-amber-500")} />;
  if (ins.type === "success") return <CheckCircle2 className={cn(cls, "text-emerald-500")} />;
  return <Lightbulb className={cn(cls, "text-blue-500")} />;
}

function insightBg(t: WeekInsight["type"]) {
  if (t === "danger") return "border-l-2 border-rose-400 bg-rose-50/50 dark:bg-rose-950/20";
  if (t === "warning") return "border-l-2 border-amber-400 bg-amber-50/50 dark:bg-amber-950/20";
  if (t === "success") return "border-l-2 border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20";
  return "border-l-2 border-blue-400 bg-blue-50/50 dark:bg-blue-950/20";
}

// ── Mini progress bar ─────────────────────────────────────────────────────────

function ProgressBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", colorClass)}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-muted/40 rounded-lg px-3 py-2 flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className={cn("text-base font-semibold leading-tight", valueClass ?? "text-foreground")}>
        {value}
      </span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ── Panel tabs ────────────────────────────────────────────────────────────────

type Tab = "overview" | "gaps" | "insights" | "days";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "overview", label: "Visão", Icon: BarChart3 },
  { id: "gaps", label: "Lacunas", Icon: Target },
  { id: "insights", label: "Ações", Icon: Zap },
  { id: "days", label: "Dias", Icon: Calendar },
];

// ── Overview panel ────────────────────────────────────────────────────────────

function OverviewPanel({
  summaries,
  stats,
}: {
  summaries: SubjectSummary[];
  stats: ReturnType<PlannerAnalytics["getWeekStats"]>;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2">
        <StatChip
          label="Eficiência"
          value={`${stats.overallEfficiency}%`}
          sub={`${formatDuration(stats.totalDoneMinutes)} concluído`}
          valueClass={efficiencyColor(stats.overallEfficiency)}
        />
        <StatChip
          label="Blocos"
          value={`${stats.doneBlocks}/${stats.totalBlocks}`}
          sub="concluídos"
        />
        <StatChip
          label="Lacunas críticas"
          value={String(stats.criticalGaps)}
          sub="matérias em 0%"
          valueClass={stats.criticalGaps > 0 ? "text-rose-600 dark:text-rose-400" : undefined}
        />
        <StatChip
          label="Tempo total"
          value={formatDuration(stats.totalPlannedMinutes)}
          sub="planejado"
        />
      </div>

      <Separator />

      {/* Subject health grid */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Saúde por matéria
        </p>
        <div className="flex flex-col gap-3">
          {summaries.map((s) => (
            <div key={s.subject} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      COLOR_MAP[s.color]?.badge ?? "bg-muted"
                    )}
                  />
                  <span className="text-xs font-medium truncate">{s.subject}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDuration(s.doneMinutes)}/{formatDuration(s.plannedMinutes)}
                  </span>
                  <span className={cn("text-xs font-semibold w-8 text-right", efficiencyColor(s.efficiencyPct))}>
                    {s.efficiencyPct}%
                  </span>
                </div>
              </div>
              <ProgressBar value={s.efficiencyPct} colorClass={efficiencyBg(s.efficiencyPct)} />
              {s.todoCount > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  {s.todoCount} pendente{s.todoCount > 1 ? "s" : ""}
                  {s.pendingTopics.length > 0 && ` · ${s.pendingTopics[0]}`}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Gaps panel ───────────────────────────────────────────────────────────────

function GapsPanel({ gaps }: { gaps: GapAlert[] }) {
  if (gaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        <p className="text-sm font-medium">Sem lacunas detectadas</p>
        <p className="text-xs text-muted-foreground">Todas as matérias têm progresso satisfatório.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {gaps.length} matéria{gaps.length > 1 ? "s" : ""} com atenção necessária
      </p>
      {gaps.map((gap) => (
        <div
          key={gap.subject}
          className={cn(
            "rounded-lg p-3 flex flex-col gap-2",
            gap.severity === "critical"
              ? "bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40"
              : gap.severity === "warning"
              ? "bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40"
              : "bg-muted/30 border border-border/50"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className={cn("w-2 h-2 rounded-full shrink-0", COLOR_MAP[gap.color]?.badge)}
              />
              <span className="text-xs font-semibold">{gap.subject}</span>
            </div>
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", severityBadge(gap.severity))}>
              {gap.efficiencyPct}%
            </span>
          </div>

          {gap.pendingTopics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {gap.pendingTopics.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[10px] bg-background/70 border border-border/60 rounded px-1.5 py-0.5 text-muted-foreground"
                >
                  {t}
                </span>
              ))}
              {gap.pendingTopics.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{gap.pendingTopics.length - 3}</span>
              )}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground leading-relaxed">{gap.suggestion}</p>

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <TrendingDown className="w-3 h-3" />
            <span>{gap.pendingBlocks} bloco{gap.pendingBlocks > 1 ? "s" : ""} pendente{gap.pendingBlocks > 1 ? "s" : ""}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Insights panel ────────────────────────────────────────────────────────────

function InsightsPanel({ insights }: { insights: WeekInsight[] }) {
  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
        <TrendingUp className="w-8 h-8 text-emerald-500" />
        <p className="text-sm font-medium">Plano equilibrado</p>
        <p className="text-xs text-muted-foreground">Nenhuma ação prioritária no momento.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        Ações recomendadas
      </p>
      {insights.map((ins, i) => (
        <div key={i} className={cn("rounded-lg px-3 py-2.5 flex gap-2.5", insightBg(ins.type))}>
          <div className="mt-0.5">{insightIcon(ins)}</div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-semibold leading-tight">{ins.title}</span>
            <span className="text-[11px] text-muted-foreground leading-relaxed">{ins.body}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Days panel ────────────────────────────────────────────────────────────────

function DaysPanel({ dayLoads }: { dayLoads: DayLoad[] }) {
  const STUDY_WINDOW = 8 * 60;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Carga diária · janela de 8h
      </p>
      {dayLoads.map((d) => {
        const loadPct = Math.min(100, Math.round((d.plannedMinutes / STUDY_WINDOW) * 100));
        const overloaded = d.plannedMinutes > STUDY_WINDOW;
        return (
          <div key={d.dayIndex} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold w-7">{d.dayLabel}</span>
                {d.blockCount === 0 && (
                  <span className="text-[10px] text-muted-foreground/50">livre</span>
                )}
                {overloaded && (
                  <span className="text-[10px] text-rose-500 font-medium">sobrecarregado</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                {d.plannedMinutes > 0 && (
                  <>
                    <span>{formatDuration(d.plannedMinutes)}</span>
                    <span className={cn("font-medium", efficiencyColor(d.completionPct))}>
                      {d.completionPct}%
                    </span>
                  </>
                )}
                {d.freeMinutes > 0 && d.plannedMinutes > 0 && (
                  <span className="text-blue-500">{formatDuration(d.freeMinutes)} livre</span>
                )}
              </div>
            </div>

            <div className="h-2 bg-muted rounded-full overflow-hidden relative">
              {/* Planned bar */}
              <div
                className={cn(
                  "h-full rounded-full absolute left-0 top-0 transition-all duration-500",
                  overloaded ? "bg-rose-400" : "bg-muted-foreground/30"
                )}
                style={{ width: `${loadPct}%` }}
              />
              {/* Done bar */}
              {d.completionPct > 0 && (
                <div
                  className="h-full rounded-full absolute left-0 top-0 bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.round(loadPct * (d.completionPct / 100))}%` }}
                />
              )}
            </div>

            {d.blockCount > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {d.blockCount} bloco{d.blockCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export function AnalyticsSidebar() {
  const { allBlocks } = usePlannerActions();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const analytics = useMemo(() => new PlannerAnalytics(allBlocks), [allBlocks]);

  const summaries = useMemo(() => analytics.getSubjectSummaries(), [analytics]);
  const stats = useMemo(() => analytics.getWeekStats(), [analytics]);
  const gaps = useMemo(() => analytics.getGapAlerts(), [analytics]);
  const insights = useMemo(() => analytics.getInsights(), [analytics]);
  const dayLoads = useMemo(() => analytics.getDayLoads(), [analytics]);
  const balanceScore = useMemo(() => analytics.getBalanceScore(), [analytics]);

  const criticalCount = gaps.filter((g) => g.severity === "critical").length;
  const warningCount = gaps.filter((g) => g.severity === "warning").length;
  const actionCount = insights.filter(
    (i) => i.type === "danger" || i.type === "warning"
  ).length;

  if (isCollapsed) {
    return (
      <aside className="border-l bg-muted/10 flex flex-col items-center py-4 gap-4 w-14 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Separator />
        {TABS.map(({ id, Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? "secondary" : "ghost"}
            size="icon"
            className="w-8 h-8 relative"
            onClick={() => {
              setActiveTab(id);
              setIsCollapsed(false);
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {id === "gaps" && criticalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
            {id === "insights" && actionCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </Button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="border-l bg-muted/10 flex flex-col w-72 shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/50">
        <div className="flex flex-col">
          <span className="text-xs font-semibold">Análise da Semana</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-muted-foreground">Equilíbrio:</span>
            <span
              className={cn(
                "text-[10px] font-semibold",
                balanceScore >= 70
                  ? "text-emerald-600 dark:text-emerald-400"
                  : balanceScore >= 40
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {balanceScore}%
            </span>
            <div className="flex-1 w-16 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  balanceScore >= 70 ? "bg-emerald-500" : balanceScore >= 40 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${balanceScore}%` }}
              />
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 shrink-0"
          onClick={() => setIsCollapsed(true)}
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-2 pt-2 gap-0.5">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "relative flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-t-md transition-colors",
              activeTab === id
                ? "bg-background text-foreground border border-b-0 border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
            {id === "gaps" && (criticalCount > 0 || warningCount > 0) && (
              <span
                className={cn(
                  "ml-0.5 text-[9px] font-bold px-1 rounded-full",
                  criticalCount > 0
                    ? "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400"
                    : "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                )}
              >
                {criticalCount + warningCount}
              </span>
            )}
            {id === "insights" && actionCount > 0 && (
              <span className="ml-0.5 text-[9px] font-bold px-1 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                {actionCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === "overview" && (
          <OverviewPanel summaries={summaries} stats={stats} />
        )}
        {activeTab === "gaps" && <GapsPanel gaps={gaps} />}
        {activeTab === "insights" && <InsightsPanel insights={insights} />}
        {activeTab === "days" && <DaysPanel dayLoads={dayLoads} />}
      </div>
    </aside>
  );
}
