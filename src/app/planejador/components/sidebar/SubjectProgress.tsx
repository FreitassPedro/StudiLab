"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { formatDuration, hexToRgba } from "../../utils";
import { usePlannerActions } from "../PlannerActionsContext";
import { updateSubjectAction } from "@/server/actions/subject.actions";
import { ColorName } from "../../types";
import { Circle, Target } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const COLOR_OPTIONS = [
    "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b",
    "#f43f5e", "#f97316", "#14b8a6", "#ec4899",
    "#06b6d4", "#d946ef", "#84cc16", "#6366f1"
];

function ProgressBar({ progress }: { progress: number }) {
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

export function SubjectProgress() {
    const { subjects, subjectsSummary, hiddenSubjects, toggleViewSubject, updateSubjectLocally } = usePlannerActions();
    const [, startTransition] = useTransition();

    return (
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
                        const progress = plannedMinutes > 0 ? (doneMinutes / plannedMinutes) * 100 : 0;
                        const subjectColor = subject?.color || "#3b82f6";
                        const isHidden = hiddenSubjects.has(subjectId);

                        return (
                            <div
                                key={subjectId}
                                className={cn("space-y-1.5 transition-opacity", isHidden && "opacity-40")}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0 group">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className={cn(
                                                        "flex items-center justify-center w-4 h-4 rounded-full shrink-0 transition-opacity hover:opacity-80 ring-offset-1 focus-visible:ring-2"
                                                    )}
                                                    style={{ backgroundColor: hexToRgba(subjectColor, 0.2), color: subjectColor }}
                                                    title="Alterar cor"
                                                >
                                                    <Circle className="w-2 h-2" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-40 p-1 flex flex-wrap gap-1" align="start">
                                                {COLOR_OPTIONS.map((c) => (
                                                    <DropdownMenuItem
                                                        key={c}
                                                        className="w-6 h-6 rounded-full p-0 cursor-pointer"
                                                        style={{ backgroundColor: c }}
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
    );
}
