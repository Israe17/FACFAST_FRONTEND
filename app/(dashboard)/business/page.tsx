"use client";

import { useEffect } from "react";
import { Building2, Globe2, MapPinned, ToggleLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { BusinessSettingsForm } from "@/features/businesses/components/business-settings-form";
import {
  useCurrentBusinessQuery,
  useUpdateCurrentBusinessMutation,
} from "@/features/businesses/queries";
import { updateCurrentBusinessSchema } from "@/features/businesses/schemas";
import type { UpdateCurrentBusinessInput } from "@/features/businesses/types";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
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

type StatChipProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
};

function StatChip({ icon: Icon, label, value, hint }: StatChipProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold leading-tight">{value}</p>
        {hint ? (
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function BusinessPage() {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const { activeBranchId, isBusinessLevelContext } = useActiveBranch();
  const { isTenantContextMode, isTenantMode } = usePlatformMode();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const canView = can("businesses.view");
  const canUpdate = can("businesses.update");
  const businessQuery = useCurrentBusinessQuery(canView && canRunTenantQueries);
  const updateBusinessMutation = useUpdateCurrentBusinessMutation({
    showErrorToast: false,
  });
  const form = useForm<UpdateCurrentBusinessInput>({
    defaultValues,
    resolver: buildFormResolver<UpdateCurrentBusinessInput>(
      updateCurrentBusinessSchema,
    ),
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
        description={t("business.page_access_denied")}
        title={t("common.access_denied_title")}
      />
    );
  }

  const business = businessQuery.data;
  const noValue = t("business.kpi.no_value");
  const nameValue = business?.name ?? noValue;
  const localizationValue = business
    ? `${business.currency_code ?? "—"} / ${business.language ?? "—"}`
    : noValue;
  const locationValue = business?.province ?? noValue;
  const activeContextValue = isBusinessLevelContext
    ? t("common.enterprise_level")
    : (activeBranchId ?? t("common.none"));

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("business.page_eyebrow")}
          </p>
          <h1 className="text-xl font-semibold sm:text-2xl">
            {t("business.page_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("business.page_description")}
          </p>
        </div>

        {business ? (
          <div className="flex flex-wrap gap-2">
            <StatChip
              icon={Building2}
              label={t("business.kpi.name_title")}
              value={nameValue}
              hint={t("business.kpi.name_hint")}
            />
            <StatChip
              icon={Globe2}
              label={t("business.kpi.localization_title")}
              value={localizationValue}
              hint={t("business.kpi.localization_hint")}
            />
            <StatChip
              icon={MapPinned}
              label={t("business.kpi.location_title")}
              value={locationValue}
              hint={t("business.kpi.location_hint")}
            />
          </div>
        ) : null}
      </header>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          {t("business.context.active_label", { value: activeContextValue })}
        </Badge>
        <Badge variant="outline">{t("business.context.query_source")}</Badge>
      </div>

      {businessQuery.isLoading ? (
        <LoadingState description={t("business.loading")} />
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
      {!businessQuery.isLoading && !businessQuery.isError && !business ? (
        <EmptyState
          description={t("business.empty_description")}
          icon={Building2}
          title={t("business.empty_title")}
        />
      ) : null}

      {business ? (
        <>
          {!canUpdate ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <ToggleLeft className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p className="flex-1">{t("business.read_only_warning")}</p>
            </div>
          ) : null}

          <BusinessSettingsForm
            canUpdate={canUpdate}
            form={form}
            formError={formError}
            isPending={updateBusinessMutation.isPending}
            onSubmit={handleSubmit}
          />
        </>
      ) : null}
    </>
  );
}
