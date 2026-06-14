"use client";

import { StudyBlock, BlockType, BlockPriority, SubjectColor } from "./planner";
import { Plus, GripVertical, CheckCircle2, Circle, Clock, Flame, BookOpen, Target, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { COLOR_MAP, generateId } from "./planner-utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SidebarToolsProps {
  unscheduledBlocks: Partial<StudyBlock>[];
  subjectBreakdown: Record<string, number>;
  onAddUnscheduled: (data: Partial<StudyBlock>) => void;
  onRemoveUnscheduled: (id: string) => void;
  onDragStart: (id: string) => void;
  onQuickAdd: (data: Partial<StudyBlock>) => void;
}

export function SidebarTools({
  unscheduledBlocks,
  subjectBreakdown,
  onAddUnscheduled,
  onRemoveUnscheduled,
  onDragStart,
  onQuickAdd,
}: SidebarToolsProps) {
  
  const templates = [
    { label: "Deep Work", type: "study", priority: 3, color: "blue", icon: <BookOpen className="w-3 h-3"/> },
    { label: "Prática ENEM", type: "practice", priority: 3, color: "emerald", icon: <Target className="w-3 h-3"/> },
    { label: "Revisão Rápida", type: "revision", priority: 2, color: "violet", icon: <Clock className="w-3 h-3"/> },
    { label: "Simulado", type: "exam", priority: 3, color: "rose", icon: <PenTool className="w-3 h-3"/> },
  ];

  // Example goals (in minutes) - 5 hours per major subject
  const GOALS: Record<string, number> = {
    "Matemática": 300,
    "Física": 240,
    "Português": 180,
    "Química": 180,
    "Biologia": 180,
    "História": 120,
    "Geografia": 120,
    "Inglês": 90,
  };

  const subjectEntries = Object.entries(subjectBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <aside className="w-64 border-l bg-muted/10 flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8">
          {/* Progress Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Metas Semanais
              </h2>
            </div>
            <div className="space-y-4">
              {subjectEntries.length > 0 ? (
                subjectEntries.map(([subject, minutes]) => {
                  const goal = GOALS[subject] || 120; // Default 2h if not specified
                  const progress = Math.min(100, (minutes / goal) * 100);
                  
                  return (
                    <div key={subject} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="truncate pr-2">{subject}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {Math.round(minutes/60)}h / {Math.round(goal/60)}h
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/5">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-700 ease-out",
                            progress >= 100 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : 
                            progress > 50 ? "bg-primary" : "bg-amber-500"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-muted-foreground italic text-center py-2">
                  Nenhuma matéria agendada
                </p>
              )}
            </div>
          </section>

          <Separator />

          {/* Templates */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ações Rápidas
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <Button
                  key={t.label}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 px-2 flex flex-col items-center gap-1.5 text-[10px] bg-background hover:border-primary/50"
                  onClick={() => onQuickAdd({
                    subject: t.label,
                    type: t.type as BlockType,
                    priority: t.priority as BlockPriority,
                    color: t.color as SubjectColor,
                  })}
                >
                  <div className={cn("p-1.5 rounded-full", COLOR_MAP[t.color as SubjectColor].bg, COLOR_MAP[t.color as SubjectColor].text)}>
                    {t.icon}
                  </div>
                  <span className="font-medium">{t.label}</span>
                </Button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Backlog / Unscheduled */}
          <section className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Backlog
                </h2>
              </div>
              <Badge variant="outline" className="text-[10px] px-1.5 h-4 font-mono">
                {unscheduledBlocks.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {unscheduledBlocks.map((block) => (
                <div
                  key={block.id}
                  className={cn(
                    "group relative p-2.5 rounded-lg border bg-background hover:shadow-sm transition-all cursor-grab active:cursor-grabbing",
                    COLOR_MAP[block.color || "blue"].border
                  )}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("blockId", block.id!);
                    onDragStart(block.id!);
                  }}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-3 h-3 mt-0.5 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-tight truncate">
                        {block.subject}
                      </p>
                      {block.topic && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {block.topic}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                     <Badge 
                        variant="secondary" 
                        className={cn("text-[9px] px-1 h-3.5", COLOR_MAP[block.color || "blue"].badge)}
                     >
                        {block.type}
                     </Badge>
                     {block.priority === 3 && (
                       <div className="flex gap-0.5">
                         <div className="w-1 h-1 rounded-full bg-rose-500" />
                         <div className="w-1 h-1 rounded-full bg-rose-500" />
                         <div className="w-1 h-1 rounded-full bg-rose-500" />
                       </div>
                     )}
                  </div>
                </div>
              ))}
              
              {unscheduledBlocks.length === 0 && (
                <div className="text-center py-8 px-4 border border-dashed rounded-lg bg-muted/5">
                  <p className="text-[10px] text-muted-foreground">
                    Vazio
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </ScrollArea>
      
      {/* Focus Tool Hint */}
      <div className="p-4 border-t bg-muted/20">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-3 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">MODO FOCO</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Arraste do backlog e clique no play para iniciar.
            </p>
        </div>
      </div>
    </aside>
  );
}
