"use client";

import { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

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
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import type { Branch } from "@/features/branches/types";
import type { SaleOrder } from "@/features/sales/types";
import type { User } from "@/features/users/types";

import { dispatchTypeValues } from "../constants";
import type { CreateDispatchOrderInput, Route, Vehicle, Warehouse } from "../types";
import { FormFieldError } from "./form-field-error";

const EMPTY_SELECT_VALUE = "__none__";

const dispatchTypeLabels: Record<string, string> = {
  individual: "Individual",
  consolidated: "Consolidado",
};

type DispatchOrderFormProps = {
  branches: Branch[];
  form: UseFormReturn<CreateDispatchOrderInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateDispatchOrderInput) => Promise<void> | void;
  routes: Route[];
  saleOrders?: SaleOrder[];
  submitLabel: string;
  users: User[];
  vehicles: Vehicle[];
  warehouses: Warehouse[];
};

function DispatchOrderForm({
  branches,
  form,
  formError,
  isPending,
  onSubmit,
  routes,
  saleOrders = [],
  submitLabel,
  users,
  vehicles,
  warehouses,
}: DispatchOrderFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
    control,
    register,
    watch,
    setValue,
  } = form;

  const selectedBranchId = watch("branch_id");
  const selectedRouteId = watch("route_id");
  const selectedStopIds = watch("stop_sale_order_ids") ?? [];

  // Filter sale orders: confirmed + delivery fulfillment + pending dispatch status
  const eligibleSaleOrders = useMemo(
    () =>
      saleOrders.filter(
        (o) =>
          o.status === "confirmed" &&
          o.fulfillment_mode === "delivery" &&
          o.dispatch_status === "pending" &&
          (!selectedBranchId || String(o.branch_id) === String(selectedBranchId)),
      ),
    [saleOrders, selectedBranchId],
  );

  const activeBranches = useMemo(
    () => branches.filter((b) => b.is_active),
    [branches],
  );

  const activeWarehouses = useMemo(
    () =>
      warehouses.filter(
        (w) =>
          w.is_active &&
          (!selectedBranchId ||
            !w.branch_id ||
            String(w.branch_id) === String(selectedBranchId)),
      ),
    [warehouses, selectedBranchId],
  );

  const activeRoutes = useMemo(
    () => routes.filter((r) => r.is_active !== false),
    [routes],
  );

  const activeVehicles = useMemo(
    () => vehicles.filter((v) => v.is_active !== false),
    [vehicles],
  );

  const activeDrivers = useMemo(
    () => users.filter((u) => u.status === "active"),
    [users],
  );

  // Auto-fill vehicle and driver when route is selected
  useEffect(() => {
    if (!selectedRouteId || selectedRouteId === EMPTY_SELECT_VALUE) return;
    const route = activeRoutes.find((r) => String(r.id) === String(selectedRouteId));
    if (!route) return;
    if (route.default_vehicle_id) {
      setValue("vehicle_id", String(route.default_vehicle_id));
    }
    if (route.default_driver_user_id) {
      setValue("driver_user_id", String(route.default_driver_user_id));
    }
  }, [selectedRouteId, activeRoutes, setValue]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      {/* Código y sucursal */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dispatch-code">{t("inventory.common.code")}</Label>
          <Input id="dispatch-code" placeholder="DO-0001" {...register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatch-branch-id">
            {t("inventory.form.branch")} <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="branch_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="dispatch-branch-id">
                  <SelectValue placeholder="Selecciona una sucursal" />
                </SelectTrigger>
                <SelectContent>
                  {activeBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.branch_id?.message} />
        </div>
      </div>

      {/* Tipo y fecha */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("inventory.dispatch.dispatch_type")}</Label>
          <Controller
            control={control}
            name="dispatch_type"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value ?? "individual"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dispatchTypeValues.map((type) => (
                    <SelectItem key={type} value={type}>
                      {dispatchTypeLabels[type] ?? type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.dispatch_type?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatch-scheduled-date">
            {t("inventory.dispatch.scheduled_date")}
          </Label>
          <Input
            id="dispatch-scheduled-date"
            type="date"
            {...register("scheduled_date")}
          />
          <FormFieldError message={errors.scheduled_date?.message} />
        </div>
      </div>

      {/* Ruta y vehículo */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("inventory.dispatch.route")}</Label>
          <Controller
            control={control}
            name="route_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  field.onChange(value === EMPTY_SELECT_VALUE ? undefined : value)
                }
                value={field.value ?? EMPTY_SELECT_VALUE}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin ruta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>Sin ruta</SelectItem>
                  {activeRoutes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.route_id?.message} />
        </div>

        <div className="space-y-2">
          <Label>{t("inventory.dispatch.vehicle")}</Label>
          <Controller
            control={control}
            name="vehicle_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  field.onChange(value === EMPTY_SELECT_VALUE ? undefined : value)
                }
                value={field.value ?? EMPTY_SELECT_VALUE}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin vehículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>Sin vehículo</SelectItem>
                  {activeVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} — {vehicle.plate_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.vehicle_id?.message} />
        </div>
      </div>

      {/* Chofer y bodega */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("inventory.dispatch.driver")}</Label>
          <Controller
            control={control}
            name="driver_user_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  field.onChange(value === EMPTY_SELECT_VALUE ? undefined : value)
                }
                value={field.value ?? EMPTY_SELECT_VALUE}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin chofer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>Sin chofer</SelectItem>
                  {activeDrivers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.driver_user_id?.message} />
        </div>

        <div className="space-y-2">
          <Label>{t("inventory.dispatch.origin_warehouse")}</Label>
          <Controller
            control={control}
            name="origin_warehouse_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  field.onChange(value === EMPTY_SELECT_VALUE ? undefined : value)
                }
                value={field.value ?? EMPTY_SELECT_VALUE}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin bodega" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>Sin bodega</SelectItem>
                  {activeWarehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.origin_warehouse_id?.message} />
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="dispatch-notes">{t("inventory.common.notes")}</Label>
        <Textarea
          id="dispatch-notes"
          placeholder={t("inventory.common.notes")}
          {...register("notes")}
        />
        <FormFieldError message={errors.notes?.message} />
      </div>

      {/* Sale order selector */}
      {eligibleSaleOrders.length > 0 ? (
        <div className="space-y-2">
          <Label>{t("inventory.dispatch.select_sale_orders")}</Label>
          <p className="text-sm text-muted-foreground">
            {t("inventory.dispatch.select_sale_orders_description")}
          </p>
          <div className="max-h-48 overflow-y-auto rounded-md border p-2 space-y-1">
            {eligibleSaleOrders.map((order) => {
              const orderId = String(order.id);
              const isChecked = selectedStopIds.includes(orderId);
              return (
                <label
                  key={order.id}
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const current = selectedStopIds;
                      if (checked) {
                        setValue("stop_sale_order_ids", [...current, orderId]);
                      } else {
                        setValue(
                          "stop_sale_order_ids",
                          current.filter((id) => id !== orderId),
                        );
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{order.code ?? `#${order.id}`}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {order.customer_contact?.name ?? ""}
                    </span>
                    {order.delivery_address ? (
                      <p className="text-xs text-muted-foreground truncate">
                        {order.delivery_address}
                      </p>
                    ) : null}
                  </div>
                </label>
              );
            })}
          </div>
          {selectedStopIds.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              {selectedStopIds.length} {t("inventory.dispatch.orders_selected")}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { DispatchOrderForm };
export type { DispatchOrderFormProps };
