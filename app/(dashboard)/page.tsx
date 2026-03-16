"use client";

import Link from "next/link";
import {
  ArrowRightLeft,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  ContactRound,
  GitBranch,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentBusinessQuery } from "@/features/businesses/queries";
import { inventoryViewPermissions } from "@/features/inventory/constants";
import { ClearTenantContextButton } from "@/features/platform-context/components/clear-tenant-context-button";
import { DataCard } from "@/shared/components/data-card";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { PageHeader } from "@/shared/components/page-header";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { useSession } from "@/shared/hooks/use-session";
import { APP_ROUTES } from "@/shared/lib/routes";
import { formatBranchLabel } from "@/shared/lib/utils";

const TENANT_QUICK_LINKS = [
  {
    description: "Ver y editar la empresa activa del tenant.",
    href: APP_ROUTES.business,
    icon: BriefcaseBusiness,
    requiredAnyPermissions: ["businesses.view"],
    title: "Empresa",
  },
  {
    description: "Gestionar usuarios de la empresa seleccionada.",
    href: APP_ROUTES.users,
    icon: Users,
    requiredAnyPermissions: ["users.view"],
    title: "Users",
  },
  {
    description: "Administrar roles y permisos RBAC.",
    href: APP_ROUTES.roles,
    icon: ShieldCheck,
    requiredAnyPermissions: ["roles.view"],
    title: "Roles",
  },
  {
    description: "Operar sobre sucursales y terminales.",
    href: APP_ROUTES.branches,
    icon: Building2,
    requiredAnyPermissions: ["branches.view"],
    title: "Branches",
  },
  {
    description: "Gestionar clientes y proveedores.",
    href: APP_ROUTES.contacts,
    icon: ContactRound,
    requiredAnyPermissions: ["contacts.view"],
    title: "Contacts",
  },
  {
    description: "Catalogos y base operativa para productos, precios y stock.",
    href: APP_ROUTES.inventory,
    icon: Boxes,
    requiredAnyPermissions: [...inventoryViewPermissions],
    title: "Inventory",
  },
] as const;

export default function DashboardPage() {
  const { canAny, hasTenantContextAccess } = usePermissions();
  const { user } = useSession();
  const { isTenantContextMode, isTenantMode, mode } = usePlatformMode();
  const { activeBranchId, isBusinessLevelContext } = useActiveBranch();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const businessQuery = useCurrentBusinessQuery(canRunTenantQueries);
  const visibleQuickLinks = TENANT_QUICK_LINKS.filter((item) =>
    hasTenantContextAccess ? true : canAny([...item.requiredAnyPermissions]),
  );
  const branchSummary = isBusinessLevelContext
    ? "Nivel empresa"
    : activeBranchId
      ? formatBranchLabel(activeBranchId)
      : "Sin sucursal";

  return (
    <>
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href={APP_ROUTES.business}>
                <ArrowRightLeft className="size-4" />
                Ir a empresa
              </Link>
            </Button>
            {isTenantContextMode ? (
              <ClearTenantContextButton label="Volver a modo plataforma" />
            ) : null}
          </div>
        }
        description="Panel operativo del tenant activo. Desde aquÃ­ puedes entrar directamente a los mÃ³dulos administrativos reales."
        eyebrow={isTenantContextMode ? "Tenant Context" : "Tenant"}
        title={businessQuery.data?.name ?? `Bienvenido${user?.name ? `, ${user.name}` : ""}`}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">mode = {mode ?? "unknown"}</Badge>
        <Badge variant="outline">Empresa: {businessQuery.data?.name ?? "Cargando..."}</Badge>
        <Badge variant="outline">Sucursal: {branchSummary}</Badge>
        {isTenantContextMode ? (
          <Badge variant="outline">Operando como platform admin dentro del tenant</Badge>
        ) : null}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DataCard
          description="Empresa resuelta desde `/api/businesses/current`."
          icon={<BriefcaseBusiness className="size-5" />}
          title="Empresa activa"
          value={businessQuery.data?.name ?? "Cargando"}
        />
        <DataCard
          description="Cantidad de roles visibles en la sesiÃ³n actual."
          icon={<ShieldCheck className="size-5" />}
          title="Roles"
          value={user?.roles.length ?? 0}
        />
        <DataCard
          description="Contexto de sucursal actualmente activo."
          icon={<GitBranch className="size-5" />}
          title="Sucursal"
          value={branchSummary}
        />
        <DataCard
          description="MÃ³dulos tenant disponibles desde este contexto."
          icon={<Users className="size-5" />}
          title="MÃ³dulos"
          value={visibleQuickLinks.length}
        />
      </section>

      {businessQuery.isLoading ? <LoadingState description="Cargando empresa activa." /> : null}
      {businessQuery.isError ? (
        <ErrorState
          description="No fue posible cargar la empresa activa."
          onRetry={() => businessQuery.refetch()}
        />
      ) : null}
      {!businessQuery.isLoading && !businessQuery.isError && !businessQuery.data ? (
        <EmptyState
          description="La sesiÃ³n entrÃ³ al shell tenant, pero el backend no devolviÃ³ la empresa actual."
          icon={BriefcaseBusiness}
          title="Sin empresa activa"
        />
      ) : null}

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">NavegaciÃ³n tenant real</h2>
          <p className="text-sm text-muted-foreground">
            Estos accesos abren los mÃ³dulos operativos del tenant seleccionado sin volver al modo plataforma.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleQuickLinks.map((item) => (
            <article
              key={item.href}
              className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/60 p-5 transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-primary/15 bg-primary/8 p-3 text-primary">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>

              <Button asChild className="w-full" variant="outline">
                <Link href={item.href}>
                  Abrir módulo
                  <ChevronRight className="ml-auto size-4" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
