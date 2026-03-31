"use client";

import { useMemo } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";

import { emptyRouteFormValues, getRouteFormValues } from "../form-values";
import {
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useZonesQuery,
  useVehiclesQuery,
} from "../queries";
import { createRouteSchema } from "../schemas";
import type { Route, CreateRouteInput } from "../types";
import { RouteForm } from "./route-form";

type RouteDialogProps = {
  route?: Route | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function RouteDialog({ route, onOpenChange, open }: RouteDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreateRouteMutation({ showErrorToast: false });
  const updateMutation = useUpdateRouteMutation(route?.id ?? "", { showErrorToast: false });
  const zonesQuery = useZonesQuery();
  const vehiclesQuery = useVehiclesQuery();

  const zones = useMemo(
    () =>
      (zonesQuery.data ?? []).map((z) => ({
        id: String(z.id),
        name: z.name,
      })),
    [zonesQuery.data],
  );

  const vehicles = useMemo(
    () =>
      (vehiclesQuery.data ?? []).map((v) => ({
        id: String(v.id),
        name: v.name,
        plate_number: v.plate_number,
      })),
    [vehiclesQuery.data],
  );

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateRouteInput, Route>({
    open,
    onOpenChange,
    schema: createRouteSchema,
    defaultValues: emptyRouteFormValues,
    entity: route,
    mapEntityToForm: getRouteFormValues,
    mutation: route ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      route ? "inventory.route_update_error_fallback" : "inventory.route_create_error_fallback",
    ),
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {route
              ? t("inventory.common.edit_entity", { entity: t("inventory.entity.route") })
              : t("inventory.common.create_entity", { entity: t("inventory.entity.route") })}
          </DialogTitle>
          <DialogDescription>{t("inventory.routes.dialog_description")}</DialogDescription>
        </DialogHeader>
        <RouteForm
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          submitLabel={
            route
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", { entity: t("inventory.entity.route") })
          }
          vehicles={vehicles}
          zones={zones}
        />
      </DialogContent>
    </Dialog>
  );
}

export { RouteDialog };
