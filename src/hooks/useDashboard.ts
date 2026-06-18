import { useTodayActivity } from "./useActivity";
import { useSubjects, useSubjectsMap } from "./useSubjects";
import { useTopics } from "./useTopics";

/**
 * Hook centralizado para o Dashboard.
 * Agora utiliza os hooks unificados para aproveitar o cache global.
 */
export function useDashboardData() {
    const { data: activityData, isLoading: isLoadingActivity } = useTodayActivity();
    const { data: subjects, isLoading: isLoadingSubjects } = useSubjects();
    const { data: topicsData, isLoading: isLoadingTopics } = useTopics();

    const isLoading = isLoadingActivity || isLoadingSubjects || isLoadingTopics;

    return {
        data:
            activityData && subjects && topicsData ? {
                ...activityData, // Inclui logs, summary e charts processados no servidor
                subjects: subjects,
                topics: topicsData.topics,
                topicsMap: topicsData.topicsMap,
            } : null,
        isLoading,
    };
}

/**
 * Derivados para manter a compatibilidade com componentes existentes
 */
export function useDashboardTodayLogs() {
    const { data } = useDashboardData();
    return data?.logs;
}

export function useDashboardSubjectsMap() {
    return useSubjectsMap();
}

export function useDashboardTopicsMap() {
    const { data: topicsData } = useTopics();
    return topicsData?.topicsMap ?? {};
}
