import { format } from "date-fns";

/**
 * Padroniza a geração de chaves para o React Query
 * Evita chaves "sinônimas" que apontam para o mesmo dado
 */
export const activityKeys = {
    all: ['activity'] as const,
    range: (startDate: Date, endDate: Date) => {
        const start = format(startDate, 'yyyy-MM-dd');
        const end = format(endDate, 'yyyy-MM-dd');
        return ['activity', 'range', start, end] as const;
    },
    today: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return ['activity', 'range', today, today] as const;
    },
    detail: (id: string) => ['activity', 'detail', id] as const,
};

export const metadataKeys = {
    all: ['metadata'] as const,
    subjects: ['metadata', 'subjects'] as const,
    topics: ['metadata', 'topics'] as const,
    subjectTree: ['metadata', 'subjects', 'tree'] as const,
};
