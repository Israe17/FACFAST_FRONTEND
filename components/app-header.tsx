"use client";

import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";
import { usePathname } from "next/navigation";

import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { BranchSwitcher } from "@/components/branch-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ClearTenantContextButton } from "@/features/platform-context/components/clear-tenant-context-button";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { useActiveBusiness } from "@/shared/hooks/use-active-business";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { APP_ROUTES } from "@/shared/lib/routes";
import { formatBranchLabel } from "@/shared/lib/utils";

function AppHeader() {
  const pathname = usePathname();
  const { activeBusinessId, activeBusinessName } = useActiveBusiness();
  const { activeBranchId, isBusinessLevelContext } = useActiveBranch();
  const { isPlatformAdmin, isPlatformMode, isTenantContextMode, isTenantMode, mode } =
    usePlatformMode();
  const showTenantHeader = isTenantMode || isTenantContextMode;
  const showPlatformEntryAction =
    isPlatformAdmin && isPlatformMode && pathname !== APP_ROUTES.superadminEnterContext;
  const branchSummary = isBusinessLevelContext
    ? "Nivel empresa"
    : activeBranchId
      ? formatBranchLabel(activeBranchId)
      : "Sin sucursal";
  const businessSummary = activeBusinessName ?? activeBusinessId ?? "Sin empresa activa";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 hidden h-4 md:block" />
      <div className="min-w-0 flex-1">
        <AppBreadcrumbs />
      </div>

      <div className="hidden items-center gap-2 xl:flex">
        <Badge variant={isPlatformMode ? "default" : "outline"}>mode = {mode ?? "unknown"}</Badge>
        {showTenantHeader ? <Badge variant="outline">Empresa: {businessSummary}</Badge> : null}
        {showTenantHeader ? <Badge variant="outline">Sucursal: {branchSummary}</Badge> : null}
        {isTenantContextMode ? (
          <Badge variant="outline">Platform admin dentro del tenant</Badge>
        ) : null}
        {isPlatformMode ? <Badge variant="outline">Sin contexto tenant activo</Badge> : null}
      </div>

      <div className="flex items-center gap-2">
        {showTenantHeader ? <BranchSwitcher /> : null}
        {showPlatformEntryAction ? (
          <Button asChild variant="outline" size="sm">
            <Link href={APP_ROUTES.superadminEnterContext}>
              <ArrowRightLeft className="size-4" />
              <span className="hidden sm:inline">Entrar a empresa</span>
            </Link>
          </Button>
        ) : null}
        {isTenantContextMode ? <ClearTenantContextButton /> : null}
      </div>
    </header>
  );
}

export { AppHeader };
