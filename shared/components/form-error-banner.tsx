import { AlertTriangle } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type FormErrorBannerProps = {
  className?: string;
  message?: string | null;
  title?: string;
};

function FormErrorBanner({
  className,
  message,
  title = "No fue posible completar la operacion.",
}: FormErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive",
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p>{message}</p>
      </div>
    </div>
  );
}

export { FormErrorBanner };
