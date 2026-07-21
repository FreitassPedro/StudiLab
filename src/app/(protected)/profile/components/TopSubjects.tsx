"use client";

import { useProfileTheme } from "./ThemeContext";
import { SectionLabel } from "./SectionLabel";
import type { ProfileSubject } from "../types";

// ── Subject row emoji fallbacks (by subject name keyword) ─────────────────────
const SUBJECT_EMOJI_MAP: Record<string, string> = {
  matemática: "🧮",
  matematica: "🧮",
  math: "🧮",
  química: "⚗️",
  quimica: "⚗️",
  biologia: "🧬",
  física: "⚡",
  fisica: "⚡",
  português: "📖",
  portugues: "📖",
  redação: "✍️",
  redacao: "✍️",
  história: "📜",
  historia: "📜",
  geografia: "🌍",
  inglês: "🇺🇸",
  ingles: "🇺🇸",
  programação: "💻",
  programacao: "💻",
};

function getEmoji(name: string): string {
  const key = name.toLowerCase();
  for (const k of Object.keys(SUBJECT_EMOJI_MAP)) {
    if (key.includes(k)) return SUBJECT_EMOJI_MAP[k];
  }
  return "📚";
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

// ── Subject row ────────────────────────────────────────────────────────────────
interface SubjectRowProps {
  subject: ProfileSubject;
  rank: number;
  maxMinutes: number;
  accent: Record<string, string>;
}

function SubjectRow({ subject, rank, maxMinutes, accent }: SubjectRowProps) {
  const barWidth = `${Math.max(4, (subject.minutes / maxMinutes) * 100)}%`;

  return (
    <div className="flex items-center gap-3.5 rounded-lg px-2 py-3 transition-colors duration-200 hover:bg-foreground/[0.04] border-b border-border last:border-b-0">
      {/* Rank */}
      <span className="w-5 text-center text-[11px] font-bold text-foreground/25">
        {rank}
      </span>

      {/* Emoji cover */}
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-xl"
        style={{
          background: `${subject.color}22`,
          border: `1px solid ${subject.color}44`,
        }}
      >
        {subject.emoji}
      </div>

      {/* Name */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{subject.name}</div>
      </div>

      {/* Hours + bar */}
      <div className="flex min-w-[100px] flex-col items-end gap-1">
        <span
          className="font-['Space_Grotesk'] text-[13px] font-extrabold"
          style={{ color: accent.accent }}
        >
          {formatMinutes(subject.minutes)}
        </span>
        <div className="h-[3px] w-full min-w-[60px] rounded-full bg-foreground/[0.08]">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{
              width: barWidth,
              background: `linear-gradient(90deg, ${accent.accent}, ${accent.accent2})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
interface TopSubjectsProps {
  subjects: ProfileSubject[];
}

export function TopSubjects({ subjects }: TopSubjectsProps) {
  const { accent } = useProfileTheme();
  const maxMinutes = subjects[0]?.minutes ?? 1;

  if (subjects.length === 0) {
    return (
      <section className="mb-10">
        <SectionLabel>Top Matérias</SectionLabel>
        <p className="text-sm text-foreground/30">Nenhuma sessão registrada ainda.</p>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <SectionLabel>Top Matérias — Semanal</SectionLabel>

      <div className="overflow-hidden rounded-[18px] border border-border bg-foreground/[0.02]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-foreground/[0.03] px-4 py-2">
          <span className="text-[11px] font-semibold text-foreground/25">#</span>
          <span className="text-[11px] font-semibold text-foreground/25">HORAS</span>
        </div>

        {/* Rows */}
        <div className="px-2 py-1">
          {subjects.map((subject, i) => (
            <SubjectRow
              key={subject.name}
              subject={subject}
              rank={i + 1}
              maxMinutes={maxMinutes}
              accent={accent}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
