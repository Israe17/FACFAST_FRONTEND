"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/shared/components/action-button";
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
      form.reset({
        confirmPassword: "",
        password: "",
      });
    }
  }, [form, open]);

  async function handleSubmit(values: ChangeUserPasswordInput) {
    try {
      await changePasswordMutation.mutateAsync(values);
      onOpenChange(false);
    } catch {}
  }

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Change password</DrawerTitle>
          <DrawerDescription>Set a new password for this user.</DrawerDescription>
        </DrawerHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="user-new-password">New password</Label>
            <Input
              id="user-new-password"
              placeholder="New password"
              type="password"
              {...form.register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-confirm-password">Confirm password</Label>
            <Input
              id="user-confirm-password"
              placeholder="Confirm password"
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
              loadingText="Updating"
              type="submit"
            >
              Update password
            </ActionButton>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

export { ChangeUserPasswordDialog };
