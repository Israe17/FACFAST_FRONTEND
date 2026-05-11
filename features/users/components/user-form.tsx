"use client";

import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useAvailablePermissionsQuery } from "@/features/roles/queries";
import type { PermissionDefinition } from "@/features/roles/types";

type UserFormValues = {
  email: string;
  max_sale_discount: number;
  name: string;
  password?: string;
  permission_ids: string[];
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

      <AuthPermissionsField form={form} />

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

function AuthPermissionsField({ form }: { form: UseFormReturn<UserFormValues> }) {
  const { t } = useAppTranslator();
  const permissionsQuery = useAvailablePermissionsQuery(true);

  const authPermissions: PermissionDefinition[] =
    permissionsQuery.data?.filter((permission) =>
      permission.key.startsWith("auth."),
    ) ?? [];

  return (
    <fieldset className="space-y-2 rounded-md border border-border/60 bg-muted/30 p-3">
      <legend className="px-1 text-sm font-medium">
        {t("users.form.auth_permissions_title")}
      </legend>
      <p className="text-xs text-muted-foreground">
        {t("users.form.auth_permissions_description")}
      </p>

      {permissionsQuery.isLoading ? (
        <p className="text-xs text-muted-foreground">{t("common.loading")}</p>
      ) : authPermissions.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t("users.form.auth_permissions_empty")}
        </p>
      ) : (
        <Controller
          control={form.control}
          name="permission_ids"
          render={({ field }) => (
            <div className="space-y-2">
              {authPermissions.map((permission) => {
                const idAsString = String(permission.id);
                const checked = field.value?.includes(idAsString) ?? false;
                return (
                  <label
                    key={permission.id}
                    htmlFor={`user-perm-${permission.id}`}
                    className="flex cursor-pointer items-start gap-2 text-sm"
                  >
                    <Checkbox
                      id={`user-perm-${permission.id}`}
                      checked={checked}
                      onCheckedChange={(next) => {
                        const current = field.value ?? [];
                        if (next === true) {
                          if (!current.includes(idAsString)) {
                            field.onChange([...current, idAsString]);
                          }
                        } else {
                          field.onChange(
                            current.filter((value) => value !== idAsString),
                          );
                        }
                      }}
                    />
                    <span className="space-y-0.5">
                      <span className="block font-medium">{permission.key}</span>
                      {permission.description ? (
                        <span className="block text-xs text-muted-foreground">
                          {permission.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        />
      )}
    </fieldset>
  );
}

export { UserForm };
export type { UserFormValues };
