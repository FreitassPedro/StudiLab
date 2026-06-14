"use client";

import { BookOpen, Clock, BarChart2, CheckCircle2, TrendingUp } from "lucide-react";
import type { WeekStats } from "./planner";
import { formatDuration } from "./planner-utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface WeekStatsBarProps {
  stats: WeekStats;
  className?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  "Matemática": "bg-blue-400",
  "Física": "bg-amber-400",
  "História": "bg-rose-400",
  "Inglês": "bg-teal-400",
  "Química": "bg-emerald-400",
  "Geografia": "bg-violet-400",
  "Biologia": "bg-emerald-500",
  "Português": "bg-orange-400",
};

function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? "bg-muted-foreground/40";
}

export function WeekStatsBar({ stats, className }: WeekStatsBarProps) {
  const topSubjects = Object.entries(stats.subjectBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const completionRate = stats.totalBlocks > 0 
    ? Math.round((stats.completedBlocks / stats.totalBlocks) * 100) 
    : 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4",
        "border-b bg-muted/10 text-sm",
        className
      )}
    >
      {/* Progress Circle/Badge */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
           <svg className="w-full h-full -rotate-90">
             <circle 
                cx="20" cy="20" r="18" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                className="text-muted/20"
             />
             <circle 
                cx="20" cy="20" r="18" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeDasharray={113}
                strokeDashoffset={113 - (113 * completionRate) / 100}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-1000"
             />
           </svg>
           <span className="absolute text-[10px] font-bold tabular-nums">
             {completionRate}%
           </span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Progresso</p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {stats.completedBlocks} de {stats.totalBlocks} feitos
          </p>
        </div>
      </div>

      <div className="h-8 w-px bg-border/50 hidden sm:block" />

      <div className="flex items-center gap-8">
        {/* Total hours */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Tempo Total</span>
          </div>
          <p className="font-bold text-sm tabular-nums">
            {formatDuration(stats.totalMinutes)}
          </p>
        </div>

        {/* Completed hours */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-emerald-600/70 mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Concluído</span>
          </div>
          <p className="font-bold text-sm tabular-nums text-emerald-600">
            {formatDuration(stats.completedMinutes)}
          </p>
        </div>
      </div>

      {/* Per-subject breakdown */}
      {topSubjects.length > 0 && (
        <div className="flex-1 flex items-center justify-end gap-3 min-w-[200px]">
          <BarChart2 className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          <div className="flex items-center gap-3 overflow-hidden">
            {topSubjects.map(([subject, minutes]) => (
              <div key={subject} className="flex flex-col items-start gap-0.5 group">
                <div className="flex items-center gap-1.5">
                   <div className={cn("w-2 h-2 rounded-full shrink-0", getSubjectColor(subject))} />
                   <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[70px]">
                     {subject}
                   </span>
                </div>
                <span className="text-[10px] font-mono opacity-50 tabular-nums ml-3.5">
                  {formatDuration(minutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
