"use client";

import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";

type RoleFormValues = {
  code?: string;
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
  const {
    formState: { errors },
  } = form;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="space-y-2">
        <Label htmlFor="role-code">Code</Label>
        <Input id="role-code" placeholder="RL-0007" {...form.register("code")} />
        {errors.code ? <p className="text-sm text-destructive">{errors.code.message}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role-name">Name</Label>
          <Input id="role-name" placeholder="Manager" {...form.register("name")} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role-key">Role key</Label>
          <Input id="role-key" placeholder="manager" {...form.register("role_key")} />
          {errors.role_key ? (
            <p className="text-sm text-destructive">{errors.role_key.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText="Saving" type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { RoleForm };
export type { RoleFormValues };
