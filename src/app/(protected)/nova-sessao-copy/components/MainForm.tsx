import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Play, Pause, RotateCcw, CheckCircle2, BookOpen, Target, Minimize2, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Glass } from "./Glass";
import { CircularTimer } from "./CircularTimer";
import { useSubjects } from "@/hooks/useSubjects";
import { useCreateStudyLog } from "@/hooks/useStudyLogs";
import useCronometerStore from "@/store/useCronometerStore";
import useSessionFormStore from "@/store/useSessionFormStore";
import { getLocalDateForToday } from "@/lib/utils";
import { StudyLogInput } from "@/server/actions/studyLogs.action";
import { useTopicsMap } from "@/hooks/useTopics";
import { usePageTitleWithCronometer } from "@/hooks/usePageTitleWithCronometer";

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
    const topicsMap = useTopicsMap();

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
    const [topicSelectOpen, setTopicSelectOpen] = useState(false);
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

    usePageTitleWithCronometer({
        isRunning: isCronometerRunning,
        seconds: 12,
        baseTitle: "Motor de Estudo",
    });

    // Derived state
    const activeSubject = useMemo(() =>
        subjects.find((s: any) => s.id === form.subjectId),
        [subjects, form.subjectId]
    );

    const accentColor = activeSubject?.color || "hsl(var(--primary))";

    // Form helpers
    const progress = Math.min(1, seconds / (selectedGoal * 60));
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");

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
        <div className={`relative z-10 transition-all duration-500 w-full`}>
            <Glass
                accentColor={accentColor}
                className="w-full flex flex-col items-center justify-center p-8 md:p-12 min-h-[500px] relative shadow-2xl"
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

                <CircularTimer
                    progress={progress}
                    isRunning={isCronometerRunning}
                    color={accentColor}
                    size={timerSize}
                >
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-tighter mb-1">
                        {isCronometerRunning ? "Em Foco" : "Pausado"}
                    </span>
                    <span className="text-6xl md:text-7xl font-mono font-bold tabular-nums">
                        {mm}:{ss}
                    </span>
                    <span className="text-xs text-muted-foreground mt-2">
                        meta: {selectedGoal} min
                    </span>
                </CircularTimer>

                {/* Subject atual */}
                {activeSubject && (
                    <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 11, background: hexToRgba(activeSubject.color, 0.1), border: `1px solid ${hexToRgba(activeSubject.color, 0.3)}` }}>
                        <BookOpen size={15} />
                        <span style={{ fontSize: 13.5 }}>{activeSubject.name.split(" ")[0]} · <b>{activeSubject.name}</b></span>
                    </div>
                )}

                {/* Current Topic Indicator */}
                <div
                    className="px-6 py-2 mt-2 border-1 border-gray-600 rounded-2xl flex items-center gap-3 transition-all cursor-pointer hover:scale-105"
                    style={{ backgroundColor: `${accentColor}15` }}
                    onClick={() => setTopicSelectOpen(true)}
                >
                    <Target className="h-5 w-5" style={{ color: accentColor }} />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold truncate max-w-[200px]">
                            {form.topicId ? (topicsMap[form.topicId]?.name || "Tópico Selecionado") : "Selecionar tópico..."}
                        </span>
                    </div>
                </div>

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
        </div>
    );
}