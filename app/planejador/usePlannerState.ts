"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BlockType, MOCK_BLOCKS, StudyBlock, SubjectColor } from "./components/mockData";
import { generateId } from "../teste/4/components/planner-utils";
import { parseTimeToMinutes } from "./utils";

const PLANNER_BLOCKS_STORAGE_KEY = "planner.blocks.v1";

export interface NewBlockForm {
    subject: string;
    topic: string;
    startTime: string;
    endTime: string;
    type: BlockType;
    color: SubjectColor;
    dayIndex: number;
}

const DEFAULT_FORM: NewBlockForm = {
    subject: "",
    topic: "",
    startTime: "09:00",
    endTime: "10:00",
    type: "exercise",
    color: "blue",
    dayIndex: 0,
};

export function minutesToTimeStr(minutes: number): string {
    const clamped = Math.max(0, Math.min(23 * 60 + 59, minutes));
    const h = Math.floor(clamped / 60);
    const m = Math.round(clamped % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function usePlannerState() {
    const [blocks, setBlocks] = useState<StudyBlock[]>(MOCK_BLOCKS);
    const [isLoaded, setIsLoaded] = useState(false);

    // 2. Transição de Estado Assíncrona: Delegação da leitura do cache para a fase pós-hidratação.
    useEffect(() => {
        
        const stored = localStorage.getItem(PLANNER_BLOCKS_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as StudyBlock[];
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setBlocks(parsed);
            } catch {
                console.error("Failed to parse stored blocks");
            }
        }
        // Sinaliza que a árvore cliente-side está pronta e o estado reflete a persistência local
        setIsLoaded(true);
    }, []);

    // 3. Serialização: Omitida no primeiro render, acionada somente após a sincronização do cache.
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(PLANNER_BLOCKS_STORAGE_KEY, JSON.stringify(blocks));
        }
    }, [blocks, isLoaded]);

    const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [newBlockForm, setNewBlockForm] = useState<NewBlockForm>(DEFAULT_FORM);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);


    // Used to detect single-click vs drag
    const dragMovedRef = useRef(false);

    const openAddModal = useCallback((dayIndex: number, startTime?: string) => {
        setEditingBlock(null);
        setNewBlockForm((prev) => ({
            ...prev,
            dayIndex,
            startTime: startTime ?? "09:00",
            endTime: startTime
                ? minutesToTimeStr(parseTimeToMinutes(startTime) + 60)
                : "10:00",
        }));
        setModalOpen(true);
    }, []);

    const openEditBlock = useCallback((block: StudyBlock) => {
        setEditingBlock(block);
        setNewBlockForm({
            subject: block.subject,
            topic: block.topic ?? "",
            startTime: block.startTime,
            endTime: block.endTime,
            type: block.type ?? "exercise",
            color: block.color,
            dayIndex: block.dayIndex,
        });
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditingBlock(null);
    }, []);

    const removeBlock = useCallback((blockId: string) => {
        setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    }, []);

    const saveBlock = useCallback(() => {
        if (editingBlock) {
            setBlocks((prev) => prev.map((b) => b.id === editingBlock.id ? { ...b, ...newBlockForm } : b));
        } 
        else {
            const newBlock: StudyBlock = {
                id: generateId(),
                subject: newBlockForm.subject,
                topic: newBlockForm.topic,
                startTime: newBlockForm.startTime,
                endTime: newBlockForm.endTime,
                color: newBlockForm.color,
                dayIndex: newBlockForm.dayIndex,
                type: newBlockForm.type,
                status: "todo",
            };

            console.log("Saving new block", newBlock);
            setBlocks((prev) => [...prev, newBlock]);
        }
        closeModal();
    }, [newBlockForm, closeModal, editingBlock]);

    const deleteBlock = useCallback((blockId: string) => {
        setBlocks((prev) => prev.filter((b) => b.id !== blockId));
        closeModal();
    }, [closeModal]);

    const toggleBlockStatus = useCallback((blockId: string) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block.id === blockId
                    ? { ...block, status: block.status === "done" ? "todo" : "done" }
                    : block
            )
        );
    }, []);

    /**
     * Move a block to a new day + pixel offset within the timeline.
     * pixelTop: distance from top of timeline container (px).
     * timelineHeight: total height of the timeline (px).
     */
    const moveBlockByPixel = useCallback(
        (blockId: string, targetDay: number, pixelTop: number, hourHeights: number[]) => {
            setBlocks((prev) => {
                const block = prev.find((b) => b.id === blockId);
                if (!block) return prev;

                const startMinutes = parseTimeToMinutes(block.startTime);
                const endMinutes = parseTimeToMinutes(block.endTime);
                const duration = endMinutes - startMinutes;

                const newStart = pixelToMinutes(pixelTop, hourHeights);
                const snapped = snapToGrid(newStart, 15);
                const newEnd = snapped + duration;

                return prev.map((b) =>
                    b.id === blockId
                        ? {
                            ...b,
                            dayIndex: targetDay,
                            startTime: minutesToTimeStr(snapped),
                            endTime: minutesToTimeStr(newEnd),
                        }
                        : b
                );
            });
        },
        []
    );

    /**
     * Resize a block by setting a new end time from pixel position.
     */
    const resizeBlockByPixel = useCallback(
        (blockId: string, pixelBottom: number, hourHeights: number[]) => {
            console.log("resizeBlockByPixel", { blockId, pixelBottom });
            setBlocks((prev) => {
                const block = prev.find((b) => b.id === blockId);
                if (!block) return prev;

                const startMinutes = parseTimeToMinutes(block.startTime);
                const newEnd = pixelToMinutes(pixelBottom, hourHeights);
                const snapped = snapToGrid(newEnd, 15);

                if (snapped <= startMinutes + 15) return prev;

                return prev.map((b) =>
                    b.id === blockId
                        ? { ...b, endTime: minutesToTimeStr(snapped) }
                        : b
                );
            });
        },
        []
    );


    return {
        blocks,
        isLoaded,
        form: newBlockForm,
        setForm: setNewBlockForm,
        draggedId,
        setDraggedId,
        dragMovedRef,
        resizingId,
        setResizingId,
        moveBlockByPixel,
        resizeBlockByPixel,
        editingBlock,
        modalOpen,
        removeBlock,
        openAddModal,
        openEditBlock,
        closeModal,
        saveBlock,
        deleteBlock,
        toggleBlockStatus,
    };
}

// Helpers

function snapToGrid(minutes: number, gridMinutes: number): number {
    return Math.round(minutes / gridMinutes) * gridMinutes;
}

export function pixelToMinutes(px: number, hourHeights: number[]): number {
    let remaining = Math.max(0, px);
    for (let hour = 0; hour < hourHeights.length; hour++) {
        const h = hourHeights[hour];
        if (remaining <= h) {
            return hour * 60 + (remaining / h) * 60;
        }
        remaining -= h;
    }
    return 24 * 60;
}
