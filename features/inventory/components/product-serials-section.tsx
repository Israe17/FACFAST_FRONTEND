"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { DataCard } from "@/shared/components/data-card";
import { DataTable } from "@/shared/components/data-table";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { buildFormResolver } from "@/shared/lib/form-resolver";
import { formatDateTime } from "@/shared/lib/utils";

import { serialStatusOptions } from "../constants";
import {
  useCreateProductSerialsMutation,
  useProductSerialsQuery,
  useProductVariantsQuery,
  useUpdateProductSerialStatusMutation,
  useWarehousesQuery,
} from "../queries";
import {
  createProductSerialsSchema,
  updateProductSerialStatusSchema,
} from "../schemas";
import type {
  CreateProductSerialsInput,
  Product,
  ProductSerial,
  UpdateProductSerialStatusInput,
  Warehouse,
} from "../types";
import { useInventoryModule } from "../use-inventory-module";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { FormFieldError } from "./form-field-error";
import { DetailBlock } from "@/shared/components/detail-block";

const EMPTY_SELECT_VALUE = "__none__";

function normalizeSerialNumbers(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

type ProductSerialsSectionProps = {
  product: Product;
};

function ProductSerialsSection({ product }: ProductSerialsSectionProps) {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const canView = can("product_serials.view");
  const canCreate = can("product_serials.create");
  const canUpdate = can("product_serials.update");
  const canViewVariants = can("product_variants.view");
  const canViewWarehouses = can("warehouses.view");
  const canRegister = canCreate && canViewWarehouses;
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState<ProductSerial | null>(null);

  const variantsQuery = useProductVariantsQuery(
    product.id,
    canRunTenantQueries && canViewVariants && (product.has_variants || product.track_serials),
  );
  const warehousesQuery = useWarehousesQuery(canRunTenantQueries && canViewWarehouses);

  const serialTrackedVariants = useMemo(() => {
    if (!product.track_serials) return [];
    const resolvedVariants = variantsQuery.data?.length ? variantsQuery.data : product.variants;

    if (product.has_variants) {
      return resolvedVariants;
    }

    const defaultVariant = resolvedVariants.find((variant) => variant.is_default) ?? resolvedVariants[0];
    return defaultVariant ? [defaultVariant] : [];
  }, [product.has_variants, product.track_serials, product.variants, variantsQuery.data]);

  const effectiveVariantId = useMemo(() => {
    if (!serialTrackedVariants.length) {
      return "";
    }

    return serialTrackedVariants.some((variant) => variant.id === selectedVariantId)
      ? selectedVariantId
      : serialTrackedVariants[0].id;
  }, [selectedVariantId, serialTrackedVariants]);

  const selectedVariant =
    serialTrackedVariants.find((variant) => variant.id === effectiveVariantId) ?? null;
  const activeWarehouses = useMemo(
    () => (warehousesQuery.data ?? []).filter((warehouse) => warehouse.is_active),
    [warehousesQuery.data],
  );

  const serialsQuery = useProductSerialsQuery(
    product.id,
    selectedVariant?.id ?? "",
    {
      status: selectedStatus || undefined,
      warehouse_id: selectedWarehouseId || undefined,
    },
    canRunTenantQueries && canView && Boolean(selectedVariant),
  );

  const createMutation = useCreateProductSerialsMutation(product.id, selectedVariant?.id ?? "", {
    showErrorToast: false,
  });
  const updateStatusMutation = useUpdateProductSerialStatusMutation(
    product.id,
    selectedVariant?.id ?? "",
    { showErrorToast: false },
  );

  const registerForm = useForm<CreateProductSerialsInput>({
    defaultValues: {
      serial_numbers: [],
      warehouse_id: "",
    },
    resolver: buildFormResolver<CreateProductSerialsInput>(createProductSerialsSchema),
  });
  const statusForm = useForm<UpdateProductSerialStatusInput>({
    defaultValues: {
      notes: "",
      status: "available",
    },
    resolver: buildFormResolver<UpdateProductSerialStatusInput>(updateProductSerialStatusSchema),
  });

  const {
    formError: registerFormError,
    handleBackendFormError: handleRegisterBackendError,
    resetBackendFormErrors: resetRegisterBackendErrors,
  } = useBackendFormErrors(registerForm);
  const {
    formError: statusFormError,
    handleBackendFormError: handleStatusBackendError,
    resetBackendFormErrors: resetStatusBackendErrors,
  } = useBackendFormErrors(statusForm);
  const registerWarehouseId = useWatch({
    control: registerForm.control,
    name: "warehouse_id",
  });
  const registerSerialNumbers = useWatch({
    control: registerForm.control,
    name: "serial_numbers",
  });
  const statusValue = useWatch({
    control: statusForm.control,
    name: "status",
  });

  useEffect(() => {
    if (!registerOpen) {
      registerForm.reset({
        serial_numbers: [],
        warehouse_id: "",
      });
      resetRegisterBackendErrors();
    }
  }, [registerForm, registerOpen, resetRegisterBackendErrors]);

  useEffect(() => {
    if (statusOpen && selectedSerial) {
      statusForm.reset({
        notes: selectedSerial.notes ?? "",
        status: selectedSerial.status,
      });
      resetStatusBackendErrors();
      return;
    }

    if (!statusOpen) {
      statusForm.reset({
        notes: "",
        status: "available",
      });
      resetStatusBackendErrors();
    }
  }, [resetStatusBackendErrors, selectedSerial, statusForm, statusOpen]);

  const serials = useMemo(() => serialsQuery.data ?? [], [serialsQuery.data]);
  const serialCounts = useMemo(
    () => ({
      available: serials.filter((serial) => serial.status === "available").length,
      reserved: serials.filter((serial) => serial.status === "reserved").length,
      sold: serials.filter((serial) => serial.status === "sold").length,
      total: serials.length,
    }),
    [serials],
  );

  const variantIsOperable = Boolean(selectedVariant?.is_active && product.is_active);

  const statusBadgeByValue: Record<string, "default" | "outline" | "secondary" | "muted"> = {
    available: "default",
    defective: "muted",
    reserved: "secondary",
    returned: "outline",
    sold: "outline",
  };

  const serialColumns: ColumnDef<ProductSerial>[] = [
    {
      accessorKey: "serial_number",
      header: t("inventory.entity.product_serial"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.serial_number}</p>
          <p className="text-sm text-muted-foreground">
            {row.original.id ? `${t("inventory.form.header_id")}: ${row.original.id}` : t("inventory.common.not_available")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "warehouse",
      header: t("inventory.entity.warehouse"),
      cell: ({ row }) => row.original.warehouse?.name ?? t("inventory.common.not_available"),
    },
    {
      accessorKey: "status",
      header: t("inventory.common.status"),
      cell: ({ row }) => (
        <Badge variant={statusBadgeByValue[row.original.status] ?? "outline"}>
          {t(`inventory.enum.serial_status.${row.original.status}` as const)}
        </Badge>
      ),
    },
    {
      accessorKey: "received_at",
      header: t("inventory.serials.received_at"),
      cell: ({ row }) =>
        row.original.received_at ? formatDateTime(row.original.received_at) : t("inventory.common.not_available"),
    },
    {
      accessorKey: "sold_at",
      header: t("inventory.serials.sold_at"),
      cell: ({ row }) =>
        row.original.sold_at ? formatDateTime(row.original.sold_at) : t("inventory.common.not_available"),
    },
    {
      accessorKey: "notes",
      header: t("inventory.common.notes"),
      cell: ({ row }) => row.original.notes ?? t("inventory.common.no_notes"),
    },
    {
      accessorKey: "updated_at",
      header: t("inventory.common.updated"),
      cell: ({ row }) => formatDateTime(row.original.updated_at),
    },
    ...(canUpdate
      ? [
          {
            id: "actions",
            cell: ({ row }: { row: { original: ProductSerial } }) =>
              variantIsOperable ? (
                <TableRowActions
                  actions={[
                    {
                      icon: Edit,
                      label: t("inventory.serials.update_status_action"),
                      onClick: () => {
                        setSelectedSerial(row.original);
                        setStatusOpen(true);
                      },
                    },
                  ]}
                />
              ) : null,
          } satisfies ColumnDef<ProductSerial>,
        ]
      : []),
  ];

  async function handleRegisterSubmit(values: CreateProductSerialsInput) {
    resetRegisterBackendErrors();

    try {
      await createMutation.mutateAsync(values);
      setRegisterOpen(false);
    } catch (error) {
      handleRegisterBackendError(error, {
        fallbackMessage: t("inventory.product_serial_create_error_fallback"),
      });
    }
  }

  async function handleStatusSubmit(values: UpdateProductSerialStatusInput) {
    if (!selectedSerial) return;
    resetStatusBackendErrors();

    try {
      await updateStatusMutation.mutateAsync({
        payload: values,
        serialId: selectedSerial.id,
      });
      setStatusOpen(false);
      setSelectedSerial(null);
    } catch (error) {
      handleStatusBackendError(error, {
        fallbackMessage: t("inventory.product_serial_update_error_fallback"),
      });
    }
  }

  if (!canView || !serialTrackedVariants.length) {
    return null;
  }

  return (
    <>
      <DetailBlock
        description={t("inventory.serials.section_description")}
        title={t("inventory.entity.product_serials")}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DataCard
            description={t("inventory.serials.kpi_total_description")}
            title={t("inventory.serials.kpi_total")}
            value={serialCounts.total}
          />
          <DataCard
            description={t("inventory.serials.kpi_available_description")}
            title={t("inventory.enum.serial_status.available")}
            value={serialCounts.available}
          />
          <DataCard
            description={t("inventory.serials.kpi_reserved_description")}
            title={t("inventory.enum.serial_status.reserved")}
            value={serialCounts.reserved}
          />
          <DataCard
            description={t("inventory.serials.kpi_sold_description")}
            title={t("inventory.enum.serial_status.sold")}
            value={serialCounts.sold}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="product-serials-variant">{t("inventory.form.product_variant")}</Label>
            <Select onValueChange={setSelectedVariantId} value={effectiveVariantId}>
              <SelectTrigger id="product-serials-variant">
                <SelectValue placeholder={t("inventory.form.select_variant")} />
              </SelectTrigger>
              <SelectContent>
                {serialTrackedVariants.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.variant_name ?? variant.sku}
                    {variant.is_active ? "" : ` - ${t("inventory.common.inactive")}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-serials-status">{t("inventory.serials.status_filter")}</Label>
            <Select
              onValueChange={(value) => setSelectedStatus(value === EMPTY_SELECT_VALUE ? "" : value)}
              value={selectedStatus || EMPTY_SELECT_VALUE}
            >
              <SelectTrigger id="product-serials-status">
                <SelectValue placeholder={t("inventory.serials.all_statuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EMPTY_SELECT_VALUE}>{t("inventory.serials.all_statuses")}</SelectItem>
                {serialStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`inventory.enum.serial_status.${option.value}` as const)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-serials-warehouse">{t("inventory.serials.warehouse_filter")}</Label>
            <Select
              onValueChange={(value) => setSelectedWarehouseId(value === EMPTY_SELECT_VALUE ? "" : value)}
              value={selectedWarehouseId || EMPTY_SELECT_VALUE}
            >
              <SelectTrigger id="product-serials-warehouse">
                <SelectValue placeholder={t("inventory.serials.all_warehouses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EMPTY_SELECT_VALUE}>{t("inventory.serials.all_warehouses")}</SelectItem>
                {(warehousesQuery.data ?? []).map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canRegister ? (
            <div className="flex items-end">
              <Button
                disabled={!variantIsOperable || activeWarehouses.length === 0}
                onClick={() => setRegisterOpen(true)}
                type="button"
              >
                <Plus className="size-4" />
                {t("inventory.serials.register_action")}
              </Button>
            </div>
          ) : null}
        </div>

        {!variantIsOperable ? (
          <div className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            {t("inventory.serials.inactive_variant_hint")}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            {t("inventory.serials.register_no_stock_hint")}
          </div>
        )}

        <DataTable
          columns={serialColumns}
          data={serials}
          emptyMessage={t("inventory.serials.no_serials")}
          isError={serialsQuery.isError}
          isLoading={serialsQuery.isLoading}
          onRetry={() => serialsQuery.refetch()}
        />
      </DetailBlock>

      <Sheet onOpenChange={setRegisterOpen} open={registerOpen}>
        <SheetContent >
          <SheetHeader>
            <SheetTitle>{t("inventory.serials.register_dialog_title")}</SheetTitle>
            <SheetDescription>
              {t("inventory.serials.register_dialog_description", {
                variant: selectedVariant?.variant_name ?? selectedVariant?.sku ?? product.name,
              })}
            </SheetDescription>
          </SheetHeader>

          <form className="space-y-4" onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}>
            <FormErrorBanner message={registerFormError} />

            <div className="space-y-2">
              <Label htmlFor="register-serials-warehouse">{t("inventory.entity.warehouse")}</Label>
              <Select
                onValueChange={(value) => registerForm.setValue("warehouse_id", value, { shouldDirty: true })}
                value={registerWarehouseId}
              >
                <SelectTrigger id="register-serials-warehouse">
                  <SelectValue placeholder={t("inventory.form.select_warehouse")} />
                </SelectTrigger>
                <SelectContent>
                  {activeWarehouses.map((warehouse: Warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError message={registerForm.formState.errors.warehouse_id?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-serials-values">{t("inventory.serials.serial_numbers")}</Label>
              <Textarea
                id="register-serials-values"
                placeholder={t("inventory.serials.serial_numbers_placeholder")}
                value={(registerSerialNumbers ?? []).join("\n")}
                onChange={(event) => {
                  registerForm.setValue(
                    "serial_numbers",
                    normalizeSerialNumbers(event.target.value),
                    { shouldDirty: true },
                  );
                }}
              />
              <FormFieldError message={registerForm.formState.errors.serial_numbers?.message as string | undefined} />
              <p className="text-sm text-muted-foreground">{t("inventory.serials.register_hint")}</p>
            </div>

            <div className="flex justify-end">
              <ActionButton
                isLoading={createMutation.isPending}
                loadingText={t("common.saving")}
                type="submit"
              >
                {t("inventory.serials.register_action")}
              </ActionButton>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet
        onOpenChange={(open) => {
          setStatusOpen(open);
          if (!open) {
            setSelectedSerial(null);
          }
        }}
        open={statusOpen}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("inventory.serials.update_status_title")}</SheetTitle>
            <SheetDescription>
              {t("inventory.serials.update_status_description", {
                serial: selectedSerial?.serial_number ?? "",
              })}
            </SheetDescription>
          </SheetHeader>

          <form className="space-y-4" onSubmit={statusForm.handleSubmit(handleStatusSubmit)}>
            <FormErrorBanner message={statusFormError} />

            <div className="space-y-2">
              <Label htmlFor="update-serial-status">{t("inventory.common.status")}</Label>
              <Select
                onValueChange={(value) =>
                  statusForm.setValue("status", value as UpdateProductSerialStatusInput["status"], {
                    shouldDirty: true,
                  })
                }
                value={statusValue}
              >
                <SelectTrigger id="update-serial-status">
                  <SelectValue placeholder={t("inventory.serials.status_filter")} />
                </SelectTrigger>
                <SelectContent>
                  {serialStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(`inventory.enum.serial_status.${option.value}` as const)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormFieldError message={statusForm.formState.errors.status?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-serial-notes">{t("inventory.common.notes")}</Label>
              <Textarea id="update-serial-notes" {...statusForm.register("notes")} />
              <FormFieldError message={statusForm.formState.errors.notes?.message} />
            </div>

            <div className="flex justify-end">
              <ActionButton
                isLoading={updateStatusMutation.isPending}
                loadingText={t("common.saving")}
                type="submit"
              >
                {t("inventory.serials.update_status_action")}
              </ActionButton>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

export { ProductSerialsSection };
