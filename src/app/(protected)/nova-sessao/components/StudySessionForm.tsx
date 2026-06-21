"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Circle,
    Plus,
    BookOpen,
    RotateCcw,
    Pencil,
    FileText,
    History,
    X,

} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useSubjects } from "@/hooks/useSubjects";
import { useCreateStudyLog, useLastStudyLog } from "@/hooks/useStudyLogs";
import { StudyLogInput } from "@/server/actions/studyLogs.action";
import { NewTopicDialog } from "../../materias/components/NewTopicDialog";
import { TopicSelector } from "./TopicTreeSelector";
import useSessionFormStore from "@/store/useSessionFormStore";
import useCronometerStore from "@/store/useCronometerStore";
import { getLocalDateForToday } from "@/lib/utils";
import { Cronometer } from "./Cronometer";

// --- Helpers ---

const calcDurationMinutes = (start?: Date, end?: Date): number => {
    if (!start || !end) return 0;
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
};

const toUtcDateOnly = (date: Date): Date =>
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

const getFormSubmitError = (form: FormData): string | null => {
    console.log("Validating form:", form);
    if (!form.subjectId) return "Selecione uma matéria.";
    if (!form.topicId) return "Selecione um tópico.";
    if (!form.study_date) return "Informe a data de estudo.";
    if (!form.start_time || !form.end_time) return "Informe o horário de início e fim.";

    const durationMinutes = calcDurationMinutes(form.start_time, form.end_time);
    if (durationMinutes <= 0) {
        return "A hora de fim deve ser maior que a hora de início.";
    }

    return null;
};



// --- Form State ---

interface FormData {
    subjectId: string;
    topicId: string;
    material_type: string;
    study_date: Date | undefined;
    start_time: Date | undefined;
    end_time: Date | undefined;
    notes: string;
}

const emptyForm: FormData = {
    subjectId: "",
    topicId: "",
    material_type: "",
    study_date: getLocalDateForToday(),
    start_time: undefined,
    end_time: undefined,
    notes: "",
};

export type StudyMode = "teoria" | "revisao" | "exercicios" | "resumo";

