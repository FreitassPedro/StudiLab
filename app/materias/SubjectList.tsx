"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteSubject, useSubjectTree } from "@/hooks/useSubjects";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, FileText, Folder, FolderOpen, Plus, Settings, Trash2 } from "lucide-react";
import { SubjectTree, TopicNode } from "@/types/types";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { NewTopicDialog } from "./components/NewTopicDialog";
import { EditSubjectDialog, EditTopicDialog } from "./components/EditSubjectDialog";

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
                <td className="py-2 group">
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    const deleteSubject = useDeleteSubject();

    const handleDelete = async () => {
        try {
            await deleteSubject.mutateAsync(subjectTree.subject.id);
            toast.info("Matéria removida com sucesso.");
        } catch {
            toast.error("Erro ao remover matéria.");
        }
    };

    return (
        <Fragment key={subjectTree.subject.id}>
            <tr className="select-none">
                <td colSpan={4} className="py-2.5 px-4 rounded-xl border border-b-2 bg-muted/40" style={{ borderColor: subjectTree.subject.color }}>
                    <div className="flex w-full items-center justify-between gap-6">
                        <button onClick={() => setIsCollapsed(!isCollapsed)}
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
                            <td colSpan={4} className="py-2 px-4 ">
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

    if (isLoading) {
        return <SubjectsSkeleton />;
    }

    return (
        <div className="mt-10 rounded-2xl border border-border bg-card p-2 overflow-hidden">
            <table className="w-full text-sm border-separate border-spacing-y-2">
                <thead>
                    <tr className="border-b border-border bg-muted/40">
                        <th className="w-8" />
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Tópico
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                            {/* Pendências */}
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                            {/* logs */}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tree.map((subjectTree) => (
                        <SubjectItem
                            key={subjectTree.subject.id}
                            subjectTree={subjectTree}
                        />
                    ))}
                </tbody>
            </table>
        </div>




    );
}
