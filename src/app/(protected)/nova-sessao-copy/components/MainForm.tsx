import { useState, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { StudySessionFormData } from "@/schemas/studySession.schema";
import {
    Play, Pause, RotateCcw, CheckCircle2, Minimize2, ChevronLeft, ChevronRight,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Glass } from "./Glass";
import { useSubjects } from "@/hooks/useSubjects";
import useCronometerStore from "@/store/useCronometerStore";
import { cn, getTodayLocal } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTopicBySubject } from "@/hooks/useTopics";
import { Cronometer } from "./Cronometer";
import { NewTopicDialog } from "../../materias/components/NewTopicDialog";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const GOALS = [0, 25, 45, 60, 90] as const;
type Goal = typeof GOALS[number];

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
    // Stores
    const { watch, setValue, reset } = useFormContext<StudySessionFormData>();
    const subjectId = watch("subjectId");
    const topicId = watch("topicId");

    const router = useRouter();

    const isCronometerRunning = useCronometerStore((state) => state.cronometer.isRunning);
    const updateCronometer = useCronometerStore((state) => state.updateCronometer);
    const resetCronometer = useCronometerStore((state) => state.resetCronometer);
    const startTicking = useCronometerStore((state) => state.startTicking);
    const stopTicking = useCronometerStore((state) => state.stopTicking);

    // Local UI state
    const [selectedGoal, setSelectedGoal] = useState<Goal>(60);
    const [timerSize, setTimerSize] = useState(320);
    const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setTimerSize(window.innerWidth < 640 ? 240 : 320);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);



    const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
    const activeSubjects = useMemo(() => subjects.filter((s) => !s.isArchived).sort((a, b) => a.name.localeCompare(b.name)), [subjects]);
    const { data: topics = [], isLoading: loadingTopics } = useTopicBySubject(subjectId);

    const activeSubject = useMemo(() => subjects.find((s: any) => s.id === subjectId), [subjects, subjectId]);


    const accentColor = activeSubject?.color || "hsl(var(--primary))";


    // Handlers
    const handleStart = () => {
        const now = new Date();
        // Behavior: Reads the current value of the store outside of React's lifecycle.
        // const seconds = useCronometerStore((state ) => state.cronometer.seconds);Behavior: Subscribes to the specific seconds property inside the store using a selector.Re-renders: Triggers an automatic re-render of the component only when the seconds value changes.
        const { seconds } = useCronometerStore.getState().cronometer;
        if (!isCronometerRunning && seconds === 0) {
            updateCronometer({ startTime: now, endTime: null });
            setValue("start_time", now);
            setValue("study_date", getTodayLocal());
        }
        // Limpa o end_time no form ao iniciar/retomar
        setValue("end_time", undefined as any);

        updateCronometer({ isRunning: true });
        startTicking();
        if (!zenMode && window.innerWidth < 1024) setZenMode(true);
    };

    const handlePause = () => {
        stopTicking();
        // Sincroniza o end_time no form ao pausar
        setValue("end_time", new Date());
        setIsDetailsOpen(true);
    };

    const handleReset = () => {
        resetCronometer();
        reset();
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
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            if (!isCronometerRunning) {
                                setSelectedGoal('60' as any)
                            }
                        }}
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

            <Cronometer goalMinutes={selectedGoal} />

            <div className="flex flex-col gap-6 mt-2 w-full items-center">
                <div className="text-center space-y-1">
                    <p className="text-[16px] text-muted-foreground">Selecione a <b>matéria</b> e o <b>tópico</b> para registrar sua sessão.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg ">
                    {/* Current Subject Indicator */}
                    <div className="flex-1 space-y-1 w-full">
                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Matéria</Label>
                            {
                                activeSubjects.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-2 w-full">
                                        <p className="text-sm text-muted-foreground">Você ainda não cadastrou matérias</p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push("/materias")}
                                            className="w-full"
                                        >
                                            Criar matéria
                                        </Button>
                                    </div>
                                ) : (
                                    <Select
                                        value={subjectId}
                                        onValueChange={(value) => setValue("subjectId", value)}
                                    >
                                        <SelectTrigger
                                            className={cn("w-full border-2 text-md rounded-xl transition-all hover:bg-background/80", !subjectId && "border-dashed")} style={{
                                                borderColor: subjectId ? accentColor : "",
                                            }}
                                        >
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {activeSubjects.map((subject: any) => (
                                                <SelectItem key={subject.id} value={subject.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                                                            style={{ backgroundColor: subject.color }}
                                                        />
                                                        {subject.name}
                                                    </div>
                                                </SelectItem>
                                            ))}

                                        </SelectContent>
                                    </Select>
                                )}

                        </div>
                    </div>

                    {/* Current Topic Indicator */}
                    {subjectId && (
                        <div className="flex-1 space-y-1 w-full transition-opacity duration-300" style={{ opacity: subjectId ? 1 : 0.5, pointerEvents: subjectId ? 'auto' : 'none' }}>
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Tópico</Label>
                            <div className="flex items-center">
                                <Select
                                    value={topicId}
                                    onValueChange={(value) => setValue("topicId", value)}
                                    disabled={!subjectId}
                                >
                                    <SelectTrigger className={cn("rounded-xl border-2 w-full", !topicId && "border-dashed")}>
                                        <SelectValue placeholder={subjectId && (!topics || topics.length === 0) ? "Sem tópicos" : "Selecione..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {topics && topics.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setNewTopicDialogOpen(true)}
                                    className="h-8 w-8 shrink-0 rounded-xl border hover:bg-primary/10 hover:text-primary transition-colors"
                                    title="Novo tópico"
                                    disabled={!subjectId}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Controls */}
            <div className="mt-8 flex gap-4">

                {isCronometerRunning ? (
                    <Button
                        type="button"
                        size="lg"
                        variant="default"
                        className="rounded-2xl h-14 px-8 text-lg font-bold gap-2 shadow-xl hover:scale-105 transition-transform"
                        onClick={() => handlePause()}
                    >
                        <Pause className="h-6 w-6 fill-current" />
                        Pausar
                    </Button>
                ) : (
                    <Button
                        type="button"
                        size="lg"
                        variant="default"
                        className="rounded-2xl h-14 px-8 text-lg font-bold gap-2 shadow-xl hover:scale-105 transition-transform"
                        onClick={() => handleStart()}
                    >
                        <Play className="h-6 w-6 fill-current" />
                        Iniciar
                    </Button>
                )}

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-2xl border-border/40 bg-background/20"
                    onClick={handleReset}
                >
                    <RotateCcw className="h-6 w-6" />
                </Button>

                {!isCronometerRunning && (
                    <Button
                        type="submit"
                        variant="default"
                        className="h-14 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-800 text-white font-bold gap-2 shadow-lg"
                    >
                        <CheckCircle2 className="h-6 w-6" />
                        Concluir
                    </Button>
                )}
            </div>
            {
                zenMode && (
                    <Button
                        type="button"
                        variant="ghost"
                        className="absolute bottom-6 text-muted-foreground"
                        onClick={() => setZenMode(false)}
                    >
                        <Minimize2 className="h-4 w-4 mr-2" /> Sair do Modo Zen
                    </Button>
                )
            }

            {
                !zenMode && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                        className="absolute top-1/2 -right-4 transform h-14 w-14 -translate-y-1/2 rounded-full shadow-md border border-border/50 z-20 flex items-center justify-center bg-background/80 hover:bg-background"
                        title={isDetailsOpen ? "Recolher Detalhes" : "Expandir Detalhes"}
                    >
                        {isDetailsOpen ? <ChevronLeft className="h-12 w-12 text-foreground" /> : <ChevronRight className="h-12 w-12 text-foreground" />}
                    </Button>
                )
            }

            <NewTopicDialog
                isOpen={newTopicDialogOpen}
                onOpenChange={setNewTopicDialogOpen}
                subjectId={subjectId!}
            />
        </Glass >

    );
}