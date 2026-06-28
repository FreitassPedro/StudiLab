"use client";

import { useProfileTheme } from "./ThemeContext";
import { SectionLabel } from "./SectionLabel";

interface ActivityEntry {
  id: string;
  userName: string;
  userImage?: string;
  action: string; // e.g. "estudou 2h de Matemática"
  timeAgo: string; // e.g. "há 20 min"
}

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "1", userName: "Ana Silva", action: "estudou 2h de Física", timeAgo: "há 5 min" },
  { id: "2", userName: "Carlos Edu", action: "completou o heatmap da semana 🔥", timeAgo: "há 18 min" },
  { id: "3", userName: "Maria Clara", action: "estudou 45min de Química", timeAgo: "há 1h" },
  { id: "4", userName: "Lucas Mendes", action: "atingiu 7 dias de ofensiva ⚡", timeAgo: "há 2h" },
];

export function SocialActivity() {
  const { accent } = useProfileTheme();

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Atividade de Amigos</SectionLabel>

      <div className="flex flex-col gap-2">
        {MOCK_ACTIVITY.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.02] border border-border hover:bg-foreground/[0.04] transition-colors"
          >
            {/* Avatar */}
            <div
              className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-foreground"
              style={{ background: `linear-gradient(135deg, ${accent.accent}80, ${accent.accent2}60)` }}
            >
              {entry.userName.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground/90 leading-snug">
                <span className="font-semibold">{entry.userName}</span>{" "}
                <span className="text-foreground/55">{entry.action}</span>
              </p>
              <p className="text-[11px] text-foreground/30 mt-0.5">{entry.timeAgo}</p>
            </div>

            {/* Accent dot */}
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: `${accent.accent}80` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
