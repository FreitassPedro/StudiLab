"use client";

import { MOCK_SUBJECTS } from "../mock-data";
import { useProfileTheme } from "./ThemeContext";
import { SectionLabel } from "./SectionLabel";
import type { Subject } from "../types";

interface SubjectRowProps {
  subject: Subject;
  rank: number;
  maxHours: number;
  accent: Record<string, string>;
}

function SubjectRow({ subject, rank, maxHours, accent }: SubjectRowProps) {
  const barWidth = `${(subject.hours / maxHours) * 100}%`;

  return (
    <div className="flex items-center gap-3.5 rounded-lg px-2 py-3 transition-colors duration-200 hover:bg-white/[0.04] border-b border-white/[0.05] last:border-b-0">
      {/* Rank */}
      <span className="w-5 text-center text-[11px] font-bold text-white/25">
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

      {/* Name + sub */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{subject.name}</div>
        <div className="text-[11px] text-white/35">{subject.sub}</div>
      </div>

      {/* Hours + bar */}
      <div className="flex min-w-[100px] flex-col items-end gap-1">
        <span
          className="font-['Space_Grotesk'] text-[13px] font-extrabold"
          style={{ color: accent.accent }}
        >
          {subject.hours}h
        </span>
        <div className="h-[3px] w-full min-w-[60px] rounded-full bg-white/[0.08]">
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

export function TopSubjects() {
  const { accent } = useProfileTheme();
  const maxHours = MOCK_SUBJECTS[0].hours;

  return (
    <section className="mb-10">
      <SectionLabel>Top Matérias — Esta Semana</SectionLabel>

      <div className="overflow-hidden rounded-[18px] border border-white/[0.06] bg-white/[0.02]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.05] bg-white/[0.03] px-4 py-2">
          <span className="text-[11px] font-semibold text-white/25">#</span>
          <span className="text-[11px] font-semibold text-white/25">HORAS</span>
        </div>

        {/* Rows */}
        <div className="px-2 py-1">
          {MOCK_SUBJECTS.map((subject, i) => (
            <SubjectRow
              key={subject.name}
              subject={subject}
              rank={i + 1}
              maxHours={maxHours}
              accent={accent}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
