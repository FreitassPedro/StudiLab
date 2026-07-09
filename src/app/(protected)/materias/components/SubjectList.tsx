"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteSubject, useSubjectOpen, useSubjectTree, useToggleArchiveSubject } from "@/hooks/useSubjects";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, FileText, Folder, FolderOpen, Plus, Settings, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { SubjectTree, TopicNode } from "@/types/types";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { NewTopicDialog } from "./NewTopicDialog";
import { EditSubjectDialog, EditTopicDialog } from "./EditSubjectDialog";
import { SubjectBook } from "./SubjectBook";
import { NewSubject } from "./NewSubject";

function NodeRow({
    node,
    level,
}: {
    node: TopicNode;
    level: number;
}) {
    const hasChildren = node.children && node.children.length > 0;
    const [isCollapsed, setIsCollapsed] = useState(level > 1 ? true : false);

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    }

    return (
        <>
            <tr className="group border-b border-muted hover:bg-muted/30 transition-colors animate-in fade-in-0 slide-in-from-top-1 duration-200">
                <td>
                    {hasChildren && (
                        <button onClick={toggleCollapse}
                            className={`flex items-center justify-center h-5 w-5 rounded hover:bg-accent text-muted-foreground transition-colors `}
                            style={{ marginLeft: `${level * 12}px` }}
                        >
                            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                        </button>
                    )}
                </td>
                {/* Name */}
                <td className="py-2 w-full group">
                    <div
                        className="flex items-center gap-2 text-sm"
                        style={{ paddingLeft: `${level * 16}px` }}
                    >
                        {hasChildren
                            ? isCollapsed
                                ? <Folder size={13} className="text-muted-foreground shrink-0" />
                                : <FolderOpen size={13} className="text-primary/60 shrink-0" />
                            : <FileText size={13} className="text-muted-foreground/50 shrink-0" />
                        }
                        <span className={`text-foreground ${level === 0 ? 'font-medium' : ''}`}>{node.name}</span>
                        <EditTopicDialog topicId={node.id}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                            >
                                <Settings className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </EditTopicDialog>
                    </div>
                </td>
            </tr>
            {
                !isCollapsed && hasChildren &&
                node.children.map((child) => (
                    <NodeRow
                        key={child.id}
                        node={child}
                        level={level + 1}
                    />

                ))
            }


        </>
    );
}

export const SubjectsSkeleton = () => {
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Matérias Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse h-16 bg-gray-200 rounded" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
function SubjectItem({ subjectTree }: {
    subjectTree: SubjectTree;
}) {
    const [isCollapsed, setIsCollapsed] = useState(subjectTree.subject.isOpen);

    const deleteSubject = useDeleteSubject();
    const updateSubjectStatus = useSubjectOpen();
    const toggleArchiveSubject = useToggleArchiveSubject();

    const handleDelete = async () => {
        try {
            await deleteSubject.mutateAsync(subjectTree.subject.id);
            toast.info("Matéria removida com sucesso.");
        } catch {
            toast.error("Erro ao remover matéria.");
        }
    };

    const handleOpen = async () => {
        setIsCollapsed(!isCollapsed);
        try {
            await updateSubjectStatus.mutateAsync({
                subjectId: subjectTree.subject.id,
                isOpen: !isCollapsed,
                isArchived: subjectTree.subject.isArchived
            });
        } catch {
            toast.error("Erro ao atualizar status da matéria.");
        }

    };

    const handleToggleArchive = async () => {
        try {
            await toggleArchiveSubject.mutateAsync({
                subjectId: subjectTree.subject.id,
                isOpen: subjectTree.subject.isOpen,
                isArchived: !subjectTree.subject.isArchived
            });
            toast.info(subjectTree.subject.isArchived ? "Matéria desarquivada com sucesso." : "Matéria arquivada com sucesso.");
        } catch {
            toast.error("Erro ao alterar status da matéria.");
        }
    };

    const isArchived = subjectTree.subject.isArchived;

    return (
        <Fragment key={subjectTree.subject.id}>
            <tr className={`select-none ${isArchived ? 'opacity-50 grayscale hover:opacity-80 transition-opacity' : ''}`}>
                <td colSpan={5} className={`py-2.5 px-4 rounded-xl border border-b-2 ${isArchived ? 'bg-muted/20' : 'bg-muted/40'}`} style={{ borderColor: subjectTree.subject.color }}>
                    <div className="flex w-full items-center justify-between gap-6">
                        <button onClick={handleOpen}
                            className={`flex items-center justify-center h-5 w-5 rounded hover:bg-accent text-muted-foreground transition-colors `}
                        >
                            <ChevronRight size={24} className={` ${isCollapsed ? "rotate-0" : "rotate-90"} transition-transform ease-in-out`} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: subjectTree.subject.color }}
                            />
                            <span className="font-medium text-foreground">{subjectTree.subject.name}</span>
                        </div>
                        <div className="ml-6 flex items-center gap-2">
                            <NewTopicDialog
                                subjectId={subjectTree.subject.id}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                >
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </NewTopicDialog>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={handleDelete}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={handleToggleArchive}
                                title={subjectTree.subject.isArchived ? "Desarquivar matéria" : "Arquivar matéria"}
                            >
                                {subjectTree.subject.isArchived ? (
                                    <ArchiveRestore className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Archive className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>

                            {/* Edit Subject */}
                            <EditSubjectDialog subjectId={subjectTree.subject.id}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                >
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </EditSubjectDialog>

                        </div>
                    </div>
                </td>
            </tr>
            {
                !isCollapsed && (
                    subjectTree.topics.length > 0 ? (
                        subjectTree.topics.map((topic) => (
                            <NodeRow
                                key={topic.id}
                                node={topic}
                                level={1}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="py-2 px-4 ">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Folder size={13} className="shrink-0" />
                                    <span>Nenhum tópico cadastrado</span>
                                </div>
                            </td>
                        </tr>
                    )
                )
            }

        </Fragment >
    );
};

export default function SubjectList() {
    const { data: tree = [], isLoading } = useSubjectTree();


    if (isLoading || !tree) {
        return <SubjectsSkeleton />;
    }

    const activeTree = tree.filter(t => !t.subject.isArchived);
        const archivedTree = tree.filter(t => t.subject.isArchived);

    return (
        <div className="mt-10">
            <div className="flex flex-row items-center gap-2 mb-6">
                <h2 className="text-2xl font-bold text-foreground shrink-0">Meus Notebooks</h2>
                <div className="h-1 w-full bg-secondary rounded-full mt-3" />
            </div>
            <NewSubject />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {activeTree.map((treeNode) => (
                    <SubjectBook key={treeNode.subject.id} subjectTree={treeNode} />
                ))}
            </div>
        </div>
    );
}
