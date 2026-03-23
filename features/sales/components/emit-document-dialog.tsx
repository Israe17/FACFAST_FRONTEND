"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { FormFieldError } from "@/features/inventory/components/form-field-error";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { buildFormResolver } from "@/shared/lib/form-resolver";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import { electronicDocumentTypeValues } from "../constants";
import { emptyEmitDocumentFormValues } from "../form-values";
import { useEmitElectronicDocumentMutation } from "../queries";
import { emitElectronicDocumentSchema } from "../schemas";
import type { EmitElectronicDocumentInput } from "../types";

type EmitDocumentDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

const documentTypeTranslationMap: Record<string, string> = {
  factura_electronica: "sales.documents.type_factura_electronica",
  tiquete_electronico: "sales.documents.type_tiquete_electronico",
  nota_credito: "sales.documents.type_nota_credito",
  nota_debito: "sales.documents.type_nota_debito",
};

function EmitDocumentDialog({ onOpenChange, open }: EmitDocumentDialogProps) {
  const { t } = useAppTranslator();
  const emitMutation = useEmitElectronicDocumentMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<EmitElectronicDocumentInput>({
    defaultValues: emptyEmitDocumentFormValues,
    resolver: buildFormResolver<EmitElectronicDocumentInput>(emitElectronicDocumentSchema),
  });

  useEffect(() => {
    if (open) {
      reset(emptyEmitDocumentFormValues);
      emitMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(data: EmitElectronicDocumentInput) {
    await emitMutation.mutateAsync(data);
    onOpenChange(false);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("sales.documents.emit")}</DialogTitle>
          <DialogDescription>
            {t("sales.documents.section_description")}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormErrorBanner
            message={getBackendErrorMessage(emitMutation.error, null)}
          />

          <div className="space-y-2">
            <Label htmlFor="sale_order_id">{t("sales.entity.sale_order")}</Label>
            <Input
              id="sale_order_id"
              placeholder="ID"
              {...register("sale_order_id")}
            />
            <FormFieldError message={errors.sale_order_id?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_type">
              {t("sales.documents.document_type")}
            </Label>
            <Controller
              control={control}
              name="document_type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="document_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {electronicDocumentTypeValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(
                          (documentTypeTranslationMap[type] ??
                            type) as Parameters<typeof t>[0],
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.document_type?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiver_name">
              {t("sales.documents.receiver")}
            </Label>
            <Input
              id="receiver_name"
              {...register("receiver_name")}
            />
            <FormFieldError message={errors.receiver_name?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiver_identification_type">
                {t("inventory.common.type")}
              </Label>
              <Input
                id="receiver_identification_type"
                {...register("receiver_identification_type")}
              />
              <FormFieldError
                message={errors.receiver_identification_type?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver_identification_number">
                {t("inventory.common.number")}
              </Label>
              <Input
                id="receiver_identification_number"
                {...register("receiver_identification_number")}
              />
              <FormFieldError
                message={errors.receiver_identification_number?.message}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiver_email">{t("inventory.common.email")}</Label>
            <Input
              id="receiver_email"
              type="email"
              {...register("receiver_email")}
            />
            <FormFieldError message={errors.receiver_email?.message} />
          </div>

          <div className="flex justify-end">
            <ActionButton
              isLoading={emitMutation.isPending}
              loadingText={t("common.saving")}
              type="submit"
            >
              {t("sales.documents.emit")}
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { EmitDocumentDialog };
