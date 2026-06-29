"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PaletteIcon, Plus, SparkleIcon } from 'lucide-react';
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
            toast.success('Matéria criada!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao criar matéria';
            toast.error(errorMessage);
            console.error(error);
        }
    };


    return (
        <div className='grid grid-cols-1 md:grid-cols-6 gap-6'>
            <Card className='md:col-span-5 col-span-full border-border/60 shadow-sm'>
                <CardHeader className="flex items-center justify-between">
                    <CardTitle>Nova Matéria</CardTitle>
                    <EnemSuggestionsDialog />
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="subjectName">Nome</Label>
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className={`rounded-md border-2 flex items-center justify-center w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity`}
                                            style={{ backgroundColor: color }}
                                        >
                                            <span className="text-xl">{icon}</span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-48 grid grid-cols-4 gap-2 p-2">
                                        {EMOJIS.map((emoji) => (
                                            <DropdownMenuItem
                                                key={emoji}
                                                onClick={() => setValue('icon', emoji)}
                                                className="flex items-center justify-center text-xl p-2 cursor-pointer rounded-md hover:bg-muted shadow-sm"
                                            >
                                                {emoji}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Input
                                    id="subjectName"
                                    placeholder="Ex: Matemática, Biologia, Inglês..."
                                    {...register('name')}
                                    maxLength={50}
                                />
                            </div>

                        </div>

                        <div className="space-y-2">
                            <Label>Cor</Label>
                            <div className='flex flex-row space-x-2 items-center'>
                                <div className={`relative bg-card ${color === rgbColor
                                    ? 'border-foreground '
                                    : 'border-border/60'
                                    } border rounded-xl p-2 flex flex-row items-center justify-center gap-2`}>
                                    <PaletteIcon />

                                    <button
                                        type='button'
                                        onClick={() => colorInputRef.current?.click()}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform 
                                            ${color === rgbColor
                                                ? 'border-foreground scale-110'
                                                : 'border-transparent'
                                            } flex items-center justify-center text-[10px] font-bold text-white`}
                                        style={{ backgroundColor: rgbColor }}
                                        title="Escolher cor personalizada">
                                    </button>

                                    <input
                                        ref={colorInputRef}
                                        type="color"
                                        value={rgbColor}
                                        onChange={handleRgbColorChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className='border-r border-gray-300'></div>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setValue('color', color)}
                                            className={`w-6 h-6 rounded-full border-2 transition-transform ${color === color
                                                ? 'border-foreground scale-110'
                                                : 'border-transparent'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={createSubject.isPending} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            {createSubject.isPending ? 'Criando...' : 'Criar Matéria'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            {name?.length > 0 && (
                <div className='md:col-span-1 flex flex-col'>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <SparkleIcon size={10} />
                        Pre visalização
                    </div>
                    <div className='bg-card relative rounded-2xl flex-1 overflow-hidden border border-border/60 shadow-lg min-h-[200px]'>
                        <div className='w-3 absolute left-0 inset-y-0' style={{ backgroundColor: color }} />
                        <div className='flex flex-col pl-6 py-4 pr-5 gap-3 h-full flex-1'>
                            {/* Icon */}
                            <div className='w-12 h-12 rounded-lg flex items-center justify-center shadow-sm'
                                style={{ backgroundColor: color }}>
                                <div className='font-bold text-xl'>
                                    {icon}
                                </div>
                            </div>
                            <h4 className='font-semibold text-foreground text-base leading-tight'>{name}</h4>
                            {/* lines decorations */}
                            <div className='mt-auto space-y-1'>
                                {[100, 75, 50].map((percent) => (
                                    <div key={percent}
                                        className='h-[2px] rounded-full'
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
