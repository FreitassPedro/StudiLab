"use client";

import { SectionLabel } from "./SectionLabel";
import { useProfileTheme } from "./ThemeContext";
import type { ProfileStats } from "../types";
import { FlameIcon } from "lucide-react";

// ── Streak card (melhorado com animação e tier) ──────────────────────────────
function StreakCard({
  streak,
  accent,
}: {
  streak: number;
  accent: Record<string, string>;
}) {
  const isOnFire = streak >= 3;

  return (
    <div
      className="flex flex-col gap-2 bg-accent rounded-2xl border border-border p-4 transition-all duration-300 hover:-translate-y-0.5"
      style={
        isOnFire
          ? {
            boxShadow: `0 0 30px -10px ${accent.accent}40`,
            borderColor: `${accent.accent}30`,
          }
          : {}
      }
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-widest text-foreground/30">
          Ofensiva
        </div>
        <span
          className={isOnFire ? "animate-pulse" : ""}
          style={isOnFire ? { filter: `drop-shadow(0 0 6px ${accent.accent})` } : {}}
        >
          🔥
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <FlameIcon className="h-12 w-12 text-red-600" />
        <span
          className="font-['Space_Grotesk'] text-[56px] font-black leading-none tracking-[-3px]"
          style={{ color: accent.accent }}
        >
          {streak}
        </span>
        <span className="text-sm font-semibold text-foreground/40">dias</span>
      </div>
      <div className="text-xs text-foreground/40">
        {streak >= 30
          ? "🌟 Lendário!"
          : streak >= 14
            ? "⚡ Elite"
            : streak > 0
              ? "Não perca amanhã ↗"
              : "Comece hoje! 💪"}
      </div>
    </div>
  );
}

// ── Today Hours card ─────────────────────────────────────────────────────────
function TodayHoursCard({
  todayMinutes,
  accent,
}: {
  todayMinutes: number;
  accent: Record<string, string>;
}) {
  const h = Math.floor(todayMinutes / 60);
  const m = todayMinutes % 60;

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border border-border bg-foreground/3 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-(--accent-muted)"
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      <div className="text-[11px] font-bold uppercase tracking-widest text-foreground/30">
        ☀️ Hoje
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="font-['Space_Grotesk'] text-[48px] font-black leading-none tracking-[-3px]"
          style={{ color: accent.accent }}
        >
          {h}
        </span>
        <span className="text-2xl font-bold text-foreground/40">h</span>
        {m > 0 && (
          <>
            <span
              className="font-['Space_Grotesk'] text-[32px] font-black leading-none tracking-[-2px] ml-1"
              style={{ color: `${accent.accent}bb` }}
            >
              {m}
            </span>
            <span className="text-sm font-bold text-foreground/30">m</span>
          </>
        )}
      </div>
      <div className="text-xs text-foreground/40">
        {todayMinutes === 0 ? "Nenhuma sessão hoje ainda" : "estudados hoje"}
      </div>
    </div>
  );
}

// ── Best week card ────────────────────────────────────────────────────────────
function BestWeekCard({
  minutes,
  weekLabel,
  accent,
}: {
  minutes: number;
  weekLabel: string;
  accent: Record<string, string>;
}) {
  const hours = Math.round(minutes / 60);
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border border-border bg-foreground/3 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-(--accent-muted)"
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      <div className="text-[11px] font-bold uppercase tracking-widest text-foreground/30">
        📅 Melhor Semana
      </div>
      <span
        className="font-['Space_Grotesk'] text-[48px] font-black leading-none tracking-[-3px]"
        style={{ color: accent.accent }}
      >
        {hours}h
      </span>
      <div className="text-xs text-foreground/40">{weekLabel}</div>
    </div>
  );
}

// ── Week goal card ────────────────────────────────────────────────────────────
const WEEK_GOAL_MINUTES = 2400;

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
      className="flex flex-col gap-3 rounded-2xl border border-border bg-foreground/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-(--accent-muted)"
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      <div className="text-[11px] font-bold uppercase tracking-widest text-foreground/30">
        🎯 Meta Semanal
      </div>
      <div>
        <span className="font-['Space_Grotesk'] text-[32px] font-black leading-none tracking-[-2px]" style={{ color: accent.accent }}>
          {progress}
        </span>
        <span className="text-base font-bold text-foreground/40">%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.07]">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${accent.accent}, ${accent.accent2})`,
          }}
        />
      </div>
      <div className="text-[11px] text-foreground/35">
        {done}h de {goal}h
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface ShowcaseGridProps {
  stats: ProfileStats;
}

export function ShowcaseGrid({ stats }: ShowcaseGridProps) {
  const { accent } = useProfileTheme();

  return (
    <section className="mb-10">
      <SectionLabel>Vitrine</SectionLabel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StreakCard streak={stats.currentStreak} accent={accent} />
        <TodayHoursCard todayMinutes={stats.todayMinutes ?? 0} accent={accent} />
        <BestWeekCard
          minutes={stats.bestWeekMinutes}
          weekLabel={stats.bestWeekLabel}
          accent={accent}
        />
        {/* TODO: Implementar meta*/}
        {/* <WeekGoalCard weeklyMinutes={stats.weeklyMinutes} accent={accent} /> */}
      </div>
    </section>
  );
}
