"use client";

import type { UseFormReturn } from "react-hook-form";

import type { UpdateCurrentBusinessInput } from "@/features/businesses/types";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";

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
  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <BusinessSectionFields disabled={!canUpdate} form={form} />

      {canUpdate ? (
        <div className="flex justify-end">
          <ActionButton isLoading={isPending} loadingText="Guardando" type="submit">
            Guardar cambios
          </ActionButton>
        </div>
      ) : null}
    </form>
  );
}

export { BusinessSettingsForm };
