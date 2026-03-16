"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type * as React from "react";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { getQueryClient } from "@/shared/lib/query-client";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster closeButton position="top-right" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
