"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRightLeft, Building2, Store, Waypoints } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BusinessDetailCard } from "@/features/platform-businesses/components/business-detail-card";
import {
  usePlatformBusinessBranchesQuery,
  usePlatformBusinessQuery,
} from "@/features/platform-businesses/queries";
import { DataCard } from "@/shared/components/data-card";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { PageHeader } from "@/shared/components/page-header";
import { APP_ROUTES } from "@/shared/lib/routes";

export default function SuperadminBusinessDetailPage() {
  const params = useParams<{ id: string }>();
  const businessId = params.id;
  const businessQuery = usePlatformBusinessQuery(businessId, Boolean(businessId));
  const branchesQuery = usePlatformBusinessBranchesQuery(businessId, Boolean(businessId));
  const totalBranches = branchesQuery.data?.length ?? 0;

  return (
    <>
      <PageHeader
        actions={
          <Button asChild>
            <Link href={`${APP_ROUTES.superadminEnterContext}?businessId=${businessId}`}>
              <ArrowRightLeft className="size-4" />
              Enter business
            </Link>
          </Button>
        }
        description="Detalle global de una empresa consultada desde /platform/businesses/:id."
        eyebrow="Platform"
        title={businessQuery.data?.name ?? "Business detail"}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DataCard
          description="Identificador real del business inspeccionado."
          icon={<Waypoints className="size-5" />}
          title="Business ID"
          value={businessId}
        />
        <DataCard
          description="Cantidad de sucursales expuestas por el endpoint de plataforma."
          icon={<Store className="size-5" />}
          title="Branches"
          value={totalBranches}
        />
        <DataCard
          description="Acceso directo al flujo de tenant context para este business."
          icon={<Building2 className="size-5" />}
          title="Context flow"
          value="Ready to enter"
        />
      </div>

      {businessQuery.isLoading ? <LoadingState description="Loading business detail." /> : null}
      {businessQuery.isError ? (
        <ErrorState
          description="Unable to load business detail."
          onRetry={() => businessQuery.refetch()}
        />
      ) : null}
      {businessQuery.data ? <BusinessDetailCard business={businessQuery.data} /> : null}

      <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Branches</h2>
            <p className="text-sm text-muted-foreground">
              Sucursales visibles desde `/platform/businesses/:id/branches`.
            </p>
          </div>
          <Badge variant="outline">{totalBranches} registradas</Badge>
        </div>

        {branchesQuery.isLoading ? <LoadingState description="Loading business branches." /> : null}
        {branchesQuery.isError ? (
          <ErrorState
            description="Unable to load branches for this business."
            onRetry={() => branchesQuery.refetch()}
          />
        ) : null}
        {branchesQuery.data?.length === 0 ? (
          <EmptyState
            description="This business has no branches returned by the platform endpoint."
            icon={Store}
            title="No branches found"
          />
        ) : null}
        {branchesQuery.data?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {branchesQuery.data.map((branch) => (
              <article
                key={branch.id}
                className="rounded-xl border border-border/70 bg-background/50 p-5"
              >
                <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
                  <div className="space-y-1">
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {branch.code ?? branch.branch_number ?? branch.id}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {branch.is_active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[0.72rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                        Branch ID
                      </p>
                      <p className="mt-1 text-sm">{branch.id}</p>
                    </div>
                    <div>
                      <p className="text-[0.72rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                        Numero
                      </p>
                      <p className="mt-1 text-sm">{branch.branch_number ?? "No disponible"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.72rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                      Ubicacion
                    </p>
                    <p className="mt-1 text-sm">
                      {[branch.province, branch.canton, branch.district]
                        .filter(Boolean)
                        .join(", ") || "No disponible"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[0.72rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                      Direccion
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {branch.address ?? "No address provided."}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
