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

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/24/svg" {...props}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
)

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
            console.log(email, inputValue);
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

    async function handleGoogleSignIn() {
        try {
            const { error } = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/dashboard"
            });
            if (error) {
                toast.error(error.message || "Erro ao fazer login com Google");
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

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-11"
                                    onClick={handleGoogleSignIn}
                                >
                                    <GoogleIcon className="mr-2 h-5 w-5" />
                                    Continuar com Google
                                </Button>

                                <div className="text-center space-y-3 mt-4">
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
