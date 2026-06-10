"use client";

import { TopicNode } from "@/types/types";
import { useMemo, useState, memo, useCallback, createContext, useContext } from "react";
import { ChevronDown, ChevronRight, FileText, Folder, FolderOpen, Network, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTopicsTree, useTopicsMap } from "@/hooks/useTopics";
import { Input } from "@/components/ui/input";

// Context to avoid prop drilling and help with optimization
const TopicSelectionContext = createContext<{
    selectedTopicId: string;
    onTopicSelect: (topicId: string) => void;
} | null>(null);

interface TopicNodeItemProps {
    node: TopicNode;
    level: number;
    searchQuery: string;
}

const TopicNodeItem = memo(function TopicNodeItem({
    node,
    level,
    searchQuery,
}: TopicNodeItemProps) {
    const context = useContext(TopicSelectionContext);
    const hasChildren = node.children && node.children.length > 0;

    // Keep nodes expanded if they match search or have children that match
    const matchesSearch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Local collapse state
    const [isCollapsed, setIsCollapsed] = useState(level > 1);

    // If searching, we force expand to show matches. Otherwise use local state.
    const expanded = searchQuery ? true : !isCollapsed;

    const isSelected = context?.selectedTopicId === node.id;

    const toggleCollapse = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsCollapsed((prev) => !prev);
    };

    // If searching and this node or its children don't match, we might want to hide it
    // But for simplicity in this recursive structure, we'll let the parent handle filtering if we want a flat list
    // OR we just show the whole tree and highlight matches.

    return (
        <div className="flex flex-col">
            <div
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${isSelected
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent text-foreground"
                    } ${matchesSearch ? "ring-1 ring-primary/30 bg-primary/5" : ""}`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => context?.onTopicSelect(node.id)}
            >
                {hasChildren ? (
                    <button
                        onClick={toggleCollapse}
                        className="flex items-center justify-center h-5 w-5 rounded hover:bg-accent/50 text-muted-foreground transition-colors shrink-0"
                    >
                        {!expanded ? (
                            <ChevronRight size={14} />
                        ) : (
                            <ChevronDown size={14} />
                        )}
                    </button>
                ) : (
                    <div className="w-5" />
                )}

                {hasChildren ? (
                    !expanded ? (
                        <Folder size={14} className="text-muted-foreground shrink-0" />
                    ) : (
                        <FolderOpen size={14} className="text-primary/60 shrink-0" />
                    )
                ) : (
                    <FileText size={14} className="text-muted-foreground/50 shrink-0" />
                )}

                <span className={`text-sm font-medium flex-1 truncate ${matchesSearch ? "font-bold" : ""}`}>
                    {node.name}
                </span>
            </div>

            {expanded && hasChildren && (
                <div className="flex flex-col">
                    {node.children.map((child) => (
                        <TopicNodeItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            searchQuery={searchQuery}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

interface TopicTreeSelectorProps {
    nodes: TopicNode[];
    selectedTopicId: string;
    onTopicSelect: (topicId: string) => void;
}

export function TopicTreeSelector({
    nodes,
    selectedTopicId,
    onTopicSelect,
}: TopicTreeSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredNodes = useMemo(() => {
        if (!searchQuery) return nodes;

        // Simple filter: if a node or any of its descendants matches the search
        const filterTree = (nodes: TopicNode[]): TopicNode[] => {
            return nodes.reduce((acc: TopicNode[], node) => {
                const matches = node.name.toLowerCase().includes(searchQuery.toLowerCase());
                const childrenMatches = filterTree(node.children);

                if (matches || childrenMatches.length > 0) {
                    acc.push({
                        ...node,
                        children: childrenMatches
                    });
                }
                return acc;
            }, []);
        };

        return filterTree(nodes);
    }, [nodes, searchQuery]);

    const contextValue = useMemo(() => ({
        selectedTopicId,
        onTopicSelect
    }), [selectedTopicId, onTopicSelect]);

    return (
        <TopicSelectionContext.Provider value={contextValue}>
            <div className="space-y-4 flex w-full flex-col">
                <div className="relative top-0 bg-background z-10">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar tópico..."
                        className="pl-9 h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="overflow-y-auto ">
                    {filteredNodes.length > 0 ? (
                        filteredNodes.map((node) => (
                            <TopicNodeItem
                                key={node.id}
                                node={node}
                                level={0}
                                searchQuery={searchQuery}
                            />
                        ))
                    ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground italic">
                            {searchQuery ? "Nenhum tópico encontrado para esta busca." : "Nenhum tópico cadastrado."}
                        </div>
                    )}
                </div>
            </div>
        </TopicSelectionContext.Provider>
    );
}

const getTopicTreeForSubject = (
    topicsTree: TopicNode[],
    subjectId: string
): TopicNode[] => {
    return topicsTree?.filter((node) => node.subjectId === subjectId) || [];
};

export function TopicSelector({
    open,
    onOpenChange,
    subjectId,
    selectedTopicId,
    onTopicSelect,
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    subjectId: string,
    selectedTopicId: string;
    onTopicSelect: (topicId: string) => void;
}) {
    const { data: topicsTree = [], isLoading: loadingTopicsTree } = useTopicsTree();
    const topicsMap = useTopicsMap();

    const topics = useMemo(
        () => getTopicTreeForSubject(topicsTree, subjectId),
        [topicsTree, subjectId]
    );

    const selectedTopicName = useMemo(() => {
        if (!selectedTopicId) return "Selecione um tópico";
        return topicsMap[selectedTopicId]?.name || "Tópico desconhecido";
    }, [selectedTopicId, topicsMap]);

    const handleSelect = useCallback((topicId: string) => {
        onTopicSelect(topicId);
        onOpenChange(false);
    }, [onTopicSelect, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    type="button"
                    className={`h-9 w-full justify-between font-normal bg-background/60 hover:bg-background/80 focus-visible:ring-primary/40 ${!selectedTopicId ? "text-muted-foreground" : "text-foreground"
                        }`}
                    disabled={!subjectId || loadingTopicsTree}
                >
                    <span className="truncate text-sm">{selectedTopicName}</span>
                    <Network className="h-3.5 w-3.5 ml-2 shrink-0 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md flex flex-col max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>Selecione um tópico</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex max-h-96 pr-2 -mr-2">
                    {loadingTopicsTree ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            <div className="animate-pulse flex flex-col items-center gap-2">
                                <div className="h-4 w-32 bg-muted rounded" />
                                <div className="h-3 w-48 bg-muted rounded" />
                            </div>
                            <span className="mt-4 block">Carregando tópicos...</span>
                        </div>
                    ) : (
                        <TopicTreeSelector
                            nodes={topics}
                            selectedTopicId={selectedTopicId}
                            onTopicSelect={handleSelect}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog >
    );
}
