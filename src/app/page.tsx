import { getCurrentUser } from "@/server/actions/getCurrentUser";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (currentUser?.id) {
    redirect("/dashboard");
  }

  // Unauthenticated: show a minimal landing with links to sign-in and demo
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4 text-center animate-in fade-in duration-700">
      <div className="space-y-4 max-w-lg">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 px-4 py-2 rounded-full text-sm font-semibold border border-violet-500/20">
          <Sparkles className="w-4 h-4" />
          Monitor de Estudos
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight">
          Bem-vindo ao{" "}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            StudiLab
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Acompanhe suas sessões de estudo, visualize seu progresso e mantenha a consistência.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/sign-in"
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 font-bold px-8 py-3.5 rounded-full shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 text-base"
        >
          Entrar na conta
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/demo"
          className="flex items-center justify-center gap-2 border border-border hover:border-violet-400 text-foreground hover:text-violet-600 font-semibold px-8 py-3.5 rounded-full transition-all hover:bg-violet-500/5 text-base"
        >
          <Sparkles className="w-4 h-4 text-violet-500" />
          Explorar sem conta
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/sign-up" className="text-primary hover:underline font-medium">
          Criar gratuitamente
        </Link>
      </p>
    </div>
  );
}
