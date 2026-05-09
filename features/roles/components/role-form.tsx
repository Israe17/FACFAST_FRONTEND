"use client";

import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

type RoleFormValues = {
  name: string;
  role_key: string;
};

type RoleFormProps = {
  form: UseFormReturn<RoleFormValues>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: RoleFormValues) => Promise<void> | void;
  submitLabel: string;
};

function RoleForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: RoleFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role-name">{t("roles.form.name_label")}</Label>
          <Input
            id="role-name"
            placeholder={t("roles.form.name_placeholder")}
            {...form.register("name")}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role-key">{t("roles.form.role_key_label")}</Label>
          <Input
            id="role-key"
            placeholder={t("roles.form.role_key_placeholder")}
            {...form.register("role_key")}
          />
          {errors.role_key ? (
            <p className="text-sm text-destructive">{errors.role_key.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { RoleForm };
export type { RoleFormValues };
