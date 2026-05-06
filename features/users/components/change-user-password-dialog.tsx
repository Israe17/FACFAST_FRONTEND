"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/shared/components/action-button";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { changeUserPasswordSchema } from "../schemas";
import { useChangeUserPasswordMutation } from "../queries";
import type { ChangeUserPasswordInput } from "../types";

type ChangeUserPasswordDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  userId: string;
};

function ChangeUserPasswordDialog({
  onOpenChange,
  open,
  userId,
}: ChangeUserPasswordDialogProps) {
  const { t } = useAppTranslator();
  const changePasswordMutation = useChangeUserPasswordMutation(userId);
  const form = useForm<ChangeUserPasswordInput>({
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
    resolver: buildFormResolver<ChangeUserPasswordInput>(changeUserPasswordSchema),
  });
  const {
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!open) {
      form.reset({ confirmPassword: "", password: "" });
    }
  }, [form, open]);

  async function handleSubmit(values: ChangeUserPasswordInput) {
    try {
      await changePasswordMutation.mutateAsync(values);
      onOpenChange(false);
    } catch {}
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("users.change_password_title")}</SheetTitle>
          <SheetDescription>{t("users.change_password_description")}</SheetDescription>
        </SheetHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="user-new-password">{t("users.new_password")}</Label>
            <Input
              id="user-new-password"
              placeholder={t("users.new_password")}
              type="password"
              {...form.register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-confirm-password">{t("users.confirm_password")}</Label>
            <Input
              id="user-confirm-password"
              placeholder={t("users.confirm_password")}
              type="password"
              {...form.register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end">
            <ActionButton
              isLoading={changePasswordMutation.isPending}
              loadingText={t("common.updating")}
              type="submit"
            >
              {t("users.update_password")}
            </ActionButton>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export { ChangeUserPasswordDialog };
