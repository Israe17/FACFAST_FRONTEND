"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { FormErrorBanner } from "@/shared/components/form-error-banner";

import type { SaleOrder } from "@/features/sales/types";

import { emptyDispatchStopFormValues } from "../form-values";
import { createDispatchStopSchema } from "../schemas";
import type { CreateDispatchStopInput, DispatchOrder } from "../types";
import { useAddDispatchStopMutation } from "../queries";
import { FormFieldError } from "./form-field-error";

type AddDispatchStopDialogProps = {
  dispatchOrder: DispatchOrder;
  pendingOrders: SaleOrder[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function AddDispatchStopDialog({
  dispatchOrder,
  pendingOrders,
  open,
  onOpenChange,
}: AddDispatchStopDialogProps) {
  const { t } = useAppTranslator();
  const mutation = useAddDispatchStopMutation(String(dispatchOrder.id), {
    showErrorToast: false,
  });

  const nextSequence = (dispatchOrder.stops?.length ?? 0) + 1;
  const [saleOrderSearch, setSaleOrderSearch] = useState("");

  const {
    control,
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<CreateDispatchStopInput>({
    resolver: zodResolver(createDispatchStopSchema) as any,
    defaultValues: {
      ...emptyDispatchStopFormValues,
      delivery_sequence: nextSequence,
    },
  });

  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors({ clearErrors, setError });

  useEffect(() => {
    if (open) {
      reset({
        ...emptyDispatchStopFormValues,
        delivery_sequence: nextSequence,
      });
      setSaleOrderSearch("");
      resetBackendFormErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dispatchOrder.id, nextSequence]);

  const filteredPendingOrders = useMemo(() => {
    const q = saleOrderSearch.trim().toLowerCase();
    if (!q) return pendingOrders;
    return pendingOrders.filter(
      (o) =>
        o.code?.toLowerCase().includes(q) ||
        o.customer_contact?.name?.toLowerCase().includes(q),
    );
  }, [pendingOrders, saleOrderSearch]);

  async function onSubmit(data: CreateDispatchStopInput) {
    resetBackendFormErrors();
    try {
      await mutation.mutateAsync({
        sale_order_id: data.sale_order_id,
        delivery_sequence: data.delivery_sequence,
        notes: data.notes && data.notes.trim() ? data.notes.trim() : undefined,
      });
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("inventory.dispatch_stop_create_error_fallback"),
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="sm">
        <SheetHeader>
          <SheetTitle>{t("inventory.dispatch.add_stop")}</SheetTitle>
          <SheetDescription>
            {dispatchOrder.code ?? `DO-${dispatchOrder.id}`} —{" "}
            {t("inventory.dispatch.add_stop_description")}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormErrorBanner message={formError} />

          <div className="space-y-2">
            <Label>{t("sales.entity.sale_order")}</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-7"
                placeholder={t(
                  "inventory.dispatch.search_sale_orders_placeholder",
                )}
                value={saleOrderSearch}
                onChange={(e) => setSaleOrderSearch(e.target.value)}
              />
            </div>
            <Controller
              control={control}
              name="sale_order_id"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "inventory.dispatch.select_sale_order",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPendingOrders.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        {t("inventory.dispatch.no_eligible_orders")}
                      </div>
                    ) : (
                      filteredPendingOrders.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          <span className="font-medium">
                            {o.code ?? `OV-${o.id}`}
                          </span>
                          {o.customer_contact?.name ? (
                            <span className="text-muted-foreground">
                              {" "}
                              — {o.customer_contact.name}
                            </span>
                          ) : null}
                          {o.delivery_zone?.name ? (
                            <span className="text-muted-foreground">
                              {" "}
                              · {o.delivery_zone.name}
                            </span>
                          ) : null}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.sale_order_id?.message} />
          </div>

          <div className="space-y-2">
            <Label>{t("inventory.dispatch.delivery_sequence")}</Label>
            <Input
              type="number"
              min={1}
              {...register("delivery_sequence", { valueAsNumber: true })}
            />
            <FormFieldError message={errors.delivery_sequence?.message} />
          </div>

          <div className="space-y-2">
            <Label>{t("inventory.common.notes")}</Label>
            <Textarea {...register("notes")} />
            <FormFieldError message={errors.notes?.message} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export { AddDispatchStopDialog };
