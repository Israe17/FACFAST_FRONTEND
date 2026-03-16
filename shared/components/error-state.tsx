import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

type ErrorStateProps = {
  className?: string;
  description?: string;
  fullPage?: boolean;
  onRetry?: () => void;
  title?: string;
};

function ErrorState({
  className,
  description = "No fue posible cargar esta sección.",
  fullPage,
  onRetry,
  title = "Algo salió mal",
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 p-8",
        fullPage && "min-h-screen rounded-none border-0 bg-transparent",
        className,
      )}
    >
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Reintentar
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { ErrorState };
