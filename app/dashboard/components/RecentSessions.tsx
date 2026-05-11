"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTodayStudyLogs } from '@/hooks/useStudyLogs';
import { BookOpen, Clock, FileText, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const StudyLogItemResume = ({
    log,
}: {
    log: {
        id: string;
        start_time: string | Date;
        end_time: Date | string;
        notes?: string | null;
        duration_minutes: number;
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
}) => {

    const subject = log.topic.subject;
    const topic = log.topic;

    return (
        <div className="group flex flex-row items-start gap-3 p-3 bg-card border border-border/40 hover:border-border rounded-lg transition-all hover:shadow-sm">
            {/* Indicador de Cor do Assunto */}
            <div
                className="w-1.5 h-full min-h-12 rounded-full shrink-0"
                style={{ backgroundColor: subject?.color || '#ccc' }}
            />

            <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row sm:justify-between gap-2 items-center justify-center">
                    <h4 className="font-semibold flex flex-col text-foreground ">
                        {subject?.name}
                        <span className="mx-2 text-muted-foreground font-normal hidden" aria-hidden="true">—</span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-normal">
                            <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            {topic?.name}
                        </span>
                    </h4>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded shrink-0">
                            {new Date(log.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(log.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1 text-xs font-normal bg-secondary/50 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" />
                                {log.duration_minutes} min
                            </span>
                        </div>
                    </div>
                </div>

                {log.notes && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line mt-2">
                        <span className="font-medium">Notas:</span> {log?.notes}
                    </p>
                )}

            </div>

            {/* Ações (Só aparecem no hover em desktop, ou sempre visíveis em mobile) */}
            <div className="flex gap-1 opacity-100 sm:opacity-30 sm:group-hover:opacity-100 transition-opacity shrink-0 self-start sm:self-auto">
                {log?.notes && (
                    <Button size="icon" variant="ghost" title="Ver anotações">
                        <FileText className="w-4 h-4 text-blue-500" />
                    </Button>
                )}
                <Button size="icon" variant="ghost" title="Excluir">
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            </div>
        </div>
    );
};
function RecentSessionsSkeleton() {
    return (
        <div className="space-y-3">
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 border border-border/40 rounded-lg animate-pulse">
                    <div className="w-1.5 h-12 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between gap-2">
                            <div className="h-4 bg-muted rounded w-1/3" />
                            <div className="h-4 bg-muted rounded w-1/4" />
                        </div>
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function RecentSessions() {
    const { data: todayLogs, isLoading } = useTodayStudyLogs();
    const route = useRouter();

    return (
        <Card className="h-auto md:flex md:h-full md:min-h-0 md:flex-col md:overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Sessões de Hoje</CardTitle>
            </CardHeader>
            <CardContent className="md:flex-1 md:min-h-0 md:overflow-y-auto">
                {isLoading || !todayLogs ? (
                    <RecentSessionsSkeleton />
                ) : todayLogs.length === 0 ? (
                    <div className='flex flex-col items-center'>
                        <p className="text-muted-foreground text-sm py-4 text-center" >
                            Nenhuma sessão registrada hoje

                        </p>
                        <Button
                            variant="default"
                            size="lg"
                            className=""
                            onClick={() => route.push('/nova-sessao')}
                        >
                            Começar a estudar
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayLogs.map((log) => (
                            <StudyLogItemResume key={log.id} log={log} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card >
    );
}
