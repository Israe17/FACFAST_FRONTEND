"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { useCancelInventoryMovementMutation } from "../queries";
import { cancelInventoryMovementSchema } from "../schemas";
import type { CancelInventoryMovementInput, InventoryMovementHeader } from "../types";
import { FormFieldError } from "./form-field-error";

export type CancelMovementDialogProps = {
  movement?: InventoryMovementHeader | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function CancelMovementDialog({ movement, onOpenChange, open }: CancelMovementDialogProps) {
  const headerId = movement?.id ?? "";
  const cancelMutation = useCancelInventoryMovementMutation(headerId, { showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<CancelInventoryMovementInput>({
    defaultValues: { notes: "" },
    resolver: buildFormResolver<CancelInventoryMovementInput>(cancelInventoryMovementSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    form.reset({ notes: "" });
    resetBackendFormErrors();
  }, [form, movement, open, resetBackendFormErrors]);

  async function handleSubmit(values: CancelInventoryMovementInput) {
    resetBackendFormErrors();

    try {
      await cancelMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("inventory.inventory_movement_cancel_error_fallback"),
      });
    }
  }

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("inventory.inventory_movements.cancel_title")}</DrawerTitle>
          <DrawerDescription>
            {t("inventory.inventory_movements.cancel_description", {
              code: movement?.code ?? "",
            })}
          </DrawerDescription>
        </DrawerHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormErrorBanner message={formError} />
          <div className="space-y-2">
            <Label htmlFor="inventory-movement-cancel-notes">{t("inventory.common.notes")}</Label>
            <Textarea id="inventory-movement-cancel-notes" {...form.register("notes")} />
            <FormFieldError message={form.formState.errors.notes?.message} />
          </div>
          <div className="flex justify-end">
            <ActionButton
              isLoading={cancelMutation.isPending}
              loadingText={t("common.saving")}
              type="submit"
            >
              {t("inventory.inventory_movements.cancel_action")}
            </ActionButton>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
