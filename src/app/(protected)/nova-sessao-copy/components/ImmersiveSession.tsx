"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Target,
  PenLine,
  Maximize2,
  Minimize2,
  Settings2,
  ClockArrowUpIcon,
  ClockArrowUp
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Glass } from "./Glass";
import { CircularTimer } from "./CircularTimer";
import { NewTopicDialog } from "../../materias/components/NewTopicDialog";

import { useSubjects } from "@/hooks/useSubjects";
import { useCreateStudyLog } from "@/hooks/useStudyLogs";
import useCronometerStore from "@/store/useCronometerStore";
import useSessionFormStore from "@/store/useSessionFormStore";
import { getLocalDateForToday } from "@/lib/utils";
import { StudyLogInput } from "@/server/actions/studyLogs.action";

import { useTopicsMap } from "@/hooks/useTopics";
import { usePageTitleWithCronometer } from "@/hooks/usePageTitleWithCronometer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const GOALS = [25, 45, 60, 90];
const hexToRgba = (hex, a) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

interface Subject {
  id: string;
  name: string;
  color: string;
}

const subject: Subject = {
  id: "1",
  name: "Matemática",
  color: "#FF0000"
}


export function ExtraDetails() {

  const form = useSessionFormStore((state) => state.form);
  const updateForm = useSessionFormStore((state) => state.updateForm);
  
  const [studyMode, setStudyMode] = useState<"teoria" | "revisao" | "exercicios" | "resumo">("teoria");

  const setCurrentTime = (field: "start_time" | "end_time") => {
    updateForm({ [field]: new Date() });
  };

  return (
    < div className="flex flex-col h-full justify-between space-y-4 animate-in slide-in-from-right duration-500" >
      {/* Topic & Notes */}
      < Card className="h-full flex-1" >
        <CardHeader>
          <Settings2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Configuração</h3>
        </CardHeader>
        <CardContent className="flex-1 space-y-2 flex flex-col"  >

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Modo de Estudo</p>
            <div className="grid grid-cols-2 gap-2">
              {["teoria", "revisao", "exercicios", "resumo"].map((m) => (
                <button
                  key={m}
                  onClick={() => setStudyMode(m as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${studyMode === m
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'
                    }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1 mr-4">
            <Label htmlFor="study_date" className="text-[10px] font-medium text-foreground/80">
              Data
            </Label>
            <Input
              id="study_date"
              type="date"
              value={form.study_date?.toISOString().split('T')[0] || ''}
              className="h-8 text-xs bg-background/60 focus-visible:ring-primary/40"
              onChange={(e) => { }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Hora Início */}
            <div className="space-y-1">
              <Label htmlFor="start_time" className="text-[10px] font-medium text-foreground/80">
                Início
              </Label>
              <div className="flex gap-1">
                <Input
                  id="start_time"
                  type="time"
                  value={form.start_time?.toISOString().split('T')[1] || ''}
                  className="h-8 text-xs bg-background/60 focus-visible:ring-primary/40 min-w-0"
                  onChange={(e) => { }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentTime("start_time")}
                  title="Hora atual"
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <ClockArrowUp className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Hora Fim */}
            <div className="space-y-1">
              <Label htmlFor="end_time" className="text-[10px] font-medium text-foreground/80">
                Fim
              </Label>
              <div className="flex gap-1">
                <Input
                  id="end_time"
                  type="time"
                  value={form.end_time?.toISOString().split('T')[1] || ''}
                  className={`h-8 text-xs bg-background/60 focus-visible:ring-primary/40 min-w-0`}
                  onChange={(e) => { }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentTime("end_time")}
                  title="Hora atual"
                  className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <ClockArrowUpIcon className="h-3.5 w-3.5" />
                </Button>
              </div>

            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Anotações</h3>
            </div>
            <Textarea
              placeholder="Insights, dificuldades ou observações..."
              className="min-h-[120px] bg-background/20 border-border/40 focus:ring-primary/40 rounded-2xl resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

        </CardContent>
      </Card >
    </div >

  )
}

export function ImmersiveSession() {
  const router = useRouter();
  const createStudyLog = useCreateStudyLog();
  const topicsMap = useTopicsMap();

  // Stores
  const form = useSessionFormStore();
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
  const [zenMode, setZenMode] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(50);
  const [notes, setNotes] = useState("");
  const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);
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
    subjects.find(s => s.id === form.subjectId),
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
    setNotes("");
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
      material_type: studyMode,
      start_time: form.start_time || new Date(now.getTime() - seconds * 1000),
      end_time: now,
      duration_minutes: mins,
      notes: notes || undefined,
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

  const handleSubjectSelect = (id: string) => {
    updateForm({ subjectId: id, topicId: "" });
  };

  const setCurrentTime = (field: "start_time" | "end_time") => {
    updateForm({ [field]: new Date() });
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">

      {/* Header */}
      {!zenMode && (
        <div className="flex items-center justify-between z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Motor de Estudo</h1>
            <p className="text-muted-foreground">Otimize seu foco e registre sua evolução.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setZenMode(!zenMode)} title="Modo Zen">
              {zenMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      )}

      <div className={`grid  transition-all duration-500 ${zenMode ? 'grid-cols-1' : 'lg:grid-cols-[1fr_350px]'}`}>

        {/* Main Section: Timer */}
        <div className="flex flex-col items-center justify-center space-y-8">
          <Glass
            accentColor={accentColor}
            className="w-full flex flex-col items-center justify-center p-8 md:p-12 min-h-[500px]"
          >
            {/* Goal Selectors */}
            <div className="absolute top-6 right-6 flex gap-2">
              {GOALS.map(g => (
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
            <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 11, background: hexToRgba(subject.color, 0.1), border: `1px solid ${hexToRgba(subject.color, 0.3)}` }}>
              <BookOpen size={15} />
              <span style={{ fontSize: 13.5 }}>{subject.name.split(" ")[0]} · <b>{subject.name}</b></span>
            </div>

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
          </Glass>
        </div>

      </div>
      {
        form.subjectId && (
          <NewTopicDialog
            isOpen={newTopicDialogOpen}
            onOpenChange={setNewTopicDialogOpen}
            subjectId={form.subjectId}
            onTopicCreated={(topic) => updateForm({ topicId: topic.id })}
          />
        )
      }
    </div >
  );
}
