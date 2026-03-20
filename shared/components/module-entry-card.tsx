import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";

type ModuleEntryCardProps = {
  badge?: ReactNode;
  className?: string;
  ctaLabel: string;
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
};

function ModuleEntryCard({
  badge,
  className,
  ctaLabel,
  description,
  href,
  icon: Icon,
  title,
}: ModuleEntryCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/70 bg-card/95 transition-all duration-200 hover:border-primary/20 hover:shadow-sm",
        className,
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/8 p-3 text-primary">
            <Icon className="size-5" />
          </div>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>

        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Button asChild className="w-full" variant="outline">
          <Link href={href}>
            {ctaLabel}
            <ChevronRight className="ml-auto size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export { ModuleEntryCard };
