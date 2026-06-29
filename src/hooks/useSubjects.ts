import { createBulkSubjectsWithTopicsAction, createSubjectAction, deleteSubjectAction, getSubjectsAction, updateSubjectAction, updateSubjectStatus } from "@/server/actions/subject.actions";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { indexSubjectById } from "@/server/normalizers/indexSubject";
import { metadataKeys } from "@/lib/query-keys";
import { topicsKeys, useTopics } from "./useTopics";
import { useMemo } from "react";
import { SubjectTree, TopicNode } from "@/types/types";

/***
 * Options
 * 
***/
export const subjectsKeys = {
    all: metadataKeys.subjects,
    tree: metadataKeys.subjectTree,
};

export const useSubjectsOptions = () => queryOptions({
    queryKey: subjectsKeys.all,
    queryFn: () => getSubjectsAction(),

});

/***
 * Hooks
 * 
***/
export function useSubjectsMap() {
    return useQuery({
        ...useSubjectsOptions(),
        select: (subjects) => indexSubjectById(subjects),
    });
};


export function useSubjects() {
    return useQuery(
        useSubjectsOptions()
    );
}


export function useCreateSubject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newSubject: { name: string; color: string }) => {
            return createSubjectAction(newSubject);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subjectsKeys.all });
            queryClient.invalidateQueries({ queryKey: topicsKeys.all });
        },
    });
}

export function useBulkCreateSubjects() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (subjects: { name: string; color: string; topics: string[] }[]) => {
            return createBulkSubjectsWithTopicsAction({ subjects });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subjectsKeys.all });
            queryClient.invalidateQueries({ queryKey: topicsKeys.all });
        },
    });
}

/**
 * Otimizado para construir a árvore em memória a partir de matérias e tópicos globais.
 * Evita uma query extra ao banco e aproveita o cache de metadados.
 */
export function useSubjectTree() {
    const { data: subjects, isLoading: isLoadingSubjects } = useSubjects();
    const { data: topicsData, isLoading: isLoadingTopics } = useTopics();

    const topics = topicsData?.topics;

    const tree = useMemo(() => {
        if (!subjects || !topics) return [];

        return subjects.map((s): SubjectTree => {
            const map = new Map<string, TopicNode>();
            const roots: TopicNode[] = [];
            const subjectsTopics = topics.filter(t => t.subjectId === s.id);
            // Primeiro criamos todos os nós
            subjectsTopics.forEach((t) => map.set(t.id, { ...t, children: [] }));

            // Depois organizamos a hierarquia
            subjectsTopics.forEach((t) => {
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

            return {
                subject: s,
                topics: roots,
            };
        });
    }, [subjects, topics]);

    return {
        data: tree,
        isLoading: isLoadingSubjects || isLoadingTopics,
    };
}

export function useSubjectOpen() {
    return useMutation({
        mutationFn: async (payload: { subjectId: string; isOpen: boolean; isArchived: boolean }) => {
            const { subjectId, isOpen, isArchived } = payload;
            return updateSubjectStatus(subjectId, isOpen, isArchived);
        },
    });
}

export function useToggleArchiveSubject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { subjectId: string; isOpen: boolean; isArchived: boolean }) => {
            const { subjectId, isOpen, isArchived } = payload;
            return updateSubjectStatus(subjectId, isOpen, isArchived);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subjectsKeys.all });
        },
    });
}

export function useDeleteSubject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (subjectId: string) => {
            return deleteSubjectAction(subjectId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subjectsKeys.all });
        },
    });
}
export function useUpdateSubject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updatedSubject: { id: string; name: string; color: string; icon?: string | null }) => {
            return updateSubjectAction(updatedSubject);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subjectsKeys.all });
        },
    });
}

