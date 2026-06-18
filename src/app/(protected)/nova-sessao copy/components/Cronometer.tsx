import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageTitleWithCronometer } from "@/hooks/usePageTitleWithCronometer";
import { cn } from "@/lib/utils";
import useCronometerStore from "@/store/useCronometerStore";
import useSessionFormStore from "@/store/useSessionFormStore";
import { ClockArrowUp, Eye, EyeOff, Maximize2, Minimize2, Play, Square, Timer } from "lucide-react";
import { useEffect, useState } from "react";

const padTwo = (n: number) => n.toString().padStart(2, "0");

const calcDurationMinutes = (start?: Date, end?: Date): number => {
    if (!start || !end) return 0;
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
};

const formatTime = (date?: Date) => {
    if (!date || isNaN(date.getTime())) return "";
    return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
};

const formatCronometerTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${padTwo(hrs)}:${padTwo(mins)}:${padTwo(secs)}`;
};

const formatDateForInputLocal = (date?: Date) => {
    if (!date || isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = padTwo(date.getMonth() + 1);
    const day = padTwo(date.getDate());
    return `${year}-${month}-${day}`;
};

const parseInputDateLocal = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day);
};

function CronometerTitleSync() {
    const isRunning = useCronometerStore((state) => state.cronometer.isRunning);
    const seconds = useCronometerStore((state) => state.cronometer.seconds);

    usePageTitleWithCronometer({
        isRunning,
        seconds,
        baseTitle: "Nova Sessão de Estudo",
    });

    return null;
}

function CronometerTimeDisplay({ isRunning }: { isRunning: boolean }) {
    const seconds = useCronometerStore((state) => state.cronometer.seconds);
    const [isTimeHidden, setIsTimeHidden] = useState(false);

    const displayTime = isTimeHidden ? "--:--:--" : formatCronometerTime(seconds);

    return (
        <div className="relative flex  items-center gap-3">
            <span
                className={`text-4xl font-mono font-semibold tracking-tight transition-colors ${isRunning ? "text-foreground" : "text-muted-foreground"
                    }`}
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsTimeHidden(!isTimeHidden)}
                    title={isTimeHidden ? "Mostrar tempo" : "Ocultar tempo"}
                    className="h-8 w-8 text-muted-foreground/80 hover:text-foreground transition-colors"
                >
                    {isTimeHidden ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </Button>
                {displayTime}
            </span>

        </div>
    );
};

function FocusModeTimeDisplay({
    isRunning,
    isTimeHidden,
}: {
    isRunning: boolean;
    isTimeHidden: boolean;
}) {
    const seconds = useCronometerStore((state) => state.cronometer.seconds);

    return (
        <span className={`font-mono font-semibold tabular-nums text-[min(18vw,11rem)] leading-none ${isRunning ? "text-foreground" : "text-muted-foreground"}`}>
            {isTimeHidden ? "••:••:••" : formatCronometerTime(seconds)}
        </span>
    );
}


export function Cronometer() {

    const isCronometerRunning = useCronometerStore((state) => state.cronometer.isRunning);
    const cronometerStartTime = useCronometerStore((state) => state.cronometer.startTime);
    const cronometerEndTime = useCronometerStore((state) => state.cronometer.endTime);
    const updateCronometer = useCronometerStore((state) => state.updateCronometer);
    const resetCronometer = useCronometerStore((state) => state.resetCronometer);
    const startTicking = useCronometerStore((state) => state.startTicking);
    const stopTicking = useCronometerStore((state) => state.stopTicking);

    const form = useSessionFormStore((state) => state.form);
    const updateForm = useSessionFormStore((state) => state.updateForm);

    const [timeRegisterType, setTimeRegisterType] = useState<"manual" | "cronometer">("manual");
    const [endTimeError] = useState<string | null>(null);
    const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
    const [isTimeHiddenFocus, setIsTimeHiddenFocus] = useState(false);
    const duration = calcDurationMinutes(form.start_time, form.end_time);

    const setCurrentTime = (field: "start_time" | "end_time") => {
        updateForm({ [field]: new Date() });
    };

    useEffect(() => {
        const today = new Date();
        if (!form.study_date) {
            updateForm({ study_date: today });
        }
    }, [updateForm, form.study_date]);

    useEffect(() => {
        if (!isFocusModeOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsFocusModeOpen(false);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isFocusModeOpen]);

    const handleTimeInput = (field: "start_time" | "end_time", value: string) => {

        if (!value) {
            updateForm({ [field]: undefined });
            return;
        }
        const [hours, minutes] = value.split(":");
        const date = new Date();
        date.setHours(+hours, +minutes, 0, 0);
        updateForm({ [field]: date });
        updateCronometer({
            startTime: field === "start_time" ? date : cronometerStartTime,
            endTime: field === "end_time" ? date : cronometerEndTime,
        });
    };

    const handleStudyDateChange = (value: string) => {
        const localDate = parseInputDateLocal(value);
        updateForm({ study_date: localDate });
    };

    const toggleCronometer = () => {
        const now = new Date();
        if (!isCronometerRunning) {
            updateCronometer({ isRunning: true, startTime: now, endTime: null });
            startTicking();
            updateForm({ start_time: now, end_time: undefined });
        } else {
            stopTicking();
            updateCronometer({ isRunning: false, endTime: now });
            updateForm({ end_time: now });
        }
    };

    const handleResetCronometer = () => {
        resetCronometer();
        updateForm({ start_time: undefined, end_time: undefined });
    };

    return (
        <>
            <CronometerTitleSync />

            <Card className="shadow-lg border-border/60 bg-card/95 py-2">
                <CardContent className="px-4 py-2  space-y-2">



                    {/* Time Mode Tabs */}
                    <Tabs
                        value={timeRegisterType}
                        onValueChange={(v) => setTimeRegisterType(v as "manual" | "cronometer")}
                    >

                        <TabsList className="h-8 w-full grid grid-cols-2 bg-muted/50">
                            <TabsTrigger
                                value="manual"
                                disabled={isCronometerRunning}
                                title={isCronometerRunning ? "Pare o cronômetro para registrar manualmente" : undefined}
                                className="h-7 gap-1.5 text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <ClockArrowUp className="h-3 w-3" />
                                Manual
                            </TabsTrigger>
                            <TabsTrigger
                                value="cronometer"
                                className="h-7 gap-1.5 text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <Timer className="h-3 w-3" />
                                Cronômetro
                            </TabsTrigger>
                        </TabsList>

                        {/* Cronometer Panel */}
                        <TabsContent value="cronometer" className="mt-2">
                            <div className={`flex flex-col items-center gap-3 py-3 rounded-xl transition-colors
                                 ${isCronometerRunning
                                    ? "ring-2 ring-primary/30 bg-primary/5" : "bg-muted/20"
                                }`}>

                                {/* Time Display */}
                                <CronometerTimeDisplay isRunning={isCronometerRunning} />

                                {/* Controls */}
                                <div className="flex gap-2 w-full px-4">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={toggleCronometer}
                                        className={`flex-1 h-9 gap-2 transition-all 
                                                            ${isCronometerRunning ?
                                                "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                            }`}
                                    >
                                        {isCronometerRunning ? (
                                            <>
                                                <Square className="h-3.5 w-3.5 fill-current" />
                                                Parar
                                            </>

                                        ) : (
                                            <>
                                                <Play className="h-3.5 w-3.5 fill-current" />
                                                Iniciar
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResetCronometer}
                                        disabled={isCronometerRunning}
                                        title="Resetar"
                                        className="h-9 shrink-0 text-muted-foreground hover:text-foreground"
                                    >
                                        Resetar
                                    </Button>
                                    <Button
                                        type={"button"}
                                        variant="outline"
                                        size="sm"
                                        className={cn("rounded-full h-8 text-xs text-muted-foreground hover:text-foreground focus-visible:ring-primary/40")}
                                        onClick={() => setIsFocusModeOpen(true)}
                                        title="Entrar no modo focado"
                                    >
                                        Modo foco <Maximize2 className="h-3.5 w-3.5 ml-1.5 text-primary" />
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Empty tab content for manual — times below are always shown */}
                        <TabsContent value="manual" className="mt-0" />
                    </Tabs>



                    {/* Start / End Time */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1 mr-4">
                            <Label htmlFor="study_date" className="text-[10px] font-medium text-foreground/80">
                                Data
                            </Label>
                            <Input
                                id="study_date"
                                type="date"
                                value={formatDateForInputLocal(form.study_date)}
                                className="h-8 text-xs bg-background/60 focus-visible:ring-primary/40"
                                onChange={(e) => handleStudyDateChange(e.target.value)}
                            />
                        </div>
                        {/* Hora Início */}
                        <div className="space-y-1">
                            <Label htmlFor="start_time" className="text-[10px] font-medium text-foreground/80">
                                Início
                            </Label>
                            <div className="flex gap-1">
                                <Input
                                    id="start_time"
                                    type="time"
                                    disabled={timeRegisterType === "cronometer"}
                                    value={formatTime(form.start_time)}
                                    className="h-8 text-xs bg-background/60 focus-visible:ring-primary/40 min-w-0"
                                    onChange={(e) => handleTimeInput("start_time", e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentTime("start_time")}
                                    disabled={timeRegisterType === "cronometer"}
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
                                    disabled={timeRegisterType === "cronometer"}
                                    value={formatTime(form.end_time)}
                                    className={`h-8 text-xs bg-background/60 focus-visible:ring-primary/40 min-w-0 ${endTimeError ? "border-destructive ring-destructive/30" : ""
                                        }`}
                                    onChange={(e) => handleTimeInput("end_time", e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentTime("end_time")}
                                    disabled={timeRegisterType === "cronometer"}
                                    title="Hora atual"
                                    className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                    <ClockArrowUp className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            {endTimeError && (
                                <p className="text-[10px] text-destructive leading-tight">{endTimeError}</p>
                            )}
                        </div>
                    </div>



                    {/* Duration Badge */}
                    {duration > 0 && (
                        <div className="flex items-center justify-between rounded-lg bg-primary/8 border border-primary/20 px-3 py-1.5">
                            <span className="text-[10px] text-muted-foreground font-medium">Duração calculada</span>
                            <span className="text-xs font-semibold text-primary tabular-nums">
                                {Math.floor(duration / 60) > 0 && `${Math.floor(duration / 60)}h `}
                                {duration % 60}min
                            </span>
                        </div>
                    )}

                    {/* Date */}

                </CardContent>
            </Card>

            {isFocusModeOpen && (
                <div className="fixed inset-0 z-50 bg-background/95">
                    <Card className="h-screen w-screen rounded-none border-none bg-background/70">
                        <CardContent className="h-full relative flex items-center justify-center p-6">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="absolute top-5 right-5"
                                onClick={() => setIsFocusModeOpen(false)}
                                title="Sair do modo focado"
                            >
                                Minimizar <Minimize2 size={128} />
                            </Button>

                            <div>
                                <div className="text-center select-none space-y-3">
                                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Modo focado</p>
                                    <div className="flex flex-col items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="default"
                                            onClick={() => setIsTimeHiddenFocus(!isTimeHiddenFocus)}
                                            title={isTimeHiddenFocus ? "Mostrar tempo" : "Ocultar tempo"}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Alterar
                                            {isTimeHiddenFocus ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </Button>
                                        <FocusModeTimeDisplay
                                            isRunning={isCronometerRunning}
                                            isTimeHidden={isTimeHiddenFocus}
                                        />
                                    </div>
                                </div>
                                {/* Display Materia and Topico if available */}
                                <div className="text-center mt-4">

                                    <p className="text-lg font-semibold text-foreground">
                                        {form.subjectId ?? "Matéria não selecionada"}
                                    </p>


                                    <p className="text-md text-muted-foreground">
                                        {form.topicId ?? "Tópico não selecionado"}
                                    </p>

                                </div>

                                <div className="w-full flex items-center justify-center gap-4">
                                    <Button
                                        type="button"
                                        onClick={toggleCronometer}
                                        className={`gap-2 transition-all 
                                        ${isCronometerRunning ?
                                                "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                            }`}
                                    >
                                        {isCronometerRunning ? (
                                            <>
                                                <Square className="fill-current" />
                                                Parar
                                            </>
                                        ) : (
                                            <>
                                                <Play className="fill-current" />
                                                Iniciar
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleResetCronometer}
                                        disabled={isCronometerRunning}
                                        title="Resetar"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Resetar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    )
}