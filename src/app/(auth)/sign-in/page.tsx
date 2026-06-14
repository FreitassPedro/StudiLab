"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { User2Icon } from "lucide-react";
import { useForm } from "react-hook-form";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormData = z.infer<typeof formSchema>;

export default function SignInPage() {
    const router = useRouter();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(formSchema)
    });

    async function handleSignIn(data: FormData) {
        try {
            const { error } = await authClient.signIn.email({
                email: data.email,
                password: data.password
            });

            if (error) {
                toast.error("Erro ao fazer login");
            } else {
                toast.success("Login bem-sucedido!");
                router.push("/dashboard");
            }
        } catch (error) {
            toast.error("Erro ao fazer login");
        }
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm mx-auto z-999 p-4 flex items-center justify-center">
            <Card className="w-full max-w-lg max-h-[85vh]">
                <CardHeader>
                    <CardTitle>Entrar</CardTitle>
                    <CardDescription>Acesse sua conta para continuar</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col min-h-0">
                    <form onSubmit={handleSubmit(handleSignIn)} className="flex flex-col flex-1 justify-between">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">E-mail</label>
                                <Input placeholder="seu@email.com" type="email" {...register("email")} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Senha</label>
                                <Input placeholder="******" type="password" {...register("password")} />
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                            <Button variant="default" className="w-full" type="submit">
                                Entrar
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
                                Voltar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
