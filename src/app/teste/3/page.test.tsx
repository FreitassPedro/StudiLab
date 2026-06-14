"use client";
import React, { useEffect, useState } from 'react';
import { mockJsonDashboardStats, mockJsonTopicTree, mockStudyLogs, TopicNode } from './mock';
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    FileText,
    X,
    Clock,
    BookOpen,
    StickyNote,
    Filter,
    Plus,
    Trash2,
    Settings,
} from 'lucide-react';

// ─── shadcn/ui-style primitives (inline, no external dep) ───────────────────

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'outline' }) => {
    const styles = {
        default: 'bg-primary/10 text-primary border border-primary/20',
        secondary: 'bg-muted text-muted-foreground border border-border',
        outline: 'bg-transparent text-muted-foreground border border-border',
    };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles[variant]}`}>
            {children}
        </span>
    );
};

const Button = ({
    children,
    onClick,
    variant = 'default',
    size = 'md',
    className = '',
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'icon';
    className?: string;
}) => {
    const base = 'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50';
    const variants = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground text-muted-foreground',
        outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground text-foreground',
    };
    const sizes = { sm: 'h-7 px-2.5 text-xs', md: 'h-9 px-4 text-sm', icon: 'h-7 w-7 text-xs' };
    return (
        <button onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </button>
    );
};

// ─── Detail Sheet ────────────────────────────────────────────────────────────

const DetailSheet = ({ topicId, topicName, onClose }: { topicId: string; topicName: string; onClose: () => void }) => {
    const logs = mockStudyLogs.filter(log => log.topicId === topicId);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Sheet panel */}
            <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-border">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Detalhes do Tópico</p>
                        <h2 className="text-lg font-semibold text-foreground">{topicName}</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">ID: {topicId}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="mt-0.5">
                        <X size={15} />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Logs de Estudo</span>
                        <Badge variant="secondary">{logs.length}</Badge>
                    </div>

                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <BookOpen size={32} className="text-muted-foreground/40 mb-3" />
                            <p className="text-sm text-muted-foreground">Nenhum log registrado para este tópico.</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {logs.map(log => (
                                <li key={log.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                                        <span className="text-sm text-foreground">{log.date}</span>
                                    </div>
                                    <Badge variant="outline">
                                        <Clock size={10} />
                                        {log.durationMinutes} min
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};

// ─── Sidebar Tree ─────────────────────────────────────────────────────────────

const SidebarTopicNode = ({
    topic,
    depth = 0,
    onSelectTopic,
    selectedTopicId,
}: {
    topic: TopicNode;
    depth?: number;
    onSelectTopic: (id: string) => void;
    selectedTopicId: string | null;
}) => {
    const [open, setOpen] = useState(depth < 1);
    const hasChildren = topic.children && topic.children.length > 0;
    const isSelected = selectedTopicId === topic.id;

    return (
        <div>
            <button
                onClick={() => {
                    onSelectTopic(topic.id);
                    if (hasChildren) setOpen(o => !o);
                }}
                className={`group w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors
          ${isSelected
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`}
                style={{ paddingLeft: `${8 + depth * 14}px` }}
            >
                {hasChildren ? (
                    open ? <FolderOpen size={14} className="shrink-0 text-primary/70" /> : <Folder size={14} className="shrink-0 text-muted-foreground" />
                ) : (
                    <FileText size={14} className="shrink-0 text-muted-foreground/60" />
                )}
                <span className="truncate">{topic.name}</span>
                {hasChildren && (
                    <span className="ml-auto">
                        {open
                            ? <ChevronDown size={12} className="text-muted-foreground" />
                            : <ChevronRight size={12} className="text-muted-foreground" />}
                    </span>
                )}
            </button>
            {hasChildren && open && (
                <div>
                    {topic.children.map(child => (
                        <SidebarTopicNode
                            key={child.id}
                            topic={child}
                            depth={depth + 1}
                            onSelectTopic={onSelectTopic}
                            selectedTopicId={selectedTopicId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Table Row ────────────────────────────────────────────────────────────────

function NodeRow({
    node,
    level = 0,
    onOpenDetail,
}: {
    node: TopicNode;
    level?: number;
    onOpenDetail?: (node: TopicNode) => void;
}) {
    const hasChildren = node.children && node.children.length > 0;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pendingCount = 2;
    const logsCount = mockStudyLogs.filter(l => l.topicId === node.id).length;

    return (
        <>
            <tr className="group border-b border-border/50 hover:bg-muted/30 transition-colors">
                {/* Expand toggle */}
                <td className="w-8 pl-3">
                    {hasChildren && (
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`flex items-center justify-center h-5 w-5 rounded hover:bg-accent text-muted-foreground transition-colors `}
                            style={{ marginLeft: `${level * 12}px` }}
                        >
                            {isCollapsed
                                ? <ChevronRight size={13} />
                                : <ChevronDown size={13} />}
                        </button>
                    )}
                </td>

                {/* Name */}
                <td className="py-2.5 pr-4 group">
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 opacity-5 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                        >
                            <Settings className="h-4 w-4 " />
                        </Button>
                    </div>
                </td>

                {/* Pendências */}
                <td className="py-2.5 text-center w-24">
                    {pendingCount > 0 ? (
                        <Badge variant="secondary">
                            <StickyNote size={10} />
                            {pendingCount}
                        </Badge>
                    ) : (
                        <span className="text-muted-foreground/30 text-xs">—</span>
                    )}
                </td>

                {/* Logs button */}
                <td className="py-2.5 w-24 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenDetail?.(node)}
                        className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <Clock size={12} />
                        {logsCount > 0 ? logsCount : '0'} logs
                    </Button>
                </td>
            </tr>

            {/* Children rows with smooth reveal */}
            {!isCollapsed &&
                node.children.map(child => (
                    <NodeRow key={child.id} node={child} level={level + 1} onOpenDetail={onOpenDetail} />
                ))}
        </>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudyMonitorPage() {
    const [folderTree] = useState<{ id: string; name: string; color: string, topics: TopicNode[] }[]>(mockJsonTopicTree);
    const [detailNode, setDetailNode] = useState<TopicNode | null>(null);
    const [dashboardStats] = useState<typeof mockJsonDashboardStats>(mockJsonDashboardStats);
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

    return (
        <>
            <div className="min-h-screen flex bg-background text-foreground">

                {/* ── Sidebar ── */}
                <aside className="w-64 shrink-0 border-r border-border flex flex-col bg-background">
                    <div className="px-4 py-5 border-b border-border">
                        <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-primary" />
                            <span className="text-sm font-semibold tracking-tight">Study Monitor</span>
                        </div>
                    </div>

                    <div className="px-3 py-4 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3 px-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Meus Tópicos</span>
                            {selectedTopicId && (
                                <button
                                    onClick={() => setSelectedTopicId(null)}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Filter size={10} />
                                    Limpar
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {folderTree.map(subject => (
                                <div key={subject.id}>
                                    <p className="px-2 mb-1 text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                                        {subject.name}
                                    </p>
                                    {subject.topics.map(rootTopic => (
                                        <SidebarTopicNode
                                            key={rootTopic.id}
                                            topic={rootTopic}
                                            depth={0}
                                            onSelectTopic={setSelectedTopicId}
                                            selectedTopicId={selectedTopicId}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <main className="flex-1 flex flex-col min-w-0">
                    {/* Topbar */}
                    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <h1 className="text-sm font-semibold text-foreground">Painel de Estudos</h1>
                            {selectedTopicId && (
                                <Badge variant="secondary">
                                    <Filter size={10} />
                                    ID: {selectedTopicId}
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {dashboardStats?.totalStudyMinutes ?? 0} min totais
                        </div>
                    </header>

                    {/* Table section */}
                    <div className="p-6 flex-1 overflow-auto">
                        <div className="rounded-lg border border-border bg-background overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        <th className="w-8" />
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Tópico
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                                            Pendências
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                                            Logs
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {folderTree.map(subject => (
                                        <React.Fragment key={subject.id}>
                                            {/* Subject header row */}
                                            <tr className="group border-b border-border bg-muted/30 border-l-4 transition-colors group-hover:border-l-primary"
                                                style={{ borderColor: subject.color }}
                                            >
                                                <td colSpan={4} className="py-2.5 px-4">
                                                    <div className="flex w-full items-center justify-between gap-6 "                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: subject.color }}
                                                            />
                                                            <span className="font-medium text-foreground">{subject.name}</span>
                                                        </div>
                                                        <div className="ml-6 flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9"
                                                            >
                                                                <Plus className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
                                                            >
                                                                <Settings className="h-4 w-4 " />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            {
                                                subject.topics.map(topic => (
                                                    <NodeRow
                                                        key={topic.id}
                                                        node={topic}
                                                        level={1}
                                                        onOpenDetail={setDetailNode}
                                                    />
                                                ))
                                            }
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main >
            </div >

            {/* ── Detail Sheet ── */}
            {
                detailNode && (
                    <DetailSheet
                        topicId={detailNode.id}
                        topicName={detailNode.name}
                        onClose={() => setDetailNode(null)}
                    />
                )
            }
        </>
    );
}