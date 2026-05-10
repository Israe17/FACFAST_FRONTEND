"use client";

import type { UseFormReturn } from "react-hook-form";

import type { UpdateCurrentBusinessInput } from "@/features/businesses/types";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import { BusinessSectionFields } from "./business-section-fields";

type BusinessSettingsFormProps = {
  canUpdate: boolean;
  form: UseFormReturn<UpdateCurrentBusinessInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: UpdateCurrentBusinessInput) => Promise<void> | void;
};

function BusinessSettingsForm({
  canUpdate,
  form,
  formError,
  isPending,
  onSubmit,
}: BusinessSettingsFormProps) {
  const { t } = useAppTranslator();
  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <BusinessSectionFields disabled={!canUpdate} form={form} />

      {canUpdate ? (
        <div className="flex justify-end">
          <ActionButton
            isLoading={isPending}
            loadingText={t("business.actions.saving")}
            type="submit"
          >
            {t("business.actions.save")}
          </ActionButton>
        </div>
      ) : null}
    </form>
  );
}

export { BusinessSettingsForm };
