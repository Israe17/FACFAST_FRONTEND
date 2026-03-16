"use client";

import { useEffect } from "react";
import { Building2, Globe2, MapPinned } from "lucide-react";
import { useForm } from "react-hook-form";

import { BusinessSettingsForm } from "@/features/businesses/components/business-settings-form";
import {
  useCurrentBusinessQuery,
  useUpdateCurrentBusinessMutation,
} from "@/features/businesses/queries";
import { updateCurrentBusinessSchema } from "@/features/businesses/schemas";
import type { UpdateCurrentBusinessInput } from "@/features/businesses/types";
import { DataCard } from "@/shared/components/data-card";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { buildFormResolver } from "@/shared/lib/form-resolver";

const defaultValues: UpdateCurrentBusinessInput = {
  address: "",
  canton: "",
  city: "",
  code: "",
  country: "",
  currency_code: "",
  district: "",
  email: "",
  identification_number: "",
  identification_type: undefined,
  is_active: true,
  language: "",
  legal_name: "",
  logo_url: "",
  name: "",
  phone: "",
  postal_code: "",
  province: "",
  timezone: "",
  website: "",
};

export default function BusinessPage() {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const { isTenantContextMode, isTenantMode } = usePlatformMode();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const canView = can("businesses.view");
  const canUpdate = can("businesses.update");
  const businessQuery = useCurrentBusinessQuery(canView && canRunTenantQueries);
  const updateBusinessMutation = useUpdateCurrentBusinessMutation({ showErrorToast: false });
  const form = useForm<UpdateCurrentBusinessInput>({
    defaultValues,
    resolver: buildFormResolver<UpdateCurrentBusinessInput>(updateCurrentBusinessSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (!businessQuery.data) {
      return;
    }

    form.reset({
      address: businessQuery.data.address ?? "",
      canton: businessQuery.data.canton ?? "",
      city: businessQuery.data.city ?? "",
      code: businessQuery.data.code ?? "",
      country: businessQuery.data.country ?? "",
      currency_code: businessQuery.data.currency_code ?? "",
      district: businessQuery.data.district ?? "",
      email: businessQuery.data.email ?? "",
      identification_number: businessQuery.data.identification_number ?? "",
      identification_type: businessQuery.data.identification_type as
        | UpdateCurrentBusinessInput["identification_type"]
        | undefined,
      is_active: businessQuery.data.is_active,
      language: businessQuery.data.language ?? "",
      legal_name: businessQuery.data.legal_name ?? "",
      logo_url: businessQuery.data.logo_url ?? "",
      name: businessQuery.data.name ?? "",
      phone: businessQuery.data.phone ?? "",
      postal_code: businessQuery.data.postal_code ?? "",
      province: businessQuery.data.province ?? "",
      timezone: businessQuery.data.timezone ?? "",
      website: businessQuery.data.website ?? "",
    });
    resetBackendFormErrors();
  }, [businessQuery.data, form, resetBackendFormErrors]);

  async function handleSubmit(values: UpdateCurrentBusinessInput) {
    resetBackendFormErrors();

    try {
      await updateBusinessMutation.mutateAsync(values);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("business.update_error_fallback"),
      });
    }
  }

  if (!canView) {
    return (
      <ErrorState
        description="No tienes permiso para ver la configuracion de empresa."
        title="Acceso denegado"
      />
    );
  }

  return (
    <>
      <PageHeader
        description="Autogestion del tenant actual usando /api/businesses/current."
        eyebrow="Configuracion"
        title="Empresa"
      />

      {businessQuery.data ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <DataCard
            description="Nombre visible del tenant autenticado."
            icon={<Building2 className="size-5" />}
            title="Nombre"
            value={businessQuery.data.name ?? "Sin nombre"}
          />
          <DataCard
            description="Moneda e idioma configurados para el tenant."
            icon={<Globe2 className="size-5" />}
            title="Localizacion"
            value={`${businessQuery.data.currency_code ?? "-"} / ${businessQuery.data.language ?? "-"}`}
          />
          <DataCard
            description="Ubicacion base configurada para el tenant."
            icon={<MapPinned className="size-5" />}
            title="Ubicacion"
            value={businessQuery.data.province ?? "Sin provincia"}
          />
        </div>
      ) : null}

      {businessQuery.isLoading ? (
        <LoadingState description="Cargando configuracion de empresa." />
      ) : null}
      {businessQuery.isError ? (
        <ErrorState
          description={getBackendErrorMessage(
            businessQuery.error,
            t("common.load_failed"),
          )}
          onRetry={() => businessQuery.refetch()}
        />
      ) : null}
      {!businessQuery.isLoading && !businessQuery.isError && !businessQuery.data ? (
        <EmptyState
          description="El backend no devolvio datos para la empresa actual."
          icon={Building2}
          title="Sin configuracion disponible"
        />
      ) : null}

      {businessQuery.data ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          {!canUpdate ? (
            <div className="mb-5 rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Tienes permiso de lectura, pero no de edicion para la empresa actual.
            </div>
          ) : null}

          <BusinessSettingsForm
            canUpdate={canUpdate}
            form={form}
            formError={formError}
            isPending={updateBusinessMutation.isPending}
            onSubmit={handleSubmit}
          />
        </section>
      ) : null}
    </>
  );
}
