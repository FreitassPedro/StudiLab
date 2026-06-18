"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateStudyLog, useDeleteStudyLog, useStudyLogDetails } from "@/hooks/useStudyLogs";
import { getStudyLogDetailsAction } from "@/server/actions/studyLogs.action";
import { useHistoryAnalysis } from "@/hooks/useCharts";
import { useQuery } from "@tanstack/react-query";
import { addWeeks, endOfWeek, format, isSameWeek, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    BookOpen,
    ChevronRight,
    Clock,
    Edit2,
    FileText,
    Loader2,
    Trash2,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import useSearchRangeStore from "@/store/useSearchRangeStore";
import { parseDateAsLocal } from "@/lib/utils";
import { useTopicBySubject } from "@/hooks/useTopics";

type StudyLogFeedItem = {
    id: string;
    study_date: string | Date;
    start_time: string | Date;
    end_time: string | Date;
    duration_minutes: number;
    notes: string | null;
    topic: {
        id: string;
        name: string;
        subject: {
            id: string;
            name: string;
            color: string;
        };
    };
};
const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
};



const EditLogForm = ({
    logDetails,
    onOpenChange,
}: {
    logDetails: StudyLogFeedItem;
    onOpenChange: (isOpen: boolean) => void;
}) => {

    const start = new Date(logDetails.start_time);
    const end = new Date(logDetails.end_time);

    const [startTime, setStartTime] = useState(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`);

    const [endTime, setEndTime] = useState(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
    const [notes, setNotes] = useState(logDetails.notes ?? "");
    const [topicId, setTopicId] = useState(logDetails.topic.id);
    const { data: topics } = useTopicBySubject(logDetails.topic.subject.id);

    const updateMutation = useUpdateStudyLog();

    const handleSave = async () => {

        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const studyDate = new Date(logDetails.study_date);

        const newStartTime = new Date(studyDate);
        newStartTime.setHours(startHour, startMin, 0, 0);
        const newEndTime = new Date(studyDate);
        newEndTime.setHours(endHour, endMin, 0, 0);
        const duration = Math.round((newEndTime.getTime() - newStartTime.getTime()) / 60000);

        try {
            await updateMutation.mutateAsync({
                id: logDetails.id,
                topic_id: topicId,
                start_time: newStartTime,
                end_time: newEndTime,
                duration_minutes: duration,
                notes: notes,
            });
            onOpenChange(false);
        }
        catch (error) {
            console.error("Erro ao atualizar log:", error);
        }
    };

    return (
        <>
            <div className="space-y-4 py-4">
                {/* Tópico */}
                <div className="space-y-2">
                    <Label htmlFor="topic">Tópico</Label>
                    <Select value={topicId} onValueChange={setTopicId}>
                        <SelectTrigger id="topic">
                            <SelectValue placeholder="Selecione um tópico" />
                        </SelectTrigger>
                        <SelectContent>
                            {topics?.map((topic) => (
                                <SelectItem key={topic.id} value={topic.id}>
                                    {topic.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Horário de Início */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Início</Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>

                    {/* Horário de Término */}
                    <div className="space-y-2">
                        <Label htmlFor="endTime">Término</Label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>
                </div>

                {/* Anotações */}
                <div className="space-y-2">
                    <Label htmlFor="notes">Anotações</Label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Adicione suas anotações aqui..."
                        className="min-h-25"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        "Salvar"
                    )}
                </Button>
            </DialogFooter>
        </>
    )
};
const EditLogDialog = ({
    logId,
    isOpen,
    onOpenChange
}: {
    logId: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}) => {

    const { data: logDetails, isLoading } = useStudyLogDetails(logId);

    if (!logId) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Sessão de Estudo</DialogTitle>
                    <DialogDescription>
                        Faça alterações nos horários, tópico ou anotações desta sessão.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : logDetails ? (
                    <EditLogForm logDetails={logDetails} onOpenChange={onOpenChange} />
                ) : (
                    <p className="text-sm text-muted-foreground">Detalhes do log não encontrados.</p>
                )}



            </DialogContent>
        </Dialog>
    );
};


const LogDetailsDialog = ({ logId, isOpen, isOpenChange }: { logId: string; isOpen: boolean; isOpenChange: (isOpen: boolean) => void }) => {

    const { data: logDetails, isLoading } = useQuery({
        queryKey: ["studyLogs", "details", logId],
        queryFn: () => getStudyLogDetailsAction(logId),
        enabled: !!logId && isOpen,
        gcTime: 1000 * 60, // 1 minuto, depois destroi
    });

    if (!logId) return null;


    return (
        <Dialog open={isOpen} onOpenChange={isOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalhes da Sessão</DialogTitle>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex items-center justify-center py-3 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                ) : null}

                {logDetails ? (
                    <>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Matéria</p>
                            <p className="whitespace-pre-line">{logDetails.topic.subject.name}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Tópico</p>
                            <p className="whitespace-pre-line">{logDetails.topic.name}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Anotações</p>
                            <p className="whitespace-pre-line">{logDetails.notes || 'Sem anotações'}</p>
                        </div>
                        <div className='space-y-2'>
                            <p className="text-sm text-muted-foreground">Duração</p>
                            <p>{formatMinutes(logDetails.duration_minutes)}</p>
                        </div>
                        <div className='space-y-2'>
                            <p className="text-sm text-muted-foreground">Horário</p>
                            <p>{new Date(logDetails.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(logDetails.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className='space-y-2'>
                            <p className="text-sm text-muted-foreground">Data</p>
                            <p>{format(parseDateAsLocal(logDetails.study_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Nenhum registro selecionado</p>
                )}
            </DialogContent>
        </Dialog>
    );
};
export function LogCard({ log }: { log: StudyLogFeedItem }) {
    const subject = log.topic.subject;
    const topic = log.topic;

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const deleteMutation = useDeleteStudyLog();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(log.id);
            setIsDeleteOpen(false);
        } catch (error) {
            console.error("Erro ao excluir log:", error);
        }
    };

    return (
        <>
            <div className="group relative flex items-center gap-4 p-4 bg-background border border-border/50 hover:border-primary/30 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5">
                {/* Subject Color Indicator */}
                <div
                    className="w-1.5 h-12 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: subject?.color || "#ccc" }}
                />

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="space-y-0.5">
                            <h4 className="font-bold text-foreground flex items-center gap-2">
                                {subject?.name}
                                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
                                    {topic?.name}
                                </span>
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 font-mono">
                                    <Clock className="w-3 h-3" />
                                    {new Date(log.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="bg-secondary/60 px-2 py-0.5 rounded-full font-semibold text-primary/80">
                                    {formatMinutes(log.duration_minutes)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {log.notes && (
                        <div className="mt-2 text-sm text-muted-foreground line-clamp-2 italic bg-muted/30 px-3 py-2 rounded-lg border-l-2 border-primary/20">
                            {log.notes}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => setIsEditOpen(true)}>
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setIsDeleteOpen(true)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <LogDetailsDialog
                logId={log.id}
                isOpen={isDetailsOpen}
                isOpenChange={setIsDetailsOpen}
            />
            <EditLogDialog
                logId={log.id}
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir esta sessão de estudo? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                "Excluir"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function DateGroup({
    dateKey,
    logs,
}: {
    dateKey: string;
    logs: StudyLogFeedItem[];
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const totalMinutes = logs.reduce(
        (sum, log) => sum + log.duration_minutes,
        0
    );
    const dateLabel = format(parseDateAsLocal(dateKey), "EEEE, dd 'de' MMMM", {
        locale: ptBR,
    });

    return (
        <div>
            <Card>
                <CardContent
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsExpanded((prev) => !prev)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                            <ChevronRight
                                size={18}
                                className={`${isExpanded ? "rotate-90" : "rotate-0"
                                    } transition-transform duration-300 ease-in-out`}
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-foreground capitalize">
                                {dateLabel}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {logs.length} {logs.length === 1 ? "sessão" : "sessões"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatMinutes(totalMinutes)}
                    </div>
                </CardContent>
            </Card>

            {isExpanded && (
                <div className="mt-2 space-y-3 px-4">
                    {logs.map((log) => (
                        <LogCard key={log.id} log={log} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function LogsHistory() {
    const { startDate, endDate, setRange } = useSearchRangeStore();
    const isCurrentWeek = isSameWeek(endDate, new Date(), { weekStartsOn: 1 });
    const currentStart = startDate;
    const currentEnd = endDate;

    const { data: analysis, status, error, isFetching } = useHistoryAnalysis(currentStart, currentEnd);
    const data = analysis?.logs;

    const groupedLogs = useMemo(() => {
        const allLogs = data ?? [];
        return allLogs.reduce((acc, log) => {
            const dateKey = format(parseDateAsLocal(log.study_date), "yyyy-MM-dd");
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(log);
            return acc;
        }, {} as Record<string, StudyLogFeedItem[]>);
    }, [data]);

    const groupedEntries = Object.entries(groupedLogs) as [string, StudyLogFeedItem[]][];
    const weekLabel = `${format(currentStart, "dd MMM", {
        locale: ptBR,
    })} - ${format(currentEnd, "dd MMM", { locale: ptBR })}`;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                    Semana: <span className="font-medium text-foreground">{weekLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const previousWeekStart = subWeeks(currentStart, 1);
                            setRange({
                                startDate: previousWeekStart,
                                endDate: endOfWeek(previousWeekStart, { weekStartsOn: 1 }),
                            });
                        }}
                    >
                        Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const nextWeekStart = addWeeks(currentStart, 1);
                            setRange({
                                startDate: nextWeekStart,
                                endDate: endOfWeek(nextWeekStart, { weekStartsOn: 1 }),
                            });
                        }}
                        disabled={isCurrentWeek}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <ScrollArea className="h-[70vh] pr-2">
                {status === "error" && (
                    <div className="text-sm text-destructive">
                        {(error as Error).message}
                    </div>
                )}

                {isFetching && (
                    <div className="flex items-center justify-center py-3 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                )}

                {status === "success" && groupedEntries.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                        Nenhum registro encontrado.
                    </div>
                )}

                <div className="space-y-4">
                    {groupedEntries.map(([dateKey, logs]) => (
                        <DateGroup key={dateKey} dateKey={dateKey} logs={logs} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
} 