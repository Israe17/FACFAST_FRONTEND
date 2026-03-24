"use client";

import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import type { Branch } from "@/features/branches/types";
import type { Contact } from "@/features/contacts/types";
import type { User } from "@/features/users/types";
import type { Product, Warehouse, WarehouseStockRow, Zone } from "@/features/inventory/types";
import { useWarehouseStockByWarehouseQuery } from "@/features/inventory/queries";

import {
  deliveryChargeTypeValues,
} from "../constants";
import {
  emptySaleOrderLineFormValues,
  emptySaleOrderDeliveryChargeFormValues,
} from "../form-values";
import type { CreateSaleOrderInput } from "../types";
import { FormFieldError } from "@/features/inventory/components/form-field-error";

const EMPTY_SELECT_VALUE = "__none__";

const saleModeLabels: Record<string, string> = {
  branch_direct: "Venta directa en sucursal",
  seller_attributed: "Atribuida a vendedor",
  seller_route: "Ruta de vendedor",
};

const fulfillmentModeLabels: Record<string, string> = {
  pickup: "Retiro en sucursal",
  delivery: "Entrega a domicilio",
};

const chargeTypeLabels: Record<string, string> = {
  shipping: "Envío",
  installation: "Instalación",
  express: "Express",
};

type SaleOrderFormProps = {
  branches: Branch[];
  contacts: Contact[];
  form: UseFormReturn<CreateSaleOrderInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateSaleOrderInput) => Promise<void> | void;
  products: Product[];
  submitLabel: string;
  users: User[];
  warehouses: Warehouse[];
  zones: Zone[];
};

