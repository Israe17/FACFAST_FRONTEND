"use client";

import { useEffect, useMemo } from "react";
import { Building2, ToggleLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { BusinessDetailPanel } from "@/features/businesses/components/business-detail-panel";
import {
  useCurrentBusinessQuery,
  useUpdateCurrentBusinessMutation,
} from "@/features/businesses/queries";
import { updateCurrentBusinessSchema } from "@/features/businesses/schemas";
import type { UpdateCurrentBusinessInput } from "@/features/businesses/types";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { buildFormResolver } from "@/shared/lib/form-resolver";

const defaultValues: UpdateCurrentBusinessInput = {
  address: "",
  canton: "",
  canton_id: null,
  city: "",
  code: "",
  country: "",
  country_id: null,
  currency_code: "",
  district: "",
  district_id: null,
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
  province_id: null,
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
  const updateBusinessMutation = useUpdateCurrentBusinessMutation({
    showErrorToast: false,
  });
  const toggleBusinessMutation = useUpdateCurrentBusinessMutation();
  const form = useForm<UpdateCurrentBusinessInput>({
    defaultValues,
    resolver: buildFormResolver<UpdateCurrentBusinessInput>(
      updateCurrentBusinessSchema,
    ),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  const initialFormValues: UpdateCurrentBusinessInput | null = useMemo(() => {
    const data = businessQuery.data;
    if (!data) return null;
    return {
      address: data.address ?? "",
      canton: data.canton ?? "",
      canton_id: data.canton_id ?? null,
      city: data.city ?? "",
      code: data.code ?? "",
      country: data.country ?? "",
      country_id: data.country_id ?? null,
      currency_code: data.currency_code ?? "",
      district: data.district ?? "",
      district_id: data.district_id ?? null,
      email: data.email ?? "",
      identification_number: data.identification_number ?? "",
      identification_type: data.identification_type as
        | UpdateCurrentBusinessInput["identification_type"]
        | undefined,
      is_active: data.is_active,
      language: data.language ?? "",
      legal_name: data.legal_name ?? "",
      logo_url: data.logo_url ?? "",
      name: data.name ?? "",
      phone: data.phone ?? "",
      postal_code: data.postal_code ?? "",
      province: data.province ?? "",
      province_id: data.province_id ?? null,
      timezone: data.timezone ?? "",
      website: data.website ?? "",
    };
  }, [businessQuery.data]);

  useEffect(() => {
    if (!initialFormValues) return;
    form.reset(initialFormValues);
    resetBackendFormErrors();
  }, [initialFormValues, form, resetBackendFormErrors]);

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

  async function handleToggleActive() {
    if (!businessQuery.data) return;
    const next = !(businessQuery.data.is_active ?? true);
    try {
      await toggleBusinessMutation.mutateAsync({ is_active: next });
      toast.success(
        next
          ? t("business.actions.toggle_success_active")
          : t("business.actions.toggle_success_inactive"),
      );
    } catch {
      // toggleBusinessMutation has showErrorToast on by default
    }
  }

  function handleResetChanges() {
    if (initialFormValues) {
      form.reset(initialFormValues);
      resetBackendFormErrors();
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

  return (
    <>
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("business.page_eyebrow")}
        </p>
        <h1 className="text-xl font-semibold sm:text-2xl">
          {t("business.page_title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("business.page_description")}
        </p>
      </header>

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

          <BusinessDetailPanel
            business={business}
            canUpdate={canUpdate}
            form={form}
            formError={formError}
            isPending={updateBusinessMutation.isPending}
            isToggling={toggleBusinessMutation.isPending}
            onSubmit={handleSubmit}
            onToggleActive={handleToggleActive}
            onResetChanges={handleResetChanges}
          />
        </>
      ) : null}
    </>
  );
}
