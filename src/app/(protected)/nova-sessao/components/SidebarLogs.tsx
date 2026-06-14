"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight, Loader2, History } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { getRecentLogsBySubjectAction, getRecentLogsByTopicAction } from "@/server/actions/studyLogs.action";
import { useSubjects } from "@/hooks/useSubjects";
import { useTopicsBySubject } from "@/hooks/useTopics";
import useSessionFormStore from "@/store/useSessionFormStore";
import { parseDateAsLocal } from "@/lib/utils";

// --- Helpers ---

const diffInDays = (date1: Date, date2: Date) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

const daysAgo = (date: Date) => {
    const diff = diffInDays(date, new Date());
    if (diff === 0) return "Hoje";
    if (diff === 1) return "Ontem";
    return `${diff} dias atrás`;
};

// --- Sub-components ---

export const LogCard = ({ name, date, notes }: { name: string; date: Date | string; notes?: string }) => {
    const localDate = parseDateAsLocal(date);
    return (
        <Card className="p-3 gap-0 space-y-2 bg-muted/50 border-none transition-all hover:bg-muted/70">
            <div className="flex justify-between items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate">{name}</span>
                <div className="text-[10px] font-medium whitespace-nowrap text-right">
                    <span className="text-foreground">{localDate.toLocaleDateString('pt-BR')}</span>
                    <span className="text-muted-foreground ml-1">({daysAgo(localDate)})</span>
                </div>
            </div>
            {notes && <p className="text-xs text-muted-foreground ">{notes}</p>}
        </Card>
    );
};

export const EmptyLog = ({ message = "Nenhuma sessão encontrada." }: { message?: string }) => (
    <div className="p-8 border border-dashed rounded-lg bg-muted/5 text-center">
        <p className="text-xs text-muted-foreground italic">{message}</p>
    </div>
);

const LogSectionHeader = ({
    title,
    type,
    isOpen,
    onToggle
}: {
    title: string,
    type: string,
    isOpen: boolean,
    onToggle(): void;
}) => {

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary/60" />
                    <h3 className="text-sm font-semibold text-foreground">
                        {title}
                    </h3>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-primary/10"
                    onClick={onToggle}
                >
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
                </Button>
            </div>
        </div>
    )
}
// --- Main Component ---
function useRecentLogs(
    type: "topic" | "subject",
    targetId: string | null
) {
    const PAGE_SIZE = 4;

    return useInfiniteQuery({
        queryKey: ["studyLogs", "recent", type, targetId],
        queryFn: ({ pageParam = 0 }) => {
            if (!targetId) return Promise.resolve([]);

            return type === "subject" ? getRecentLogsBySubjectAction(targetId, PAGE_SIZE, pageParam) : getRecentLogsByTopicAction(targetId, PAGE_SIZE, pageParam)
        },

        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length === PAGE_SIZE
                ? allPages.length * PAGE_SIZE : undefined,

        enabled: !!targetId,
    })
}
export const LogSection = ({ type }: { type: 'topic' | 'subject' }) => {
    const PAGE_SIZE = 4;
    const [isOpen, setIsOpen] = useState(true);

    const selectedSubjectId = useSessionFormStore((state) => state.form.subjectId);
    const selectedTopicId = useSessionFormStore((state) => state.form.topicId);

    const { data: subjects = [] } = useSubjects();
    const { data: topics = [] } = useTopicsBySubject(selectedSubjectId || undefined);

    const currentSubject = subjects.find(s => s.id === selectedSubjectId);

    const currentTopic = topics.find(t => t.id === selectedTopicId);


    const effectiveTopicId = type === 'topic' ? selectedTopicId : null;

    const targetId = type === 'subject' ? selectedSubjectId : effectiveTopicId;

    const logsQUery = useRecentLogs(type, targetId);

    const allLogs = logsQUery.data?.pages.flat() ?? [];

    const recentLogs = allLogs.slice(0, 3);

    const hasNextPage = logsQUery.hasNextPage;
    const isFetchingNextPage = logsQUery.isFetchingNextPage;
    const fetchNextPage = logsQUery.fetchNextPage;

    const isLoading = logsQUery.isLoading;

    if (type === 'topic' && !selectedTopicId && !selectedTopicId) return null;
    if (!selectedSubjectId) return null;

    return (
        <div className="space-y-4">
            {/* Header */}

            <LogSectionHeader
                type={type}
                title={type == "subject" ? currentSubject?.name ?? "" : currentTopic?.name ?? ""}
                isOpen={isOpen}
                onToggle={() => setIsOpen(!isOpen)}
            />

            {isOpen && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <Card key={i} className="p-3 space-y-2 bg-muted/30 border-none animate-pulse">
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-muted rounded w-1/3" />
                                        <div className="h-3 bg-muted rounded w-1/4" />
                                    </div>
                                    <div className="h-3 bg-muted rounded w-full" />
                                </Card>
                            ))}
                        </div>
                    ) : recentLogs.length > 0 ? (
                        <div className="space-y-2">
                            {recentLogs.map(log => (
                                <LogCard
                                    key={log.id}
                                    name={log.topic.name}
                                    date={log.study_date}
                                    notes={log.notes || undefined}
                                />
                            ))}

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className="w-full border-dotted border text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 ">
                                        Ver mais
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <History className="w-4 h-4 text-primary" />
                                            Histórico: {type === 'subject' ? currentSubject?.name : currentTopic?.name}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="flex-1 overflow-y-auto  space-y-2 py-2">
                                        {allLogs.map(log => (
                                            <div key={log.id} className="group relative pl-4 border-l-2 border-primary/20 hover:border-primary transition-colors py-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-bold leading-none">{log.topic.name}</h4>

                                                    <div className="text-[10px] font-medium whitespace-nowrap text-right">
                                                        <span className="text-foreground">{daysAgo(new Date(log.study_date))}</span>
                                                        -
                                                        <span className="text-muted-foreground">
                                                            {new Date(log.study_date).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                </div>
                                                {log.notes && <p className="text-xs text-foreground/80 leading-relaxed bg-muted/30 p-2 rounded">{log.notes}</p>}
                                            </div>
                                        ))}

                                        {hasNextPage && (
                                            <Button
                                                variant="outline"
                                                className="w-full h-9 text-xs"
                                                onClick={() => fetchNextPage()}
                                                disabled={isFetchingNextPage}
                                            >
                                                {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Carregar mais"}
                                            </Button>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="secondary" className="w-full sm:w-auto">Fechar</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <EmptyLog message={type === 'subject' ? "Nenhum log para esta matéria." : "Nenhum log para este tópico."} />
                    )}
                </div>
            )}
            <Separator className="opacity-50" />
        </div>
    );
};
