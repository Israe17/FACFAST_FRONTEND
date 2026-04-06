"use client";

import { useMemo } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";
import { useSeedEntityOption } from "@/shared/hooks/use-seed-entity-option";

import { emptyRouteFormValues, getRouteFormValues } from "../form-values";
import {
  useCreateRouteMutation,
  useUpdateRouteMutation,
} from "../queries";
import { createRouteSchema } from "../schemas";
import type { Route, CreateRouteInput, Zone, Vehicle } from "../types";
import { RouteForm } from "./route-form";

type RouteDialogProps = {
  route?: Route | null;
  zones: Zone[];
  vehicles: Vehicle[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function RouteDialog({ route, zones: rawZones, vehicles: rawVehicles, onOpenChange, open }: RouteDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreateRouteMutation({ showErrorToast: false });
  const updateMutation = useUpdateRouteMutation(route?.id ?? "", { showErrorToast: false });

  const zones = useMemo(
    () =>
      rawZones.map((z) => ({
        id: String(z.id),
        name: z.name,
      })),
    [rawZones],
  );

  const vehicles = useMemo(
    () =>
      rawVehicles.map((v) => ({
        id: String(v.id),
        name: v.name,
        plate_number: v.plate_number,
      })),
    [rawVehicles],
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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {route
              ? t("inventory.common.edit_entity", { entity: t("inventory.entity.route") })
              : t("inventory.common.create_entity", { entity: t("inventory.entity.route") })}
          </SheetTitle>
          <SheetDescription>{t("inventory.routes.dialog_description")}</SheetDescription>
        </SheetHeader>
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
      </SheetContent>
    </Sheet>
  );
}

export { RouteDialog };
