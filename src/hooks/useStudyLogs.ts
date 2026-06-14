import { createStudyLogAction, deleteStudyLogAction, getLastStudyLogAction, getStudyLogsByDateAction, getSummaryStatsAction, getTodayStudyLogsAction, StudyLogInput, updateStudyLogAction, UpdateStudyLogInput } from "@/server/actions/studyLogs.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDay } from "date-fns";
import { useAuthStore } from "@/store/useAuthStore";
import { getLocalDateForToday } from "@/lib/utils";

const getDateKey = (date: Date) => date.toDateString();

export const studyLogsByDateQUeryOptions = (startDate: Date, endDate: Date, userId?: string) => ({
    queryKey: ["studyLogs", "range", getDateKey(startDate), getDateKey(endDate), userId],
    queryFn: () => getStudyLogsByDateAction({ startDate, endDate, userId: userId! }),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutos
});

export const summaryStatsQueryOptions = (startDate: Date, endDate: Date, userId?: string) => ({
    queryKey: ["summaryStats", "range", getDateKey(startDate), getDateKey(endDate), userId],
    queryFn: () => getSummaryStatsAction(startDate, endDate, userId!),
    enabled: !!startDate && !!endDate && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
});

export function useLastStudyLog() {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({
        queryKey: ["studyLogs", "last", userId],
        queryFn: () => getLastStudyLogAction(userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

export function useCreateStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: StudyLogInput) => createStudyLogAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studyLogs"] });
            queryClient.invalidateQueries({ queryKey: ["summaryStats"] });
            queryClient.invalidateQueries({ queryKey: ["charts"] });
        },
    });
}

export function useUpdateStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateStudyLogInput) => updateStudyLogAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studyLogs"] });
            queryClient.invalidateQueries({ queryKey: ["summaryStats"] });
            queryClient.invalidateQueries({ queryKey: ["charts"] });
        },
    });
}

export function useDeleteStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteStudyLogAction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["studyLogs"] });
            queryClient.invalidateQueries({ queryKey: ["summaryStats"] });
            queryClient.invalidateQueries({ queryKey: ["charts"] });
        },
    });
}

export function useStudyLogsHistory(startDate: Date, endDate: Date) {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({
        ...studyLogsByDateQUeryOptions(startDate, endDate, userId),
        enabled: !!userId,
    });
}


export function useTodayStudyLogs() {
    const userId = useAuthStore((state) => state.user?.id);

    // Obter a data local do cliente para passar ao servidor
    // Isso garante que usuários em diferentes timezones recebam os dados corretos
    const todayDate = getLocalDateForToday();

    return useQuery({
        queryKey: ["studyLogs", "today", userId, todayDate.toDateString()],
        queryFn: () => getTodayStudyLogsAction(userId!, todayDate),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

export function useStudyLogsRange(startDate: Date, endDate: Date) {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({
        ...studyLogsByDateQUeryOptions(startDate, endDate, userId),
        enabled: !!userId,
    });
}

export function useSummaryStats(startDate: Date, endDate: Date) {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({
        ...summaryStatsQueryOptions(startDate, endDate, userId),
        enabled: !!userId,
    });
}
