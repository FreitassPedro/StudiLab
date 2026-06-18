import { createStudyLogAction, deleteStudyLogAction, getLastStudyLogAction, StudyLogInput, updateStudyLogAction, UpdateStudyLogInput, getStudyLogDetailsAction } from "@/server/actions/studyLogs.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActivityAnalysis } from "./useActivity";
import { activityKeys } from "@/lib/query-keys";

/**
 * Hook para o histórico de logs em um intervalo.
 * Agora utiliza o useActivityAnalysis para compartilhar cache com gráficos e sumários.
 */
export function useStudyLogsHistory(startDate: Date, endDate: Date) {
    const { data, ...rest } = useActivityAnalysis(startDate, endDate);
    return { data: data?.logs, ...rest };
}

export function useStudyLogsRange(startDate: Date, endDate: Date) {
    return useStudyLogsHistory(startDate, endDate);
}

/**
 * Hook para estatísticas resumidas.
 * Agora deriva os dados do useActivityAnalysis, evitando query extra.
 */
export function useSummaryStats(startDate: Date, endDate: Date) {
    const { data, ...rest } = useActivityAnalysis(startDate, endDate);
    return { data: data?.summary, ...rest };
}

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
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
}

export function useUpdateStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateStudyLogInput) => updateStudyLogAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
}

export function useStudyLogDetails(logId: string) {
    return useQuery({
        queryKey: activityKeys.detail(logId),
        queryFn: () => getStudyLogDetailsAction(logId),
        enabled: !!logId,
    });
}

export function useDeleteStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteStudyLogAction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
}

/**
 * Hoje simplificado para usar o hook central
 */
export function useTodayStudyLogs() {
    const today = new Date();
    const { data, isLoading } = useActivityAnalysis(today, today);
    return { data: data?.logs, isLoading };
}
