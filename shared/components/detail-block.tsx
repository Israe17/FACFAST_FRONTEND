"use client";

import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";

type DetailBlockProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
};

function DetailBlock({
  children,
  className,
  description,
  title,
}: DetailBlockProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border-border/70 bg-card/95 shadow-none",
        className,
      )}
    >
      <CardHeader className="gap-0.5 px-4 py-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
          {title}
        </CardTitle>
        {description ? (
          <p className="text-[11px] text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="px-4 py-3">{children}</CardContent>
    </Card>
  );
}

export { DetailBlock };