function SaleOrderForm({
  branches,
  contacts,
  form,
  formError,
  isPending,
  onSubmit,
  products,
  submitLabel,
  users,
  warehouses,
  zones,
}: SaleOrderFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
    control,
    register,
    watch,
  } = form;

  const fulfillmentMode = watch("fulfillment_mode");
  const saleMode = watch("sale_mode");
  const selectedBranchId = watch("branch_id");
  const selectedWarehouseId = watch("warehouse_id");

  const isDelivery = fulfillmentMode === "delivery";
  const sellerRequired = saleMode === "seller_attributed" || saleMode === "seller_route";

  const {
    fields: lineFields,
    append: appendLine,
    remove: removeLine,
  } = useFieldArray({ control, name: "lines" });

  const {
    fields: chargeFields,
    append: appendCharge,
    remove: removeCharge,
  } = useFieldArray({ control, name: "delivery_charges" });

  const activeBranches = useMemo(
    () => branches.filter((b) => b.is_active),
    [branches],
  );

  const activeContacts = useMemo(
    () => contacts.filter((c) => c.is_active),
    [contacts],
  );

  const activeUsers = useMemo(
    () => users.filter((u) => u.status === "active"),
    [users],
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

  const { setValue, getValues } = form;

  // Clear warehouse when branch changes and current warehouse doesn't match
  useEffect(() => {
    if (!selectedWarehouseId || selectedWarehouseId === EMPTY_SELECT_VALUE) return;
    const match = activeWarehouses.find(
      (w) => String(w.id) === String(selectedWarehouseId),
    );
    if (!match) {
      setValue("warehouse_id", undefined);
    }
  }, [activeWarehouses, selectedWarehouseId, setValue]);

  // Clear delivery fields and charges when switching to pickup
  useEffect(() => {
    if (fulfillmentMode === "pickup") {
      setValue("delivery_address", undefined);
      setValue("delivery_province", undefined);
      setValue("delivery_canton", undefined);
      setValue("delivery_district", undefined);
      setValue("delivery_zone_id", undefined);
      setValue("delivery_requested_date", undefined);
      const charges = getValues("delivery_charges");
      if (charges && charges.length > 0) {
        setValue("delivery_charges", []);
      }
    }
  }, [fulfillmentMode, setValue, getValues]);

  // Auto-set delivery mode when sale_mode is seller_route
  useEffect(() => {
    if (saleMode === "seller_route" && fulfillmentMode !== "delivery") {
      setValue("fulfillment_mode", "delivery");
    }
  }, [saleMode, fulfillmentMode, setValue]);

  const activeZones = useMemo(
    () => zones.filter((z) => z.is_active),
    [zones],
  );

  const hasWarehouse = Boolean(
    selectedWarehouseId && selectedWarehouseId !== EMPTY_SELECT_VALUE,
  );

  const { data: warehouseStock = [] } = useWarehouseStockByWarehouseQuery(
    selectedWarehouseId ?? "",
    hasWarehouse,
  );

  const stockByVariantId = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of warehouseStock) {
      if (row.product_variant?.id) {
        map.set(String(row.product_variant.id), row.available_quantity ?? 0);
      }
    }
    return map;
  }, [warehouseStock]);

  const variantOptions = useMemo(
    () =>
      products
        .filter((p) => p.is_active)
        .flatMap((p) =>
          (p.variants ?? [])
            .filter((v) => {
              if (!v.is_active) return false;
              if (v.allow_negative_stock) return true;
              if (!hasWarehouse) return false;
              const available = stockByVariantId.get(String(v.id));
              return available !== undefined && available > 0;
            })
            .map((v) => {
              const available = stockByVariantId.get(String(v.id));
              const stockLabel =
                hasWarehouse && available !== undefined
                  ? ` (${available} disp.)`
                  : "";
              return {
                id: v.id,
                label: p.has_variants
                  ? `${p.name} / ${v.variant_name ?? v.sku ?? v.id}${stockLabel}`
                  : `${p.name}${stockLabel}`,
              };
            }),
        ),
    [products, hasWarehouse, stockByVariantId],
  );

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      {/* Código y fecha */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="so-code">{t("sales.form.code")}</Label>
          <Input id="so-code" placeholder="SO-0001" {...register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="so-order-date">{t("sales.form.order_date")}</Label>
          <Input
            id="so-order-date"
            type="date"
            {...register("order_date")}
          />
          <FormFieldError message={errors.order_date?.message} />
        </div>
      </div>

      {/* Modo de venta y cumplimiento */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="so-sale-mode">{t("sales.form.sale_mode")}</Label>
          <Controller
            control={control}
            name="sale_mode"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="so-sale-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["branch_direct", "seller_attributed", "seller_route"] as const).map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {saleModeLabels[mode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.sale_mode?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="so-fulfillment-mode">
            {t("sales.form.fulfillment_mode")}
          </Label>
          <Controller
            control={control}
            name="fulfillment_mode"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={saleMode === "seller_route"}
              >
                <SelectTrigger id="so-fulfillment-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["pickup", "delivery"] as const).map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {fulfillmentModeLabels[mode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {saleMode === "seller_route" && (
            <p className="text-xs text-muted-foreground">
              Ruta de vendedor requiere entrega a domicilio.
            </p>
          )}
          <FormFieldError message={errors.fulfillment_mode?.message} />
        </div>
      </div>

      {/* Sucursal y cliente */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="so-branch-id">{t("sales.form.branch_id")}</Label>
          <Controller
            control={control}
            name="branch_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="so-branch-id">
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

        <div className="space-y-2">
          <Label htmlFor="so-customer-contact-id">
            {t("sales.form.customer_contact_id")}
          </Label>
          <Controller
            control={control}
            name="customer_contact_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="so-customer-contact-id">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {activeContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.customer_contact_id?.message} />
        </div>
      </div>

      {/* Vendedor y bodega */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="so-seller-user-id">
            {t("sales.form.seller_user_id")}
            {sellerRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Controller
            control={control}
            name="seller_user_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  field.onChange(value === EMPTY_SELECT_VALUE ? undefined : value)
                }
                value={field.value ?? EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="so-seller-user-id">
                  <SelectValue placeholder="Sin vendedor asignado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>Sin vendedor</SelectItem>
                  {activeUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.seller_user_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="so-warehouse-id">
            {t("sales.form.warehouse_id")}
          </Label>
          <Controller
            control={control}
            name="warehouse_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  field.onChange(value === EMPTY_SELECT_VALUE ? undefined : value)
                }
                value={field.value ?? EMPTY_SELECT_VALUE}
              >
                <SelectTrigger id="so-warehouse-id">
                  <SelectValue placeholder="Sin bodega asignada" />
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
          <FormFieldError message={errors.warehouse_id?.message} />
        </div>
      </div>

      {/* Campos de entrega (condicional) */}
      {fulfillmentMode === "delivery" && (
        <div className="space-y-4 rounded-xl border border-border/70 p-4">
          <h3 className="font-medium">{t("sales.fulfillment_delivery")}</h3>

          <div className="space-y-2">
            <Label htmlFor="so-delivery-address">
              {t("sales.form.delivery_address")}
            </Label>
            <Input
              id="so-delivery-address"
              {...register("delivery_address")}
            />
            <FormFieldError message={errors.delivery_address?.message} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="so-delivery-province">
                {t("sales.form.delivery_province")}
              </Label>
              <Input
                id="so-delivery-province"
                {...register("delivery_province")}
              />
              <FormFieldError message={errors.delivery_province?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="so-delivery-canton">
                {t("sales.form.delivery_canton")}
              </Label>
              <Input
                id="so-delivery-canton"
                {...register("delivery_canton")}
              />
              <FormFieldError message={errors.delivery_canton?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="so-delivery-district">
                {t("sales.form.delivery_district")}
              </Label>
              <Input
                id="so-delivery-district"
                {...register("delivery_district")}
              />
              <FormFieldError message={errors.delivery_district?.message} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="so-delivery-zone-id">
                {t("sales.form.delivery_zone_id")}
              </Label>
              <Controller
                control={control}
                name="delivery_zone_id"
                render={({ field }) => (
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === EMPTY_SELECT_VALUE ? undefined : value)
                    }
                    value={field.value ?? EMPTY_SELECT_VALUE}
                  >
                    <SelectTrigger id="so-delivery-zone-id">
                      <SelectValue placeholder="Sin zona asignada" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_SELECT_VALUE}>Sin zona</SelectItem>
                      {activeZones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormFieldError message={errors.delivery_zone_id?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="so-delivery-requested-date">
                {t("sales.form.delivery_requested_date")}
              </Label>
              <Input
                id="so-delivery-requested-date"
                type="date"
                {...register("delivery_requested_date")}
              />
              <FormFieldError
                message={errors.delivery_requested_date?.message}
              />
            </div>
          </div>
        </div>
      )}

      {/* Notas */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="so-notes">{t("sales.form.notes")}</Label>
          <Textarea id="so-notes" {...register("notes")} />
          <FormFieldError message={errors.notes?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="so-internal-notes">
            {t("sales.form.internal_notes")}
          </Label>
          <Textarea id="so-internal-notes" {...register("internal_notes")} />
          <FormFieldError message={errors.internal_notes?.message} />
        </div>
      </div>

      {/* Líneas de orden */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t("sales.form.lines")}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendLine(emptySaleOrderLineFormValues)}
          >
            <Plus className="size-4" />
            {t("sales.form.add_line")}
          </Button>
        </div>

        {errors.lines?.message && (
          <FormFieldError message={errors.lines.message} />
        )}

        {lineFields.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.product_variant_id")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.quantity")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.unit_price")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.discount_percent")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.tax_amount")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {lineFields.map((field, index) => (
                  <tr key={field.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2">
                      <Controller
                        control={control}
                        name={`lines.${index}.product_variant_id`}
                        render={({ field: selectField }) => (
                          <Select
                            onValueChange={selectField.onChange}
                            value={selectField.value}
                          >
                            <SelectTrigger className="h-8 min-w-[180px]">
                              <SelectValue placeholder="Selecciona producto" />
                            </SelectTrigger>
                            <SelectContent>
                              {variantOptions.map((opt) => (
                                <SelectItem key={opt.id} value={opt.id}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FormFieldError
                        message={
                          errors.lines?.[index]?.product_variant_id?.message
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        {...register(`lines.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="any"
                        className="h-8"
                      />
                      <FormFieldError
                        message={errors.lines?.[index]?.quantity?.message}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        {...register(`lines.${index}.unit_price`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="any"
                        className="h-8"
                      />
                      <FormFieldError
                        message={errors.lines?.[index]?.unit_price?.message}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        {...register(`lines.${index}.discount_percent`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="any"
                        className="h-8"
                      />
                      <FormFieldError
                        message={
                          errors.lines?.[index]?.discount_percent?.message
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        {...register(`lines.${index}.tax_amount`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="any"
                        className="h-8"
                      />
                      <FormFieldError
                        message={errors.lines?.[index]?.tax_amount?.message}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeLine(index)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cargos de entrega (solo en modo delivery) */}
      {isDelivery && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t("sales.form.delivery_charges")}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendCharge(emptySaleOrderDeliveryChargeFormValues)}
            >
              <Plus className="size-4" />
              {t("sales.form.add_charge")}
            </Button>
          </div>

          {chargeFields.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">
                      {t("sales.form.charge_type")}
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      {t("sales.form.amount")}
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      {t("sales.form.notes")}
                    </th>
                    <th className="px-3 py-2 text-right font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {chargeFields.map((field, index) => (
                    <tr key={field.id} className="border-b last:border-b-0">
                      <td className="px-3 py-2">
                        <Controller
                          control={control}
                          name={`delivery_charges.${index}.charge_type`}
                          render={({ field: selectField }) => (
                            <Select
                              onValueChange={selectField.onChange}
                              value={selectField.value}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {deliveryChargeTypeValues.map((ct) => (
                                  <SelectItem key={ct} value={ct}>
                                    {chargeTypeLabels[ct] ?? ct}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FormFieldError
                          message={
                            errors.delivery_charges?.[index]?.charge_type?.message
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          {...register(`delivery_charges.${index}.amount`, {
                            valueAsNumber: true,
                          })}
                          type="number"
                          step="any"
                          className="h-8"
                        />
                        <FormFieldError
                          message={
                            errors.delivery_charges?.[index]?.amount?.message
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          {...register(`delivery_charges.${index}.notes`)}
                          className="h-8"
                        />
                        <FormFieldError
                          message={
                            errors.delivery_charges?.[index]?.notes?.message
                          }
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeCharge(index)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { SaleOrderForm };
export type { SaleOrderFormProps };