const STUDY_MODES: { value: StudyMode; label: string; icon: React.ReactNode }[] = [
    { value: "teoria", label: "Teoria", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { value: "revisao", label: "Revisão", icon: <RotateCcw className="h-3.5 w-3.5" /> },
    { value: "exercicios", label: "Exercícios", icon: <Pencil className="h-3.5 w-3.5" /> },
    { value: "resumo", label: "Resumo", icon: <FileText className="h-3.5 w-3.5" /> },
];


// --- Component ---

export function StudySessionForm() {
    const router = useRouter();
    const createStudyLog = useCreateStudyLog();

    const sessionForm = useSessionFormStore((state) => state.form);

    const updateSelectionForm = useSessionFormStore((state) => state.updateForm);
    const resetSelectionForm = useSessionFormStore((state) => state.resetForm);

    const [selectionForm, setSelectionForm] = useState<FormData>(emptyForm);

    const isCronometerRunning = useCronometerStore((state) => state.cronometer.isRunning);
    const resetCronometer = useCronometerStore((state) => state.resetCronometer);

    const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
    const { data: lastLog } = useLastStudyLog();

    const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);
    const [topicSelectOpen, setTopicSelectOpen] = useState(false);

    const [hiddenLastLogId, setHiddenLastLogId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New UI-only state
    const [studyMode, setStudyMode] = useState<StudyMode>("teoria");


    const showResume = !!lastLog && hiddenLastLogId !== lastLog.id;

    const handleResumeLastSession = () => {
        if (!lastLog) return;
        setSelectionForm((prev) => ({
            ...prev,
            subjectId: lastLog.topic.subjectId,
            topicId: lastLog.topicId,
            notes: lastLog.notes || "",
        }));
        setStudyMode(lastLog.material_type as StudyMode || "teoria");
        toast.info("Dados da última sessão carregados!");
        setHiddenLastLogId(lastLog.id);
    };

    // Time/date fields are controlled by Cronometer via Zustand store.
    const submitForm = useMemo<FormData>(
        () => ({
            ...selectionForm,
            start_time: sessionForm.start_time,
            end_time: sessionForm.end_time,
            study_date: sessionForm.study_date ?? selectionForm.study_date,
        }),
        [selectionForm, sessionForm.start_time, sessionForm.end_time, sessionForm.study_date]
    );


    // Warn on unsaved data
    useEffect(() => {
        const isDirty =
            !!selectionForm.subjectId ||
            !!selectionForm.topicId ||
            !!selectionForm.notes ||
            !!selectionForm.start_time ||
            !!selectionForm.end_time ||
            isCronometerRunning;

        if (!isDirty) return;

        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "Você tem uma sessão de estudo em andamento. Deseja realmente sair?";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [selectionForm, isCronometerRunning]);

    // Keep store IDs as the single global source for subject/topic selection.
    useEffect(() => {
        updateSelectionForm({
            subjectId: selectionForm.subjectId,
            topicId: selectionForm.topicId,
        });
    }, [selectionForm.subjectId, selectionForm.topicId, updateSelectionForm]);

    // --- Handlers ---

    const handleSubjectChange = (subjectId: string) => {
        setSelectionForm((prev) => ({ ...prev, subjectId, topicId: "" }));
        updateSelectionForm({ subjectId, topicId: "" });
    };

    const handleTopicChange = (topicId: string) => {
        setTopicSelectOpen(false);
        setSelectionForm((prev) => ({ ...prev, topicId }));
        updateSelectionForm({ topicId });
    };


    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log("Submitting form:", submitForm);

        const submitError = getFormSubmitError(submitForm);
        if (submitError) {
            toast.error(submitError);
            setIsSubmitting(false);
            return;
        }

        const studyDate = toUtcDateOnly(submitForm.study_date!);
        const startTime = submitForm.start_time!;
        const endTime = submitForm.end_time!;
        const durationMinutes = calcDurationMinutes(submitForm.start_time, submitForm.end_time);

        const data: StudyLogInput = {
            topic_id: submitForm.topicId,
            study_date: studyDate,
            material_type: studyMode,
            start_time: startTime,
            end_time: endTime,
            duration_minutes: durationMinutes,
            notes: submitForm.notes || undefined,
        };


        try {
            await createStudyLog.mutateAsync(data);
            toast.success("Sessão de estudo registrada!");
            setSelectionForm(emptyForm);
            resetSelectionForm();
            resetCronometer();
            router.push("/");
        } catch {
            setIsSubmitting(false);
            toast.error("Erro ao registrar sessão.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormReadyToSubmit = !getFormSubmitError(submitForm);

    return (
        <>
            <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background py-4 px-4">
                <form onSubmit={onSubmit} className="max-w-5xl mx-auto space-y-4">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                Nova Sessão de Estudo
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Registre e acompanhe seu progresso de aprendizado
                            </p>
                        </div>
                        {isCronometerRunning && (
                            <Badge variant="destructive" className="animate-pulse gap-1.5 px-3 py-1 text-xs font-medium">
                                <span className="h-1.5 w-1.5 rounded-full bg-white inline-block" />
                                Cronômetro ativo
                            </Badge>
                        )}
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1  gap-4">

                        {/* LEFT COLUMN — Subject, Topic, Material, Notes */}
                        <div className="space-y-4">
                            {lastLog && showResume && (
                                <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden transition-all hover:border-primary/30 py-2">
                                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-full shrink-0">
                                                <History className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-foreground">Retomar última sessão?</p>
                                                <p className="text-[10px] text-muted-foreground truncate flex-col flex">
                                                    <span className="text-xs">{lastLog.topic.subject.name}</span>
                                                    <span>{lastLog.topic.name}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleResumeLastSession}
                                            className="bg-background hover:bg-primary hover:text-primary-foreground border-primary/20 text-[10px] h-7 px-2 transition-colors shrink-0 self-end sm:self-auto"
                                        >
                                            <RotateCcw className="h-3 w-3 mr-1" />
                                            Retomar dados
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setHiddenLastLogId(lastLog.id)}
                                            className="text-muted-foreground h-6 w-6"
                                            title="Fechar notificação"
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="shadow-lg border-border/60 bg-card/95 py-3">
                                <CardHeader className=" ">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        Formulário de Registro
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 space-y-3">
                                    {/* Matéria */}
                                    <div className="space-y-1 grid grid-cols-2 gap-4">
                                        <div className="">
                                            <Label className="text-xs font-medium text-foreground/80">Matéria</Label>
                                            <div className="flex items-center gap-1' min-w-0">
                                                <Select value={selectionForm.subjectId} onValueChange={handleSubjectChange}>
                                                    <SelectTrigger className="h-9 min-w-0 flex-1 focus-visible:ring-primary/40 bg-background/60">
                                                        <SelectValue placeholder="Selecione uma matéria" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingSubjects ? (
                                                            <SelectItem value="loading" disabled>
                                                                Carregando...
                                                            </SelectItem>
                                                        ) : subjects.length === 0 ? (
                                                            <SelectItem value="empty" disabled>
                                                                Nenhuma matéria cadastrada
                                                            </SelectItem>
                                                        ) : (
                                                            subjects.map((subject) => (
                                                                <SelectItem key={subject.id} value={subject.id}>
                                                                    <span className="flex items-center gap-2 text-sm">
                                                                        <span
                                                                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                                                            style={{ backgroundColor: subject.color }}
                                                                        />
                                                                        {subject.name}
                                                                    </span>
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => router.push("/materias")}
                                                    title="Cadastrar matéria"
                                                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>


                                        {/* Tópico */}
                                        <div className="gap-1">
                                            <Label className="text-xs font-medium text-foreground/80">Tópico Estudado</Label>
                                            <div className="flex items-center gap min-w-0">
                                                <div className="flex-1 min-w-0">

                                                    <TopicSelector
                                                        open={topicSelectOpen}
                                                        onOpenChange={setTopicSelectOpen}
                                                        subjectId={selectionForm.subjectId}
                                                        selectedTopicId={selectionForm.topicId}
                                                        onTopicSelect={(topicId) => handleTopicChange(topicId)}
                                                    />

                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setNewTopicDialogOpen(true)}
                                                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                                                    disabled={!selectionForm.subjectId}
                                                    title="Novo tópico"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tipo de material */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-foreground/80">
                                            Modo de Estudo
                                        </Label>
                                        <RadioGroup
                                            value={studyMode}
                                            onValueChange={(v) => setStudyMode(v as StudyMode)}
                                            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                                        >
                                            {STUDY_MODES.map((mode) => (
                                                <div key={mode.value} className="relative">
                                                    <RadioGroupItem
                                                        value={mode.value}
                                                        id={`mode-${mode.value}`}
                                                        className="sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={`mode-${mode.value}`}
                                                        className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 px-1 py-1 cursor-pointer text-[8px] font-medium transition-all select-none
                                                            ${studyMode === mode.value
                                                                ? "border-primary bg-primary/10 text-primary"
                                                                : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
                                                            }`}
                                                    >
                                                        {mode.icon}
                                                        {mode.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    {/* Anotações */}
                                    <div className="space-y-1">
                                        <Label htmlFor="notes" className="text-xs font-medium text-foreground/80">
                                            Anotações{" "}
                                            <span className="text-muted-foreground font-normal">(opcional)</span>
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Resumo, pontos-chave, dúvidas..."
                                            rows={3}
                                            value={selectionForm.notes}
                                            className="text-sm bg-background/40 focus-visible:ring-primary/40 resize-none"
                                            onChange={(e) =>
                                                setSelectionForm((prev) => ({ ...prev, notes: e.target.value }))
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Time tracking */}
                        <div className="space-y-3">
                            <Cronometer />

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="submit"
                                    disabled={createStudyLog.isPending || !isFormReadyToSubmit}
                                    className="w-full  font-semibold h-10 shadow-md"
                                    size="default"
                                >
                                    {createStudyLog.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <Circle className="h-4 w-4 animate-spin" />
                                            Salvando...
                                        </span>
                                    ) : (
                                        "Registrar Sessão"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                </form >
            </div >

            {/* Dialogs */}
            {
                selectionForm.subjectId && (
                    <NewTopicDialog
                        isOpen={newTopicDialogOpen}
                        onOpenChange={setNewTopicDialogOpen}
                        subjectId={selectionForm.subjectId}
                        onTopicCreated={(topic) => {
                            setSelectionForm((prev) => ({ ...prev, topicId: topic.id }));
                        }}
                    />
                )
            }

            {/* Submitting Overlay */}
            {
                isSubmitting && (
                    <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center">
                        <Card className="shadow-xl border-border/60">
                            <CardContent className="flex items-center gap-3 px-8 py-5">
                                <Circle className="animate-spin h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Registrando sessão...</span>
                            </CardContent>
                        </Card>
                    </div>
                )
            }
        </>
    );
}