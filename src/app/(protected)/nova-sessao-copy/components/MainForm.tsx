import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Play, Pause, RotateCcw, CheckCircle2, Minimize2, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Glass } from "./Glass";
import { useSubjects } from "@/hooks/useSubjects";
import { useCreateStudyLog } from "@/hooks/useStudyLogs";
import useCronometerStore from "@/store/useCronometerStore";
import useSessionFormStore from "@/store/useSessionFormStore";
import { getLocalDateForToday } from "@/lib/utils";
import { StudyLogInput } from "@/server/actions/studyLogs.action";
import { usePageTitleWithCronometer } from "@/hooks/usePageTitleWithCronometer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTopicBySubject } from "@/hooks/useTopics";
import { Cronometer } from "./Cronometer";

const GOALS = [25, 45, 60, 90];
const hexToRgba = (hex: string, a: number) => {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
};

interface MainSectionProps {
    zenMode: boolean;
    setZenMode: (val: boolean) => void;
    isDetailsOpen: boolean;
    setIsDetailsOpen: (val: boolean) => void;
}

export function MainSection({
    zenMode,
    setZenMode,
    isDetailsOpen,
    setIsDetailsOpen
}: MainSectionProps) {
    const router = useRouter();
    const createStudyLog = useCreateStudyLog();

    // Stores
    const form = useSessionFormStore((state) => state.form);
    const resetForm = useSessionFormStore((state) => state.resetForm);
    const updateForm = useSessionFormStore((state) => state.updateForm);

    const isCronometerRunning = useCronometerStore((state) => state.cronometer.isRunning);
    const cronometerStartTime = useCronometerStore((state) => state.cronometer.startTime);
    const cronometerEndTime = useCronometerStore((state) => state.cronometer.endTime);
    const updateCronometer = useCronometerStore((state) => state.updateCronometer);
    const resetCronometer = useCronometerStore((state) => state.resetCronometer);
    const startTicking = useCronometerStore((state) => state.startTicking);
    const stopTicking = useCronometerStore((state) => state.stopTicking);
    const seconds = useCronometerStore((state) => state.cronometer.seconds);

    // Local UI state
    const [selectedGoal, setSelectedGoal] = useState(50);
    const [timerSize, setTimerSize] = useState(320);

    useEffect(() => {
        const handleResize = () => {
            setTimerSize(window.innerWidth < 640 ? 240 : 320);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
    const { data: topics = [], isLoading: loadingTopics } = useTopicBySubject(form.subjectId);

    const activeSubject = useMemo(() => subjects.find((s: any) => s.id === form.subjectId), [subjects, form.subjectId]);

    usePageTitleWithCronometer({
        isRunning: isCronometerRunning,
        seconds: 12,
        baseTitle: "Motor de Estudo",
    });


    const accentColor = activeSubject?.color || "hsl(var(--primary))";


    // Handlers
    const handleStart = () => {
        const now = new Date();
        if (!isCronometerRunning && seconds === 0) {
            updateCronometer({ startTime: now, endTime: null });
            updateForm({ start_time: now, study_date: getLocalDateForToday() });
        }
        updateCronometer({ isRunning: true });
        startTicking();
        if (!zenMode && window.innerWidth < 1024) setZenMode(true);
    };

    const handlePause = () => {
        stopTicking();
        updateCronometer({ isRunning: false });
    };

    const handleReset = () => {
        resetCronometer();
        resetForm();
    };

    const handleFinish = async () => {
        if (!form.subjectId || !form.topicId) {
            toast.error("Selecione uma matéria e um tópico antes de concluir.");
            return;
        }

        const mins = Math.max(1, Math.round(seconds / 60));
        const now = new Date();

        const data: StudyLogInput = {
            topic_id: form.topicId,
            study_date: form.study_date || getLocalDateForToday(),
            material_type: form.studyMode,
            start_time: form.start_time || new Date(now.getTime() - seconds * 1000),
            end_time: now,
            duration_minutes: mins,
            notes: form.notes || undefined,
        };

        try {
            await createStudyLog.mutateAsync(data);
            toast.success("Sessão registrada com sucesso!");
            handleReset();
            router.push("/dashboard");
        } catch (error) {
            toast.error("Erro ao salvar sessão.");
        }
    };

    return (
        <Glass
            accentColor={accentColor}
            className="w-full flex flex-col space-y-4 items-center justify-center p-8 md:p-12 min-h-[500px] relative shadow-2xl"
        >
            {/* Goal Selectors */}
            <div className="absolute top-6 right-6 flex gap-2">
                {GOALS.map((g: number) => (
                    <button
                        key={g}
                        onClick={() => !isCronometerRunning && setSelectedGoal(g)}
                        className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${selectedGoal === g
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                        disabled={isCronometerRunning}
                    >
                        {g}m
                    </button>
                ))}
            </div>

            {/* Context Breadcrumb */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
                <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: accentColor }}
                />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    {activeSubject?.name || "Selecione uma matéria"}
                </span>
            </div>

            <Cronometer />

            {/* Current Subject Indicator */}
            <Select
                value={form.subjectId}
                onValueChange={(value) => updateForm({ subjectId: value })}
            >
                <SelectTrigger className="">
                    <SelectValue placeholder="Selecione uma matéria" />
                </SelectTrigger>
                <SelectContent>
                    {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                            <span
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: subject.color }}
                            />
                            {subject.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Current Topic Indicator */}
            {form.subjectId && topics && (
                <Select
                    value={form.topicId}
                    onValueChange={(value) => updateForm({ topicId: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um tópico" />
                    </SelectTrigger>
                    <SelectContent>
                        {topics.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                                <span
                                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                />
                                {t.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Controls */}
            <div className="mt-8 flex gap-4">
                {!isCronometerRunning ? (
                    <Button
                        size="lg"
                        variant="default"
                        className="rounded-2xl h-14 px-8 text-lg font-bold gap-2 shadow-xl hover:scale-105 transition-transform"
                        onClick={handleStart}
                    >
                        <Play className="h-6 w-6 fill-current" />
                        {isCronometerRunning ? "Retomar" : "Iniciar"}
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        variant="default"
                        className="rounded-2xl h-14 px-8 text-lg font-bold gap-2 shadow-xl hover:scale-105 transition-transform"
                        onClick={handlePause}
                    >
                        <Pause className="h-6 w-6 fill-current" />
                        Pausar
                    </Button>
                )}

                <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-2xl border-border/40 bg-background/20"
                    onClick={handleReset}
                >
                    <RotateCcw className="h-6 w-6" />
                </Button>


                <Button
                    variant="default"
                    className="h-14 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 shadow-lg"
                    onClick={handleFinish}
                >
                    <CheckCircle2 className="h-6 w-6" />
                    Concluir
                </Button>

            </div>

            {zenMode && (
                <Button
                    variant="ghost"
                    className="absolute bottom-6 text-muted-foreground"
                    onClick={() => setZenMode(false)}
                >
                    <Minimize2 className="h-4 w-4 mr-2" /> Sair do Modo Zen
                </Button>
            )}

            {!zenMode && (
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                    className="absolute top-1/2 -right-4 transform -translate-y-1/2 rounded-full h-8 w-8 shadow-md border border-border/50 z-20 flex items-center justify-center bg-background/90 hover:bg-background"
                    title={isDetailsOpen ? "Recolher Detalhes" : "Expandir Detalhes"}
                >
                    {isDetailsOpen ? <ChevronLeft className="h-4 w-4 text-foreground" /> : <ChevronRight className="h-4 w-4 text-foreground" />}
                </Button>
            )}
        </Glass>

    );
}