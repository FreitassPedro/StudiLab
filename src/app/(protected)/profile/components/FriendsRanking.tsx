"use client";

import { useProfileTheme } from "./ThemeContext";
import { FriendRanking } from "../types";
import { Trophy, Medal, Clock } from "lucide-react";
import { SectionLabel } from "./SectionLabel";

interface FriendsRankingProps {
  ranking: FriendRanking[];
}

export function FriendsRanking({ ranking }: FriendsRankingProps) {
  const { accent } = useProfileTheme();

  if (!ranking || ranking.length === 0) return null;

  const maxMinutes = Math.max(...ranking.map((r) => r.minutes), 1);

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Ranking — Hoje</SectionLabel>
      <div className="flex flex-col gap-1.5">
        {ranking.map((friend, index) => {
          const progress = Math.min(100, Math.round((friend.minutes / maxMinutes) * 100));
          const isFirst = index === 0;

          return (
            <div
              key={friend.username}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden transition-colors hover:bg-foreground/3"
            >
              {/* Progress fill */}
              <div
                className="absolute inset-y-0 left-0 rounded-xl opacity-[0.08] transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${accent.accent}, transparent)`,
                }}
              />

              {/* Rank icon */}
              <div className="relative z-10 flex items-center justify-center w-5 shrink-0">
                {index === 0 ? (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                ) : index === 1 ? (
                  <Medal className="h-4 w-4 text-slate-400" />
                ) : index === 2 ? (
                  <Medal className="h-4 w-4 text-amber-700" />
                ) : (
                  <span className="text-[11px] font-bold text-foreground/30">{index + 1}º</span>
                )}
              </div>

              {/* Avatar */}
              <div
                className="relative z-10 h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-foreground"
                style={{
                  background: isFirst
                    ? `linear-gradient(135deg, ${accent.accent}, ${accent.accent2})`
                    : "var(--muted)",
                }}
              >
                {friend.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={friend.image} alt={friend.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  friend.name.charAt(0)
                )}
              </div>

              {/* Name */}
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground/90 truncate">{friend.name}</p>
                <p className="text-[10px] text-foreground/35">@{friend.username}</p>
              </div>

              {/* Time */}
              <div className="relative z-10 flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5 text-foreground/30" />
                <span
                  className="text-sm font-semibold"
                  style={{ color: isFirst ? accent.accent : "var(--muted-foreground)" }}
                >
                  {formatHours(friend.minutes)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
