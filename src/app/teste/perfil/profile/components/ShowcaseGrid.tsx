"use client";

import { SectionLabel } from "./SectionLabel";
import { useProfileTheme } from "./ThemeContext";
import type { ProfileStats } from "../types";

// ── Streak card ────────────────────────────────────────────────────────────────
function StreakCard({
  streak,
  accent,
}: {
  streak: number;
  accent: Record<string, string>;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/30">
        🔥 Ofensiva Atual
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="font-['Space_Grotesk'] text-[64px] font-black leading-none tracking-[-3px]"
          style={{ color: accent.accent }}
        >
          {streak}
        </span>
        <span className="text-sm font-semibold text-white/40">dias</span>
      </div>
      <div className="text-xs text-white/45">
        {streak > 0 ? "Não perca amanhã ↗" : "Comece hoje! 💪"}
      </div>
    </div>
  );
}

// ── Best week card ─────────────────────────────────────────────────────────────
function BestWeekCard({
  minutes,
  weekLabel,
  accent,
}: {
  minutes: number;
  weekLabel: string;
  accent: Record<string, string>;
}) {
  const hours = (minutes / 60).toFixed(0);
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/30">
        📅 Melhor Semana
      </div>
      <span
        className="font-['Space_Grotesk'] text-[52px] font-black leading-none tracking-[-3px]"
        style={{ color: accent.accent }}
      >
        {hours}h
      </span>
      <div className="text-xs text-white/45">{weekLabel}</div>
    </div>
  );
}

// ── Week goal card ─────────────────────────────────────────────────────────────
const WEEK_GOAL_MINUTES = 2400; // 40h default goal

function WeekGoalCard({
  weeklyMinutes,
  accent,
}: {
  weeklyMinutes: number;
  accent: Record<string, string>;
}) {
  const progress = Math.min(100, Math.round((weeklyMinutes / WEEK_GOAL_MINUTES) * 100));
  const done = (weeklyMinutes / 60).toFixed(1);
  const goal = (WEEK_GOAL_MINUTES / 60).toFixed(0);

  return (
    <div
      className="flex flex-col gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/30">
        🎯 Meta da Semana
      </div>
      <div className="text-[13px] font-semibold text-white/80">
        {goal}h estudadas
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${accent.accent}, ${accent.accent2})`,
          }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-white/35">
        <span>
          {done}h / {goal}h
        </span>
        <span className="font-bold" style={{ color: accent.accent }}>
          {progress}%
        </span>
      </div>
    </div>
  );
}

// ── Total hours card ───────────────────────────────────────────────────────────
function TotalHoursCard({
  totalMinutes,
  totalSessions,
  accent,
}: {
  totalMinutes: number;
  totalSessions: number;
  accent: Record<string, string>;
}) {
  const hours = Math.round(totalMinutes / 60).toLocaleString("pt-BR");
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/30">
        ⏱ Total Histórico
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="font-['Space_Grotesk'] text-[48px] font-black leading-none tracking-[-3px]"
          style={{ color: accent.accent }}
        >
          {hours}
        </span>
        <span className="text-sm font-semibold text-white/40">horas</span>
      </div>
      <div className="text-xs text-white/45">{totalSessions} sessões registradas</div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
interface ShowcaseGridProps {
  stats: ProfileStats;
}

export function ShowcaseGrid({ stats }: ShowcaseGridProps) {
  const { accent } = useProfileTheme();

  return (
    <section className="mb-10">
      <SectionLabel>Vitrine</SectionLabel>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StreakCard streak={stats.currentStreak} accent={accent} />
        <TotalHoursCard
          totalMinutes={stats.totalMinutes}
          totalSessions={stats.totalSessions}
          accent={accent}
        />
        <BestWeekCard
          minutes={stats.bestWeekMinutes}
          weekLabel={stats.bestWeekLabel}
          accent={accent}
        />
        <WeekGoalCard weeklyMinutes={stats.weeklyMinutes} accent={accent} />
      </div>
    </section>
  );
}
