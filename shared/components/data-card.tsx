import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";

type DataCardProps = {
  className?: string;
  description?: string;
  footer?: ReactNode;
  icon?: ReactNode;
  title: string;
  value: ReactNode;
};

function DataCard({ className, description, footer, icon, title, value }: DataCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex-row items-start justify-between gap-3 border-b-0 pb-2">
        <div className="space-y-1">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-3xl">{value}</CardTitle>
        </div>
        {icon ? (
          <div className="rounded-xl border border-primary/10 bg-primary/8 p-3 text-primary">{icon}</div>
        ) : null}
      </CardHeader>
      {description || footer ? (
        <CardContent className="pt-0">
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          {footer ? <div className="mt-4">{footer}</div> : null}
        </CardContent>
      ) : null}
    </Card>
  );
}

export { DataCard };
