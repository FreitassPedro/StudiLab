"use client";

import { MOCK_SESSIONS } from "../mock-data";
import { useProfileTheme } from "./ThemeContext";
import { SectionLabel } from "./SectionLabel";
import type { Session } from "../types";

interface SessionCardProps {
  session: Session;
  accent: Record<string, string>;
}

function SessionCard({ session, accent }: SessionCardProps) {
  return (
    <div
      className="group relative flex aspect-square min-h-[130px] cursor-default flex-col justify-end overflow-hidden rounded-[14px] border p-3.5 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: `${session.color}33`,
      }}
      // Highlight border on hover via inline style trick
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = accent.accent;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${session.color}33`;
      }}
    >
      {/* Background emoji */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[56px] opacity-10">
        {session.emoji}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
          {session.subject}
        </div>
        <div className="font-['Space_Grotesk'] text-xl font-black leading-none text-white">
          {session.duration}
        </div>
        <div className="mt-1 text-[11px] text-white/45">{session.note}</div>
        <div className="mt-1.5 text-[10px] text-white/25">às {session.time}</div>
      </div>
    </div>
  );
}

export function RecentSessions() {
  const { accent } = useProfileTheme();

  return (
    <section className="mb-10">
      <SectionLabel>Sessões Recentes</SectionLabel>
      <div className="grid grid-cols-3 gap-2.5">
        {MOCK_SESSIONS.map((session, i) => (
          <SessionCard key={i} session={session} accent={accent} />
        ))}
      </div>
    </section>
  );
}
