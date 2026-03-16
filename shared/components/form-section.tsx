import type * as React from "react";

import { cn } from "@/shared/lib/utils";

type FormSectionProps = {
  children: React.ReactNode;
  className?: string;
  description?: string;
  title: string;
};

export function FormSection({ children, className, description, title }: FormSectionProps) {
  return (
    <section className={cn("space-y-4 rounded-xl border border-border/70 p-4", className)}>
      <div className="space-y-1">
        <h3 className="font-semibold">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
