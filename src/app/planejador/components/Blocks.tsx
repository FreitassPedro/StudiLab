import { useCallback, useMemo } from "react";
import { BlockType, StudyBlock, ColorName } from "../types";
import { formatDuration, getBlockTimelineMetrics, parseTimeToMinutes, hexToRgba } from "../utils";
import { CheckCircle2, Circle, Clock, GripVertical, MoreHorizontal, Pencil, Trash2, Trash2Icon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePlannerActions } from "./PlannerActionsContext";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Controller, useForm, useWatch } from "react-hook-form";


interface BlockCardProps {
    block: StudyBlock;
    hourHeights: number[];
}

export function BlockCard({
    block,
    hourHeights,
}: BlockCardProps) {

    const {
        draggedId,
        resizingId,
        openEditBlock,
        removeBlock,
        duplicateBlock,
        handleDragStart,
        handleResizeStart,
        toggleBlockStatus,
        hiddenSubjects,
        subjects,
    } = usePlannerActions();

    const subject = subjects.find(s => s.id === block.subjectId);

    const baseColor = block.color || "#3b82f6";
    const isDragging = draggedId === block.id;
    const isResizing = resizingId === block.id;

    const { topPx, heightPx } = useMemo(
        () => getBlockTimelineMetrics(block, hourHeights),
        [block, hourHeights]
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if ((e.target as HTMLElement).closest("[data-resize-handle]")) return;
            e.preventDefault();

            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            handleDragStart(block.id, offsetY);
        },
        [block.id, handleDragStart]
    );

    const durationMin = useMemo(() => {
        const s = parseTimeToMinutes(block.startTime);
        const e = parseTimeToMinutes(block.endTime);
        return e - s;
    }, [block.startTime, block.endTime]);

    const compact = heightPx < 48;

    if (hiddenSubjects.has(block.subjectId)) {
        return null;
    }


    return (
        <div
            className={cn(
                "absolute z-10 group rounded-lg border select-none left-1 right-1",
                "transition-shadow overflow-hidden flex flex-col",
                isDragging
                    ? "opacity-40 shadow-lg ring-2 ring-primary/50 cursor-grabbing"
                    : isResizing
                        ? "shadow-md ring-2 ring-primary/30 cursor-ns-resize"
                        : "cursor-grab hover:shadow-md hover:z-20",
                block.status === "done"
                    ? "bg-muted/60 border-muted grayscale-[0.5] opacity-80 text-muted-foreground"
                    : "",
                block.isLog && "cursor-default ring-1 ring-primary/20 hover:shadow-none"
            )}
            style={{
                height: `${heightPx}px`,
                top: `${topPx}px`,
                backgroundColor: block.status !== "done" ? hexToRgba(baseColor, 0.1) : undefined,
                borderColor: block.status !== "done" ? hexToRgba(baseColor, 0.3) : undefined,
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={(e) => {
                e.stopPropagation();
                openEditBlock(block);
            }}
        >
            {/* Drag grip */}
            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
                <GripVertical className="w-3 h-3" />
            </div>

            <div className={cn("flex flex-col flex-1 min-h-0", compact ? "px-2 py-0.5" : "px-2 py-1.5")}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!block.isLog) toggleBlockStatus(block.id);
                    }}
                    className={cn("absolute opacity-0 hover:opacity-100", block.status === "done" && "opacity-100")}
                >
                    {block.status === "done" ? (
                        <CheckCircle2 className="w-4 h-4 text-primary opacity-100" />
                    ) : (
                        <Circle className="w-3.5 h-3.5 text-current opacity-40 hover:opacity-80 transition-opacity" />
                    )}
                </button>

                <h3
                    className={cn("font-semibold truncate leading-tight text-xs", block.status === "done" && "line-through opacity-70")}
                    style={block.status !== "done" ? { color: baseColor } : undefined}
                >
                    {subject?.name ?? block.subjectId}
                </h3>

                {!compact && block.topic && (
                    <p className={cn("text-xs truncate leading-tight", block.status === "done" ? "line-through opacity-70" : "text-muted-foreground")}>{block.topic}</p>
                )}

                {!compact && (
                    <Badge
                        variant="outline"
                        className={cn("w-fit text-xs mt-0.5 py-0 px-1.5 h-4")}
                        style={block.status !== "done" ? { borderColor: hexToRgba(baseColor, 0.4), color: baseColor } : undefined}
                    >
                        {block.type}
                    </Badge>
                )}

                <div className={cn("flex items-center gap-0.5 text-muted-foreground leading-tight", compact ? "mt-0" : "mt-auto")}>
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    <p className="text-[10px] font-medium truncate">
                        {block.startTime}–{block.endTime}
                        {!compact && ` · ${formatDuration(durationMin)}`}
                    </p>
                </div>
            </div>

            {/* Options Button */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full"
                    >
                        <MoreHorizontal className="w-2.5 h-2.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        {/* Edit button */}
                        {!block.isLog && (
                            <>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditBlock(block);
                                    }}
                                >
                                    <Pencil className="w-2.5 h-2.5" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateBlock(block.id);
                                    }}
                                >
                                    Duplicar
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuItem variant="destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeBlock(block.id);
                            }}
                        >
                            <Trash2Icon />
                            Trash
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>




            {/* Resize handle */}
            <div
                data-resize-handle
                className={cn(
                    "absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize",
                    "flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity"
                )}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log("resize start", block.id);
                    handleResizeStart(block.id, e);
                }}
            >
                <div className="w-8 h-0.5 rounded-full bg-current opacity-50" />
            </div>
        </div>
    );
}
// ── Color picker ────────────────────────────────────────────────────────────

