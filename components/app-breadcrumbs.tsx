"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

import { APP_ROUTES } from "@/shared/lib/routes";
import { formatRouteSegment } from "@/shared/lib/utils";

function AppBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join("/")}`,
    label: formatRouteSegment(segment),
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link
        className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-foreground transition-colors hover:bg-muted"
        href={APP_ROUTES.dashboard}
      >
        <Home className="size-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      {breadcrumbs.map((breadcrumb) => (
        <div key={breadcrumb.href} className="flex items-center gap-2">
          <ChevronRight className="size-4 text-muted-foreground/70" />
          <Link
            className="truncate rounded-md px-2 py-1 transition-colors hover:bg-muted hover:text-foreground"
            href={breadcrumb.href}
          >
            {breadcrumb.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}

export { AppBreadcrumbs };
