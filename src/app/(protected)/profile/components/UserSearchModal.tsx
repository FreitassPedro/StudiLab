"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { useProfileTheme } from "./ThemeContext";
import { Button } from "@/components/ui/button";

// Mock data for search
const MOCK_USERS = [
  { id: "1", name: "Ana Silva", username: "anasilva", image: null },
  { id: "2", name: "Pedro Freitas", username: "pedrofreitas", image: null },
  { id: "3", name: "Maria Clara", username: "mariac", image: null },
];

export function UserSearchModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { accent } = useProfileTheme();

  const filteredUsers = MOCK_USERS.filter((u) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-[#12121a] border-white/10 text-white max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Encontrar Amigos</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou @username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1"
              style={{ "--tw-ring-color": accent.accent } as React.CSSProperties}
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto px-2 pb-2">
          {filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-white/40 text-sm">
              Nenhum usuário encontrado.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-3 mx-2 my-1 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: `linear-gradient(135deg, ${accent.accent}, ${accent.accent2})` }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{user.name}</span>
                    <span className="text-xs text-white/40">@{user.username}</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-xs h-8"
                  style={{ color: accent.accent }}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Seguir
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
