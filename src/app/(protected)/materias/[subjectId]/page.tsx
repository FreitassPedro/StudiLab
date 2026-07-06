"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickyNote, ListTodo, History, BookOpen } from "lucide-react";
import { SubjectHeader } from "./components/SubjectHeader";
import { NotesSection } from "./components/NotesSection";
import { TasksSection } from "./components/TasksSection";
import { SubjectHistory } from "./components/SubjectHistory";
import { useSubjects } from "@/hooks/useSubjects";
import { useTopics } from "@/hooks/useTopics";
import { useMemo } from "react";


interface Props {
    params: { subjectId: string };
}

export default function SubjectPanelPage({ params }: Props) {
    const { subjectId } = params;
    const { data: subjects } = useSubjects();
    const subject = useMemo(
        () => subjects?.find((s) => s.id === subjectId),
        [subjects, subjectId]
    );

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8 animate-in fade-in duration-500">
            <SubjectHeader subjectId={subjectId} />

            <Tabs defaultValue="notes" className="w-full space-y-6">
                {/* Tab bar */}
                <div className="flex justify-center">
                    <TabsList
                        className="bg-muted/50 p-1 rounded-xl gap-1"
                        style={subject ? { "--subject-color": subject.color } as React.CSSProperties : undefined}
                    >
                        <TabsTrigger
                            value="notes"
                            className="flex items-center gap-2 rounded-lg px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <StickyNote size={14} />
                            <span className="hidden sm:inline">Anotações</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="tasks"
                            className="flex items-center gap-2 rounded-lg px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <ListTodo size={14} />
                            <span className="hidden sm:inline">Tarefas</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="history"
                            className="flex items-center gap-2 rounded-lg px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <History size={14} />
                            <span className="hidden sm:inline">Histórico</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="topics"
                            className="flex items-center gap-2 rounded-lg px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <BookOpen size={14} />
                            <span className="hidden sm:inline">Tópicos</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Notes Tab */}
                <TabsContent
                    value="notes"
                    className="animate-in slide-in-from-left-4 duration-300 focus-visible:ring-0 outline-none"
                >
                    <div className="space-y-2">
                        <SectionTitle icon={<StickyNote size={16} />} title="Anotações" description="Crie post-its para registrar insights, fórmulas e dúvidas" />
                        <NotesSection subjectId={subjectId} />
                    </div>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent
                    value="tasks"
                    className="animate-in slide-in-from-left-4 duration-300 focus-visible:ring-0 outline-none"
                >
                    <div className="space-y-4">
                        <SectionTitle icon={<ListTodo size={16} />} title="Tarefas" description="Organize o que ainda precisa estudar ou praticar" />
                        <div className="max-w-xl">
                            <TasksSection subjectId={subjectId} />
                        </div>
                    </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent
                    value="history"
                    className="animate-in slide-in-from-left-4 duration-300 focus-visible:ring-0 outline-none"
                >
                    <div className="space-y-4">
                        <SectionTitle icon={<History size={16} />} title="Histórico de Sessões" description="Suas últimas sessões de estudo nesta matéria" />
                        <SubjectHistory
                            subjectId={subjectId}
                            subjectColor={subject?.color ?? "#6366f1"}
                        />
                    </div>
                </TabsContent>

                {/* Topics overview Tab */}
                <TabsContent
                    value="topics"
                    className="animate-in slide-in-from-left-4 duration-300 focus-visible:ring-0 outline-none"
                >
                    <div className="space-y-4">
                        <SectionTitle icon={<BookOpen size={16} />} title="Tópicos" description="Todos os tópicos cadastrados nesta matéria" />
                        <TopicsPreview subjectId={subjectId} subjectColor={subject?.color ?? "#6366f1"} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionTitle({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">{icon}</div>
            <div>
                <h2 className="text-base font-bold leading-none">{title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
        </div>
    );
}

function TopicsPreview({ subjectId, subjectColor }: { subjectId: string; subjectColor: string }) {
    const { data: topicsData, isLoading } = useTopics();

    const topics = useMemo(
        () => topicsData?.topics?.filter((t: { subjectId: string }) => t.subjectId === subjectId) ?? [],
        [topicsData, subjectId]
    );

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 rounded-xl bg-muted/50 animate-pulse" />
                ))}
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum tópico cadastrado. Acesse{" "}
                <a href="/materias" className="text-primary hover:underline">Matérias</a>{" "}
                para adicionar.
            </p>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {topics.map((t: { id: string; name: string }) => (
                <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-border/40"
                    style={{ backgroundColor: subjectColor + "15", color: subjectColor }}
                >
                    {t.name}
                </span>
            ))}
        </div>
    );
}
