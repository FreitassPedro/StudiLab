"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Plus,
  ArrowLeft,
  Settings2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Glass } from "./Glass";
import { CircularTimer } from "./CircularTimer";
import { TopicSelector } from "./TopicTreeSelector";
import { NewTopicDialog } from "../../materias/components/NewTopicDialog";

import { useSubjects } from "@/hooks/useSubjects";
import { useCreateStudyLog } from "@/hooks/useStudyLogs";
import useCronometerStore from "@/store/useCronometerStore";
import useSessionFormStore from "@/store/useSessionFormStore";
import { getLocalDateForToday } from "@/lib/utils";
import { StudyLogInput } from "@/server/actions/studyLogs.action";

import { useTopicsMap } from "@/hooks/useTopics";
import { usePageTitleWithCronometer } from "@/hooks/usePageTitleWithCronometer";

const GOALS = [25, 45, 60, 90];

export function ImmersiveSession() {
  const router = useRouter();
  const createStudyLog = useCreateStudyLog();
  const topicsMap = useTopicsMap();
  
  // Stores
  const { cronometer, updateCronometer, startTicking, stopTicking, resetCronometer } = useCronometerStore();
  const { form, updateForm, resetForm } = useSessionFormStore();
  
  // Local UI state
  const [zenMode, setZenMode] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(50);
  const [notes, setNotes] = useState("");
  const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);
  const [topicSelectOpen, setTopicSelectOpen] = useState(false);
  const [studyMode, setStudyMode] = useState<"teoria" | "revisao" | "exercicios" | "resumo">("teoria");

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
    isRunning: cronometer.isRunning,
    seconds: cronometer.seconds,
    baseTitle: "Motor de Estudo",
  });

  // Derived state
  const activeSubject = useMemo(() => 
    subjects.find(s => s.id === form.subjectId),
    [subjects, form.subjectId]
  );

  const accentColor = activeSubject?.color || "hsl(var(--primary))";

  // Form helpers
  const progress = Math.min(1, cronometer.seconds / (selectedGoal * 60));
  const mm = String(Math.floor(cronometer.seconds / 60)).padStart(2, "0");
  const ss = String(cronometer.seconds % 60).padStart(2, "0");

  // Handlers
  const handleStart = () => {
    const now = new Date();
    if (!cronometer.isRunning && cronometer.seconds === 0) {
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

    const mins = Math.max(1, Math.round(cronometer.seconds / 60));
    const now = new Date();

    const data: StudyLogInput = {
      topic_id: form.topicId,
      study_date: form.study_date || getLocalDateForToday(),
      material_type: studyMode,
      start_time: form.start_time || new Date(now.getTime() - cronometer.seconds * 1000),
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

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Background Ambient Glow */}
      <div 
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${accentColor}15, transparent 50%), radial-gradient(circle at 100% 100%, ${accentColor}05, transparent 50%)`
        }}
      />

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

      <div className={`grid gap-8 transition-all duration-500 ${zenMode ? 'grid-cols-1' : 'lg:grid-cols-[1fr_350px]'}`}>
        
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
                  onClick={() => !cronometer.isRunning && setSelectedGoal(g)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    selectedGoal === g 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                  disabled={cronometer.isRunning}
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
              isRunning={cronometer.isRunning} 
              color={accentColor}
              size={timerSize}
            >
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-tighter mb-1">
                {cronometer.isRunning ? "Em Foco" : "Pausado"}
              </span>
              <span className="text-6xl md:text-7xl font-mono font-bold tabular-nums">
                {mm}:{ss}
              </span>
              <span className="text-xs text-muted-foreground mt-2">
                meta: {selectedGoal} min
              </span>
            </CircularTimer>

            {/* Current Topic Indicator */}
            <div 
              className="mt-12 px-6 py-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer hover:scale-105"
              style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}33` }}
              onClick={() => setTopicSelectOpen(true)}
            >
              <Target className="h-5 w-5" style={{ color: accentColor }} />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground font-bold">Tópico Atual</span>
                <span className="text-sm font-semibold truncate max-w-[200px]">
                  {form.topicId ? (topicsMap[form.topicId]?.name || "Tópico Selecionado") : "Clique para selecionar..."}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex gap-4">
              {!cronometer.isRunning ? (
                <Button 
                  size="lg" 
                  className="rounded-2xl h-14 px-8 text-lg font-bold gap-2 shadow-xl hover:scale-105 transition-transform"
                  style={{ backgroundColor: accentColor, color: '#fff' }}
                  onClick={handleStart}
                >
                  <Play className="h-6 w-6 fill-current" />
                  {cronometer.seconds > 0 ? "Retomar" : "Iniciar Foco"}
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  variant="secondary"
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

              {cronometer.seconds > 10 && (
                <Button 
                  variant="default" 
                  className="h-14 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 shadow-lg"
                  onClick={handleFinish}
                >
                  <CheckCircle2 className="h-6 w-6" />
                  Concluir
                </Button>
              )}
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

        {/* Sidebar Section: Configuration */}
        {!zenMode && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500">
            
            {/* Subject Selection */}
            <Glass className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Matéria</h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSubjectSelect(s.id)}
                    className={`h-10 rounded-xl transition-all border-2 ${
                      form.subjectId === s.id 
                      ? 'scale-110 shadow-lg' 
                      : 'opacity-40 hover:opacity-100'
                    }`}
                    style={{ 
                      backgroundColor: s.color,
                      borderColor: form.subjectId === s.id ? 'white' : 'transparent'
                    }}
                    title={s.name}
                  />
                ))}
                <button 
                  onClick={() => router.push("/materias")}
                  className="h-10 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {activeSubject && (
                <p className="mt-4 text-center text-sm font-bold animate-in fade-in slide-in-from-top-1">
                  {activeSubject.name}
                </p>
              )}
            </Glass>

            {/* Topic & Notes */}
            <Glass className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Configuração</h3>
                  </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Tópico</p>
                   <div className="flex gap-2">
                    <TopicSelector
                      open={topicSelectOpen}
                      onOpenChange={setTopicSelectOpen}
                      subjectId={form.subjectId}
                      selectedTopicId={form.topicId}
                      onTopicSelect={(id) => updateForm({ topicId: id })}
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setNewTopicDialogOpen(true)}
                      disabled={!form.subjectId}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                   </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Modo de Estudo</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["teoria", "revisao", "exercicios", "resumo"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setStudyMode(m as any)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                          studyMode === m 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Diário de Bordo</h3>
                </div>
                <Textarea 
                  placeholder="Insights, dificuldades ou observações..."
                  className="min-h-[120px] bg-background/20 border-border/40 focus:ring-primary/40 rounded-2xl resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </Glass>

            <Button 
              variant="outline" 
              className="w-full rounded-2xl h-12"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Cancelar
            </Button>
          </div>
        )}
      </div>

      {form.subjectId && (
        <NewTopicDialog
          isOpen={newTopicDialogOpen}
          onOpenChange={setNewTopicDialogOpen}
          subjectId={form.subjectId}
          onTopicCreated={(topic) => updateForm({ topicId: topic.id })}
        />
      )}
    </div>
  );
}
