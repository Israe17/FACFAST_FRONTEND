import type * as React from "react";

import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";

type QueryStateWrapperProps = {
  children: React.ReactNode;
  errorDescription?: string;
  isError: boolean;
  isLoading: boolean;
  loadingDescription?: string;
  onRetry?: () => void;
};

export function QueryStateWrapper({
  children,
  errorDescription,
  isError,
  isLoading,
  loadingDescription,
  onRetry,
}: QueryStateWrapperProps) {
  if (isLoading) {
    return <LoadingState description={loadingDescription} />;
  }

  if (isError) {
    return <ErrorState description={errorDescription} onRetry={onRetry} />;
  }

  return <>{children}</>;
}
