import { createBulkSubjectsWithTopicsAction, createSubjectAction, deleteSubjectAction, getSubjectsAction, getSubjectsTrees, getSubjectsWithTopicsAction, updateSubjectAction } from "@/server/actions/subject.actions";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { indexSubjectById } from "@/server/normalizers/indexSubject";

/***
 * Options
 * 
***/
export const subjectsKeys = {
    all: ["subjects"] as const,
    tree: ["subjects", "tree"] as const,
    list: ["subjects", "list"] as const,
    withTopics: ["subjects", "with-topics"] as const,
};

export const useSubjectsOptions = () => queryOptions({
    queryKey: subjectsKeys.list,
    queryFn: () => getSubjectsAction(),
});

export const useSubjectsWithTopicsOptions = () => queryOptions({
    queryKey: subjectsKeys.withTopics,
    queryFn: () => getSubjectsWithTopicsAction(),
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

export function useSubjectsWithTopics() {
    return useQuery(useSubjectsWithTopicsOptions());
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

export function useSubjectTree() {
    return useQuery({
        queryKey: subjectsKeys.tree,
        queryFn: () => getSubjectsTrees(),
        staleTime: Infinity,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
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
