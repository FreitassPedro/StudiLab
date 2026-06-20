"use client";

import { useMemo } from "react";
import { useProfileTheme } from "./ThemeContext";
import { SectionLabel } from "./SectionLabel";

// ── Types ──
interface HeatCell {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  weekIndex: number;
  dayIndex: number;
}

interface WeekColumn {
  cells: HeatCell[];
  monthLabel?: string;
}

// ── Utils ──
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

function getHeatLevel(rand: number, recency: number, dayIndex: number): 0 | 1 | 2 | 3 | 4 {
  let level: 0 | 1 | 2 | 3 | 4 = 0;
  if (rand < 0.15) level = 0;
  else if (rand < 0.35) level = 1;
  else if (rand < 0.6 + recency * 0.1) level = 2;
  else if (rand < 0.8 + recency * 0.1) level = 3;
  else level = 4;
  // Weekends slightly less active
  if (dayIndex >= 5 && Math.random() > 0.6) {
    level = Math.max(0, level - 1) as 0 | 1 | 2 | 3 | 4;
  }
  return level;
}

function buildHeatmapData(weeks: number): WeekColumn[] {
  const columns: WeekColumn[] = [];
  let lastMonth = -1;

  for (let w = 0; w < weeks; w++) {
    const colDate = new Date(2025, 10, 15); // Nov 15, 2025 as "today"
    colDate.setDate(colDate.getDate() - (weeks - w) * 7);
    const month = colDate.getMonth();

    const monthLabel = month !== lastMonth ? MONTH_NAMES[month] : undefined;
    if (month !== lastMonth) lastMonth = month;

    const cells: HeatCell[] = Array.from({ length: 7 }, (_, d) => {
      const rand = Math.random();
      const level = getHeatLevel(rand, w / weeks, d);
      return { level, label: HOURS_LABELS[level], weekIndex: w, dayIndex: d };
    });

    columns.push({ cells, monthLabel });
  }

  return columns;
}

// ── Cell component ──
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
    0: "rgba(255,255,255,0.06)",
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
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#1e1e2e] px-2 py-1 text-[11px] text-[#e2e8f0] opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </div>
    </div>
  );
}

// ── Day labels ──
const DAY_LABELS = ["Seg", "", "Qua", "", "Sex", "", "Dom"];

// ── Main component ──
export function StudyHeatmap() {
  const { accent } = useProfileTheme();
  const WEEKS = 26;

  // useMemo makes sure we generate consistent data on mount (theme changes won't re-randomize)
  const columns = useMemo(() => buildHeatmapData(WEEKS), []);

  return (
    <section className="mb-10">
      <SectionLabel>Diário de Bordo · Últimos 6 meses</SectionLabel>

      <div className="overflow-x-auto rounded-[18px] border border-white/[0.06] bg-white/[0.02] p-6">
        {/* Month labels */}
        <div className="mb-1.5 flex gap-0.5 pl-[22px]">
          {columns.map((col, i) =>
            col.monthLabel ? (
              <span
                key={i}
                className="min-w-[28px] flex-shrink-0 text-[9px] font-semibold text-white/25"
              >
                {col.monthLabel}
              </span>
            ) : (
              <span key={i} className="min-w-[15px] flex-shrink-0" />
            )
          )}
        </div>

        <div className="flex gap-1.5">
          {/* Day labels */}
          <div className="flex flex-col justify-around gap-0.5 pt-1">
            {DAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="flex h-[13px] items-center text-[9px] text-white/20"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid columns */}
          <div className="flex flex-nowrap gap-0.5">
            {columns.map((col, w) => (
              <div key={w} className="flex flex-col gap-0.5">
                {col.cells.map((cell, d) => (
                  <HeatCell
                    key={d}
                    level={cell.level}
                    label={cell.label}
                    accent={accent}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3.5 flex items-center gap-1.5">
          <span className="text-[10px] text-white/25">Menos</span>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <HeatCell key={level} level={level} label={HOURS_LABELS[level]} accent={accent} />
          ))}
          <span className="text-[10px] text-white/25">Mais</span>
        </div>
      </div>
    </section>
  );
}
