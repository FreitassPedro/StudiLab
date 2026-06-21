import { createBulkSubjectsWithTopicsAction, createSubjectAction, deleteSubjectAction, getSubjectsAction, updateSubjectAction, updateSubjectStatus } from "@/server/actions/subject.actions";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { indexSubjectById } from "@/server/normalizers/indexSubject";
import { metadataKeys } from "@/lib/query-keys";
import { useTopics } from "./useTopics";
import { useMemo } from "react";
import { Subject, SubjectTree, Topic, TopicNode } from "@/types/types";

const STALE_TIME = 1000 * 60 * 60; // 1 hora para metadados

/***
 * Options
 * 
***/
export const subjectsKeys = {
    all: metadataKeys.subjects,
    tree: metadataKeys.subjectTree,
    list: metadataKeys.subjects,
};

export const useSubjectsOptions = () => queryOptions({
    queryKey: subjectsKeys.list,
    queryFn: () => getSubjectsAction(),
    staleTime: STALE_TIME,
    gcTime: 1000 * 60 * 30, // 30 minutos para coleta de lixo
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

    const tree = useMemo(() => {
        if (!subjects || !topicsData?.topics) return [];

        return subjects.map((s): SubjectTree => {
            const subjectTopics = topicsData.topics.filter(t => t.subjectId === s.id);
            const map = new Map<string, TopicNode>();
            
            // Primeiro criamos todos os nós
            subjectTopics.forEach((t) => map.set(t.id, { ...t, children: [] }));

            const roots: TopicNode[] = [];
            // Depois organizamos a hierarquia
            subjectTopics.forEach((t) => {
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
    }, [subjects, topicsData?.topics]);

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
        mutationFn: async (updatedSubject: { id: string; name: string; color: string }) => {
            return updateSubjectAction(updatedSubject);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subjectsKeys.all });
        },
    });
}

