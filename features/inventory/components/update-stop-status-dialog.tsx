"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
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

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateDispatchStopStatusInput>({
    resolver: zodResolver(updateDispatchStopStatusSchema),
    defaultValues: {
      status: stop.status as UpdateDispatchStopStatusInput["status"],
      received_by: stop.received_by ?? "",
      failure_reason: stop.failure_reason ?? "",
      notes: stop.notes ?? "",
    },
  });

  const watchedStatus = watch("status");
  const showReceivedBy = watchedStatus === "delivered";
  const showFailureReason =
    watchedStatus === "failed" ||
    watchedStatus === "partial" ||
    watchedStatus === "skipped";

  async function onSubmit(data: UpdateDispatchStopStatusInput) {
    await mutation.mutateAsync(data);
    onOpenChange(false);
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent >
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
