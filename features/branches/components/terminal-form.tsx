"use client";

import type { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

type TerminalFormValues = {
  code?: string;
  is_active: boolean;
  name: string;
  terminal_number: string;
};

type TerminalFormProps = {
  form: UseFormReturn<TerminalFormValues>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: TerminalFormValues) => Promise<void> | void;
  submitLabel: string;
};

function TerminalForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: TerminalFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="terminal-name">{t("branches.terminal_form.name")}</Label>
          <Input id="terminal-name" placeholder="POS Front Desk" {...form.register("name")} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="terminal-number">{t("branches.terminal_form.number")}</Label>
          <Input
            id="terminal-number"
            placeholder="00001"
            {...form.register("terminal_number")}
          />
          {errors.terminal_number ? (
            <p className="text-sm text-destructive">{errors.terminal_number.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="terminal-code">{t("branches.terminal_form.code")}</Label>
        <Input id="terminal-code" placeholder="TR-0001" {...form.register("code")} />
        {errors.code ? <p className="text-sm text-destructive">{errors.code.message}</p> : null}
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("is_active", checked === true, { shouldDirty: true });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">{t("branches.terminal_form.active_terminal")}</p>
          <p className="text-sm text-muted-foreground">
            {t("branches.terminal_form.active_terminal_description")}
          </p>
        </div>
      </label>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { TerminalForm };
export type { TerminalFormValues };
