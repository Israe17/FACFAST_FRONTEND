import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Boxes } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type EmptyStateProps = {
  action?: React.ReactNode;
  className?: string;
  description: string;
  icon?: LucideIcon;
  title: string;
};

function EmptyState({
  action,
  className,
  description,
  icon: Icon = Boxes,
  title,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/70 p-8 text-center",
        className,
      )}
    >
      <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
        <Icon className="size-6" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
