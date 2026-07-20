"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlannerActions } from "./PlannerActionsContext";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const HOURS_STORAGE_KEY = "planner.weeklyHours.v1";

interface BacklogGeneratorProps {
    open: boolean;
    onClose: () => void;
}

export function BacklogGeneratorModal({ open, onClose }: BacklogGeneratorProps) {
    const { subjects, generateBacklog } = usePlannerActions();
    const [hoursMap, setHoursMap] = useState<Record<string, number>>({});

    useEffect(() => {
        if (open) {
            const stored = localStorage.getItem(HOURS_STORAGE_KEY);
            if (stored) {
                try {
                    setHoursMap(JSON.parse(stored));
                } catch {
                    // Ignore parsing errors
                }
            }
        }
    }, [open]);

    const updateHour = (subjectId: string, delta: number) => {
        setHoursMap(prev => {
            const current = prev[subjectId] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [subjectId]: next };
        });
    };

    const handleGenerate = () => {
        localStorage.setItem(HOURS_STORAGE_KEY, JSON.stringify(hoursMap));
        generateBacklog(hoursMap);
        onClose();
    };

    const totalHours = Object.values(hoursMap).reduce((a, b) => a + b, 0);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Gerador de Planejamento Geral</DialogTitle>
                    <DialogDescription>
                        Defina quantas horas na semana você deseja dedicar a cada matéria. 
                        Serão criados blocos de 1h no Backlog para você arrastar para o seu planejamento.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    <div className="flex items-center justify-between mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>Matéria</span>
                        <span>Horas/Semana</span>
                    </div>
                    <ScrollArea className="h-[300px] border rounded-md p-2">
                        {subjects.length === 0 ? (
                            <div className="text-sm text-center py-6 text-muted-foreground">
                                Nenhuma matéria cadastrada.
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {subjects.map(subj => {
                                    const hours = hoursMap[subj.id] || 0;
                                    return (
                                            <div key={subj.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full" 
                                                        style={{ backgroundColor: subj.color || "#3b82f6" }} 
                                                    />
                                                    <span className="text-sm font-medium">{subj.name}</span>
                                                </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="w-6 h-6 rounded-full"
                                                    onClick={() => updateHour(subj.id, -1)}
                                                    disabled={hours <= 0}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="text-sm font-semibold w-4 text-center tabular-nums">
                                                    {hours}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="w-6 h-6 rounded-full"
                                                    onClick={() => updateHour(subj.id, 1)}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                    <div className="mt-3 text-right text-xs text-muted-foreground font-medium">
                        Total a gerar: {totalHours} {totalHours === 1 ? 'bloco' : 'blocos'} (1h cada)
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleGenerate} disabled={totalHours === 0}>
                        Gerar Blocos
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
