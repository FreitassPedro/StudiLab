"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles } from "lucide-react";
import { useBulkCreateSubjects } from "@/hooks/useSubjects";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ENEM_DATA = [
    {
        name: "Matemática",
        color: "#3B82F6",
        topics: ["Álgebra", "Geometria Plana", "Geometria Espacial", "Estatística", "Probabilidade", "Trigonometria", "Funções"]
    },
    {
        name: "Física",
        color: "#EF4444",
        topics: ["Mecânica", "Termologia", "Óptica", "Ondulatória", "Eletricidade", "Magnetismo"]
    },
    {
        name: "Química",
        color: "#10B981",
        topics: ["Química Geral", "Físico-Química", "Química Orgânica", "Química Inorgânica", "Meio Ambiente"]
    },
    {
        name: "Biologia",
        color: "#F59E0B",
        topics: ["Citologia", "Genética", "Evolução", "Ecologia", "Fisiologia Humana", "Botânica"]
    },
    {
        name: "História",
        color: "#8B5CF6",
        topics: ["História do Brasil", "História Geral"]
    },
    {
        name: "Geografia",
        color: "#EC4899",
        topics: ["Geografia Física", "Geografia Humana", "Geografia do Brasil", "Geopolítica"]
    },
    {
        name: "Português",
        color: "#06B6D4",
        topics: ["Gramática", "Interpretação de Texto", "Literatura"]
    },
    {
        name: "Filosofia",
        color: "#1E3A8A",
        topics: ["Surgimento da Filosofia", "Filosofia Antiga", "Filosofia Medieval", "Filosofia Moderna", "Filosofia Contemporânea", "Ética e Política"]
    },
    {
        name: "Sociologia",
        color: "#1E40AF",
        topics: ["Cultura e Identidade", "Trabalho e Produção", "Estado e Democracia", "Movimentos Sociais", "Desigualdades Sociais"]
    }
];

export function EnemSuggestionsDialog() {
    const [open, setOpen] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState<Record<string, boolean>>(
        Object.fromEntries(ENEM_DATA.map(s => [s.name, true]))
    );
    const [selectedTopics, setSelectedTopics] = useState<Record<string, Record<string, boolean>>>(
        Object.fromEntries(ENEM_DATA.map(s => [
            s.name,
            Object.fromEntries(s.topics.map(t => [t, true]))
        ]))
    );

    const bulkCreate = useBulkCreateSubjects();

    const handleToggleSubject = (subjectName: string) => {
        setSelectedSubjects(prev => {
            const newState = !prev[subjectName];
            // Also toggle all topics for this subject
            setSelectedTopics(prevTopics => ({
                ...prevTopics,
                [subjectName]: Object.fromEntries(
                    ENEM_DATA.find(s => s.name === subjectName)!.topics.map(t => [t, newState])
                )
            }));
            return { ...prev, [subjectName]: newState };
        });
    };

    const handleToggleTopic = (subjectName: string, topicName: string) => {
        setSelectedTopics(prev => {
            const subjectTopics = { ...prev[subjectName], [topicName]: !prev[subjectName][topicName] };

            // If at least one topic is selected, select the subject
            const anyTopicSelected = Object.values(subjectTopics).some(v => v);
            if (anyTopicSelected && !selectedSubjects[subjectName]) {
                setSelectedSubjects(prevS => ({ ...prevS, [subjectName]: true }));
            }

            return { ...prev, [subjectName]: subjectTopics };
        });
    };

    const handleAddSelected = async () => {
        const toAdd = ENEM_DATA
            .filter(s => selectedSubjects[s.name])
            .map(s => ({
                name: s.name,
                color: s.color,
                topics: s.topics.filter(t => selectedTopics[s.name][t])
            }))
            .filter(s => s.topics.length > 0 || selectedSubjects[s.name]);

        if (toAdd.length === 0) {
            toast.error("Selecione ao menos uma matéria ou tópico");
            return;
        }

        try {
            await bulkCreate.mutateAsync(toAdd);
            toast.success("Sugestões adicionadas com sucesso!");
            setOpen(false);
        } catch (error) {
            toast.error("Erro ao adicionar sugestões");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-dashed border-primary text-primary hover:bg-primary/5">
                    <Sparkles size={16} />
                    Sugestões ENEM
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary" />
                        Sugestões de Matérias (ENEM)
                    </DialogTitle>
                </DialogHeader>


                <p className="text-sm text-muted-foreground mb-4">
                    Selecione as matérias e tópicos que deseja adicionar ao seu cronograma.
                    Matérias que você já possui serão apenas atualizadas com novos tópicos.
                </p>

                <ScrollArea className="flex pr-4 overflow-y-auto">
                    <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ENEM_DATA.map((subject) => (
                            <Card key={subject.name} className={cn("border rounded-lg  p-2 overflow-hidden h-min ", selectedSubjects[subject.name] ? "border-muted/20 hover:bg-muted/50 bg-card/60" : "border-transparent bg-card/30 opacity-50")}>
                                <CardHeader
                                    className="flex items-center cursor-pointer transition-colors"
                                    onClick={() => handleToggleSubject(subject.name)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedSubjects[subject.name]}
                                        onChange={() => { }} // Handled by div click
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: subject.color }}
                                    />
                                    <span className="font-medium flex-1">{subject.name}</span>
                                    <ArrowDown size={16} className={cn("transition-transform", selectedSubjects[subject.name] ? "rotate-0" : "rotate-90")} />
                                </CardHeader>

                                {selectedSubjects[subject.name] && (
                                    <CardContent className="h-min">
                                        <div className="p-2 grid grid-cols-1 gap-2 shrink-0 border-t border-t-muted">
                                            {subject.topics.map(topic => (
                                                <div
                                                    key={topic}
                                                    className="flex   items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => handleToggleTopic(subject.name, topic)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTopics[subject.name][topic]}
                                                        onChange={() => { }} // Handled by div click
                                                        className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm">{topic}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>

                                )}
                            </Card>
                        ))}
                    </div>
                </ScrollArea>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAddSelected} disabled={bulkCreate.isPending}>
                        {bulkCreate.isPending ? "Adicionando..." : "Adicionar Selecionados"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
