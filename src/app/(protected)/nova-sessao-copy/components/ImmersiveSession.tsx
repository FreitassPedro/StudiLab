"use client";

import { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewTopicDialog } from "../../materias/components/NewTopicDialog";

import useSessionFormStore from "@/store/useSessionFormStore";

import { MainSection } from "./MainForm";
import { ExtraDetails } from "./ExtraSide";



export function ImmersiveSession() {
  const form = useSessionFormStore((state) => state.form);
  const updateForm = useSessionFormStore((state) => state.updateForm);

  const [zenMode, setZenMode] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [newTopicDialogOpen, setNewTopicDialogOpen] = useState(false);

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
          className={`
      relative z-10 flex overflow-hidden transition-all duration-500 ease-in-out
      ${isDetailsOpen
              ? "opacity-100 max-h-[1000px] lg:max-w-125 translate-y-0 lg:translate-x-0 -mt-4 lg:mt-0 lg:-ml-4 pt-4 lg:pt-0 lg:pl-0"
              : "opacity-0 max-h-0 lg:max-w-0 -translate-y-8 lg:translate-y-0lg:-translate-x-8 mt-0 lg:ml-0"
            }
    `}
        >
          {/* Contêiner interno para manter a integridade da largura do conteúdo durante o colapso */}
          <div className="w-full rounded-b-xl lg:rounded-bl-none lg:rounded-r-xl shadow-inner">
            <ExtraDetails />
          </div>
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
