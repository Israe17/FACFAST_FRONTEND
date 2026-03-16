"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type InventoryBreadcrumbItem = {
  href?: string;
  label: string;
};

type InventoryBreadcrumbsProps = {
  items: InventoryBreadcrumbItem[];
};

function InventoryBreadcrumbs({ items }: InventoryBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link className="transition-colors hover:text-foreground" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-foreground" : undefined}>{item.label}</span>
            )}
            {!isLast ? <ChevronRight className="size-4" /> : null}
          </div>
        );
      })}
    </nav>
  );
}

export { InventoryBreadcrumbs };
