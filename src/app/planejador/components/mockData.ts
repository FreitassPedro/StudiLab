// Re-export types from the centralized types file for backward compatibility
export type { BlockType, StudyBlock, Subject, ColorName } from "../types";
import type { Subject, StudyBlock } from "../types";

export const MOCK_SUBJECTS: Subject[] = [
    { id: "Matemática", name: "Matemática", color: "#3b82f6", isVisible: true }, // blue
    { id: "Física", name: "Física", color: "#f59e0b", isVisible: true }, // amber
    { id: "História", name: "História", color: "#f43f5e", isVisible: true }, // rose
    { id: "Inglês", name: "Inglês", color: "#14b8a6", isVisible: true }, // teal
    { id: "Química", name: "Química", color: "#10b981", isVisible: true }, // emerald
    { id: "Geografia", name: "Geografia", color: "#8b5cf6", isVisible: true }, // violet
    { id: "Biologia", name: "Biologia", color: "#10b981", isVisible: true }, // emerald
    { id: "Português", name: "Português", color: "#f97316", isVisible: true }, // orange
    { id: "Revisão Geral", name: "Revisão Geral", color: "#8b5cf6", isVisible: true }, // violet
];

export const MOCK_BLOCKS: StudyBlock[] = [
    // Monday
    {
        id: "blk-1",
        subjectId: "Matemática",
        topic: "Cálculo Diferencial",
        startTime: "08:00",
        endTime: "10:00",
        color: "#3b82f6",
        dayIndex: 0,
        type: "leiture",
        status: "todo"
    },
    {
        id: "blk-2",
        subjectId: "Física",
        topic: "Cinemática",
        startTime: "14:00",
        endTime: "15:30",
        color: "#f59e0b",
        dayIndex: 0,
        type: "leiture",
        status: "todo"
    },

    // Tuesday
    {
        id: "blk-3",
        subjectId: "História",
        topic: "Revolução Industrial",
        startTime: "09:00",
        endTime: "11:00",
        color: "#f43f5e",
        dayIndex: 1,
        type: "exam",
        status: "todo"
    },
    {
        id: "blk-4",
        subjectId: "Inglês",
        topic: "Reading Comprehension",
        startTime: "15:00",
        endTime: "16:00",
        color: "#14b8a6",
        dayIndex: 1,
        type: "leiture",
        status: "todo"
    },

    // Wednesday
    {
        id: "blk-5",
        subjectId: "Matemática",
        topic: "Integrais",
        startTime: "08:00",
        endTime: "09:30",
        color: "#3b82f6",
        dayIndex: 2,
        type: "exercise",
        status: "todo"

    },
    {
        id: "blk-6",
        subjectId: "Química",
        topic: "Ligações Químicas",
        startTime: "10:00",
        endTime: "12:00",
        color: "#10b981",
        dayIndex: 2,
        type: "revision",
        status: "todo"
    },
    {
        id: "blk-7",
        subjectId: "Geografia",
        topic: "Geopolítica",
        startTime: "14:00",
        endTime: "15:00",
        color: "#8b5cf6",
        dayIndex: 2,
        type: "resume",
        status: "todo"
    },

    // Thursday
    {
        id: "blk-8",
        subjectId: "Biologia",
        topic: "Genética Mendeliana",
        startTime: "09:00",
        endTime: "11:30",
        color: "#10b981",
        dayIndex: 3,
        type: "leiture",
        status: "todo"
    },
    {
        id: "blk-9",
        subjectId: "Física",
        topic: "Dinâmica",
        startTime: "14:00",
        endTime: "16:00",
        color: "#f59e0b",
        type: "leiture",
        dayIndex: 3,
        status: "todo"
    },

    // Friday
    {
        id: "blk-10",
        subjectId: "Português",
        topic: "Análise Sintática",
        startTime: "08:00",
        endTime: "09:00",
        color: "#f97316",
        dayIndex: 4,
        type: "leiture",
        status: "todo"

    },
    {
        id: "blk-11",
        subjectId: "Inglês",
        topic: "Grammar & Writing",
        startTime: "10:00",
        endTime: "11:00",
        color: "#14b8a6",
        dayIndex: 4,
        type: "exercise",
        status: "todo"
    },
    {
        id: "blk-12",
        subjectId: "Revisão Geral",
        topic: "Flashcards da semana",
        startTime: "15:00",
        endTime: "17:00",
        color: "#8b5cf6",
        dayIndex: 4,
        type: "exercise",
        status: "todo"
    },

    // Saturday
    {
        id: "blk-13",
        subjectId: "Matemática",
        topic: "Exercícios ENEM",
        startTime: "09:00",
        endTime: "12:00",
        color: "#3b82f6",
        dayIndex: 5,
        type: "exercise",
        status: "todo"

    },

    // Sunday — rest (no blocks)
];
