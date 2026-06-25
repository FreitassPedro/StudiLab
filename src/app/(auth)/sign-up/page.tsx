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
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
}).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

export default function SignUpPage() {
    const router = useRouter();

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
    });

    const password = watch("password");
    const confirmPassword = watch("confirmPassword");

    const passwordMatch = password === confirmPassword && confirmPassword.length > 0;

    const onSubmit = async (data: FormData) => {
        if (!passwordMatch) {
            toast.error("As senhas não coincidem");
            return;
        };
        try {
            const email = `${data.name.toLowerCase().replace(/\s+/g, "")}@example.com`;
            const { error } = await authClient.signUp.email({
                name: data.name,
                email: email,
                password: data.password
            });

            if (error) {
                toast.error(error.message || "Falha ao criar conta");
                return;
            }
            toast.success("Conta criada com sucesso!");
            router.push("/");

        } catch (error) {
            toast.error("Ocorreu um erro inesperado");
            console.error("Unexpected error:", error);
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
                                    <Label htmlFor="name">Nome de Usuário</Label>
                                    <Input
                                        id="name"
                                        placeholder="Seu usuário"
                                        {...register("name")}
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
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

                                <div className="text-center space-y-3">
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