import { postCreateTopic, getTopicsAction, getTopicsBySubjectAction, deleteTopicAction, updateTopicAction, getTopicsTreeAction } from "@/server/actions/topic.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { Topic } from "@/types/types";

/*
keyss
*/
export const topicsKeys = {
    all: ['topics'] as const,
    tree: ['topics', 'tree'] as const,
    bySubject: (subjectId?: string) => ['topics', 'by-subject', subjectId] as const,
};

/// ********************
//
// Options
//
// ********************
export const topicsBySubjectQueryOptions = (subjectId?: string) => ({
    queryKey: topicsKeys.bySubject(subjectId),
    queryFn: () => getTopicsBySubjectAction(subjectId!),
    enabled: !!subjectId,
});

export function useTopics() {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({
        queryKey: topicsKeys.all,
        queryFn: () => getTopicsAction(userId!),
        enabled: !!userId,
        select: (topics) => {
            const topicsMap: Record<string, typeof topics[number]> = {};
            topics.forEach(topic => {
                topicsMap[topic.id] = topic;
            });
            return { topics, topicsMap };
        },
    });
}

export function useTopicsBySubject(subjectId?: string) {
    return useQuery(topicsBySubjectQueryOptions(subjectId));
}

export function useTopicsMap() {
    const { data } = useTopics();
    return (data?.topicsMap ?? {}) as Record<string, Topic>;
}

export function useTopicsTree() {
    const userId = useAuthStore((state) => state.user?.id);
    return useQuery({
        queryKey: topicsKeys.tree,
        queryFn: () => getTopicsTreeAction(userId!),
        enabled: !!userId,
    });
}



export function useCreateTopic() {
    const queryClient = useQueryClient();

   

    return useMutation({
        mutationFn: ({ name, subjectId, parentId }: { name: string; subjectId: string, parentId: string | null }) =>
            postCreateTopic(name, subjectId, parentId),
        onSuccess: (topic, variables) => {
            queryClient.setQueryData(
                topicsKeys.bySubject(variables.subjectId),
                (currentTopics: typeof topic[] | undefined) => {
                    if (!currentTopics) return [topic];
                    if (currentTopics.some((t) => t.id === topic.id)) return currentTopics;
                    return [...currentTopics, topic];
                }
            );

            queryClient.invalidateQueries({ queryKey: topicsKeys.bySubject(variables.subjectId) });
            queryClient.invalidateQueries({ queryKey: topicsKeys.all });
            queryClient.invalidateQueries({ queryKey: ["subjects", "tree"] });
        },
        
    });
}

export function useDeleteTopic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (topicId: string) => deleteTopicAction(topicId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: topicsKeys.all });
            queryClient.invalidateQueries({ queryKey: ["subjects", "tree"] });
        },
    });
}

export function useUpdateTopic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ topicId, name }: { topicId: string; name: string }) =>
            updateTopicAction(topicId, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: topicsKeys.all });
            queryClient.invalidateQueries({ queryKey: ["subjects", "tree"] });
        },
    });
}