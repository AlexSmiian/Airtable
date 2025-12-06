// src/components/providers/ReactQueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
    // useState гарантує, що клієнт створюється лише один раз за життєвий цикл компонента
    const [queryClient] = useState(() => new QueryClient({
        // Додайте налаштування за замовчуванням
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 хвилина
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}