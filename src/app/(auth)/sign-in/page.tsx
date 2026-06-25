"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeClosed, LogInIcon, UserPlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";

import { getEmailByUsernameAction } from "@/server/actions/user.actions";

const formSchema = z.object({
    name: z.string().min(2, "Informe seu username ou e-mail"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type FormData = z.infer<typeof formSchema>;

export default function SignInPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(formSchema)
    });

    async function handleSignIn(data: FormData) {
        try {
            const inputValue = data.name.trim();
            let email = inputValue;

            if (!inputValue.includes("@")) {
                const foundEmail = await getEmailByUsernameAction(inputValue);
                if (!foundEmail) {
                    toast.error("Usuário não encontrado");
                    return;
                }
                email = foundEmail;
            }
            
            const { error } = await authClient.signIn.email({
                email: email,
                password: data.password
            });

            if (error) {
                toast.error(error.message || "Erro ao fazer login");
            } else {
                toast.success("Bem-vindo de volta!");
                router.push("/dashboard");
            }
        } catch {
            toast.error("Ocorreu um erro inesperado");
        }
    }

    return (
        <div className="fixed inset-0 bg-linear-to-r from-background to-muted mx-auto z-999 p-4 flex items-center justify-center overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full max-w-5xl mx-auto py-8">

                {/* Motivational Section */}
                <div className="hidden md:flex flex-col items-center text-center md:text-left md:items-start space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-bold md:text-6xl text-primary">StudiLab</h1>
                        <p className="text-xl text-muted-foreground max-w-md">
                            Acompanhe seu progresso, otimize seu tempo e alcance seus objetivos acadêmicos com foco e disciplina.
                        </p>
                    </div>

                </div>

                {/* Form Section */}
                <div className="w-full flex justify-center">
                    <Card className="w-full max-w-md shadow-xl border-primary/10">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
                            <CardDescription>
                                Acesse sua conta para continuar sua jornada de estudos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(handleSignIn)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Username ou E-mail</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="seu_usuario ou seu@email.com"
                                        {...register("name")}
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Senha</Label>
                                        <Link href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="******"
                                            {...register("password")}
                                            className={errors.password ? "border-destructive" : ""}
                                        />

                                        {showPassword ? (
                                            <Eye
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 h-4 w-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted-foreground" />
                                        ) : (
                                            <EyeClosed
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 h-4 w-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted-foreground" />
                                        )}
                                    </div>

                                    {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
                                </div>

                                <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        "Entrando..."
                                    ) : (
                                        <>
                                            <LogInIcon className="mr-2 h-4 w-4" />
                                            Entrar
                                        </>
                                    )}
                                </Button>

                                <Separator className="my-4" />

                                <div className="text-center space-y-3">
                                    <p className="text-sm text-muted-foreground">Ainda não tem uma conta?</p>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/sign-up">
                                            <UserPlusIcon className="mr-2 h-4 w-4" />
                                            Criar Nova Conta
                                        </Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
