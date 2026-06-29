"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    ChevronDown,
    ChevronRight,
    FileText,
    Folder,
    FolderOpen,
    Plus,
    Settings,
    Trash2,
    Archive,
    ArchiveRestore,
    BookOpen,
    Hash,
} from "lucide-react";
import { SubjectTree, TopicNode } from "@/types/types";
import { Fragment } from "react";
import { toast } from "sonner";
import { useDeleteSubject, useSubjectOpen, useToggleArchiveSubject } from "@/hooks/useSubjects";
import { EditSubjectDialog, EditTopicDialog } from "./EditSubjectDialog";
import { NewTopicDialog } from "./NewTopicDialog";
import { cn } from "@/lib/utils";

// ─── Topic Row ────────────────────────────────────────────────────────────────

function TopicRow({ node, level }: { node: TopicNode; level: number }) {
    const hasChildren = node.children && node.children.length > 0;
    const [open, setOpen] = useState(level <= 1);

    const childCount = node.children?.length ?? 0;

    return (
        <>
            <div
                className="group flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-default"
                style={{ paddingLeft: `${12 + level * 16}px` }}
            >
                {/* expand toggle */}
                <button
                    onClick={() => hasChildren && setOpen((p) => !p)}
                    className={`shrink-0 w-4 h-4 flex items-center justify-center rounded text-muted-foreground transition-colors ${hasChildren ? "hover:text-foreground" : "invisible"
                        }`}
                >
                    {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>

                {/* icon */}
                {hasChildren ? (
                    open ? (
                        <FolderOpen size={13} className="text-amber-500 shrink-0" />
                    ) : (
                        <Folder size={13} className="text-amber-400/70 shrink-0" />
                    )
                ) : (
                    <FileText size={13} className="text-muted-foreground/50 shrink-0" />
                )}

                {/* name */}
                <span
                    className={`text-sm flex-1 leading-none ${level === 0 ? "font-medium text-foreground" : "text-muted-foreground"
                        }`}
                >
                    {node.name}
                </span>

                {/* child count badge */}
                {hasChildren && (
                    <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">
                        {childCount}
                    </span>
                )}

                {/* edit button */}
                <EditTopicDialog topicId={node.id}>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10 dark:hover:bg-white/10">
                        <Settings size={11} className="text-muted-foreground" />
                    </button>
                </EditTopicDialog>
            </div>

            {open &&
                hasChildren &&
                node.children.map((child) => (
                    <TopicRow key={child.id} node={child} level={level + 1} />
                ))}
        </>
    );
}

// ─── Subject Notebook Card ────────────────────────────────────────────────────

export function SubjectBook({ subjectTree }: { subjectTree: SubjectTree }) {
    const [isOpen, setIsOpen] = useState(subjectTree.subject.isOpen);

    const deleteSubject = useDeleteSubject();
    const updateSubjectStatus = useSubjectOpen();
    const toggleArchiveSubject = useToggleArchiveSubject();

    const { subject, topics } = subjectTree;
    const isArchived = subject.isArchived;

    const topicCount = countTopics(topics);

    const handleDelete = async () => {
        try {
            await deleteSubject.mutateAsync(subject.id);
            toast.info("Matéria removida.");
        } catch {
            toast.error("Erro ao remover matéria.");
        }
    };

    const handleToggleExpand = async () => {
        const next = !isOpen;
        setIsOpen(next);
        try {
            await updateSubjectStatus.mutateAsync({
                subjectId: subject.id,
                isOpen: next,
                isArchived: subject.isArchived,
            });
        } catch {
            toast.error("Erro ao atualizar estado.");
        }
    };

    const handleToggleArchive = async () => {
        try {
            await toggleArchiveSubject.mutateAsync({
                subjectId: subject.id,
                isOpen: subject.isOpen,
                isArchived: !isArchived,
            });
            toast.info(isArchived ? "Matéria desarquivada." : "Matéria arquivada.");
        } catch {
            toast.error("Erro ao alterar status.");
        }
    };

    return (
        <div
            className={`group relative rounded-2xl min-h-[200px] overflow-hidden border border-border/60 bg-card shadow-sm transition-all duration-300 ${isArchived ? "opacity-60 grayscale" : "hover:shadow-md"
                }`}
        >
            {/* ── Spine (lombada lateral) ── */}
            <div
                className={cn("absolute inset-y-0 left-0 rounded-2xl transition-all duration-300 ease-in-out shadow-inner ",
                    isOpen ? "w-[5%]" : "w-[90%]"
                )}
                style={{ backgroundColor: subject.color }}
            />

            {/* ── Cover ── */}
            < div className="relative z-10 pl-5 pr-4 pt-4 pb-3" >
                {/* top row */}
                < div className="flex items-start justify-between gap-3" >
                    <button
                        onClick={handleToggleExpand}
                        className="flex items-center gap-3 flex-1 text-left group/btn"
                    >
                        {/* color dot + chevron stacked */}
                        <div className="relative shrink-0">
                            <div
                                className="w-9 h-9 rounded-xl shadow-sm flex items-center justify-center"
                                style={{ backgroundColor: subject.color + "22" }}
                            >
                                {subject.icon ? (
                                    <span className="text-base transition-transform group-hover/btn:scale-110">{subject.icon}</span>
                                ) : (
                                    <BookOpen
                                        size={18}
                                        className="transition-transform group-hover/btn:scale-110"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-base leading-tight truncate">
                                {subject.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
                                    <Hash size={9} className="inline mr-0.5 -mt-px" />
                                    {topicCount} tópico{topicCount !== 1 ? "s" : ""}
                                </span>
                                {isArchived && (
                                    <Badge variant="secondary" className="text-[9px] py-0 h-4">
                                        arquivado
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <ChevronDown
                            size={16}
                            className={`text-muted-foreground/50 shrink-0 transition-transform duration-200 ${isOpen ? "-rotate-90" : ""
                                }`}
                        />
                    </button>
                </div>

                {/* action row — only visible on hover */}
                <div className={cn("flex items-center gap-1 mt-3 transition-all duration-300 ease-in-out",
                    isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
                    <NewTopicDialog subjectId={subject.id}>
                        <ActionBtn icon={<Plus size={13} />} label="Tópico" />
                    </NewTopicDialog>

                    <EditSubjectDialog subjectId={subject.id}>
                        <ActionBtn icon={<Settings size={13} />} label="Editar" />
                    </EditSubjectDialog>

                    <div className="flex-1" />

                    <ActionBtn
                        icon={
                            isArchived ? (
                                <ArchiveRestore size={13} />
                            ) : (
                                <Archive size={13} />
                            )
                        }
                        label={isArchived ? "Reativar" : "Arquivar"}
                        onClick={handleToggleArchive}
                        muted
                    />
                    <ActionBtn
                        icon={<Trash2 size={13} />}
                        label="Excluir"
                        onClick={handleDelete}
                        destructive
                    />
                </div>
            </div >

            {/* ── Pages (topic tree) ── */}
            {
                isOpen && (
                    <div className="mx-2 mb-2 rounded-xl overflow-hidden">
                        {/* lined paper texture rows */}
                        <div className="pt-2 pb-1 px-1">
                            {topics.length > 0 ? (
                                topics.map((topic) => (
                                    <TopicRow key={topic.id} node={topic} level={0} />
                                ))
                            ) : (
                                <EmptyTopics subjectId={subject.id} />
                            )}
                        </div>
                    </div>
                )
            }


        </div >
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ActionBtn({
    icon,
    label,
    onClick,
    muted,
    destructive,
}: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    muted?: boolean;
    destructive?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${destructive
                ? "text-destructive hover:bg-destructive/10"
                : muted
                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function EmptyTopics({ subjectId }: { subjectId: string }) {
    return (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center">
                <FileText size={15} className="text-muted-foreground/40" />
            </div>
            <p className="text-xs text-muted-foreground/60">Nenhum tópico ainda</p>
            <NewTopicDialog subjectId={subjectId}>
                <button className="text-xs text-primary hover:underline underline-offset-2">
                    + Adicionar primeiro tópico
                </button>
            </NewTopicDialog>
        </div>
    );
}

function countTopics(nodes: TopicNode[]): number {
    return nodes.reduce((acc, n) => acc + 1 + countTopics(n.children ?? []), 0);
}