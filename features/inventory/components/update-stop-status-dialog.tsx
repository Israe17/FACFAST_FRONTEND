"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

  const form = useForm<UpdateDispatchStopStatusInput>({
    resolver: zodResolver(updateDispatchStopStatusSchema),
    defaultValues: {
      status: stop.status as UpdateDispatchStopStatusInput["status"],
      received_by: stop.received_by ?? "",
      failure_reason: stop.failure_reason ?? "",
      notes: stop.notes ?? "",
    },
  });

  const watchedStatus = form.watch("status");
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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("inventory.dispatch.update_stop_status")}</DialogTitle>
          <DialogDescription>
            {stop.sale_order?.code ?? `#${stop.sale_order_id}`} —{" "}
            {stop.customer_contact?.name ?? ""}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.dispatch.status")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {showReceivedBy ? (
              <FormField
                control={form.control}
                name="received_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("inventory.dispatch.received_by")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder={t("inventory.dispatch.received_by_placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {showFailureReason ? (
              <FormField
                control={form.control}
                name="failure_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("inventory.dispatch.failure_reason")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder={t("inventory.dispatch.failure_reason_placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.common.notes")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? t("common.saving")
                  : t("common.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { UpdateStopStatusDialog };
