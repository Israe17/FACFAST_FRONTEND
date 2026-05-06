"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { updateUserStatusSchema } from "../schemas";
import { useUpdateUserStatusMutation } from "../queries";
import type { UpdateUserStatusInput, User } from "../types";

type UpdateUserStatusDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: User;
};

function UpdateUserStatusDialog({
  onOpenChange,
  open,
  user,
}: UpdateUserStatusDialogProps) {
  const updateStatusMutation = useUpdateUserStatusMutation(user.id);
  const { t } = useAppTranslator();

  const userStatusOptions: Array<{
    description: string;
    value: UpdateUserStatusInput["status"];
  }> = [
    { description: t("users.status_active_description"), value: "active" },
    { description: t("users.status_inactive_description"), value: "inactive" },
    { description: t("users.status_suspended_description"), value: "suspended" },
    { description: t("users.status_deleted_description"), value: "deleted" },
  ];

  const form = useForm<UpdateUserStatusInput>({
    defaultValues: {
      allow_login: user.allow_login ?? user.status === "active",
      status: user.status,
    },
    resolver: buildFormResolver<UpdateUserStatusInput>(updateUserStatusSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  const statusValue = useWatch({ control: form.control, name: "status" });
  const allowLoginValue = useWatch({ control: form.control, name: "allow_login" });

  useEffect(() => {
    if (open) {
      form.reset({
        allow_login: user.allow_login ?? user.status === "active",
        status: user.status,
      });
      resetBackendFormErrors();
    }
  }, [form, open, resetBackendFormErrors, user.allow_login, user.status]);

  async function handleSubmit(values: UpdateUserStatusInput) {
    resetBackendFormErrors();
    try {
      await updateStatusMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("users.status_update_error_fallback"),
      });
    }
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("users.change_status_title")}</SheetTitle>
          <SheetDescription>{t("users.change_status_description")}</SheetDescription>
        </SheetHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormErrorBanner message={formError} />

          <div className="space-y-2">
            <Label htmlFor="user-status">{t("users.status_label")}</Label>
            <Select
              onValueChange={(value) =>
                form.setValue("status", value as UpdateUserStatusInput["status"], {
                  shouldDirty: true,
                })
              }
              value={statusValue}
            >
              <SelectTrigger id="user-status">
                <SelectValue placeholder={t("users.status_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {userStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {userStatusOptions.find((option) => option.value === statusValue)?.description}
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
            <Checkbox
              checked={Boolean(allowLoginValue)}
              onCheckedChange={(checked) => {
                form.setValue("allow_login", checked === true, { shouldDirty: true });
              }}
            />
            <div className="space-y-1">
              <p className="font-medium">{t("users.allow_login")}</p>
              <p className="text-sm text-muted-foreground">{t("users.allow_login_description")}</p>
            </div>
          </label>

          <div className="flex justify-end">
            <ActionButton
              isLoading={updateStatusMutation.isPending}
              loadingText={t("common.updating")}
              type="submit"
            >
              {t("users.save_status")}
            </ActionButton>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export { UpdateUserStatusDialog };
