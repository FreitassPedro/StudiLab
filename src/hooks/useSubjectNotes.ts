"use client";

import { useState, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubjectNote {
    id: string;
    title: string;
    content: string;
    color: string;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = (subjectId: string) => `studi_notes_${subjectId}`;

function generateId() {
    return `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(subjectId: string): SubjectNote[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY(subjectId));
        return raw ? (JSON.parse(raw) as SubjectNote[]) : [];
    } catch {
        return [];
    }
}

function saveToStorage(subjectId: string, notes: SubjectNote[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY(subjectId), JSON.stringify(notes));
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const NOTE_COLORS = [
    { label: "Padrão", value: "default" },
    { label: "Vermelho", value: "red" },
    { label: "Laranja", value: "orange" },
    { label: "Amarelo", value: "yellow" },
    { label: "Verde", value: "green" },
    { label: "Azul", value: "blue" },
    { label: "Roxo", value: "purple" },
] as const;

export type NoteColor = (typeof NOTE_COLORS)[number]["value"];

export const NOTE_COLOR_STYLES: Record<NoteColor, string> = {
    default: "bg-card border-border",
    red: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/50",
    orange: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/50",
    yellow: "bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800/50",
    green: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50",
    blue: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50",
    purple: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/50",
};

export function useSubjectNotes(subjectId: string) {
    const [notes, setNotes] = useState<SubjectNote[]>([]);

    // Load on mount / subjectId change
    useEffect(() => {
        setNotes(loadFromStorage(subjectId));
    }, [subjectId]);

    // Persist every change
    const persist = useCallback(
        (updated: SubjectNote[]) => {
            setNotes(updated);
            saveToStorage(subjectId, updated);
        },
        [subjectId]
    );

    const addNote = useCallback(
        (title = "", content = "", color: NoteColor = "default") => {
            const now = new Date().toISOString();
            const note: SubjectNote = {
                id: generateId(),
                title,
                content,
                color,
                isPinned: false,
                createdAt: now,
                updatedAt: now,
            };
            persist([note, ...notes]);
            return note;
        },
        [notes, persist]
    );

    const updateNote = useCallback(
        (id: string, patch: Partial<Omit<SubjectNote, "id" | "createdAt">>) => {
            persist(
                notes.map((n) =>
                    n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
                )
            );
        },
        [notes, persist]
    );

    const deleteNote = useCallback(
        (id: string) => {
            persist(notes.filter((n) => n.id !== id));
        },
        [notes, persist]
    );

    const togglePin = useCallback(
        (id: string) => {
            persist(
                notes.map((n) =>
                    n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n
                )
            );
        },
        [notes, persist]
    );

    // Pinned first, then by updatedAt desc
    const sortedNotes = [...notes].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return { notes: sortedNotes, addNote, updateNote, deleteNote, togglePin };
}
