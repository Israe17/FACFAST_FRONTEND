import { Loader2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type LoadingStateProps = {
  className?: string;
  description?: string;
  fullPage?: boolean;
  title?: string;
};

function LoadingState({
  className,
  description = "Estamos preparando la información inicial.",
  fullPage,
  title = "Cargando",
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/70 p-8",
        fullPage && "min-h-screen rounded-none border-0 bg-transparent",
        className,
      )}
    >
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <Loader2 className="size-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export { LoadingState };
