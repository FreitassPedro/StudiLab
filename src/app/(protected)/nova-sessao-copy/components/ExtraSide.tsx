import { useFormContext } from "react-hook-form";
import { StudySessionFormData } from "@/schemas/studySession.schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings2, PenLine } from "lucide-react";
import useCronometerStore from "@/store/useCronometerStore";

type StudyMode = "teoria" | "revisao" | "exercicios" | "resumo";

const padTwo = (n: number) => n.toString().padStart(2, "0");

const formatTimeLocal = (date?: Date) => {
    if (!date || isNaN(date.getTime())) return "";
    return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
};

const formatDateLocal = (date?: Date) => {
    if (!date || isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = padTwo(date.getMonth() + 1);
    const day = padTwo(date.getDate());
    return `${year}-${month}-${day}`;
};

export function ExtraDetails() {
    const { watch, setValue } = useFormContext<StudySessionFormData>();
    const updateCronometer = useCronometerStore((state) => state.updateCronometer);

    const studyMode = watch("studyMode");
    const study_date = watch("study_date");
    const start_time = watch("start_time");
    const end_time = watch("end_time");
    const notes = watch("notes");

    const handleTimeInput = (field: "start_time" | "end_time", value: string) => {
        if (!value) {
            setValue(field, undefined as any);
            return;
        }
        const [hours, minutes] = value.split(":");
        const date = new Date();
        date.setHours(+hours, +minutes, 0, 0);
        setValue(field, date);

        const cronometerField = field === "start_time" ? "startTime" : "endTime";
        updateCronometer({ [cronometerField]: date });
    };

    const handleDateInput = (value: string) => {
        if (!value) {
            setValue("study_date", undefined as any);
            return;
        }
        const [year, month, day] = value.split("-").map(Number);
        setValue("study_date", new Date(year, month - 1, day));
    };

    return (
        <div className="flex flex-col h-full justify-between space-y-4 animate-in slide-in-from-right duration-500" >
            {/* Topic & Notes */}
            <Card className="h-full flex-1 rounded-tr-2xl rounded-br-2xl" >
                <CardHeader className="flex flex-row">
                    <Settings2 className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Extra</h3>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 flex flex-col"  >
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Modo de Estudo</p>
                        <div className="grid grid-cols-2 gap-2">
                            {["teoria", "revisao", "exercicios", "resumo"].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setValue("studyMode", m as StudyMode)}
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
                            value={formatDateLocal(study_date)}
                            className="h-8 text-xs bg-background/60 focus-visible:ring-primary/40"
                            onChange={(e) => handleDateInput(e.target.value)}
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
                                    value={formatTimeLocal(start_time)}
                                    className="h-8 text-xs bg-background/60 focus-visible:ring-primary/40 min-w-0"
                                    onChange={(e) => handleTimeInput("start_time", e.target.value)}
                                />

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
                                    value={formatTimeLocal(end_time)}
                                    className={`h-8 text-xs bg-background/60 focus-visible:ring-primary/40 min-w-0`}
                                    onChange={(e) => handleTimeInput("end_time", e.target.value)}
                                />
                            </div>

                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <PenLine className="h-4 w-4 text-primary" />
                            <h3 className="text-[10px] font-medium text-foreground/80  uppercase tracking-wider">Anotações</h3>
                        </div>
                        <Textarea
                            placeholder="Insights, dificuldades ou observações..."
                            className="min-h-30 bg-background/20 border-border/40 focus:ring-primary/40 rounded-2xl resize-none"
                            value={notes || ""}
                            onChange={(e) => setValue("notes", e.target.value)}
                        />
                    </div>

                </CardContent>
            </Card >
        </div >

    )
}