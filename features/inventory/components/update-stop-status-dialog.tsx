"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

import { dispatchStopStatusValues } from "../constants";
import { updateDispatchStopStatusSchema } from "../schemas";
import type { DispatchStop, UpdateDispatchStopStatusInput } from "../types";
import { useUpdateDispatchStopStatusMutation } from "../queries";
import { useSaleOrderQuery } from "@/features/sales/queries";
import { FormFieldError } from "./form-field-error";

type UpdateStopStatusDialogProps = {
  orderId: string;
  stop: DispatchStop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const stopStatusTranslationKeys: Record<string, string> = {
  pending: "inventory.dispatch.stop_pending",
  in_transit: "inventory.dispatch.stop_in_transit",
  delivered: "inventory.dispatch.stop_delivered",
  failed: "inventory.dispatch.stop_failed",
  partial: "inventory.dispatch.stop_partial",
  skipped: "inventory.dispatch.stop_skipped",
};

function UpdateStopStatusDialog({
  orderId,
  stop,
  open,
  onOpenChange,
}: UpdateStopStatusDialogProps) {
  const { t } = useAppTranslator();
  const mutation = useUpdateDispatchStopStatusMutation(orderId, String(stop.id));

  // Fallback: if stop has no lines (created before DispatchStopLine),
  // load the sale order to get its lines for the partial delivery form
  const hasNativeLines = (stop.lines?.length ?? 0) > 0;
  const saleOrderQuery = useSaleOrderQuery(
    hasNativeLines ? "" : String(stop.sale_order_id),
  );

  const stopLines = useMemo(() => {
    if (hasNativeLines) return stop.lines!;
    // Build stop-line-like objects from sale order lines
    const soLines = saleOrderQuery.data?.lines ?? [];
    return soLines.map((line) => ({
      id: line.id,
      sale_order_line_id: line.id,
      product_variant_id: line.product_variant_id ?? 0,
      product_variant: line.product_variant ?? undefined,
      ordered_quantity: line.quantity,
      delivered_quantity: null as number | null,
    }));
  }, [hasNativeLines, stop.lines, saleOrderQuery.data]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateDispatchStopStatusInput>({
    resolver: zodResolver(updateDispatchStopStatusSchema) as any,
    defaultValues: {
      status: stop.status as UpdateDispatchStopStatusInput["status"],
      received_by: stop.received_by ?? "",
      failure_reason: stop.failure_reason ?? "",
      notes: stop.notes ?? "",
      delivered_lines: stopLines.map((line) => ({
        sale_order_line_id: Number(line.sale_order_line_id),
        delivered_quantity: line.delivered_quantity ?? line.ordered_quantity,
      })),
    },
  });

  // Re-sync delivered_lines when stopLines changes (fallback query loads)
  useEffect(() => {
    if (stopLines.length > 0) {
      reset((prev) => ({
        ...prev,
        delivered_lines: stopLines.map((line) => ({
          sale_order_line_id: Number(line.sale_order_line_id),
          delivered_quantity: line.delivered_quantity ?? line.ordered_quantity,
        })),
      }));
    }
  }, [stopLines, reset]);

  const watchedStatus = watch("status");
  const showReceivedBy = watchedStatus === "delivered";
  const showFailureReason =
    watchedStatus === "failed" ||
    watchedStatus === "partial" ||
    watchedStatus === "skipped";
  const showDeliveredLines = watchedStatus === "partial" && stopLines.length > 0;

  async function onSubmit(data: UpdateDispatchStopStatusInput) {
    const payload = { ...data };
    // Only send delivered_lines when status is partial
    if (data.status !== "partial") {
      delete payload.delivered_lines;
    }
    await mutation.mutateAsync(payload);
    onOpenChange(false);
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("inventory.dispatch.update_stop_status")}</SheetTitle>
          <SheetDescription>
            {stop.sale_order?.code ?? `#${stop.sale_order_id}`} —{" "}
            {stop.customer_contact?.name ?? ""}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("inventory.dispatch.status")}</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dispatchStopStatusValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(
                          (stopStatusTranslationKeys[status] ??
                            "inventory.dispatch.stop_pending") as Parameters<typeof t>[0],
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={errors.status?.message} />
          </div>

          {showReceivedBy ? (
            <div className="space-y-2">
              <Label>{t("inventory.dispatch.received_by")}</Label>
              <Input
                {...register("received_by")}
                placeholder={t("inventory.dispatch.received_by_placeholder")}
              />
              <FormFieldError message={errors.received_by?.message} />
            </div>
          ) : null}

          {showFailureReason ? (
            <div className="space-y-2">
              <Label>{t("inventory.dispatch.failure_reason")}</Label>
              <Textarea
                {...register("failure_reason")}
                placeholder={t("inventory.dispatch.failure_reason_placeholder")}
              />
              <FormFieldError message={errors.failure_reason?.message} />
            </div>
          ) : null}

          {/* Per-line delivered quantities for partial deliveries */}
          {showDeliveredLines ? (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                {t("inventory.dispatch.delivered_quantities")}
              </Label>
              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium">
                        {t("inventory.dispatch.product")}
                      </th>
                      <th className="px-3 py-2 text-right font-medium w-24">
                        {t("inventory.dispatch.ordered")}
                      </th>
                      <th className="px-3 py-2 text-right font-medium w-28">
                        {t("inventory.dispatch.delivered")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stopLines.map((line, index) => (
                      <tr key={line.id} className="border-b last:border-b-0">
                        <td className="px-3 py-2">
                          <span className="font-medium text-xs">
                            {line.product_variant?.product?.name ?? line.product_variant?.sku ?? `Variante #${line.product_variant_id}`}
                          </span>
                          {line.product_variant?.variant_name ? (
                            <span className="text-muted-foreground text-xs ml-1">
                              ({line.product_variant.variant_name})
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {line.ordered_quantity}
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            max={line.ordered_quantity}
                            className="w-24 ml-auto text-right tabular-nums"
                            {...register(`delivered_lines.${index}.delivered_quantity`, {
                              valueAsNumber: true,
                            })}
                          />
                          <input
                            type="hidden"
                            {...register(`delivered_lines.${index}.sale_order_line_id`, {
                              valueAsNumber: true,
                            })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

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

export { UpdateStopStatusDialog };
