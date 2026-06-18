import { useMemo } from "react";
import { postCreateTopic, getTopicsAction, deleteTopicAction, updateTopicAction } from "@/server/actions/topic.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Topic, TopicNode } from "@/types/types";
import { activityKeys, metadataKeys } from "@/lib/query-keys";

const STALE_TIME = 1000 * 60 * 60 * 12; // 12 horas para metadados

/*
keys
*/
export const topicsKeys = {
    all: metadataKeys.topics,
    tree: metadataKeys.topicTree,
};

/// ********************
//
// Options
//
// ********************
export function useTopics() {
    return useQuery({
        queryKey: topicsKeys.all,
        queryFn: () => getTopicsAction(),
        staleTime: STALE_TIME,
        select: (topics: Topic[]) => {
            const topicsMap: Record<string, Topic> = {};
            topics.forEach(topic => {
                topicsMap[topic.id] = topic;
            });
            return {
                topics,
                topicsMap
            };
        },
    });
}

export function useTopicBySubject(subjectId: string) {
    return useQuery({
        queryKey: topicsKeys.all,
        queryFn: () => getTopicsAction(),
        staleTime: STALE_TIME,
        select: (topics: Topic[]) => {
            return topics.filter(topic => topic.subjectId === subjectId);
        },
    });
}

export function useTopicsMap() {
    const { data } = useTopics();
    return data?.topicsMap || {};
}

/**
 * Otimizado para construir a árvore em memória a partir de todos os tópicos.
 */
export function useTopicsTree() {
    return useQuery({
        queryKey: topicsKeys.tree,
        queryFn: () => getTopicsAction(),
        staleTime: STALE_TIME,
        select: (topics: Topic[]) => {

            if (!topics?.length) return [];

            const map = new Map<string, TopicNode>();

            // Primeiro criamos todos os nós
            topics.forEach((t) => map.set(t.id, { ...t, children: [] }));

            const roots: TopicNode[] = [];
            // Depois organizamos a hierarquia
            topics.forEach((t) => {
                const node = map.get(t.id)!;
                if (t.parentId) {
                    const parent = map.get(t.parentId);
                    if (parent) {
                        parent.children.push(node);
                    } else {
                        roots.push(node);
                    }
                } else {
                    roots.push(node);
                }
            });

            return roots;
        }
    });
}


interface CreateTopicInput {
    name: string;
    subjectId: string;
    parentId?: string | null;
}
export function useCreateTopic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (topicInput: CreateTopicInput) =>
            postCreateTopic(topicInput.name, topicInput.subjectId, topicInput.parentId ?? null),
        onSuccess: () => {
            // Invalidação em cascata conforme DATA_FETCHING.md
            queryClient.invalidateQueries({ queryKey: topicsKeys.all });
            queryClient.invalidateQueries({ queryKey: metadataKeys.subjects });
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
        },

    });
}

export function useDeleteTopic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (topicId: string) => deleteTopicAction(topicId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: topicsKeys.all });
            queryClient.invalidateQueries({ queryKey: metadataKeys.subjects });
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
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
            queryClient.invalidateQueries({ queryKey: metadataKeys.subjects });
            queryClient.invalidateQueries({ queryKey: activityKeys.all });
        },
    });
}