"use client";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";

import { emptyBrandFormValues, getBrandFormValues } from "../form-values";
import { useCreateBrandMutation, useUpdateBrandMutation } from "../queries";
import { createBrandSchema } from "../schemas";
import type { Brand, CreateBrandInput } from "../types";
import { BrandForm } from "./brand-form";

type BrandDialogProps = {
  brand?: Brand | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function BrandDialog({ brand, onOpenChange, open }: BrandDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreateBrandMutation({ showErrorToast: false });
  const updateMutation = useUpdateBrandMutation(brand?.id ?? "", { showErrorToast: false });

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateBrandInput, Brand>({
    open,
    onOpenChange,
    schema: createBrandSchema,
    defaultValues: emptyBrandFormValues,
    entity: brand,
    mapEntityToForm: getBrandFormValues,
    mutation: brand ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      brand ? "inventory.brand_update_error_fallback" : "inventory.brand_create_error_fallback",
    ),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {brand
              ? t("inventory.common.edit_entity", { entity: t("inventory.entity.brand") })
              : t("inventory.common.create_entity", { entity: t("inventory.entity.brand") })}
          </SheetTitle>
          <SheetDescription>{t("inventory.brands.dialog_description")}</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <BrandForm
            form={form}
            formError={formError}
            isPending={isPending}
            onSubmit={handleSubmit}
            submitLabel={
              brand
                ? t("inventory.common.save_changes")
                : t("inventory.common.create_entity", { entity: t("inventory.entity.brand") })
            }
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export { BrandDialog };
