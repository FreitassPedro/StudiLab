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
import { LogInIcon, UserPlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    username: z.string().min(2, "O username deve ter pelo menos 2 caracteres").regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e underline (_)"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
}).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
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

export default function SignUpPage() {
    const router = useRouter();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
    });


    const onSubmit = async (data: FormData) => {
        if (errors.confirmPassword) {
            toast.error(errors.confirmPassword.message);
            return;
        };
        try {
            const email = `${data.username.toLowerCase().replace(/\s+/g, "")}@email.com`;

            const { error } = await authClient.signUp.email({
                name: data.username,
                email: email,
                password: data.password,
            });

            if (error) {
                toast.error(error.message || "Falha ao criar conta");
                return;
            }

            toast.success("Conta criada com sucesso!");
            router.push("/");

        } catch (error) {
            toast.error("Ocorreu um erro ao criar a conta.");
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
        <div className="fixed inset-0 bg-linear-to-r from-background to-muted backdrop-blur-sm mx-auto z-999 p-4 flex items-center justify-center overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full max-w-5xl mx-auto py-8">

                {/* Motivational Section */}
                <div className="hidden md:flex flex-col items-center text-center md:text-left md:items-start space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-bold md:text-6xl text-primary">Junte-se ao StudiLab</h1>
                        <p className="text-xl text-muted-foreground max-w-md">
                            Comece sua jornada de aprendizado hoje mesmo. Transforme esforço em resultados reais.
                        </p>
                    </div>

                    <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20">
                        <Image
                            src="/images/studyUnc.gif"
                            alt="Incentivo aos estudos"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground italic">
                        <span className="h-px w-8 bg-muted-foreground/30"></span>
                        &quot;O segredo do sucesso é a constância no objetivo.&quot;
                    </div>
                </div>

                {/* Form Section */}
                <div className="w-full flex justify-center">
                    <Card className="w-full max-w-md shadow-xl border-primary/10">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
                            <CardDescription>
                                Preencha os dados abaixo para começar a monitorar seus estudos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username (@)</Label>
                                    <Input
                                        id="username"
                                        placeholder="seu_usuario"
                                        {...register("username")}
                                        className={errors.username ? "border-destructive" : ""}
                                    />
                                    {errors.username && <p className="text-xs text-destructive font-medium">{errors.username.message}</p>}
                                </div>

                                {/*
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        {...register("email")}
                                        className={errors.email ? "border-destructive" : ""}
                                    />
                                    {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
                                </div>
*/}
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground font-normal" htmlFor="password">Senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        {...register("password")}
                                        className={errors.password ? "border-destructive" : ""}
                                    />
                                    {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground font-normal" htmlFor="confirmPassword">Confirmar Senha</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirme sua senha"
                                        {...register("confirmPassword")}
                                        className={errors.confirmPassword ? "border-destructive" : ""}
                                    />
                                    {errors.confirmPassword && <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>}
                                </div>

                                <Button type="submit" className={cn("w-full mt-2", isSubmitting ? "opacity-50 cursor-not-allowed" : "")} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        "Criando conta..."
                                    ) : (
                                        <>
                                            <UserPlusIcon className="mr-2 h-4 w-4" />
                                            Registrar Agora
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
                                    Criar conta com Google
                                </Button>

                                <div className="text-center space-y-3 mt-4">
                                    <p className="text-sm text-muted-foreground">Já tem uma conta?</p>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/sign-in">
                                            <LogInIcon className="mr-2 h-4 w-4" />
                                            Fazer Login
                                        </Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Mobile-only Motivational Text */}
                <div className="md:hidden text-center space-y-4 pt-4">
                    <p className="text-muted-foreground italic text-sm">
                        &quot;O segredo do sucesso é a constância no objetivo.&quot;
                    </p>
                </div>
            </div>
        </div>
    );
}