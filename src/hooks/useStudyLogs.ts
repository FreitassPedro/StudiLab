import { createStudyLogAction, deleteStudyLogAction, getLastStudyLogAction, StudyLogInput, updateStudyLogAction, UpdateStudyLogInput, getStudyLogDetailsAction } from "@/server/actions/studyLogs.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActivityAnalysis, useTodayActivity } from "./useActivity";
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
    });
}

export function useCreateStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: StudyLogInput) => createStudyLogAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            queryClient.invalidateQueries({ queryKey: activityKeys.range(new Date(), new Date()) });
            queryClient.invalidateQueries({ queryKey: ["studyLogs"] });
        },
    });
}

export function useUpdateStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateStudyLogInput) => updateStudyLogAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            queryClient.invalidateQueries({ queryKey: ["studyLogs"] });
        },
    });
}

export function useStudyLogDetails(logId: string, enabled = true) {
    return useQuery({
        queryKey: activityKeys.detail(logId),
        queryFn: () => getStudyLogDetailsAction(logId),
        enabled: !!logId && enabled,
    });
}

export function useDeleteStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteStudyLogAction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            queryClient.invalidateQueries({ queryKey: ["studyLogs"] });
        },
    });
}

/**
 * Hoje simplificado — usa o hook estabilizado useTodayActivity
 */
export function useTodayStudyLogs() {
    const { data, isLoading } = useTodayActivity();
    return { data: data?.logs, isLoading };
}
