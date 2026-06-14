"use client";

import { useState, useCallback } from "react";
import { StudyBlock, SubjectColor, BlockStatus, BlockType, BlockPriority } from "./planner";
import { MOCK_BLOCKS, MOCK_UNSCHEDULED } from "./mock-data";
import { generateId, timeToMinutes, minutesToTime, blockDurationMinutes } from "./planner-utils";

export interface NewBlockForm {
  subject: string;
  topic: string;
  startTime: string;
  endTime: string;
  color: SubjectColor;
  status: BlockStatus;
  type: BlockType;
  priority: BlockPriority;
}

const DEFAULT_FORM: NewBlockForm = {
  subject: "",
  topic: "",
  startTime: "09:00",
  endTime: "10:00",
  color: "blue",
  status: "todo",
  type: "study",
  priority: 2,
};

export function usePlannerState() {
  const [blocks, setBlocks] = useState<StudyBlock[]>(MOCK_BLOCKS);
  const [unscheduledBlocks, setUnscheduledBlocks] = useState<Partial<StudyBlock>[]>(MOCK_UNSCHEDULED);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
  const [activeDay, setActiveDay] = useState<number>(0);
  const [form, setForm] = useState<NewBlockForm>(DEFAULT_FORM);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const openAddModal = useCallback((dayIndex: number, initialData?: Partial<NewBlockForm>) => {
    setActiveDay(dayIndex);
    setEditingBlock(null);
    setForm({ ...DEFAULT_FORM, ...initialData });
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((block: StudyBlock) => {
    setActiveDay(block.dayIndex);
    setEditingBlock(block);
    setForm({
      subject: block.subject,
      topic: block.topic ?? "",
      startTime: block.startTime,
      endTime: block.endTime,
      color: block.color,
      status: block.status,
      type: block.type,
      priority: block.priority,
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingBlock(null);
  }, []);

  const saveBlock = useCallback(() => {
    if (!form.subject.trim()) return;
    if (timeToMinutes(form.endTime) <= timeToMinutes(form.startTime)) return;

    if (editingBlock) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === editingBlock.id
            ? { ...b, ...form, topic: form.topic || undefined }
            : b
        )
      );
    } else {
      const newBlock: StudyBlock = {
        id: generateId(),
        subject: form.subject.trim(),
        topic: form.topic.trim() || undefined,
        startTime: form.startTime,
        endTime: form.endTime,
        color: form.color,
        dayIndex: activeDay,
        status: form.status,
        type: form.type,
        priority: form.priority,
      };
      setBlocks((prev) => [...prev, newBlock]);
    }
    closeModal();
  }, [form, editingBlock, activeDay, closeModal]);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const moveBlockToDay = useCallback((blockId: string, targetDay: number) => {
    // Check if it's from unscheduled
    const unscheduled = unscheduledBlocks.find(b => b.id === blockId);
    if (unscheduled) {
      const newBlock: StudyBlock = {
        id: generateId(),
        subject: unscheduled.subject!,
        topic: unscheduled.topic,
        startTime: "09:00",
        endTime: "10:00",
        color: unscheduled.color || "blue",
        dayIndex: targetDay,
        status: "todo",
        type: unscheduled.type || "study",
        priority: unscheduled.priority || 2,
      };
      setBlocks(prev => [...prev, newBlock]);
      setUnscheduledBlocks(prev => prev.filter(b => b.id !== blockId));
      return;
    }

    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, dayIndex: targetDay } : b))
    );
  }, [unscheduledBlocks]);

  const resizeBlock = useCallback((blockId: string, deltaMinutes: number) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const currentDuration = blockDurationMinutes(b);
        const newDuration = Math.max(15, Math.min(480, currentDuration + deltaMinutes));
        const snapped = Math.round(newDuration / 15) * 15;
        return { ...b, endTime: minutesToTime(timeToMinutes(b.startTime) + snapped) };
      })
    );
  }, []);

  const toggleStatus = useCallback((blockId: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId) return b;
      const nextStatus: BlockStatus = b.status === 'done' ? 'todo' : 'done';
      return { ...b, status: nextStatus };
    }));
  }, []);

  const blocksForDay = useCallback(
    (dayIndex: number) => blocks.filter((b) => b.dayIndex === dayIndex),
    [blocks]
  );

  const addUnscheduled = useCallback((data: Partial<StudyBlock>) => {
    const newUn: Partial<StudyBlock> = {
      id: generateId(),
      subject: "Nova Atividade",
      ...data,
    };
    setUnscheduledBlocks(prev => [newUn, ...prev]);
  }, []);

  const removeUnscheduled = useCallback((id: string) => {
    setUnscheduledBlocks(prev => prev.filter(b => b.id !== id));
  }, []);

  return {
    blocks,
    unscheduledBlocks,
    form,
    setForm,
    modalOpen,
    editingBlock,
    activeDay,
    draggedId,
    setDraggedId,
    openAddModal,
    openEditModal,
    closeModal,
    saveBlock,
    deleteBlock,
    moveBlockToDay,
    resizeBlock,
    blocksForDay,
    toggleStatus,
    addUnscheduled,
    removeUnscheduled,
  };
}
