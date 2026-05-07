"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

import { APP_ROUTES } from "@/shared/lib/routes";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatRouteSegment } from "@/shared/lib/utils";

function AppBreadcrumbs() {
  const { t } = useAppTranslator();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const segmentLabel = (segment: string) => {
    const labelMap: Record<string, string> = {
      branches: t("branches.page_title"),
      business: t("nav.business"),
      contacts: t("contacts.page_title"),
      dashboard: t("nav.dashboard"),
      dispatch: t("nav.dispatch"),
      inventory: t("nav.inventory"),
      roles: t("nav.roles"),
      sales: t("nav.sales"),
      users: t("users.page_title"),
    };
    return labelMap[segment] ?? formatRouteSegment(segment);
  };

  const breadcrumbs = segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join("/")}`,
    label: segmentLabel(segment),
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link
        className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-foreground transition-colors hover:bg-muted"
        href={APP_ROUTES.dashboard}
      >
        <Home className="size-4" />
        <span className="hidden sm:inline">{t("nav.dashboard")}</span>
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
