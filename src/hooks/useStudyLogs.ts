import { createStudyLogAction, deleteStudyLogAction, getLastStudyLogAction, StudyLogInput, updateStudyLogAction, UpdateStudyLogInput, getStudyLogDetailsAction } from "@/server/actions/studyLogs.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActivityAnalysis, useTodayActivity } from "./useActivity";
import { activityKeys, userStatsKeys } from "@/lib/query-keys";

/**
 * Hook para o histórico de logs em um intervalo.
 * Utiliza o useActivityAnalysis para compartilhar cache com gráficos e sumários.
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
 * Deriva os dados do useActivityAnalysis, evitando query extra.
 */
export function useSummaryStats(startDate: Date, endDate: Date) {
    const { data, ...rest } = useActivityAnalysis(startDate, endDate);
    return { data: data?.summary, ...rest };
}

/**
 * Hook para o último log registrado.
 * Cacheado pelo servidor via unstable_cache com tag study-logs-{userId}.
 * Invalidado automaticamente quando o usuário cria/edita/deleta um log.
 * staleTime: 12h pois é metadado que muda raramente e a invalidação de tag garante frescor.
 */
export function useLastStudyLog() {
    return useQuery({
        queryKey: ["studyLogs", "last"],
        queryFn: () => getLastStudyLogAction(),
        staleTime: 1000 * 60 * 60 * 12,    // 12h — tag server-side invalida quando necessário
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
}

export function useCreateStudyLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: StudyLogInput) => createStudyLogAction(data),
        onSuccess: () => {
            // Invalida TODOS os ranges de atividade (inclui today, semana, etc.)
            // activityKeys.all é o prefixo ['activity'] — invalida toda a hierarquia
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
            // Invalida o cache de último log
            queryClient.invalidateQueries({ queryKey: ["studyLogs", "last"] });
            // Invalida userStats para atualizar streak/totais no header
            queryClient.invalidateQueries({ queryKey: userStatsKeys.current() });
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
            queryClient.invalidateQueries({ queryKey: userStatsKeys.current() });
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
            queryClient.invalidateQueries({ queryKey: userStatsKeys.current() });
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
