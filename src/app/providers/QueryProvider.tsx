"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

interface Props {
    children: React.ReactNode;
}
export default function QueryProvider({ children }: Props) {
    const [queryClient] = React.useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 60 * 24,      // 24 horas — dados não mudam sozinhos
                gcTime: 1000 * 60 * 60 * 24 * 7,     // 7 dias — manter cache na memória
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchOnMount: false,            // CRÍTICO: Não refazer query ao montar se já tem cache
                retry: 1,
            },
        },
    }));

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}