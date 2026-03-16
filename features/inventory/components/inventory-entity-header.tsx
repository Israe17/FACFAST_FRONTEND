"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/components/page-header";

import { InventoryBreadcrumbs } from "./inventory-breadcrumbs";

type InventoryEntityHeaderProps = {
  actions?: ReactNode;
  badges?: ReactNode;
  backHref: string;
  backLabel: string;
  breadcrumbs: Array<{ href?: string; label: string }>;
  code?: string | null;
  description?: string;
  title: string;
};

function InventoryEntityHeader({
  actions,
  badges,
  backHref,
  backLabel,
  breadcrumbs,
  code,
  description,
  title,
}: InventoryEntityHeaderProps) {
  return (
    <div className="space-y-4">
      <InventoryBreadcrumbs items={breadcrumbs} />
      <PageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href={backHref}>
                <ArrowLeft className="size-4" />
                {backLabel}
              </Link>
            </Button>
            {actions}
          </div>
        }
        description={description}
        title={title}
      />
      <div className="flex flex-wrap gap-2">
        {code ? <Badge>{code}</Badge> : null}
        {badges}
      </div>
    </div>
  );
}

export { InventoryEntityHeader };
