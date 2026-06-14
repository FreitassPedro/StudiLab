"use client";

import { cn } from "@/lib/utils";
import { COLOR_MAP, formatDuration } from "../utils";
import { Separator } from "@/components/ui/separator";
import { useMemo, useState } from "react";
import { usePlannerActions } from "./PlannerActionsContext";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Flame,
  Target,
  TrendingUp,
  Copy,
  Trash2,
} from "lucide-react";
import { usePlannerState } from "../usePlannerState";
import { PlannerAnalytics, SubjectSummary, DayLoad } from "../plannerAnalytics";
import { StudyBlock } from "./mockData";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const COLOR_HEX: Record<string, string> = {
  blue: "#3b82f6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  teal: "#14b8a6",
  emerald: "#10b981",
  violet: "#8b5cf6",
  orange: "#f97316",
  pink: "#ec4899",
};

const TYPE_BADGE: Record<string, string> = {
  leiture: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  revision: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  exercise: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  resume: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  exam: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function effPalette(p: number) {
  if (p >= 80) return { fill: "#10b981", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" };
  if (p >= 40) return { fill: "#f59e0b", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" };
  return { fill: "#f43f5e", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Donut ring – overall efficiency
// ─────────────────────────────────────────────────────────────────────────────

function DonutRing({
  value,
  size = 72,
  stroke = 7,
  color,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color: string;
  label: string;
  sublabel: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(value, 100) / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke="currentColor" strokeWidth={stroke} className="text-muted/50" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.6s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-foreground leading-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Weekly bar chart (SVG) – planned vs done per day
// ─────────────────────────────────────────────────────────────────────────────

function WeekBarChart({ dayLoads }: { dayLoads: DayLoad[] }) {
  const W = 236;
  const H = 80;
  const PAD = { t: 8, b: 20, l: 4, r: 4 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const maxMins = Math.max(...dayLoads.map((d) => d.plannedMinutes), 60);
  const barW = Math.floor(innerW / 7) - 4;
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full select-none">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}
        role="img" aria-label="Carga diária: planejado vs concluído por dia da semana">
        {dayLoads.map((d, i) => {
          const x = PAD.l + i * (innerW / 7) + 2;
          const plannedH = (d.plannedMinutes / maxMins) * innerH;
          const doneH = d.plannedMinutes > 0 ? (d.doneMinutes / maxMins) * innerH : 0;
          const yBase = PAD.t + innerH;
          const isHov = hovered === i;
          // tooltip positioning: keep within SVG bounds
          const ttX = Math.min(Math.max(x - 10, 2), W - 72);
          const ttY = yBase - plannedH - 30;

          return (
            <g key={i}>
              {/* Planned bar */}
              {d.plannedMinutes > 0 && (
                <rect x={x} y={yBase - plannedH} width={barW} height={plannedH} rx={3}
                  fill={isHov ? "#94a3b8" : "#e2e8f0"}
                  style={{ transition: "fill 0.12s" }} />
              )}
              {/* Done bar */}
              {doneH > 0 && (
                <rect x={x} y={yBase - doneH} width={barW} height={doneH} rx={3}
                  fill="#10b981" opacity={isHov ? 1 : 0.85}
                  style={{ transition: "opacity 0.12s" }} />
              )}
              {/* Empty tick */}
              {d.plannedMinutes === 0 && (
                <rect x={x + barW / 2 - 1} y={yBase - 4} width={2} height={4} rx={1} fill="#cbd5e1" />
              )}
              {/* Hover region */}
              <rect x={x - 1} y={PAD.t} width={barW + 2} height={innerH + 4}
                fill="transparent" style={{ cursor: "default" }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
              {/* Day label */}
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize={9}
                fill={isHov ? "#64748b" : "#94a3b8"}>
                {d.dayLabel}
              </text>
              {/* Tooltip */}
              {isHov && d.plannedMinutes > 0 && (
                <g>
                  <rect x={ttX} y={ttY} width={68} height={24} rx={4} fill="#0f172a" opacity={0.88} />
                  <text x={ttX + 34} y={ttY + 10} textAnchor="middle" fontSize={9} fill="#f8fafc">
                    {formatDuration(d.doneMinutes)}/{formatDuration(d.plannedMinutes)}
                  </text>
                  <text x={ttX + 34} y={ttY + 20} textAnchor="middle" fontSize={8} fill="#94a3b8">
                    {d.completionPct}% concluído
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-3 mt-0.5">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-600" />
          Planejado
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          Concluído
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Day heat strip – 7 dots per subject
// ─────────────────────────────────────────────────────────────────────────────

function DayHeatStrip({
  subject,
  blocks,
  hex,
}: {
  subject: string;
  blocks: StudyBlock[];
  hex: string;
}) {
  const cells = Array.from({ length: 7 }, (_, i) => {
    const bs = blocks.filter((b) => b.subject === subject && b.dayIndex === i);
    return {
      done: bs.some((b) => b.status === "done"),
      todo: bs.some((b) => b.status === "todo"),
      empty: bs.length === 0,
    };
  });

  return (
    <div className="flex gap-0.5">
      {cells.map((c, i) => (
        <div
          key={i}
          title={DAY_NAMES[i]}
          className="w-3.5 h-3.5 rounded-sm transition-all"
          style={{
            background: c.done ? hex : c.todo ? "transparent" : "rgb(226 232 240 / 0.5)",
            border: c.todo && !c.done ? `1.5px solid ${hex}` : "none",
            opacity: c.done ? 1 : c.todo ? 0.5 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subject card (expandable)
// ─────────────────────────────────────────────────────────────────────────────

function SubjectCard({
  s,
  blocks,
  onAddBlock,
}: {
  s: SubjectSummary;
  blocks: StudyBlock[];
  onAddBlock: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hex = COLOR_HEX[s.color] ?? "#3b82f6";
  const pal = effPalette(s.efficiencyPct);
  const progress = s.plannedMinutes > 0 ? (s.doneMinutes / s.plannedMinutes) * 100 : 0;

  const typeCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of blocks.filter((b) => b.subject === s.subject)) {
      const t = b.type ?? "—";
      map[t] = (map[t] ?? 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [blocks, s.subject]);

  return (
    <div className={cn(
      "rounded-xl border transition-all duration-150 overflow-hidden",
      open
        ? "border-border bg-background shadow-sm"
        : "border-border/40 bg-background/30 hover:bg-background/60 hover:border-border/70"
    )}>
      <button
        className="w-full text-left px-3 py-2.5 flex flex-col gap-2"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Row: dot · name · streak · badge · chevron */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: hex }} />
            <span className="text-xs font-semibold truncate">{s.subject}</span>
            {s.streak > 1 && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-semibold shrink-0">
                <Flame className="w-3 h-3" />{s.streak}d
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0", pal.badge)}>
              {s.efficiencyPct}%
            </span>
            {open
              ? <ChevronUp className="w-3 h-3 text-muted-foreground" />
              : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
          </div>
        </div>

        {/* Progress track */}
        <div className="relative h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(progress, 100)}%`, background: pal.fill }} />
        </div>

        {/* Bottom: time + day strip */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            <span className="font-medium text-foreground">{formatDuration(s.doneMinutes)}</span>
            <span className="text-muted-foreground/50"> / {formatDuration(s.plannedMinutes)}</span>
          </span>
          <DayHeatStrip subject={s.subject} blocks={blocks} hex={hex} />
        </div>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="px-3 pb-3 pt-2 border-t border-border/40 bg-muted/10 flex flex-col gap-2.5">
          {/* Type pills */}
          {typeCount.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {typeCount.map(([type, count]) => (
                <span key={type}
                  className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full",
                    TYPE_BADGE[type] ?? "bg-muted text-muted-foreground")}>
                  {type} ×{count}
                </span>
              ))}
            </div>
          )}

          {/* Pending topics */}
          {s.pendingTopics.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Pendentes ({s.todoCount})
              </p>
              <div className="flex flex-col gap-1">
                {s.pendingTopics.slice(0, 4).map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 opacity-50" style={{ background: hex }} />
                    <span className="text-[11px] text-muted-foreground truncate">{t}</span>
                  </div>
                ))}
                {s.pendingTopics.length > 4 && (
                  <span className="text-[10px] text-muted-foreground pl-3">
                    +{s.pendingTopics.length - 4} tópicos
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "blocos", value: s.blockCount },
              { label: "feitos", value: s.doneCount },
              { label: "pendentes", value: s.todoCount },
            ].map(({ label, value }) => (
              <div key={label}
                className="bg-background/60 rounded-lg px-2 py-1.5 text-center border border-border/30">
                <p className="text-sm font-bold text-foreground">{value}</p>
                <p className="text-[9px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full h-7 text-[11px] gap-1"
            onClick={(e) => { e.stopPropagation(); onAddBlock(); }}>
            <Plus className="w-3 h-3" />
            Novo bloco · {s.subject.split(" ")[0]}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pending blocks queue
// ─────────────────────────────────────────────────────────────────────────────

function PendingQueue({
  blocks,
  onEdit,
  onDuplicate,
  onRemove,
}: {
  blocks: StudyBlock[];
  onEdit: (b: StudyBlock) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  if (blocks.length === 0)
    return (
      <p className="text-[11px] text-muted-foreground text-center py-3">
        Nenhum bloco pendente 🎉
      </p>
    );

  return (
    <div className="flex flex-col gap-1.5">
      {blocks.slice(0, 6).map((b) => {
        const hex = COLOR_HEX[b.color] ?? "#3b82f6";
        return (
          <div key={b.id}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 bg-background/40 border border-border/40 group hover:bg-background/70 hover:border-border transition-all cursor-pointer"
            onClick={() => onEdit(b)}
          >
            <div className="w-1 h-8 rounded-full shrink-0" style={{ background: hex }} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate">{b.subject}</p>
              {b.topic && (
                <p className="text-[10px] text-muted-foreground truncate">{b.topic}</p>
              )}
              <p className="text-[10px] text-muted-foreground/60">
                {DAY_NAMES[b.dayIndex]} · {b.startTime}–{b.endTime}
              </p>
            </div>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 rounded hover:bg-muted transition-colors"
                onClick={(e) => { e.stopPropagation(); onDuplicate(b.id); }}
                title="Duplicar">
                <Copy className="w-3 h-3 text-muted-foreground" />
              </button>
              <button className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                onClick={(e) => { e.stopPropagation(); onRemove(b.id); }}
                title="Remover">
                <Trash2 className="w-3 h-3 text-rose-500" />
              </button>
            </div>
          </div>
        );
      })}
      {blocks.length > 6 && (
        <p className="text-[10px] text-muted-foreground text-center">
          +{blocks.length - 6} blocos pendentes
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main sidebar
// ─────────────────────────────────────────────────────────────────────────────

export function SidebarTools() {
  const { allBlocks, openAddModal, openEditBlock, removeBlock, duplicateBlock } = usePlannerActions();

  const analytics = useMemo(() => new PlannerAnalytics(allBlocks), [allBlocks]);
  const summaries = useMemo(() => analytics.getSubjectSummaries(), [analytics]);
  const stats = useMemo(() => analytics.getWeekStats(), [analytics]);
  const dayLoads = useMemo(() => analytics.getDayLoads(), [analytics]);

  const pendingBlocks = useMemo(
    () => [...allBlocks]
      .filter((b) => b.status === "todo")
      .sort((a, b) => a.dayIndex - b.dayIndex || a.startTime.localeCompare(b.startTime)),
    [allBlocks]
  );

  const pal = effPalette(stats.overallEfficiency);

  return (
    <aside className="border-l bg-muted/5 flex flex-col h-full w-[272px] shrink-0 overflow-y-auto">

      {/* ── Sticky header ── */}
      <div className="px-4 pt-4 pb-3 border-b bg-background/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold">Esta semana</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatDuration(stats.totalPlannedMinutes)} planejados
            </p>
          </div>
          <Button variant="default" size="sm" className="h-7 text-xs px-2.5 gap-1"
            onClick={() => openAddModal(0)}>
            <Plus className="w-3 h-3" /> Adicionar
          </Button>
        </div>

        {/* Donut + 4 KPIs */}
        <div className="flex items-center gap-3">
          <DonutRing
            value={stats.overallEfficiency}
            color={pal.fill}
            label="Eficiência"
            sublabel={formatDuration(stats.totalDoneMinutes) + " feito"}
          />
          <div className="flex-1 grid grid-cols-2 gap-1.5">
            {([
              { label: "Lacunas", value: String(stats.criticalGaps), danger: stats.criticalGaps > 0 },
              { label: "Matérias", value: String(summaries.length), danger: false },
              { label: "Pendentes", value: String(pendingBlocks.length), danger: pendingBlocks.length > 5 },
              { label: "Dia top", value: stats.mostLoadedDay, danger: false },
            ] as const).map(({ label, value, danger }) => (
              <div key={label} className="bg-muted/40 rounded-lg px-2 py-1.5">
                <p className="text-[9px] text-muted-foreground truncate">{label}</p>
                <p className={cn("text-xs font-bold leading-tight",
                  danger ? "text-rose-600 dark:text-rose-400" : "text-foreground")}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">

        {/* ── Weekly load chart ── */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Carga diária
          </p>
          <WeekBarChart dayLoads={dayLoads} />
        </section>

        <Separator />

        {/* ── Subject health ── */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Matérias · {summaries.length}
          </p>
          <div className="flex flex-col gap-2">
            {summaries.map((s) => (
              <SubjectCard
                key={s.subject}
                s={s}
                blocks={allBlocks}
                onAddBlock={() => openAddModal(0)}
              />
            ))}
            {summaries.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Nenhuma matéria ainda</p>
                <p className="text-xs mt-1">Adicione um bloco para começar</p>
              </div>
            )}
          </div>
        </section>

        <Separator />

        {/* ── Pending queue ── */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Próximos blocos · {pendingBlocks.length}
          </p>
          <PendingQueue
            blocks={pendingBlocks}
            onEdit={openEditBlock}
            onDuplicate={duplicateBlock}
            onRemove={removeBlock}
          />
        </section>

      </div>
    </aside>
  );
}