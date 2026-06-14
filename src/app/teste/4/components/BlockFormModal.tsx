"use client";

import { SubjectColor, BlockType, BlockPriority, BlockStatus } from "./planner";
import { NewBlockForm } from "./use-planner-state";
import { COLOR_OPTIONS, DAY_NAMES, timeToMinutes } from "./planner-utils";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BlockFormModalProps {
  open: boolean;
  isEditing: boolean;
  activeDay: number;
  form: NewBlockForm;
  onFormChange: (patch: Partial<NewBlockForm>) => void;
  onSave: () => void;
  onClose: () => void;
}

const TYPE_LABELS: Record<BlockType, string> = {
  study: "Estudo",
  practice: "Prática",
  revision: "Revisão",
  exam: "Prova",
};

export function BlockFormModal({
  open,
  isEditing,
  activeDay,
  form,
  onFormChange,
  onSave,
  onClose,
}: BlockFormModalProps) {
  const timeError =
    form.startTime &&
    form.endTime &&
    timeToMinutes(form.endTime) <= timeToMinutes(form.startTime);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            {isEditing ? "Editar bloco" : "Novo bloco de estudo"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {DAY_NAMES[activeDay]}
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Subject & Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="subject" className="text-xs">
                Matéria <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Ex: Matemática"
                value={form.subject}
                onChange={(e) => onFormChange({ subject: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => onFormChange({ status: v as BlockStatus })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Pendente</SelectItem>
                  <SelectItem value="in-progress">Em progresso</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                  <SelectItem value="missed">Não feito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <Label htmlFor="topic" className="text-xs text-muted-foreground">
              Tópico (opcional)
            </Label>
            <Input
              id="topic"
              placeholder="Ex: Cálculo diferencial"
              value={form.topic}
              onChange={(e) => onFormChange({ topic: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v) => onFormChange({ type: v as BlockType })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Prioridade</Label>
              <Tabs 
                value={String(form.priority)} 
                onValueChange={(v) => onFormChange({ priority: Number(v) as BlockPriority })}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 h-8 p-0.5 w-full">
                  <TabsTrigger value="1" className="text-[10px] py-1">Baixa</TabsTrigger>
                  <TabsTrigger value="2" className="text-[10px] py-1">Média</TabsTrigger>
                  <TabsTrigger value="3" className="text-[10px] py-1">Alta</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-time" className="text-xs">
                Início
              </Label>
              <Input
                id="start-time"
                type="time"
                value={form.startTime}
                onChange={(e) => onFormChange({ startTime: e.target.value })}
                className="h-8 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-time" className="text-xs">
                Fim
              </Label>
              <Input
                id="end-time"
                type="time"
                value={form.endTime}
                onChange={(e) => onFormChange({ endTime: e.target.value })}
                className={cn(
                  "h-8 text-sm font-mono",
                  timeError && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {timeError && (
                <p className="text-[10px] text-destructive">
                  Horário inválido
                </p>
              )}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs">Cor</Label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onFormChange({ color: c.value as SubjectColor })}
                  className={cn(
                    "w-6 h-6 rounded-full transition-transform",
                    c.dot,
                    form.color === c.value
                      ? "scale-110 ring-2 ring-offset-1 ring-foreground/40"
                      : "opacity-60 hover:opacity-100 hover:scale-105"
                  )}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={!form.subject.trim() || !!timeError}
          >
            {isEditing ? "Salvar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
