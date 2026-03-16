import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type PageHeaderProps = {
  actions?: ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  title: string;
};

function PageHeader({ actions, className, description, eyebrow, title }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{eyebrow}</p>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export { PageHeader };
