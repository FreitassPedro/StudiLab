import { create } from 'zustand';

interface FormData {
    subjectId: string;
    topicId: string;
    start_time?: Date;
    end_time?: Date;
    study_date?: Date;
}

interface SessionFormState {
    form: FormData;

    setForm: (form: FormData) => void;
    updateForm: (partial: Partial<FormData>) => void;
    resetForm: () => void;
}

const initialFormData: FormData = {
    subjectId: '',
    topicId: '',
    start_time: undefined,
    end_time: undefined

};

const useSessionFormStore = create<SessionFormState>((set) => ({
    form: initialFormData,

    setForm: (form) => set({ form }),
    updateForm: (partial) => set((state) => ({
        form: { ...state.form, ...partial }
    })),
    resetForm: () => set({
        form: initialFormData
    })
}));

export default useSessionFormStore;