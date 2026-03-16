"use client";

import { useEffect } from "react";

import { ErrorState } from "@/shared/components/error-state";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      description={error.message || "La aplicación encontró un error inesperado."}
      fullPage
      onRetry={reset}
      title="Error de aplicación"
    />
  );
}
