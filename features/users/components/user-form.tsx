"use client";

import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

type UserFormValues = {
  email: string;
  max_sale_discount: number;
  name: string;
  password?: string;
};

type UserFormProps = {
  form: UseFormReturn<UserFormValues>;
  formError?: string | null;
  includePassword?: boolean;
  isPending?: boolean;
  onSubmit: (values: UserFormValues) => Promise<void> | void;
  submitLabel: string;
};

function UserForm({
  form,
  formError,
  includePassword,
  isPending,
  onSubmit,
  submitLabel,
}: UserFormProps) {
  const {
    formState: { errors },
  } = form;
  const { t } = useAppTranslator();

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="user-name">{t("users.form.name")}</Label>
          <Input id="user-name" placeholder={t("users.form.name_placeholder")} {...form.register("name")} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-email">{t("users.form.email")}</Label>
          <Input id="user-email" placeholder="user@company.com" {...form.register("email")} />
          {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>
      </div>

      {includePassword ? (
        <div className="space-y-2">
          <Label htmlFor="user-password">{t("users.form.password")}</Label>
          <Input
            id="user-password"
            placeholder={t("users.form.password_placeholder")}
            type="password"
            {...form.register("password")}
          />
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="user-discount">{t("users.form.max_discount")}</Label>
        <Input
          id="user-discount"
          min={0}
          step="0.01"
          type="number"
          {...form.register("max_sale_discount", { valueAsNumber: true })}
        />
        {errors.max_sale_discount ? (
          <p className="text-sm text-destructive">{errors.max_sale_discount.message}</p>
        ) : null}
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { UserForm };
export type { UserFormValues };
