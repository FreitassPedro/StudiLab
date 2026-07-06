"use client";

import { useState, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubjectTask {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
    completedAt: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = (subjectId: string) => `studi_tasks_${subjectId}`;

function generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(subjectId: string): SubjectTask[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY(subjectId));
        return raw ? (JSON.parse(raw) as SubjectTask[]) : [];
    } catch {
        return [];
    }
}

function saveToStorage(subjectId: string, tasks: SubjectTask[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY(subjectId), JSON.stringify(tasks));
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSubjectTasks(subjectId: string) {
    const [tasks, setTasks] = useState<SubjectTask[]>([]);

    // Load on mount / subjectId change
    useEffect(() => {
        setTasks(loadFromStorage(subjectId));
    }, [subjectId]);

    // Persist every change
    const persist = useCallback(
        (updated: SubjectTask[]) => {
            setTasks(updated);
            saveToStorage(subjectId, updated);
        },
        [subjectId]
    );

    const addTask = useCallback(
        (text: string) => {
            if (!text.trim()) return null;
            const task: SubjectTask = {
                id: generateId(),
                text: text.trim(),
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: null,
            };
            persist([task, ...tasks]);
            return task;
        },
        [tasks, persist]
    );

    const toggleTask = useCallback(
        (id: string) => {
            persist(
                tasks.map((t) =>
                    t.id === id
                        ? {
                            ...t,
                            completed: !t.completed,
                            completedAt: !t.completed ? new Date().toISOString() : null,
                        }
                        : t
                )
            );
        },
        [tasks, persist]
    );

    const deleteTask = useCallback(
        (id: string) => {
            persist(tasks.filter((t) => t.id !== id));
        },
        [tasks, persist]
    );

    const editTask = useCallback(
        (id: string, text: string) => {
            if (!text.trim()) return;
            persist(tasks.map((t) => (t.id === id ? { ...t, text: text.trim() } : t)));
        },
        [tasks, persist]
    );

    const clearCompleted = useCallback(() => {
        persist(tasks.filter((t) => !t.completed));
    }, [tasks, persist]);

    // Pending first, then by createdAt desc
    const pending = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);

    return {
        tasks,
        pending,
        completed,
        addTask,
        toggleTask,
        deleteTask,
        editTask,
        clearCompleted,
    };
}
