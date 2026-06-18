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
                staleTime: 1000 * 60, // 1 minute
                gcTime: 1000 * 60 * 5, // 5 minutes
                refetchOnWindowFocus: false, // Optional: disable refetch on window focus for better performance
            },
        },
    }));

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}