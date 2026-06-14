"use client";

import { useState } from "react";
import { Plus, CheckCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudyBlock } from "./planner";
import { DAY_NAMES, DAY_SHORT, formatDate, blockDurationMinutes, formatDuration } from "./planner-utils";
import { StudyBlockCard } from "./StudyBlockCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DayColumnProps {
  dayIndex: number;
  date: Date;
  blocks: StudyBlock[];
  isToday: boolean;
  onAddBlock: (dayIndex: number) => void;
  onEditBlock: (block: StudyBlock) => void;
  onDeleteBlock: (id: string) => void;
  onResizeBlock: (id: string, deltaMinutes: number) => void;
  onDragStart: (id: string) => void;
  onDrop: (blockId: string, targetDay: number) => void;
  onToggleStatus: (id: string) => void;
}

export function DayColumn({
  dayIndex,
  date,
  blocks,
  isToday,
  onAddBlock,
  onEditBlock,
  onDeleteBlock,
  onResizeBlock,
  onDragStart,
  onDrop,
  onToggleStatus,
}: DayColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const dayMinutes = blocks.reduce((a, b) => a + blockDurationMinutes(b), 0);
  const doneBlocks = blocks.filter(b => b.status === 'done');
  const totalBlocks = blocks.length;
  const isWeekend = dayIndex >= 5;
  console.log(`Renderizando ${DAY_NAMES[dayIndex]} - ${blocks.length} blocos, ${formatDuration(dayMinutes)}`);
  return (
    <div className={cn(
      "flex flex-col min-w-0 transition-opacity",
      !isToday && !isWeekend && "opacity-95 hover:opacity-100"
    )}>
      {/* Day header */}
      <div
        className={cn(
          "mb-3 px-2 pb-2.5 border-b-2 transition-all",
          isToday ? "border-primary" : "border-border/50",
          isToday && "bg-primary/5 rounded-t-lg"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3
              className={cn(
                "text-xs font-bold uppercase tracking-wider truncate",
                isToday ? "text-primary" : "text-muted-foreground",
                isWeekend && !isToday && "text-muted-foreground/60"
              )}
            >
              <span className="hidden lg:inline">{DAY_NAMES[dayIndex]}</span>
              <span className="lg:hidden">{DAY_SHORT[dayIndex]}</span>
            </h3>
            <p
              className={cn(
                "text-[10px] tabular-nums font-medium mt-0.5",
                isToday ? "text-primary/70" : "text-muted-foreground/40"
              )}
            >
              {formatDate(date)}
            </p>
          </div>
          {isToday && (
            <Badge className="bg-primary text-[9px] h-4 px-1 animate-pulse">HOJE</Badge>
          )}
        </div>

        {totalBlocks > 0 && (
          <div className="mt-2 flex items-center gap-1.5 overflow-hidden">
            <Badge
              variant="secondary"
              className="h-4 text-[9px] px-1 font-mono shrink-0 bg-muted/50 border-none"
            >
              {formatDuration(dayMinutes)}
            </Badge>
            <div className="flex items-center gap-1 min-w-0">
              <div className="flex-1 h-1 bg-muted rounded-full min-w-[30px]">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(doneBlocks.length / totalBlocks) * 100}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-muted-foreground/60 shrink-0">
                {doneBlocks.length}/{totalBlocks}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "flex-1 flex flex-col gap-3 rounded-xl p-2 min-h-[400px] transition-all duration-200",
          isDragOver
            ? "bg-primary/5 ring-2 ring-primary/20 scale-[1.02] z-10"
            : "bg-muted/10 hover:bg-muted/20",
          isToday && "bg-primary/5 border border-primary/10"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const blockId = e.dataTransfer.getData("blockId");
          if (blockId) onDrop(blockId, dayIndex);
        }}
      >
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-20 pointer-events-none select-none">
            <Calendar className="w-8 h-8 mb-2" />
            <p className="text-[10px] font-medium">Vazio</p>
          </div>
        ) : (
          blocks.map((block) => (
            <StudyBlockCard
              key={block.id}
              block={block}
              onDelete={onDeleteBlock}
              onEdit={onEditBlock}
              onResize={onResizeBlock}
              onDragStart={onDragStart}
              onToggleStatus={onToggleStatus}
            />
          ))
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "mt-auto w-full h-8 text-[11px] font-bold tracking-tight rounded-lg",
            "text-muted-foreground/40 hover:text-primary hover:bg-primary/10",
            "border border-dashed border-border/50 hover:border-primary/50"
          )}
          onClick={() => onAddBlock(dayIndex)}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          ADICIONAR
        </Button>
      </div>
    </div>
  );
}