const COLOR_OPTIONS: string[] = [
    "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b",
    "#f43f5e", "#f97316", "#14b8a6", "#ec4899",
    "#06b6d4", "#d946ef", "#84cc16", "#6366f1"
];



function ColorPicker({
    value,
    onChange,
    disabled,
}: {
    value?: string;
    onChange: (c: ColorName) => void;
    disabled?: boolean;
}) {

    return (
        <div className={cn("flex gap-2 flex-wrap", disabled && "pointer-events-none opacity-50")}>
            {COLOR_OPTIONS.map((c) => (
                <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    className={cn(
                        "w-6 h-6 rounded-full transition-all ring-offset-2",
                        value === c
                            ? "ring-2 ring-primary scale-110"
                            : "hover:scale-105 opacity-70 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                />
            ))}
        </div>
    );
}

interface FormValues {
    subjectName: string;
    topicName: string | null;
    study_type: string;
    dayIndex: number;
    startTime: string;
    endTime: string;
    color: ColorName;
}
// ── Block Form Modal ─────────────────────────────────────────────────────────
export function NewBlockFormModal({
    open,
    initialData,
    onCloseModal,
    onSave,
    onDelete,
    isEditing,
}: {
    open: boolean;
    initialData: Partial<StudyBlock>;
    onCloseModal: () => void;
    onSave: (payload: Partial<StudyBlock>) => void;
    onDelete?: () => void;
    isEditing?: boolean;
}) {

    const { subjects } = usePlannerActions();

    const initialSubject = subjects.find(s => s.id === initialData.subjectId)?.name ?? initialData.subjectId ?? "";

    const { register, handleSubmit, reset, setValue, control } = useForm<FormValues>({
        defaultValues: {
            subjectName: initialSubject,
            topicName: initialData.topic,
            study_type: initialData.type,
            dayIndex: initialData.dayIndex,
            startTime: initialData.startTime,
            endTime: initialData.endTime,
            color: initialData.color,
        },
    });

    const [subjectName, topicName, study_type, dayIndex, startTime, endTime, color] = useWatch({
        control,
        name: ["subjectName", "topicName", "study_type", "dayIndex", "startTime", "endTime", "color"],
    })

    const subject = subjects.find(s => s.id === initialData.subjectId);


    const filteredOptions = useMemo(() => {
        const query = (subjectName || "").toLowerCase().trim();

        return subjects.filter((subj) => !query || subj.name.toLowerCase().includes(query))

    }, [subjectName, subjects]);

    const handleSubmitForm = (values: FormValues) => {
        const normalizedInput = values.subjectName.trim().toLowerCase();
        const matchedSubject = subjects.find(
            s => s.name.toLowerCase() === normalizedInput
        );

        const payload: Partial<StudyBlock> = {
            subjectId: matchedSubject ? matchedSubject.id : values.subjectName.trim(),
            topic: values.topicName || undefined,
            dayIndex: values.dayIndex,
            startTime: values.startTime,
            endTime: values.endTime,
            type: values.study_type as BlockType,
            color: values.color as ColorName,
        };

        onSave(payload);
        reset();
    };


    return (
        <Dialog open={open} onOpenChange={(v) => !v && onCloseModal()}>
            <DialogContent className="max-w-sm">
                <form className="flex flex-col gap-3" onSubmit={handleSubmit(handleSubmitForm)}>

                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Editar bloco" : "Novo bloco de estudo"}
                        </DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 py-4">
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground mb-1">Matéria</Label>
                            <Controller
                                control={control}
                                name="subjectName"
                                render={({ field }) => (
                                    <Combobox
                                        items={filteredOptions}
                                        value={field.value}
                                        inputValue={field.value}
                                        onInputValueChange={field.onChange}
                                        onValueChange={(selectedName) => {
                                            const subj = subjects.find(s => s.name === selectedName);
                                            if (subj) {
                                                field.onChange(subj.name);
                                                setValue("color", subj.color);
                                            }
                                        }}
                                    >
                                        <ComboboxInput placeholder="Ex: Cálculo" />
                                        <ComboboxContent>
                                            <ComboboxList>
                                                {filteredOptions.map((sbj) => (
                                                    <ComboboxItem key={sbj.id} value={sbj.name}>
                                                        <div>
                                                            <div
                                                                className="w-2.5 h-2.5 rounded-full opacity-70 mr-2 inline-block"
                                                                style={{ backgroundColor: sbj.color || "#3b82f6" }}
                                                            />
                                                            {sbj.name}
                                                        </div>
                                                    </ComboboxItem>
                                                ))}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                )}
                            />
                        </div>

                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Tópico</Label>
                            <Input
                                placeholder="Ex: Cálculo — Derivadas"
                                {...register("topicName")}
                            />
                        </div>

                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Tipo</Label>
                            <div className="flex gap-2 flex-wrap">
                                {["leiture", "revision", "exercise", "resume", "exam"].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setValue("study_type", t, { shouldDirty: true })}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs border transition-all",
                                            study_type === t
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Dia</Label>
                            <div className="flex gap-1 flex-wrap">
                                {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((d, i) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setValue("dayIndex", i, { shouldDirty: true })}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs border transition-all",
                                            dayIndex === i
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Início</Label>
                                <Input
                                    type="time"
                                    value={startTime}
                                    {...register("startTime")}
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Fim</Label>
                                <Input
                                    type="time"
                                    value={endTime}
                                    {...register("endTime")}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Cor</Label>
                            <div className="flex justify-between items-center gap-2">
                                <ColorPicker
                                    value={color as ColorName}
                                    onChange={(color) => {
                                        setValue("color", color);
                                    }}
                                    disabled={subjects.some(s => s.id === subject?.id)}
                                />
                                {subject && (
                                    <Button
                                        variant="outline"
                                        type="button"
                                    >
                                        <div
                                            className="w-2.5 h-2.5 rounded-full inline-block"
                                            style={{ backgroundColor: color as string }}
                                        />
                                        {subject.name ?? "Sem matéria"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>


                    <DialogFooter className="flex items-center justify-between mt-1">
                        <div>
                            {isEditing && onDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={onDelete}
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    Excluir
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={onCloseModal}>
                                Cancelar
                            </Button>
                            <Button size="sm" onClick={handleSubmit(handleSubmitForm)}>
                                Salvar
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}

// ── Ghost block shown while dragging ────────────────────────────────────────

export function GhostBlock({
    topPx,
    heightPx,
    label,
}: {
    topPx: number;
    heightPx: number;
    label: string;
}) {
    return (
        <div
            className="absolute left-1 right-1 z-30 rounded-lg border-2 border-dashed border-primary/60 bg-primary/10 pointer-events-none flex items-center justify-center"
            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
        >
            <p className="text-xs font-medium text-primary/70">{label}</p>
        </div>
    );
}