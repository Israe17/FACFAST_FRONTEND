"use client";

import Link from "next/link";
import { ArrowRightLeft, Building2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BusinessesTable } from "@/features/platform-businesses/components/businesses-table";
import { usePlatformBusinessesQuery } from "@/features/platform-businesses/queries";
import { DataCard } from "@/shared/components/data-card";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { PageHeader } from "@/shared/components/page-header";
import { APP_ROUTES } from "@/shared/lib/routes";

export default function SuperadminBusinessesPage() {
  const businessesQuery = usePlatformBusinessesQuery(true);
  const totalBusinesses = businessesQuery.data?.length ?? 0;

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={APP_ROUTES.superadminEnterContext}>
                <ArrowRightLeft className="size-4" />
                Entrar a empresa
              </Link>
            </Button>
            <Button asChild>
              <Link href={APP_ROUTES.superadminBusinessNew}>
                <Plus className="size-4" />
                New business
              </Link>
            </Button>
          </>
        }
        description="Vista global de empresas disponibles para el operador de plataforma."
        eyebrow="Platform"
        title="Businesses"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DataCard
          description="Businesses visibles desde /platform/businesses."
          icon={<Building2 className="size-5" />}
          title="Global businesses"
          value={totalBusinesses}
        />
        <DataCard
          description="Punto de entrada recomendado para seleccionar tenant y sucursal."
          icon={<ArrowRightLeft className="size-5" />}
          title="Next flow"
          value="Enter context"
        />
        <DataCard
          description="Create new businesses using platform onboarding."
          icon={<Plus className="size-5" />}
          title="Next action"
          value="Onboarding"
        />
      </div>

      {businessesQuery.isLoading ? <LoadingState description="Loading global businesses." /> : null}
      {businessesQuery.isError ? (
        <ErrorState
          description="Unable to load platform businesses."
          onRetry={() => businessesQuery.refetch()}
        />
      ) : null}
      {businessesQuery.data?.length === 0 ? (
        <EmptyState
          action={
            <Button asChild>
              <Link href={APP_ROUTES.superadminBusinessNew}>
                <Plus className="size-4" />
                Create business
              </Link>
            </Button>
          }
          description="No businesses are available in platform context yet."
          icon={Building2}
          title="No businesses found"
        />
      ) : null}
      {businessesQuery.data?.length ? <BusinessesTable data={businessesQuery.data} /> : null}
    </>
  );
}
