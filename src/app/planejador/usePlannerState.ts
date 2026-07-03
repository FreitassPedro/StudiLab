"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BlockType, MOCK_BLOCKS, StudyBlock, ColorName, Subject, MOCK_SUBJECTS } from "./components/mockData";
import { generateId } from "../teste/4/components/planner-utils";
import { normalizeSubjectName, parseTimeToMinutes } from "./utils";

const PLANNER_BLOCKS_STORAGE_KEY = "planner.blocks.v1";

export interface NewBlockForm {
    subjectId: string;
    topic: string;
    startTime: string;
    endTime: string;
    type: BlockType;
    color: ColorName;
    dayIndex: number;
}

const DEFAULT_FORM: NewBlockForm = {
    subjectId: "",
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
    const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS); // Derivado dos blocos, mas pode ser enriquecido com dados adicionais
    const [hiddenSubjects, setHiddenSubjects] = useState<Set<string>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    // 2. Transição de Estado Assíncrona: Delegação da leitura do cache para a fase pós-hidratação.
    useEffect(() => {
        const stored = localStorage.getItem(PLANNER_BLOCKS_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as StudyBlock[];
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setBlocks(parsed);

                // Deriva matérias a partir dos blocos salvos (enriquece o estado inicial)
                setSubjects(prev => {
                    const newSubjectsMap = new Map(prev.map(s => [s.id, s]));
                    parsed.forEach(b => {
                        if (!newSubjectsMap.has(b.subjectId)) {
                            newSubjectsMap.set(b.subjectId, {
                                id: b.subjectId,
                                name: b.subjectId,
                                color: b.color,
                                isVisible: true
                            });
                        }
                    });
                    return Array.from(newSubjectsMap.values());
                });
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


    const subjectsSummary = useMemo(() => {
        const summary = new Map<string, { plannedMinutes: number; doneMinutes: number }>();

        for (const block of blocks) {
            const [startH, startM] = block.startTime.split(":").map(Number);
            const [endH, endM] = block.endTime.split(":").map(Number);
            const minutes = Math.max(0, (endH * 60 + endM) - (startH * 60 + startM));

            const current = summary.get(block.subjectId) ?? {
                plannedMinutes: 0,
                doneMinutes: 0,
            };

            current.plannedMinutes += minutes;
            if (block.status === "done") {
                current.doneMinutes += minutes;
            }
            summary.set(block.subjectId, current);
        }

        return Array.from(summary.entries())
            .map(([subjectId, values]) => ({ subjectId, ...values }))
            .sort((a, b) => b.plannedMinutes - a.plannedMinutes);
    }, [blocks]);

    const openAddModal = useCallback((dayIndex: number, startTime?: string) => {
        setEditingBlock(null);
        setNewBlockForm((prev) => ({
            ...prev,
            subjectId: "",
            topic: "",
            dayIndex,
            startTime: startTime ?? "09:00",
            endTime: startTime
                ? minutesToTimeStr(parseTimeToMinutes(startTime) + 60)
                : "10:00",
        }));
        setModalOpen(true);
    }, []);

    const openEditBlock = useCallback((block: StudyBlock) => {
        const subject = subjects.find(s => s.id === block.subjectId);
        setNewBlockForm({
            subjectId: subject?.name ?? block.subjectId,
            topic: block.topic ?? "",
            startTime: block.startTime,
            endTime: block.endTime,
            type: block.type ?? "exercise",
            color: block.color,
            dayIndex: block.dayIndex,
        });
        setEditingBlock(block);
        setModalOpen(true);
    }, [subjects]);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditingBlock(null);
    }, []);

    const removeBlock = useCallback((blockId: string) => {
        setBlocks((prev) => {
            const newBlocks = prev.filter((b) => b.id !== blockId);
            const block = prev.find(b => b.id === blockId);
            if (block) {
                // Se for o último bloco da matéria, remova a matéria se ela foi gerada dinamicamente
                const hasOther = newBlocks.some(b => b.subjectId === block.subjectId);
                if (!hasOther) {
                    setSubjects(prevSubjs => prevSubjs.filter(s => s.id !== block.subjectId));
                }
            }
            return newBlocks;
        });
    }, []);

    const duplicateBlock = useCallback((blockId: string) => {
        const block = blocks.find((b) => b.id === blockId);
        if (!block) return;

        const newblock = {
            ...block,
            id: generateId(),
            startTime: minutesToTimeStr(parseTimeToMinutes(block.startTime) + 60),
            endTime: minutesToTimeStr(parseTimeToMinutes(block.endTime) + 60),
        };
        setBlocks((prev) => [...prev, newblock]);
    }, [blocks]);


    const saveBlock = useCallback((newBlockForm: Partial<StudyBlock>) => {
        const payloadSubjectId = newBlockForm.subjectId?.trim();
        if (!payloadSubjectId) {
            alert("O campo 'Matéria' é obrigatório.");
            return;
        }

        // Tenta encontrar a matéria pelo ID ou nome normalizado
        let subject = subjects.find(s => s.id === payloadSubjectId || normalizeSubjectName(s.name) === normalizeSubjectName(payloadSubjectId));
        let subjectWasCreated = false;

        if (!subject) {
            subject = {
                id: payloadSubjectId, // O próprio nome é o ID para preservar e não precisar persistir separadamente
                name: payloadSubjectId,
                color: newBlockForm.color || "blue",
                isVisible: true,
            };
            subjectWasCreated = true;
        }

        const blockData: Omit<StudyBlock, "id" | "status"> = {
            subjectId: subject.id,
            topic: newBlockForm.topic || "",
            startTime: newBlockForm.startTime || "09:00",
            endTime: newBlockForm.endTime || "10:00",
            color: subject.color, // A cor do bloco deriva da matéria
            dayIndex: newBlockForm.dayIndex ?? 0,
            type: newBlockForm.type || "exercise",
        };

        if (subjectWasCreated) {
            setSubjects((prev) => [...prev, subject!]);
        }

        if (editingBlock) {
            setBlocks((prev) => prev.map((b) => b.id === editingBlock.id ? { ...b, ...blockData } : b));
        } else {
            const newBlock: StudyBlock = {
                id: generateId(),
                status: "todo",
                ...blockData
            };
            setBlocks((prev) => [...prev, newBlock]);
        }

        closeModal();
    }, [editingBlock, subjects, closeModal]);

    const deleteBlock = useCallback((blockId: string) => {
        removeBlock(blockId);
        closeModal();
    }, [removeBlock, closeModal]);

    const toggleBlockStatus = useCallback((blockId: string) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block.id === blockId
                    ? { ...block, status: block.status === "done" ? "todo" : "done" }
                    : block
            )
        );
    }, []);

    // Tres modo: Normal, Foquem e Oculto
    const toggleViewSubject = useCallback((subjectId: string) => {
        if (!subjectId) return;

        setHiddenSubjects((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(subjectId)) {
                newSet.delete(subjectId);
            } else {
                newSet.add(subjectId);
            }
            return newSet;
        });
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
        }, []);


    return {
        blocks,
        isLoaded,
        form: newBlockForm,
        setForm: setNewBlockForm,
        subjects,
        toggleViewSubject,
        hiddenSubjects,
        subjectsSummary,
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
        duplicateBlock,
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
