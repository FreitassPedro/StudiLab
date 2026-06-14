"use client";

import { createContext, useContext } from "react";
import { StudyBlock } from "./mockData";

import { Subject } from "./mockData";

interface PlannerActionsContextValue {
    allBlocks: StudyBlock[];
    subjects: Subject[];
    hiddenSubjects: Set<string>;
    subjectsSummary: { subjectId: string; plannedMinutes: number; doneMinutes: number }[];
    draggedId: string | null;
    resizingId: string | null;
    dragOffsetY: number;
    openAddModal: (dayIndex: number, startTime?: string) => void;
    openEditBlock: (block: StudyBlock) => void;
    removeBlock: (blockId: string) => void;
    duplicateBlock: (blockId: string) => void;
    handleDragStart: (id: string, offsetY: number) => void;
    handleResizeStart: (id: string, e: React.MouseEvent) => void;
    toggleBlockStatus: (blockId: string) => void;
    toggleViewSubject: (subjectId: string) => void;
}

const PlannerActionsContext = createContext<PlannerActionsContextValue | null>(null);

export function PlannerActionsProvider({
    value,
    children,
}: {
    value: PlannerActionsContextValue;
    children: React.ReactNode;
}) {
    return (
        <PlannerActionsContext.Provider value={value}>
            {children}
        </PlannerActionsContext.Provider>
    );
}

export function usePlannerActions() {
    const context = useContext(PlannerActionsContext);
    if (!context) {
        throw new Error("usePlannerActions must be used within PlannerActionsProvider");
    }
    return context;
}
