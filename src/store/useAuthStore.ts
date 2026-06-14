import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
    id: string;
    name: string | null;
    email: string;
}

interface AuthState {
    user: User | null;
    hasHydrated: boolean;
    setUser: (user: User | null) => void;
    setHasHydrated: (hasHydrated: boolean) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            hasHydrated: false,
            setUser: (user) => set({ user }),
            setHasHydrated: (hasHydrated) => set({ hasHydrated }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

// Sincroniza o estado de autenticação entre abas via evento storage do localStorage.
// O evento 'storage' só dispara nas OUTRAS abas, então não há loop infinito.
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
        // Verifica se a chave do evento é a mesma usada para armazenar o estado de autenticação
        if (event.key === 'auth-storage') {
            // O valor armazenado é uma string JSON, então precisamos parsear para obter o objeto User
            // O valor pode ser null se o usuário tiver sido deslogado, então lidamos com isso também
            const user = event.newValue ? (JSON.parse(event.newValue)?.state?.user ?? null): null;
            useAuthStore.setState({ user });
        }
    });
}
