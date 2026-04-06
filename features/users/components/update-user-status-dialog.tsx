"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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

const userStatusOptions: Array<{
  description: string;
  value: UpdateUserStatusInput["status"];
}> = [
  { description: "User can operate normally.", value: "active" },
  { description: "User remains registered but should not operate.", value: "inactive" },
  { description: "Access is temporarily suspended.", value: "suspended" },
  { description: "Logical deleted status only. Permanent delete is a separate action.", value: "deleted" },
];

function UpdateUserStatusDialog({
  onOpenChange,
  open,
  user,
}: UpdateUserStatusDialogProps) {
  const updateStatusMutation = useUpdateUserStatusMutation(user.id);
  const { t } = useAppTranslator();
  const form = useForm<UpdateUserStatusInput>({
    defaultValues: {
      allow_login: user.allow_login ?? user.status === "active",
      status: user.status,
    },
    resolver: buildFormResolver<UpdateUserStatusInput>(updateUserStatusSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  const statusValue = useWatch({
    control: form.control,
    name: "status",
  });
  const allowLoginValue = useWatch({
    control: form.control,
    name: "allow_login",
  });

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
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Change user status</DrawerTitle>
          <DrawerDescription>
            Use lifecycle status for non-destructive user administration. Permanent delete remains
            a separate action.
          </DrawerDescription>
        </DrawerHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormErrorBanner message={formError} />

          <div className="space-y-2">
            <Label htmlFor="user-status">Status</Label>
            <Select
              onValueChange={(value) =>
                form.setValue("status", value as UpdateUserStatusInput["status"], {
                  shouldDirty: true,
                })
              }
              value={statusValue}
            >
              <SelectTrigger id="user-status">
                <SelectValue placeholder="Select a status" />
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
              <p className="font-medium">Allow login</p>
              <p className="text-sm text-muted-foreground">
                Toggle whether this user can authenticate while keeping the backend status value
                explicit.
              </p>
            </div>
          </label>

          <div className="flex justify-end">
            <ActionButton
              isLoading={updateStatusMutation.isPending}
              loadingText="Updating"
              type="submit"
            >
              Save status
            </ActionButton>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

export { UpdateUserStatusDialog };
