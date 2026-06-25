"use client";

import { useProfileTheme } from "./ThemeContext";
import { SectionLabel } from "./SectionLabel";
import type { ProfileSession } from "../types";

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getSubjectEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("matem") || lower.includes("math")) return "🧮";
  if (lower.includes("quím") || lower.includes("quim")) return "⚗️";
  if (lower.includes("bio")) return "🧬";
  if (lower.includes("fís") || lower.includes("fis")) return "⚡";
  if (lower.includes("portug") || lower.includes("redaç") || lower.includes("redac")) return "📖";
  if (lower.includes("hist")) return "📜";
  if (lower.includes("geo")) return "🌍";
  if (lower.includes("ingl") || lower.includes("engl")) return "🇺🇸";
  if (lower.includes("prog") || lower.includes("comput")) return "💻";
  return "📚";
}

// ── Session card ───────────────────────────────────────────────────────────────
interface SessionCardProps {
  session: ProfileSession;
  accent: Record<string, string>;
}

function SessionCard({ session, accent }: SessionCardProps) {
  const emoji = getSubjectEmoji(session.subjectName);

  return (
    <div
      className="group relative flex aspect-square min-h-[130px] cursor-default flex-col justify-end overflow-hidden rounded-[14px] border p-3.5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: `${session.subjectColor}33`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = accent.accent;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${session.subjectColor}33`;
      }}
    >
      {/* Background emoji watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[56px] opacity-10">
        {emoji}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
          {session.subjectName}
        </div>
        <div className="font-['Space_Grotesk'] text-xl font-black leading-none text-white">
          {formatDuration(session.duration_minutes)}
        </div>
        <div className="mt-1 line-clamp-1 text-[11px] text-white/45">
          {session.topicName}
        </div>
        <div className="mt-1.5 text-[10px] text-white/25">
          às {formatTime(session.start_time)}
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
interface RecentSessionsProps {
  sessions: ProfileSession[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  const { accent } = useProfileTheme();

  if (sessions.length === 0) {
    return (
      <section className="mb-10">
        <SectionLabel>Sessões Recentes</SectionLabel>
        <p className="text-sm text-white/30">Nenhuma sessão registrada ainda.</p>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <SectionLabel>Sessões Recentes</SectionLabel>
      <div className="grid grid-cols-4 gap-2.5">
        {sessions.slice(0, 9).map((session) => (
          <SessionCard key={session.id} session={session} accent={accent} />
        ))}
      </div>
    </section>
  );
}
