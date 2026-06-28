"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { updateProfile } from "@/server/actions/profile.action";
import { Loader2 } from "lucide-react";
import type { ProfileUser } from "../types";
import { useRouter } from "next/navigation";

export function AccountSettingsCard({ user }: { user: ProfileUser }) {
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const router = useRouter();

  async function handleSaveUsername() {
    try {
      setLoadingUsername(true);
      await updateProfile({ username });
      alert("Username atualizado com sucesso!");
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Erro ao atualizar username");
    } finally {
      setLoadingUsername(false);
    }
  }

  async function handleSaveEmail() {
    try {
      setLoadingEmail(true);
      const { error } = await authClient.changeEmail({ newEmail: email, callbackURL: window.location.href });
      if (error) throw new Error(error.message);
      alert("Email atualizado com sucesso! (Pode ser necessário verificar o novo email)");
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Erro ao atualizar email");
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleChangePassword() {
    try {
      setLoadingPassword(true);
      const { error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });
      if (error) throw new Error(error.message);
      alert("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e: any) {
      alert(e.message || "Erro ao alterar senha");
    } finally {
      setLoadingPassword(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 py-2">
      {/* USERNAME */}
      <div className="grid gap-3">
        <div>
          <Label htmlFor="account-username">Username</Label>
          <p className="text-xs text-foreground/50 mb-2">Seu identificador único na plataforma.</p>
        </div>
        <div className="flex gap-2">
          <Input
            id="account-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-foreground/5 border-border text-foreground flex-1"
            placeholder="Seu username"
          />
          <Button 
            onClick={handleSaveUsername} 
            disabled={loadingUsername || username === user.username}
            variant="outline"
            className="border-border bg-foreground/5 hover:bg-foreground/10 text-foreground"
          >
            {loadingUsername ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </Button>
        </div>
      </div>

      {/* EMAIL */}
      <div className="grid gap-3">
        <div>
          <Label htmlFor="account-email">Endereço de Email</Label>
          <p className="text-xs text-foreground/50 mb-2">O email que você usa para fazer login.</p>
        </div>
        <div className="flex gap-2">
          <Input
            id="account-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-foreground/5 border-border text-foreground flex-1"
            placeholder="voce@exemplo.com"
          />
          <Button 
            onClick={handleSaveEmail} 
            disabled={loadingEmail || email === user.email}
            variant="outline"
            className="border-border bg-foreground/5 hover:bg-foreground/10 text-foreground"
          >
            {loadingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </Button>
        </div>
      </div>

      {/* PASSWORD */}
      <div className="grid gap-3 pt-2 border-t border-border">
        <div>
          <Label>Alterar Senha</Label>
          <p className="text-xs text-foreground/50 mb-2">Para sua segurança, informe a senha atual.</p>
        </div>
        <div className="grid gap-3">
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="bg-foreground/5 border-border text-foreground"
            placeholder="Senha atual"
          />
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-foreground/5 border-border text-foreground"
            placeholder="Nova senha"
          />
          <Button 
            onClick={handleChangePassword} 
            disabled={loadingPassword || !currentPassword || !newPassword}
            variant="outline"
            className="border-border bg-foreground/5 hover:bg-foreground/10 text-foreground w-full"
          >
            {loadingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar Senha"}
          </Button>
        </div>
      </div>
    </div>
  );
}
