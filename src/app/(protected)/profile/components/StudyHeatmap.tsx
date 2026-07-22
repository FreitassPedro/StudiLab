"use client";

import { useMemo } from "react";
import { useProfileTheme } from "./ThemeContext";
import { SectionLabel } from "./SectionLabel";

// ── Types ──────────────────────────────────────────────────────────────────────
interface HeatCell {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  dateKey: string;
}

interface WeekColumn {
  cells: HeatCell[];
  monthLabel?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const HOURS_LABELS: Record<number, string> = {
  0: "Sem sessões",
  1: "1–2h estudadas",
  2: "3–4h estudadas",
  3: "5–7h estudadas",
  4: "8h+ estudadas",
};

// ── Derive heat level from minutes ────────────────────────────────────────────
function minutesToLevel(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (!minutes || minutes === 0) return 0;
  if (minutes < 90) return 1;
  if (minutes < 210) return 2;
  if (minutes < 390) return 3;
  return 4;
}

// ── Build column structure from heatmap record ────────────────────────────────
function buildColumns(
  heatmap: Record<string, number>,
  weeks: number
): WeekColumn[] {
  const columns: WeekColumn[] = [];
  let lastMonth = -1;

  for (let w = 0; w < weeks; w++) {
    // Compute the Monday of the column (w=0 is oldest)
    const weeksAgo = weeks - 1 - w;
    const today = new Date();
    const mondayThisWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay() + 1 // Monday
    );
    const colMonday = new Date(mondayThisWeek);
    colMonday.setDate(colMonday.getDate() - weeksAgo * 7);

    const month = colMonday.getMonth();
    const monthLabel = month !== lastMonth ? MONTH_NAMES[month] : undefined;
    if (month !== lastMonth) lastMonth = month;

    const cells: HeatCell[] = Array.from({ length: 7 }, (_, d) => {
      const day = new Date(colMonday);
      day.setDate(day.getDate() + d);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const minutes = heatmap[key] ?? 0;
      const level = minutesToLevel(minutes);
      const hoursLabel = minutes > 0
        ? `${(minutes / 60).toFixed(1)}h estudadas`
        : "Sem sessões";
      return { level, label: `${key} · ${hoursLabel}`, dateKey: key };
    });

    columns.push({ cells, monthLabel });
  }

  return columns;
}

// ── Cell ──────────────────────────────────────────────────────────────────────
function HeatCell({
  level,
  label,
  accent,
}: {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  accent: Record<string, string>;
}) {
  const intensityMap: Record<number, string> = {
    0: "var(--muted)",
    1: `${accent.accent}33`,
    2: `${accent.accent}66`,
    3: `${accent.accent}a6`,
    4: accent.accent,
  };

    return (
      <div
        className="group relative h-[13px] w-[13px] cursor-default rounded-[3px] transition-transform duration-150 hover:z-10 hover:scale-150"
        style={{ background: intensityMap[level] }}
        title={label}
      >
        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-[11px] text-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {label}
        </div>
      </div>
    );
}

const DAY_LABELS = ["Seg", "", "Qua", "", "Sex", "", "Dom"];

// ── Main ──────────────────────────────────────────────────────────────────────
interface StudyHeatmapProps {
  heatmap: Record<string, number>;
}

export function StudyHeatmap({ heatmap }: StudyHeatmapProps) {
  const { accent } = useProfileTheme();
  const WEEKS = 26;

  const columns = useMemo(() => buildColumns(heatmap, WEEKS), [heatmap]);

  console.log(heatmap);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <section className="mb-10">
      <SectionLabel>Diário de Bordo · Últimos 6 meses</SectionLabel>

      <div className="overflow-x-auto rounded-[18px] border border-border bg-foreground/2 p-6">
        {/* Month labels */}
        <div className="mb-1.5 flex gap-0.5 pl-[22px]">
          {columns.map((col, i) =>
            col.monthLabel ? (
              <span
                key={i}
                className="min-w-[28px] shrink-0 text-[9px] font-semibold text-foreground/25"
              >
                {col.monthLabel}
              </span>
            ) : (
              <span key={i} className="min-w-[15px] shrink-0" />
            )
          )}
        </div>

        <div className="flex gap-1.5">
          {/* Day labels */}
          <div className="flex flex-col justify-around gap-0.5 pt-1">
            {DAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="flex h-[13px] items-center text-[9px] text-foreground/20"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-nowrap gap-0.5">
            {columns.map((col, w) => (
              <div key={w} className="flex flex-col gap-0.5">
                {col.cells.map((cell, d) => {

                  // Se a celula for depois de hoje, não renderizar
                  if (cell.dateKey > todayKey) return null;

                  return (
                    <HeatCell
                      key={d}
                      level={cell.level}
                      label={cell.label}
                      accent={accent}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3.5 flex items-center gap-1.5">
          <span className="text-[10px] text-foreground/25">Menos</span>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <HeatCell
              key={level}
              level={level}
              label={HOURS_LABELS[level]}
              accent={accent}
            />
          ))}
          <span className="text-[10px] text-foreground/25">Mais</span>
        </div>
      </div>
    </section>
  );
}
