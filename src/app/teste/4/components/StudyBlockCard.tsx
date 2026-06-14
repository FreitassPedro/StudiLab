"use client";

import { useRef, useState, useCallback } from "react";
import { GripVertical, X, Pencil, Clock, CheckCircle2, Circle, Play, Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudyBlock, BlockStatus } from "./planner";
import { COLOR_MAP, blockDurationMinutes, formatDuration } from "./planner-utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface StudyBlockCardProps {
  block: StudyBlock;
  onDelete: (id: string) => void;
  onEdit: (block: StudyBlock) => void;
  onResize: (id: string, deltaMinutes: number) => void;
  onDragStart: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function StudyBlockCard({
  block,
  onDelete,
  onEdit,
  onResize,
  onDragStart,
  onToggleStatus,
}: StudyBlockCardProps) {
  const colors = COLOR_MAP[block.color];
  const duration = blockDurationMinutes(block);
  // ~1.8px per minute, min 56px
  const minHeight = Math.max(72, duration * 1.8);
  const isCompact = minHeight < 90;
  const isDone = block.status === "done";

  const resizeRef = useRef<{ startY: number; startDuration: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeRef.current = { startY: e.clientY, startDuration: duration };

      const handleMouseMove = (me: MouseEvent) => {
        if (!resizeRef.current) return;
        const delta = Math.round((me.clientY - resizeRef.current.startY) / 1.8 / 15) * 15;
        const newDuration = Math.max(15, resizeRef.current.startDuration + delta);
        onResize(block.id, newDuration - resizeRef.current.startDuration);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        resizeRef.current = null;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [block.id, duration, onResize]
  );

  const handleTouchResizeStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      setIsResizing(true);
      resizeRef.current = { startY: e.touches[0].clientY, startDuration: duration };

      const handleTouchMove = (te: TouchEvent) => {
        if (!resizeRef.current) return;
        const delta = Math.round((te.touches[0].clientY - resizeRef.current.startY) / 1.8 / 15) * 15;
        const newDuration = Math.max(15, resizeRef.current.startDuration + delta);
        onResize(block.id, newDuration - resizeRef.current.startDuration);
      };

      const handleTouchEnd = () => {
        setIsResizing(false);
        resizeRef.current = null;
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };

      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleTouchEnd);
    },
    [block.id, duration, onResize]
  );

  return (
    <div
      className={cn(
        "relative group rounded-xl border select-none transition-all duration-200",
        "hover:shadow-md",
        colors.bg,
        colors.border,
        colors.text,
        isResizing && "shadow-lg ring-2 ring-inset ring-current/20",
        isDone && "opacity-60 grayscale-[0.3]"
      )}
      style={{ minHeight }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("blockId", block.id);
        onDragStart(block.id);
      }}
    >
      {/* Drag handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-3 h-3" />
      </div>

      <div className="px-3 py-2.5 flex flex-col h-full">
        {/* Header: Type + Status Toggle */}
        <div className="flex items-center justify-between mb-1.5">
           <div className="flex items-center gap-1.5 min-w-0">
             <button 
                onClick={(e) => { e.stopPropagation(); onToggleStatus(block.id); }}
                className="shrink-0 transition-transform active:scale-90"
             >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-current opacity-80" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-current opacity-40 hover:opacity-80 transition-opacity" />
                )}
             </button>
             <Badge 
                variant="secondary" 
                className={cn("text-[8px] uppercase tracking-wider h-3.5 px-1 font-bold bg-current/10 border-none", colors.text)}
             >
                {block.type}
             </Badge>
           </div>
           
           <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-current/10"
                  onClick={(e) => { e.stopPropagation(); onEdit(block); }}
                >
                  <Pencil className="w-2.5 h-2.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-current/10 text-rose-500 hover:text-rose-600"
                  onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                >
                  <X className="w-2.5 h-2.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remover</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Subject + Priority */}
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <p className={cn(
            "font-bold leading-tight truncate", 
            isCompact ? "text-[11px]" : "text-xs",
            isDone && "line-through opacity-70"
          )}>
            {block.subject}
          </p>
          {block.priority === 3 && (
            <Flame className="w-2.5 h-2.5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
          )}
        </div>

        {/* Topic */}
        {block.topic && (
          <p className="text-[10px] opacity-70 truncate leading-tight italic">
            {block.topic}
          </p>
        )}

        {/* Footer: Time + Focus Button */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-current/10">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 opacity-65">
              <Clock className="w-2.5 h-2.5 shrink-0" />
              <span className="text-[9px] font-mono font-medium">
                {block.startTime}–{block.endTime}
              </span>
            </div>
            {!isCompact && (
               <span className="text-[9px] opacity-50 font-medium">
                 {formatDuration(duration)}
               </span>
            )}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
               <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-6 w-6 rounded-full bg-background border-current/20 hover:bg-current/10 shadow-sm",
                    isDone && "hidden"
                  )}
                  onClick={(e) => { e.stopPropagation(); /* Start focus mode logic */ }}
               >
                  <Play className="w-3 h-3 fill-current" />
               </Button>
            </TooltipTrigger>
            <TooltipContent>Iniciar Modo Foco</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Resize handle */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center",
          "cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity",
          isResizing && "opacity-100"
        )}
        onMouseDown={handleResizeMouseDown}
        onTouchStart={handleTouchResizeStart}
      >
        <div className="w-8 h-1 rounded-full bg-current opacity-20" />
      </div>
    </div>
  );
}
