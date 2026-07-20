"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BlockType, StudyBlock, ColorName, Subject } from "./components/mockData";
import { generateId } from "../teste/4/components/planner-utils";
import { checkTimeOverlap, normalizeSubjectName, parseTimeToMinutes } from "./utils";
import { getSubjectsAction } from "@/server/actions/subject.actions";
import { getStudyLogsByDateRangeAction } from "@/server/actions/studyLogs.action";

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

export function usePlannerState(weekDates?: Date[]) {
    const [blocks, setBlocks] = useState<StudyBlock[]>([]);
    const [logBlocks, setLogBlocks] = useState<StudyBlock[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [hiddenSubjects, setHiddenSubjects] = useState<Set<string>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);
    const [showLogs, setShowLogs] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(PLANNER_BLOCKS_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as StudyBlock[];
                setBlocks(parsed);
            } catch {
                console.error("Failed to parse stored blocks");
            }
        }
        
        // Fetch subjects from DB
        getSubjectsAction().then((dbSubjects) => {
            const mappedSubjects: Subject[] = dbSubjects.map(s => ({
                id: s.id,
                name: s.name,
                color: s.color as ColorName,
                isVisible: true
            }));
            
            // Se existirem matérias no localStorage que não estão no DB (criadas offline), podemos mesclar
            setSubjects(prev => {
                const newMap = new Map(mappedSubjects.map(s => [s.id, s]));
                prev.forEach(s => {
                    if (!newMap.has(s.id)) newMap.set(s.id, s);
                });
                return Array.from(newMap.values());
            });
        });
        
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!weekDates || weekDates.length === 0) return;
        
        // Ajusta endDate para o final do domingo para pegar logs até 23:59
        const startDate = weekDates[0];
        const endDate = new Date(weekDates[6]);
        endDate.setHours(23, 59, 59, 999);

        getStudyLogsByDateRangeAction(startDate, endDate).then(logs => {
            const mapped: StudyBlock[] = logs.map(log => {
                const startH = log.start_time.getHours().toString().padStart(2, '0');
                const startM = log.start_time.getMinutes().toString().padStart(2, '0');
                const endH = log.end_time.getHours().toString().padStart(2, '0');
                const endM = log.end_time.getMinutes().toString().padStart(2, '0');
                
                // Converter de Date.getDay() (0=Dom) para Planner dayIndex (0=Seg)
                const dayIndex = (log.start_time.getDay() + 6) % 7;

                return {
                    id: `log-${log.id}`,
                    subjectId: log.topic.subject.id,
                    topic: log.topic.name,
                    startTime: `${startH}:${startM}`,
                    endTime: `${endH}:${endM}`,
                    color: log.topic.subject.color as ColorName,
                    dayIndex,
                    type: "exercise", // fallback
                    status: "done",
                    isLog: true,
                    logId: log.id,
                };
            });
            setLogBlocks(mapped);
        });
    }, [weekDates]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(PLANNER_BLOCKS_STORAGE_KEY, JSON.stringify(blocks));
        }
    }, [blocks, isLoaded]);

    const allBlocks = useMemo(() => {
        return showLogs ? [...blocks, ...logBlocks] : blocks;
    }, [blocks, logBlocks, showLogs]);

    const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [newBlockForm, setNewBlockForm] = useState<NewBlockForm>(DEFAULT_FORM);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);

    const dragMovedRef = useRef(false);

    const subjectsSummary = useMemo(() => {
        const summary = new Map<string, { plannedMinutes: number; doneMinutes: number }>();

        for (const block of allBlocks) {
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
    }, [allBlocks]);

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
        if (block.isLog) return; // Nao editar study logs no planejador
        
        setNewBlockForm({
            subjectId: block.subjectId,
            topic: block.topic ?? "",
            startTime: block.startTime,
            endTime: block.endTime,
            type: block.type ?? "exercise",
            color: block.color,
            dayIndex: block.dayIndex,
        });
        setEditingBlock(block);
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditingBlock(null);
    }, []);

    const removeBlock = useCallback((blockId: string) => {
        setBlocks((prev) => {
            const newBlocks = prev.filter((b) => b.id !== blockId);
            const block = prev.find(b => b.id === blockId);
            if (block) {
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
        
        // Verifica overlap para o novo bloco
        const overlap = allBlocks.some(b => 
            b.dayIndex === newblock.dayIndex && 
            checkTimeOverlap(b.startTime, b.endTime, newblock.startTime, newblock.endTime)
        );
        
        if (overlap) {
            alert("Não é possível duplicar: conflito de horário.");
            return;
        }

        setBlocks((prev) => [...prev, newblock]);
    }, [blocks, allBlocks]);

    const generateBacklog = useCallback((hoursMap: Record<string, number>) => {
        const newBlocks: StudyBlock[] = [];
        subjects.forEach(subject => {
            const hours = hoursMap[subject.id] || 0;
            for (let i = 0; i < hours; i++) {
                newBlocks.push({
                    id: generateId(),
                    subjectId: subject.id,
                    topic: "",
                    startTime: "09:00",
                    endTime: "10:00",
                    color: subject.color,
                    dayIndex: -1,
                    type: "exercise",
                    status: "todo",
                    isLog: false
                });
            }
        });
        if (newBlocks.length > 0) {
            setBlocks(prev => [...prev, ...newBlocks]);
        }
    }, [subjects]);

    const saveBlock = useCallback((newBlockForm: Partial<StudyBlock>) => {
        const payloadSubjectId = newBlockForm.subjectId?.trim();
        if (!payloadSubjectId) {
            alert("O campo 'Matéria' é obrigatório.");
            return;
        }

        const overlap = allBlocks.some(b => 
            b.dayIndex === (newBlockForm.dayIndex ?? 0) &&
            b.id !== editingBlock?.id &&
            checkTimeOverlap(b.startTime, b.endTime, newBlockForm.startTime || "09:00", newBlockForm.endTime || "10:00")
        );

        if (overlap) {
            alert("Já existe um bloco neste mesmo horário.");
            return;
        }

        let subject = subjects.find(s => s.id === payloadSubjectId || normalizeSubjectName(s.name) === normalizeSubjectName(payloadSubjectId));
        let subjectWasCreated = false;

        if (!subject) {
            subject = {
                id: payloadSubjectId,
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
            color: subject.color,
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
    }, [editingBlock, subjects, closeModal, allBlocks]);

    const deleteBlock = useCallback((blockId: string) => {
        removeBlock(blockId);
        closeModal();
    }, [removeBlock, closeModal]);

    const toggleBlockStatus = useCallback((blockId: string) => {
        // Study Logs cannot be toggled
        if (logBlocks.some(b => b.id === blockId)) return;
        
        setBlocks((prev) =>
            prev.map((block) =>
                block.id === blockId
                    ? { ...block, status: block.status === "done" ? "todo" : "done" }
                    : block
            )
        );
    }, [logBlocks]);

    const updateSubjectLocally = useCallback((subjectId: string, color: ColorName) => {
        setSubjects((prev) => prev.map((s) => s.id === subjectId ? { ...s, color } : s));
    }, []);

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

    const moveToBacklog = useCallback((blockId: string) => {
        setBlocks((prev) => prev.map(b => b.id === blockId ? { ...b, dayIndex: -1 } : b));
    }, []);

    const addQuickBlock = useCallback((template: { subject: string, type: BlockType, color: ColorName }) => {
        setSubjects(prevSubjects => {
            let subject = prevSubjects.find(s => s.name === template.subject);
            let newSubjects = prevSubjects;
            if (!subject) {
                subject = { id: template.subject, name: template.subject, color: template.color, isVisible: true };
                newSubjects = [...prevSubjects, subject];
            }
            
            const newBlock: StudyBlock = {
                id: generateId(),
                subjectId: subject.id,
                topic: "",
                startTime: "09:00",
                endTime: "10:00",
                color: subject.color,
                dayIndex: -1,
                type: template.type,
                status: "todo",
            };
            
            setBlocks(prev => [...prev, newBlock]);
            return newSubjects;
        });
    }, []);

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

                const startStr = minutesToTimeStr(snapped);
                const endStr = minutesToTimeStr(newEnd);

                const overlap = allBlocks.some(b => 
                    b.dayIndex === targetDay && 
                    b.id !== blockId &&
                    checkTimeOverlap(b.startTime, b.endTime, startStr, endStr)
                );
                
                if (overlap) {
                    return prev;
                }

                return prev.map((b) =>
                    b.id === blockId
                        ? {
                            ...b,
                            dayIndex: targetDay,
                            startTime: startStr,
                            endTime: endStr,
                        }
                        : b
                );
            });
        },
        [allBlocks]
    );

    const resizeBlockByPixel = useCallback(
        (blockId: string, pixelBottom: number, hourHeights: number[]) => {
            setBlocks((prev) => {
                const block = prev.find((b) => b.id === blockId);
                if (!block) return prev;

                const startMinutes = parseTimeToMinutes(block.startTime);
                const newEnd = pixelToMinutes(pixelBottom, hourHeights);
                const snapped = snapToGrid(newEnd, 15);

                if (snapped <= startMinutes + 15) return prev;
                const endStr = minutesToTimeStr(snapped);

                const overlap = allBlocks.some(b => 
                    b.dayIndex === block.dayIndex && 
                    b.id !== blockId &&
                    checkTimeOverlap(b.startTime, b.endTime, block.startTime, endStr)
                );
                
                if (overlap) {
                    return prev;
                }

                return prev.map((b) =>
                    b.id === blockId
                        ? { ...b, endTime: endStr }
                        : b
                );
            });
        }, [allBlocks]);


    return {
        blocks: allBlocks,
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
        moveToBacklog,
        addQuickBlock,
        updateSubjectLocally,
        showLogs,
        setShowLogs,
        generateBacklog,
    };
}

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
