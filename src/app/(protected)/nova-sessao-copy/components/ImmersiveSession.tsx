"use client";

import { useState } from "react";
import { ArrowBigUp, Loader } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import useCronometerStore from "@/store/useCronometerStore";
import { useCreateStudyLog } from "@/hooks/useStudyLogs";
import { studySessionSchema, StudySessionFormData } from "@/schemas/studySession.schema";
import { getTodayLocal, formatDateToLocal } from "@/lib/utils";
import { StudyLogInput } from "@/server/actions/studyLogs.action";

import { MainSection } from "./MainForm";
import { ExtraDetails } from "./ExtraSide";
import { Card, CardContent } from "@/components/ui/card";

export function ImmersiveSession() {
  const router = useRouter();
  const createStudyLog = useCreateStudyLog();
  const resetCronometer = useCronometerStore((state) => state.resetCronometer);

  const methods = useForm<StudySessionFormData>({
    resolver: zodResolver(studySessionSchema),
    mode: "onChange",
    defaultValues: {
      subjectId: "",
      topicId: "",
      studyMode: "teoria",
      study_date: getTodayLocal(),
      notes: "",
    },
  });

  const { isSubmitting } = methods.formState;

  const [zenMode, setZenMode] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const onSubmit = async (data: StudySessionFormData) => {
    console.log("Submit Try", data);
    if (!data.start_time || !data.end_time) {
      toast.error("Você precisa definir um horário de início e fim da sessão!");
      return;
    }

    const { seconds } = useCronometerStore.getState().cronometer;
    const mins = Math.max(1, Math.round(seconds / 60));

    const payload: StudyLogInput = {
      topic_id: data.topicId,
      study_date: formatDateToLocal(data.study_date || getTodayLocal()),
      material_type: data.studyMode,
      start_time: data.start_time,
      end_time: data.end_time,
      duration_minutes: mins,
      notes: data.notes || undefined,
    };

    try {
      await createStudyLog.mutateAsync(payload);
      toast.success("Sessão registrada com sucesso!");
      resetCronometer();
      
      router.push("/dashboard");
    } catch (error) {
      toast.error("Erro ao salvar sessão.");
    }
  };

  function backToOldVersion() {
    router.push("/nova-sessao/old");
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">

        {/* Header */}
        {!zenMode && (
          <div className="flex items-center justify-between z-10">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Motor de Estudo</h1>
              <p className="text-muted-foreground">Otimize seu foco e registre sua evolução.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex items-center gap-2" onClick={backToOldVersion} title="Voltar para versão antiga">
                Voltar versão anterior
                <ArrowBigUp className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        <div className="relative flex flex-col lg:flex-row items-start justify-center w-full">

          {/* Main Section: Z-index superior forçando posição no topo da pilha */}
          <div className="relative z-20 transition-all duration-500 w-full shadow-lg rounded-xl ">
            <MainSection
              zenMode={zenMode}
              setZenMode={setZenMode}
              isDetailsOpen={isDetailsOpen}
              setIsDetailsOpen={setIsDetailsOpen}
            />
          </div>

          {/* Extra Details: Z-index inferior emergindo sob o eixo primário */}
          <div
            className={` relative z-10 flex overflow-hidden transition-all duration-500 ease-in-out 
              ${isDetailsOpen
                ? "opacity-100 max-h-[1000px] lg:max-w-125 translate-y-0 lg:translate-x-0 -mt-4 lg:mt-0 lg:-ml-4 pt-4 lg:pt-0 lg:pl-0"
                : "opacity-0 max-h-0 lg:max-w-0 -translate-y-8 lg:translate-y-0lg:-translate-x-8 mt-0 lg:ml-0"
              } `}
          >
            {/* Contêiner interno para manter a integridade da largura do conteúdo durante o colapso */}
            <div className="w-full rounded-b-xl lg:rounded-bl-none lg:rounded-r-xl shadow-inner">
              <ExtraDetails />
            </div>
          </div>

        </div>
      </form >
      {
        isSubmitting && (
          <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center">
            <Card className="shadow-xl border-border/60">
              <CardContent className="flex items-center gap-3 px-8 py-5">
                <Loader className="animate-spin h-5 w-5 text-primary animate-duration-500 animate-ease-in-out" />
                <span className="text-sm">Registrando seu estudo...</span>
              </CardContent>
            </Card>
          </div>
        )
      }
    </FormProvider>
  );
}
