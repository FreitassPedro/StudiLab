"use client";

import { cn } from "@/lib/utils";
import { COLOR_MAP, formatDuration } from "../utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState, useCallback, useMemo, useTransition } from "react";
import { usePlannerActions } from "./PlannerActionsContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { updateSubjectAction } from "@/server/actions/subject.actions";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Target,
    LayoutGrid,
    Circle,
    GripVertical,
    Eye,
    EyeOff,
    Zap
} from "lucide-react";
import { ColorName } from "./mockData";
import { Badge } from "@/components/ui/badge";
import { BacklogGeneratorModal } from "./BacklogGenerator";

// Utils
function parseTimeToMinutes(timeStr: string) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
}

const DAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface DayLoad {
    dayIndex: number;
    dayLabel: string;
    plannedMinutes: number;
    doneMinutes: number;
    completionPct: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Donut ring – overall efficiency
// ─────────────────────────────────────────────────────────────────────────────
function DonutRing({
    value,
    size = 72,
    stroke = 7,
    color,
    label,
    sublabel,
}: {
    value: number;
    size?: number;
    stroke?: number;
    color: string;
    label: string;
    sublabel: string;
}) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (Math.min(value, 100) / 100) * circ;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                        stroke="currentColor" strokeWidth={stroke} className="text-muted/50" />
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                        stroke={color} strokeWidth={stroke} strokeLinecap="round"
                        strokeDasharray={`${dash} ${circ}`}
                        style={{ transition: "stroke-dasharray 0.6s ease" }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold" style={{ color }}>{value}%</span>
                </div>
            </div>
            <div className="text-center">
                <p className="text-[11px] font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-[10px] text-muted-foreground">{sublabel}</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Weekly bar chart (SVG) – planned vs done per day
// ─────────────────────────────────────────────────────────────────────────────
function WeekBarChart({ dayLoads }: { dayLoads: DayLoad[] }) {
    const W = 236;
    const H = 80;
    const PAD = { t: 8, b: 20, l: 4, r: 4 };
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const maxMins = Math.max(...dayLoads.map((d) => d.plannedMinutes), 60);
    const barW = Math.floor(innerW / 7) - 4;
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="w-full select-none mt-2">
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}
                role="img" aria-label="Carga diária: planejado vs concluído por dia da semana">
                {dayLoads.map((d, i) => {
                    const x = PAD.l + i * (innerW / 7) + 2;
                    const plannedH = (d.plannedMinutes / maxMins) * innerH;
                    const doneH = d.plannedMinutes > 0 ? (d.doneMinutes / maxMins) * innerH : 0;
                    const yBase = PAD.t + innerH;
                    const isHov = hovered === i;
                    const ttX = Math.min(Math.max(x - 10, 2), W - 72);
                    const ttY = yBase - plannedH - 30;

                    return (
                        <g key={i}>
                            {/* Planned bar */}
                            {d.plannedMinutes > 0 && (
                                <rect x={x} y={yBase - plannedH} width={barW} height={plannedH} rx={3}
                                    fill={isHov ? "#94a3b8" : "#e2e8f0"}
                                    style={{ transition: "fill 0.12s" }} />
                            )}
                            {/* Done bar */}
                            {doneH > 0 && (
                                <rect x={x} y={yBase - doneH} width={barW} height={doneH} rx={3}
                                    fill="#10b981" opacity={isHov ? 1 : 0.85}
                                    style={{ transition: "opacity 0.12s" }} />
                            )}
                            {/* Empty tick */}
                            {d.plannedMinutes === 0 && (
                                <rect x={x + barW / 2 - 1} y={yBase - 4} width={2} height={4} rx={1} fill="#cbd5e1" />
                            )}
                            {/* Hover region */}
                            <rect x={x - 1} y={PAD.t} width={barW + 2} height={innerH + 4}
                                fill="transparent" style={{ cursor: "default" }}
                                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
                            {/* Day label */}
                            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize={9}
                                fill={isHov ? "#64748b" : "#94a3b8"}>
                                {d.dayLabel}
                            </text>
                            {/* Tooltip */}
                            {isHov && d.plannedMinutes > 0 && (
                                <g>
                                    <rect x={ttX} y={ttY} width={68} height={24} rx={4} fill="#0f172a" opacity={0.88} />
                                    <text x={ttX + 34} y={ttY + 10} textAnchor="middle" fontSize={9} fill="#f8fafc">
                                        {formatDuration(d.doneMinutes)}/{formatDuration(d.plannedMinutes)}
                                    </text>
                                    <text x={ttX + 34} y={ttY + 20} textAnchor="middle" fontSize={8} fill="#94a3b8">
                                        {d.completionPct}% concluído
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
            <div className="flex items-center gap-3 mt-1 justify-center">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-600" />
                    Planejado
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    Concluído
                </span>
            </div>
        </div>
    );
}

function ProgressBar({ progress, color }: { progress: number; color?: string }) {
    return (
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div
                className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    progress >= 100
                        ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                        : progress > 50
                            ? "bg-primary"
                            : "bg-amber-500"
                )}
                style={{ width: `${Math.min(100, progress)}%` }}
            />
        </div>
    );
}

export function SidebarTools() {
    const {
        allBlocks,
        subjects,
        subjectsSummary,
        hiddenSubjects,
        toggleViewSubject,
        removeBlock,
        openAddModal,
        handleDragStart,
        draggedId,
        updateSubjectLocally,
        showLogs,
        setShowLogs,
    } = usePlannerActions();

    const [isPending, startTransition] = useTransition();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    const unscheduledBlocks = allBlocks.filter(b => b.dayIndex === -1);
    
    const dayLoads = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const blocksForDay = allBlocks.filter(b => b.dayIndex === i);
            const plannedMinutes = blocksForDay.reduce((acc, b) => acc + parseTimeToMinutes(b.endTime) - parseTimeToMinutes(b.startTime), 0);
            const doneMinutes = blocksForDay.filter(b => b.status === "done").reduce((acc, b) => acc + parseTimeToMinutes(b.endTime) - parseTimeToMinutes(b.startTime), 0);
            return {
                dayIndex: i,
                dayLabel: DAY_NAMES[i],
                plannedMinutes,
                doneMinutes,
                completionPct: plannedMinutes > 0 ? Math.round((doneMinutes / plannedMinutes) * 100) : 0,
            };
        });
    }, [allBlocks]);

    const totalPlanned = useMemo(() => dayLoads.reduce((acc, d) => acc + d.plannedMinutes, 0), [dayLoads]);
    const totalDone = useMemo(() => dayLoads.reduce((acc, d) => acc + d.doneMinutes, 0), [dayLoads]);
    const overallEfficiency = totalPlanned > 0 ? Math.round((totalDone / totalPlanned) * 100) : 0;
    
    // Efficiency color matching effPalette from reference
    const effColor = overallEfficiency >= 80 ? "#10b981" : overallEfficiency >= 40 ? "#f59e0b" : "#f43f5e";

    const onMouseDownBacklogBlock = useCallback(
        (e: React.MouseEvent, blockId: string) => {
            e.preventDefault();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            handleDragStart(blockId, offsetY);
        },
        [handleDragStart]
    );

    // ── Collapsed state ────────────────────────────────────────────────────────
    if (isCollapsed) {
        return (
            <aside id="planner-sidebar" className="border-l bg-muted/5 flex flex-col items-center py-3 gap-3 w-12 shrink-0 transition-all duration-300">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsCollapsed(false)}
                    title="Expandir sidebar"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <Separator />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => { setIsCollapsed(false); openAddModal(0); }}
                    title="Adicionar bloco"
                >
                    <Plus className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 relative"
                    onClick={() => setIsCollapsed(false)}
                    title="Backlog"
                >
                    <LayoutGrid className="w-4 h-4" />
                    {unscheduledBlocks.length > 0 && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                </Button>
            </aside>
        );
    }

    return (
        <aside id="planner-sidebar" className="border-l bg-muted/5 flex flex-col w-64 lg:w-72 shrink-0 transition-all duration-300 h-full overflow-hidden">
            {/* ── Sidebar header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <div className="flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Estatísticas & Ferramentas
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsCollapsed(true)}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-8">
                    
                    {/* ── Add block CTA ── */}
                    <Button
                        variant="outline"
                        className="w-full h-9 gap-2 font-medium border-dashed hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                        onClick={() => openAddModal(0)}
                    >
                        <Plus className="w-4 h-4" />
                        Novo Bloco de Estudo
                    </Button>

                    {/* ── Charts ── */}
                    <section className="bg-background border rounded-xl p-4 shadow-sm">
                        <div className="flex justify-center mb-4">
                            <DonutRing
                                value={overallEfficiency}
                                color={effColor}
                                label="Eficiência Geral"
                                sublabel={`${formatDuration(totalDone)} / ${formatDuration(totalPlanned)} concl.`}
                            />
                        </div>
                        <Separator className="my-4" />
                        <WeekBarChart dayLoads={dayLoads} />
                    </section>

                    {/* ── Backlog / Unscheduled ── */}
                    <section className="flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Plus className="w-3.5 h-3.5 text-blue-500" />
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Backlog
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-6 px-2 text-[10px] gap-1"
                                    onClick={() => setIsGeneratorOpen(true)}
                                >
                                    <Zap className="w-3 h-3 text-amber-500" />
                                    Gerar
                                </Button>
                                <Badge variant="outline" className="text-[10px] px-1.5 h-4 font-mono">
                                    {unscheduledBlocks.length}
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            {unscheduledBlocks.map((block) => (
                                <div
                                    key={block.id}
                                    className={cn(
                                        "group relative p-2.5 rounded-lg border bg-background hover:shadow-sm transition-all cursor-grab active:cursor-grabbing",
                                        COLOR_MAP[block.color || "blue"].border,
                                        draggedId === block.id && "opacity-50"
                                    )}
                                    onMouseDown={(e) => onMouseDownBacklogBlock(e, block.id)}
                                >
                                    <div className="flex items-start gap-2">
                                        <GripVertical className="w-3 h-3 mt-0.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium leading-tight truncate">
                                                {subjects.find(s => s.id === block.subjectId)?.name || block.subjectId}
                                            </p>
                                            {block.topic && (
                                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                                    {block.topic}
                                                </p>
                                            )}
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                    
                                    <div className="mt-2 flex items-center justify-between pl-5">
                                        <Badge 
                                            variant="secondary" 
                                            className={cn("text-[9px] px-1 h-3.5 font-normal", COLOR_MAP[block.color || "blue"].badge)}
                                        >
                                            {block.type}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            
                            {unscheduledBlocks.length === 0 && (
                                <div className="text-center py-6 px-4 border border-dashed rounded-lg bg-muted/5">
                                    <p className="text-[10px] text-muted-foreground">
                                        Nenhuma tarefa no backlog.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── Subject progress ── */}
                    <section className="space-y-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <Target className="w-3.5 h-3.5 text-emerald-500" />
                            <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                Metas Semanais
                            </h2>
                        </div>

                        {subjectsSummary.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground italic text-center py-2">
                                Nenhuma matéria agendada
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {subjectsSummary.map(({ subjectId, plannedMinutes, doneMinutes }) => {
                                    const subject = subjects.find((s) => s.id === subjectId);
                                    const progress =
                                        plannedMinutes > 0 ? (doneMinutes / plannedMinutes) * 100 : 0;
                                    const colors = COLOR_MAP[subject?.color as ColorName] ?? COLOR_MAP["blue"];
                                    const isHidden = hiddenSubjects.has(subjectId);

                                    return (
                                        <div
                                            key={subjectId}
                                            className={cn(
                                                "space-y-1.5 transition-opacity",
                                                isHidden && "opacity-40"
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-1 min-w-0 group">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                className={cn(
                                                                    "flex items-center justify-center w-4 h-4 rounded-full shrink-0 transition-opacity hover:opacity-80 ring-offset-1 focus-visible:ring-2",
                                                                    colors.badge
                                                                )}
                                                                title="Alterar cor"
                                                            >
                                                                <Circle className="w-2 h-2" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="w-40 p-1 flex flex-wrap gap-1" align="start">
                                                            {(Object.keys(COLOR_MAP) as ColorName[]).map((c) => (
                                                                <DropdownMenuItem
                                                                    key={c}
                                                                    className={cn("w-6 h-6 rounded-full p-0 cursor-pointer", COLOR_MAP[c].bg)}
                                                                    onClick={() => {
                                                                        if (!subject) return;
                                                                        updateSubjectLocally(subject.id, c);
                                                                        startTransition(() => {
                                                                            updateSubjectAction({ id: subject.id, name: subject.name, color: c }).catch(console.error);
                                                                        });
                                                                    }}
                                                                />
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    <button
                                                        className="flex-1 min-w-0 text-left"
                                                        onClick={() => toggleViewSubject(subjectId)}
                                                        title={isHidden ? "Mostrar" : "Ocultar"}
                                                    >
                                                        <span className="text-[11px] font-medium truncate group-hover:text-foreground text-muted-foreground transition-colors">
                                                            {subject?.name ?? subjectId}
                                                        </span>
                                                    </button>
                                                </div>
                                                <span className="text-[9px] tabular-nums text-muted-foreground/60 shrink-0 font-medium">
                                                    {formatDuration(doneMinutes)}<span className="opacity-40">/</span>{formatDuration(plannedMinutes)}
                                                </span>
                                            </div>
                                            <ProgressBar progress={progress} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </ScrollArea>

            {/* ── Footer ── */}
            <div className="p-4 border-t shrink-0 space-y-3 bg-muted/20">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[11px] text-muted-foreground/70 hover:bg-muted/50 h-7 gap-1.5"
                    onClick={() => setShowLogs(prev => !prev)}
                >
                    {showLogs ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showLogs ? "Ocultar sessões da semana" : "Mostrar sessões da semana"}
                </Button>
                
                {/* Clear planner */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[11px] text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 h-7 gap-1.5"
                    onClick={() => {
                        if (confirm("Tem certeza que deseja limpar todo o planejamento? Esta ação não pode ser desfeita.")) {
                            allBlocks.forEach((b) => removeBlock(b.id));
                        }
                    }}
                >
                    <Trash2 className="w-3 h-3" />
                    Limpar planejamento
                </Button>
            </div>
            
            {isGeneratorOpen && (
                <BacklogGeneratorModal 
                    open={isGeneratorOpen} 
                    onClose={() => setIsGeneratorOpen(false)} 
                />
            )}
        </aside>
    );
}