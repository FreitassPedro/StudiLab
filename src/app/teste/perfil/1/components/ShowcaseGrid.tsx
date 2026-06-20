"use client";

import { SectionLabel } from "./SectionLabel";
import { useProfileTheme } from "./ThemeContext";

// ── Sub-components ──

function StreakCard({ accent }: { accent: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
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
          47
        </span>
        <span className="text-sm font-semibold text-white/40">dias</span>
      </div>
      <div className="text-xs text-white/45">Não perca amanhã ↗</div>
    </div>
  );
}

function RareBadgeCard({ accent }: { accent: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/30">
        🏆 Medalha Mais Rara
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-amber-500/50 bg-gradient-to-br from-amber-400 to-amber-600 text-[22px]">
          🌙
        </div>
        <div>
          <div className="text-sm font-bold leading-tight">
            Coruja da Madrugada
          </div>
          <div className="mt-0.5 text-[11px] text-white/35">
            30 sessões após 23h
          </div>
        </div>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber-400/70">
        ⚡ Ultra Rara · 2.1% alcançaram
      </div>
    </div>
  );
}

function BestWeekCard({ accent }: { accent: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
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
        52h
      </span>
      <div className="text-xs text-white/45">Semana 18/11 — 24/11</div>
      <div className="text-[11px]" style={{ color: accent.accent }}>
        ↑ +12h acima da média
      </div>
    </div>
  );
}

function WeekGoalCard({ accent }: { accent: Record<string, string> }) {
  const progress = 74;

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/30">
        🎯 Meta da Semana
      </div>
      <div className="text-[13px] font-semibold text-white/80">
        40h estudadas
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${accent.accent}, ${accent.accent2})`,
          }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-white/35">
        <span>29.6h / 40h</span>
        <span className="font-bold" style={{ color: accent.accent }}>
          {progress}%
        </span>
      </div>
    </div>
  );
}

// ── Main showcase grid ──
export function ShowcaseGrid() {
  const { accent } = useProfileTheme();

  return (
    <section className="mb-10">
      <SectionLabel>Vitrine</SectionLabel>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StreakCard accent={accent} />
        <RareBadgeCard accent={accent} />
        <BestWeekCard accent={accent} />
        <WeekGoalCard accent={accent} />
      </div>
    </section>
  );
}
