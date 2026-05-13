"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { useState } from "react";
import { createQueryClient } from "@/lib/query-client";
import { PwaRuntime } from "@/components/pwa/pwa-runtime";
import { FcmForegroundListener } from "@/components/pwa/fcm-foreground-listener";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PwaRuntime />
      <FcmForegroundListener />
      {children}
      <Toaster position="top-right" richColors closeButton />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
