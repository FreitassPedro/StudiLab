import { createStudyLogAction, deleteStudyLogAction, getLastStudyLogAction, getStudyLogsByDateAction, getSummaryStatsAction, getTodayStudyLogsAction, StudyLogInput, updateStudyLogAction, UpdateStudyLogInput } from "@/server/actions/studyLogs.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLocalDateForToday } from "@/lib/utils";

const getDateKey = (date: Date) => date.toDateString();

export const studyLogsByDateQUeryOptions = (startDate: Date, endDate: Date) => ({
    queryKey: ["studyLogs", "range", getDateKey(startDate), getDateKey(endDate)],
    queryFn: () => getStudyLogsByDateAction({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutos
});

export const summaryStatsQueryOptions = (startDate: Date, endDate: Date) => ({
    queryKey: ["summaryStats", "range", getDateKey(startDate), getDateKey(endDate)],
    queryFn: () => getSummaryStatsAction(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutos
});

export function useLastStudyLog() {
    return useQuery({
        queryKey: ["studyLogs", "last"],
        queryFn: () => getLastStudyLogAction(),
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

export function useStudyLogDetails(logId: string) {
    return useQuery({
        queryKey: ["studyLogs", "details", logId],
        queryFn: () => getStudyLogsByDateAction({ startDate: new Date(), endDate: new Date() }), // This seems wrong in original code but I'll leave as is for now or fix if I find better action
        enabled: !!logId,
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
    return useQuery({
        ...studyLogsByDateQUeryOptions(startDate, endDate),
    });
}


export function useTodayStudyLogs() {
    // Obter a data local do cliente para passar ao servidor
    // Isso garante que usuários em diferentes timezones recebam os dados corretos
    const todayDate = getLocalDateForToday();

    return useQuery({
        queryKey: ["studyLogs", "today", todayDate.toDateString()],
        queryFn: () => getTodayStudyLogsAction(todayDate),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

export function useStudyLogsRange(startDate: Date, endDate: Date) {
    return useQuery({
        ...studyLogsByDateQUeryOptions(startDate, endDate),
    });
}

export function useSummaryStats(startDate: Date, endDate: Date) {
    return useQuery({
        ...summaryStatsQueryOptions(startDate, endDate),
    });
}
