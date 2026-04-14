"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ChevronDown, MapPin, Plus, RotateCcw, Trash2 } from "lucide-react";

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
import { LocationPicker } from "@/shared/components/location-picker";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import type { Branch } from "@/features/branches/types";
import type { Contact } from "@/features/contacts/types";
import type { User } from "@/features/users/types";
import type { Product, Warehouse, WarehouseStockRow, Zone } from "@/features/inventory/types";
import { listBranchPriceLists, listProductPrices } from "@/features/inventory/api";
import {
  inventoryKeys,
  useBranchPriceListsQuery,
  useWarehouseStockByWarehouseQuery,
} from "@/features/inventory/queries";

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

function DeliveryLocationPickerSection({ form }: { form: UseFormReturn<CreateSaleOrderInput> }) {
  const latitude = form.watch("delivery_latitude") ?? null;
  const longitude = form.watch("delivery_longitude") ?? null;
  const [isOpen, setIsOpen] = useState(latitude != null && longitude != null);
  const { t } = useAppTranslator();

  // Auto-expand when coordinates are filled (e.g. from contact auto-fill)
  useEffect(() => {
    if (latitude != null && longitude != null && !isOpen) {
      setIsOpen(true);
    }
  }, [latitude, longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-lg border border-border/50">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors rounded-lg"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {t("sales.delivery_location")}
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen ? (
        <div className="px-3 pb-3">
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => {
              form.setValue("delivery_latitude", lat, { shouldDirty: true });
              form.setValue("delivery_longitude", lng, { shouldDirty: true });
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

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
  const selectedCustomerId = watch("customer_contact_id");

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
      setValue("delivery_latitude", null);
      setValue("delivery_longitude", null);
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

  // Auto-fill delivery fields from selected contact
  const selectedContact = useMemo(
    () => contacts.find((c) => String(c.id) === String(selectedCustomerId)),
    [contacts, selectedCustomerId],
  );
  const prevCustomerIdRef = useRef(selectedCustomerId);

  useEffect(() => {
    if (selectedCustomerId === prevCustomerIdRef.current) return;
    prevCustomerIdRef.current = selectedCustomerId;

    if (!selectedContact) return;

    if (selectedContact.address) {
      setValue("delivery_address", selectedContact.address);
    }
    if (selectedContact.province) {
      setValue("delivery_province", selectedContact.province);
    }
    if (selectedContact.canton) {
      setValue("delivery_canton", selectedContact.canton);
    }
    if (selectedContact.district) {
      setValue("delivery_district", selectedContact.district);
    }
    if (
      selectedContact.delivery_latitude != null &&
      selectedContact.delivery_longitude != null
    ) {
      setValue("delivery_latitude", selectedContact.delivery_latitude);
      setValue("delivery_longitude", selectedContact.delivery_longitude);
    }
  }, [selectedCustomerId, selectedContact, setValue]);

  const fillDeliveryFromContact = () => {
    if (!selectedContact) return;
    setValue("delivery_address", selectedContact.address ?? undefined);
    setValue("delivery_province", selectedContact.province ?? undefined);
    setValue("delivery_canton", selectedContact.canton ?? undefined);
    setValue("delivery_district", selectedContact.district ?? undefined);
    setValue(
      "delivery_latitude",
      selectedContact.delivery_latitude ?? null,
    );
    setValue(
      "delivery_longitude",
      selectedContact.delivery_longitude ?? null,
    );
  };

  const contactHasLocation =
    selectedContact?.delivery_latitude != null &&
    selectedContact?.delivery_longitude != null;

  const contactHasAddress = Boolean(selectedContact?.address);

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

  // --- Price resolution from branch price lists ---
  const queryClient = useQueryClient();

  const branchPriceListsQuery = useBranchPriceListsQuery(
    selectedBranchId ?? "",
    Boolean(selectedBranchId),
  );

  // Map variant_id → product for quick lookup
  const variantToProductMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of products) {
      for (const variant of product.variants ?? []) {
        map.set(String(variant.id), product);
      }
    }
    return map;
  }, [products]);

  // Track which variants have no price (keyed by variant_id)
  const [variantPriceStatus, setVariantPriceStatus] = useState<
    Record<string, boolean>
  >({});

  // Clear price status when branch changes (prices depend on branch)
  useEffect(() => {
    setVariantPriceStatus({});
  }, [selectedBranchId]);

  // Resolve price for a single variant against the branch's price lists
  const resolveVariantPrice = useCallback(
    async (index: number, variantId: string) => {
      if (!selectedBranchId) return;

      const product = variantToProductMap.get(variantId);
      if (!product) return;

      try {
        const branchData = await queryClient.fetchQuery({
          queryKey: inventoryKeys.branchPriceLists(selectedBranchId),
          queryFn: () => listBranchPriceLists(selectedBranchId),
          staleTime: 5 * 60 * 1000,
        });

        if (!branchData || branchData.assignments.length === 0) {
          setVariantPriceStatus((prev) => ({ ...prev, [variantId]: false }));
          return;
        }

        const branchPriceListIds = new Set(
          branchData.assignments
            .filter((a) => a.is_active && a.price_list?.id)
            .map((a) => String(a.price_list!.id)),
        );

        if (branchPriceListIds.size === 0) {
          setVariantPriceStatus((prev) => ({ ...prev, [variantId]: false }));
          return;
        }

        const productPrices = await queryClient.fetchQuery({
          queryKey: inventoryKeys.productPrices(String(product.id)),
          queryFn: () => listProductPrices(String(product.id)),
          staleTime: 5 * 60 * 1000,
        });

        const now = new Date().toISOString();
        const defaultPriceListId = branchData.default_price_list_id
          ? String(branchData.default_price_list_id)
          : null;

        const candidates = productPrices.filter((pp) => {
          if (!pp.is_active) return false;
          if (!pp.price_list?.id || !branchPriceListIds.has(String(pp.price_list.id)))
            return false;
          const ppVariantId = pp.product_variant?.id;
          if (ppVariantId && String(ppVariantId) !== variantId) return false;
          if (pp.valid_from && pp.valid_from > now) return false;
          if (pp.valid_to && pp.valid_to < now) return false;
          return true;
        });

        const sorted = [...candidates].sort((a, b) => {
          const aExact = a.product_variant?.id ? 1 : 0;
          const bExact = b.product_variant?.id ? 1 : 0;
          if (aExact !== bExact) return bExact - aExact;
          const aDefault =
            defaultPriceListId && String(a.price_list?.id) === defaultPriceListId ? 1 : 0;
          const bDefault =
            defaultPriceListId && String(b.price_list?.id) === defaultPriceListId ? 1 : 0;
          return bDefault - aDefault;
        });

        const best = sorted[0];
        if (best?.price != null) {
          setValue(`lines.${index}.unit_price`, best.price);
          setVariantPriceStatus((prev) => ({ ...prev, [variantId]: true }));
        } else {
          setVariantPriceStatus((prev) => ({ ...prev, [variantId]: false }));
        }
      } catch {
        // If fetch fails, don't change anything
      }
    },
    [selectedBranchId, variantToProductMap, queryClient, setValue],
  );

  // When variant is selected, resolve its price
  const handleVariantChange = useCallback(
    (index: number, variantId: string, fieldOnChange: (v: string) => void) => {
      fieldOnChange(variantId);
      resolveVariantPrice(index, variantId);
    },
    [resolveVariantPrice],
  );

  // Re-resolve prices for existing lines when branch changes
  const watchedLines = watch("lines");
  useEffect(() => {
    if (!selectedBranchId) return;
    for (let i = 0; i < watchedLines.length; i++) {
      const variantId = watchedLines[i]?.product_variant_id;
      if (variantId) {
        resolveVariantPrice(i, variantId);
      }
    }
  }, [selectedBranchId]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasBranchPriceLists =
    !selectedBranchId ||
    branchPriceListsQuery.isLoading ||
    (branchPriceListsQuery.data?.assignments ?? []).some((a) => a.is_active);

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
          {!hasBranchPriceLists && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="size-3 shrink-0" />
              {t("sales.form.no_branch_price_list")}
            </p>
          )}
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
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{t("sales.fulfillment_delivery")}</h3>
            {selectedContact && (contactHasLocation || contactHasAddress) ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillDeliveryFromContact}
              >
                <RotateCcw className="size-3.5" />
                {t("sales.use_contact_location")}
              </Button>
            ) : null}
          </div>

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

          <DeliveryLocationPickerSection form={form} />
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
                          <>
                            <Select
                              onValueChange={(value) =>
                                handleVariantChange(index, value, selectField.onChange)
                              }
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
                            {selectField.value &&
                              variantPriceStatus[selectField.value] === false && (
                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                  <AlertCircle className="size-3 shrink-0" />
                                  {t("sales.form.no_price_in_list")}
                                </p>
                              )}
                          </>
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
