export type BlockType = "leiture" | "revision" | "exercise" | "resume" | "exam";

export interface StudyBlock {
    id: string;
    subjectId: string;
    topic?: string;
    type?: BlockType;
    startTime: string; // "HH:MM"
    endTime: string;   // "HH:MM"
    color: ColorName;
    dayIndex: number; // 0=Monday, ..., 6=Sunday
    status: "todo" | "done";
}
export interface Subject {
    id: string;
    name: string;
    color: ColorName;
    isVisible: boolean;
}
export type ColorName =
    | "blue"
    | "amber"
    | "rose"
    | "teal"
    | "emerald"
    | "violet"
    | "orange"
    | "pink";

export const MOCK_SUBJECTS: Subject[] = [
    { id: "Matemática", name: "Matemática", color: "blue", isVisible: true },
    { id: "Física", name: "Física", color: "amber", isVisible: true },
    { id: "História", name: "História", color: "rose", isVisible: true },
    { id: "Inglês", name: "Inglês", color: "teal", isVisible: true },
    { id: "Química", name: "Química", color: "emerald", isVisible: true },
    { id: "Geografia", name: "Geografia", color: "violet", isVisible: true },
    { id: "Biologia", name: "Biologia", color: "emerald", isVisible: true },
    { id: "Português", name: "Português", color: "orange", isVisible: true },
    { id: "Revisão Geral", name: "Revisão Geral", color: "violet", isVisible: true },
];

export const MOCK_BLOCKS: StudyBlock[] = [
    // Monday
    {
        id: "blk-1",
        subjectId: "Matemática",
        topic: "Cálculo Diferencial",
        startTime: "08:00",
        endTime: "10:00",
        color: "blue",
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
        color: "amber",
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
        color: "rose",
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
        color: "teal",
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
        color: "blue",
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
        color: "emerald",
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
        color: "violet",
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
        color: "emerald",
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
        color: "amber",
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
        color: "orange",
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
        color: "teal",
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
        color: "violet",
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
        color: "blue",
        dayIndex: 5,
        type: "exercise",
        status: "todo"

    },

    // Sunday — rest (no blocks)
];
