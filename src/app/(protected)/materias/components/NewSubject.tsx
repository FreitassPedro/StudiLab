"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PaletteIcon, Plus, SparkleIcon, XIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { useCreateSubject, SubjectCreate } from '@/hooks/useSubjects';
import { useRouter } from 'next/navigation';
import { EnemSuggestionsDialog } from './EnemSuggestionsDialog';
import { useForm, useWatch } from 'react-hook-form';

const EMOJIS = ['📚', '📐', '🔬', '💻', '🌍', '🎨', '🧠', '⚡', '📝', '💡', '📊', '🏛️'];

const PRESET_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export function NewSubject() {
    const router = useRouter();
    const createSubject = useCreateSubject();
    const [isExpanded, setIsExpanded] = React.useState(false);

    const [rgbColor, setRgbColor] = React.useState('#f1f1f1');

    const { control, register, handleSubmit, setValue, reset } = useForm<{
        name: string;
        color: string;
        icon: string;
    }>({
        defaultValues: {
            name: '',
            color: '',
            icon: EMOJIS[0],
        },
    });

    const [name, color, icon] = useWatch({
        control,
        name: ['name', 'color', 'icon']
    });

    const colorInputRef = React.useRef<HTMLInputElement>(null);

    const handleRgbColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setRgbColor(color);
        setValue('color', color);
    };

    const handleCreate = async (data: SubjectCreate) => {
        if (!data.name.trim()) {
            toast.error('Digite o nome da matéria');
            return;
        }

        try {
            await createSubject.mutateAsync({
                name: data.name.trim(),
                color: data.color,
                icon: data.icon || "",
            });
            router.refresh();
            reset();
            setIsExpanded(false);
            toast.success('Matéria criada!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao criar matéria';
            toast.error(errorMessage);
            console.error(error);
        }
    };


    if (!isExpanded) {
        return (
            <Card
                className="border-border/60 border-dashed shadow-sm py-3 cursor-pointer hover:border-primary/50 transition-colors mb-6"
                onClick={() => setIsExpanded(true)}
            >
                <div className="flex flex-row items-center gap-3 p-1 justify-center">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-semibold text-foreground">Criar nova matéria</div>
                </div>
            </Card>
        );
    }

    return (
        <div className='flex flex-col md:flex-row gap-6 mb-8 animate-in fade-in duration-300'>
            <Card className='flex-1 max-w-2xl border-border/60 shadow-sm'>
                <CardHeader className="flex flex-row items-center justify-between  border-b border-border/40">
                    <CardTitle className="text-lg">Nova Matéria</CardTitle>
                    <div className="flex items-center gap-2">
                        <EnemSuggestionsDialog />
                        <div >
                            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="text-muted-foreground hover:text-foreground flex items-center gap-2">
                                Cancelar
                                <XIcon />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(handleCreate)} className="space-y-6">

                        <div className="space-y-1.5">
                            <Label htmlFor="subjectName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Identificação</Label>
                            <div className="flex items-center gap-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="rounded-xl border-2 flex items-center justify-center w-12 h-12 cursor-pointer hover:opacity-80 transition-all shadow-sm"
                                            style={{ backgroundColor: color, borderColor: `${color}40` }}
                                        >
                                            <span className="text-2xl">{icon}</span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-56 grid grid-cols-4 gap-2 p-2 rounded-xl">
                                        {EMOJIS.map((emoji) => (
                                            <DropdownMenuItem
                                                key={emoji}
                                                onClick={() => setValue('icon', emoji)}
                                                className="flex items-center justify-center text-xl p-2 cursor-pointer rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                            >
                                                {emoji}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Input
                                    id="subjectName"
                                    placeholder="Ex: Matemática, Biologia..."
                                    {...register('name')}
                                    maxLength={50}
                                    className="h-12 text-base rounded-xl bg-muted/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cor do Caderno</Label>
                            <div className='flex flex-wrap gap-2 items-center p-3 rounded-xl border border-border/40 bg-muted/10'>
                                <div className={`relative ${color === rgbColor ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''} rounded-full`}>
                                    <button
                                        type='button'
                                        onClick={() => colorInputRef.current?.click()}
                                        className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform flex items-center justify-center shadow-sm"
                                        style={{ backgroundColor: rgbColor }}
                                        title="Escolher cor personalizada">
                                        <PaletteIcon className="w-3.5 h-3.5 text-white/70 mix-blend-difference" />
                                    </button>

                                    <input
                                        ref={colorInputRef}
                                        type="color"
                                        value={rgbColor}
                                        onChange={handleRgbColorChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>

                                <div className='w-px h-6 bg-border/50 mx-1'></div>

                                <div className="flex flex-wrap gap-2">
                                    {PRESET_COLORS.map((presetColor) => (
                                        <button
                                            key={presetColor}
                                            type="button"
                                            onClick={() => setValue('color', presetColor)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm hover:scale-110 ${presetColor === color
                                                ? 'border-foreground scale-110 ring-2 ring-primary/20 ring-offset-1 ring-offset-background'
                                                : 'border-transparent'
                                                }`}
                                            style={{ backgroundColor: presetColor }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={createSubject.isPending} className="w-full h-11 rounded-xl text-base font-medium mt-2">
                            <Plus className="h-5 w-5 mr-2" />
                            {createSubject.isPending ? 'Criando...' : 'Criar Matéria'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {name?.length > 0 && (
                <div className='w-full md:w-64 shrink-0 flex flex-col pt-2 animate-in slide-in-from-right-4 duration-300'>
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2 px-1">
                        <SparkleIcon size={12} className="text-primary" />
                        Pré-visualização
                    </div>
                    <div className='bg-card relative rounded-2xl overflow-hidden border border-border/60 shadow-lg h-[220px] transition-all hover:-translate-y-1 hover:shadow-xl'>
                        <div className='w-3 absolute left-0 inset-y-0 transition-colors duration-300' style={{ backgroundColor: color }} />
                        <div className='flex flex-col pl-7 py-5 pr-5 gap-4 h-full'>
                            {/* Icon */}
                            <div className='w-14 h-14 rounded-xl flex items-center justify-center shadow-md transition-colors duration-300'
                                style={{ backgroundColor: color }}>
                                <div className='font-bold text-2xl drop-shadow-sm'>
                                    {icon}
                                </div>
                            </div>
                            <h4 className='font-bold text-foreground text-lg leading-tight line-clamp-2 mt-1'>{name}</h4>
                            {/* lines decorations */}
                            <div className='mt-auto space-y-2 opacity-80'>
                                {[100, 85, 60].map((percent) => (
                                    <div key={percent}
                                        className='h-1.5 rounded-full transition-colors duration-300'
                                        style={{ width: `${percent}%`, backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
