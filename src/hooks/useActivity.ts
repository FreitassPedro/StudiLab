import { useQuery } from "@tanstack/react-query";
import { getHistoryAnalysisAction } from "@/server/actions/analysis.action";
import { activityKeys } from "@/lib/query-keys";
import { getStudyLogDetailsAction } from "@/server/actions/studyLogs.action";

/**
 * Hook central para análise de atividade em um intervalo de datas.
 * Substitui hooks redundantes como useStudyLogsRange e useSummaryStats.
 */
export function useActivityAnalysis(startDate: Date, endDate: Date) {
    return useQuery({
        queryKey: activityKeys.range(startDate, endDate),
        queryFn: () => getHistoryAnalysisAction(startDate, endDate),

        staleTime: Infinity, // Mantemos os dados em cache indefinidamente, pois são históricos e não mudam.
        gcTime: 1000 * 60 * 60 * 24, // 24 horas para coleta de lixo, caso não seja usado.

        refetchOnWindowFocus: false, // Não refazemos a query ao focar a janela, pois os dados são históricos.
        refetchOnReconnect: false, // Não refazemos a query ao reconectar, pois os dados são históricos.
        refetchOnMount: false, // Não refazemos a query ao montar, pois os dados são históricos.

    });
}

/**
 * Hook para buscar hoje. Pode ser usado no Dashboard e no Histórico.
 */
export function useTodayActivity() {
    const today = new Date();
    return useActivityAnalysis(today, today);
}

/**
 * Hook para detalhes de um log específico.
 */
export function useActivityDetail(logId: string) {
    return useQuery({
        queryKey: activityKeys.detail(logId),
        queryFn: () => getStudyLogDetailsAction(logId),
        enabled: !!logId,
        staleTime: 1000 * 60 * 30, // Detalhes mudam pouco
    });
}

// Re-exportando para manter compatibilidade enquanto refatoramos outros arquivos
export { useActivityAnalysis as useHistoryAnalysis };
