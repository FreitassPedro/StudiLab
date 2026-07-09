import { useQuery } from "@tanstack/react-query";
import { getUserStatsAction } from "@/server/actions/userStats.action";
import { userStatsKeys } from "@/lib/query-keys";

/**
 * Hook leve para leitura das métricas pré-calculadas do usuário.
 *
 * Custo de rede: 1 linha da tabela UserStats (lookup por chave primária).
 * Usado no Dashboard (foguinho/streak), Perfil e qualquer componente de exibição.
 *
 * Os dados são invalidados automaticamente via React Query sempre que
 * `recomputeUserStats()` é chamado nas mutações de StudyLog.
 */
export function useUserStats() {
    return useQuery({
        queryKey: userStatsKeys.current(),
        queryFn: () => getUserStatsAction(),
        // Stats mudam somente quando o usuário cria/edita/deleta um log.
        // 30 minutos é um bom equilíbrio entre frescor e performance.
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24, // 24h no cache
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
}
