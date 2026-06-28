"use client";

import { useProfileTheme } from "./ThemeContext";
import { Target, CalendarDays } from "lucide-react";

interface ObjectiveCardProps {
  objective?: {
    name: string;
    date: string;
    daysLeft: number;
  };
}

export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const { accent } = useProfileTheme();

  if (!objective) return null;

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border bg-foreground/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        boxShadow: `inset 0 0 40px -20px ${accent.accent}20`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/40 flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5" style={{ color: accent.accent }} />
          Objetivo Atual
        </div>
        <div 
          className="text-xs font-semibold px-2 py-1 rounded-md"
          style={{ backgroundColor: `${accent.accent}1a`, color: accent.accent }}
        >
          {objective.daysLeft} dias
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-foreground">
          {objective.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-sm text-foreground/50">
          <CalendarDays className="h-4 w-4" />
          {objective.date}
        </div>
      </div>

      <div className="mt-2 h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
         {/* Decorative progress bar, could be actual progress if we had start date */}
        <div 
          className="h-full rounded-full" 
          style={{ 
            width: "65%", 
            background: `linear-gradient(90deg, ${accent.accent}, ${accent.accent2})` 
          }} 
        />
      </div>
    </div>
  );
}
