"use client";

import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className={cn("border-border/70 bg-card/95", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export { DetailBlock };
