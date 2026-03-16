"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionButton } from "@/shared/components/action-button";
import { DataTable } from "@/shared/components/data-table";
import { ErrorState } from "@/shared/components/error-state";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { buildFormResolver } from "@/shared/lib/form-resolver";
import { formatDateTime } from "@/shared/lib/utils";

import {
  emptyWarehouseLocationFormValues,
  getWarehouseLocationFormValues,
} from "../form-values";
import {
  useCreateWarehouseLocationMutation,
  useUpdateWarehouseLocationMutation,
  useWarehouseLocationsQuery,
  useWarehousesQuery,
} from "../queries";
import { createWarehouseLocationSchema } from "../schemas";
import type {
  CreateWarehouseLocationInput,
  Warehouse,
  WarehouseLocation,
} from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

type WarehouseLocationsSectionProps = {
  enabled?: boolean;
};

type WarehouseLocationFormProps = {
  form: UseFormReturn<CreateWarehouseLocationInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateWarehouseLocationInput) => Promise<void> | void;
  submitLabel: string;
};

function WarehouseLocationForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: WarehouseLocationFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-code">{t("inventory.common.code")}</Label>
          <Input id="warehouse-location-code" placeholder="WL-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouse-location-name">{t("inventory.common.name")}</Label>
          <Input
            id="warehouse-location-name"
            placeholder="Pasillo A - Rack 1"
            {...form.register("name")}
          />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-zone">{t("inventory.form.zone")}</Label>
          <Input id="warehouse-location-zone" {...form.register("zone")} />
          <FormFieldError message={errors.zone?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-aisle">{t("inventory.form.aisle")}</Label>
          <Input id="warehouse-location-aisle" {...form.register("aisle")} />
          <FormFieldError message={errors.aisle?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-rack">{t("inventory.form.rack")}</Label>
          <Input id="warehouse-location-rack" {...form.register("rack")} />
          <FormFieldError message={errors.rack?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-level">{t("inventory.form.level")}</Label>
          <Input id="warehouse-location-level" {...form.register("level")} />
          <FormFieldError message={errors.level?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-position">{t("inventory.form.position")}</Label>
          <Input id="warehouse-location-position" {...form.register("position")} />
          <FormFieldError message={errors.position?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warehouse-location-barcode">{t("inventory.form.barcode")}</Label>
          <Input id="warehouse-location-barcode" {...form.register("barcode")} />
          <FormFieldError message={errors.barcode?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="warehouse-location-description">{t("inventory.common.description")}</Label>
        <Input id="warehouse-location-description" {...form.register("description")} />
        <FormFieldError message={errors.description?.message} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ["is_picking_area", "inventory.form.is_picking_area", "inventory.form.is_picking_area_description"],
            ["is_receiving_area", "inventory.form.is_receiving_area", "inventory.form.is_receiving_area_description"],
            ["is_dispatch_area", "inventory.form.is_dispatch_area", "inventory.form.is_dispatch_area_description"],
            ["is_active", "inventory.form.active_warehouse_location", "inventory.form.active_warehouse_location_description"],
          ] as const
        ).map(([fieldName, labelKey, descriptionKey]) => (
          <label key={fieldName} className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
            <Checkbox
              checked={Boolean(form.watch(fieldName))}
              onCheckedChange={(checked) => {
                form.setValue(fieldName, checked === true, { shouldDirty: true });
              }}
            />
            <div className="space-y-1">
              <p className="font-medium">{t(labelKey)}</p>
              <p className="text-sm text-muted-foreground">{t(descriptionKey)}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

type WarehouseLocationDialogProps = {
  location?: WarehouseLocation | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  warehouse?: Warehouse | null;
};

function WarehouseLocationDialog({
  location,
  onOpenChange,
  open,
  warehouse,
}: WarehouseLocationDialogProps) {
  const warehouseId = warehouse?.id ?? "";
  const createMutation = useCreateWarehouseLocationMutation(warehouseId, { showErrorToast: false });
  const updateMutation = useUpdateWarehouseLocationMutation(location?.id ?? "", warehouseId, {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<CreateWarehouseLocationInput>({
    defaultValues: location ? getWarehouseLocationFormValues(location) : emptyWarehouseLocationFormValues,
    resolver: buildFormResolver<CreateWarehouseLocationInput>(createWarehouseLocationSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = location ? updateMutation : createMutation;

  useEffect(() => {
    form.reset(location ? getWarehouseLocationFormValues(location) : emptyWarehouseLocationFormValues);
    resetBackendFormErrors();
  }, [form, location, open, resetBackendFormErrors]);

  async function handleSubmit(values: CreateWarehouseLocationInput) {
    resetBackendFormErrors();

    if (!warehouseId) {
      return;
    }

    try {
      if (location) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          location
            ? "inventory.warehouse_location_update_error_fallback"
            : "inventory.warehouse_location_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {location
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.warehouse_location"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warehouse_location"),
                })}
          </DialogTitle>
          <DialogDescription>
            {t("inventory.warehouse_locations.dialog_description", {
              warehouse: warehouse?.name ?? t("inventory.entity.warehouse"),
            })}
          </DialogDescription>
        </DialogHeader>
        <WarehouseLocationForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            location
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warehouse_location"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function WarehouseLocationsSection({ enabled = true }: WarehouseLocationsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("warehouse_locations.view");
  const canCreate = can("warehouse_locations.create");
  const canUpdate = can("warehouse_locations.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null);
  const warehousesQuery = useWarehousesQuery(enabled && canView);
  const warehouseOptions = useMemo(
    () => (warehousesQuery.data ?? []).filter((warehouse) => warehouse.uses_locations),
    [warehousesQuery.data],
  );
  const resolvedSelectedWarehouseId =
    selectedWarehouseId &&
    warehouseOptions.some((warehouse) => warehouse.id === selectedWarehouseId)
      ? selectedWarehouseId
      : (warehouseOptions[0]?.id ?? "");
  const selectedWarehouse =
    warehouseOptions.find((warehouse) => warehouse.id === resolvedSelectedWarehouseId) ?? null;
  const locationsQuery = useWarehouseLocationsQuery(resolvedSelectedWarehouseId, enabled && canView);

  const columns = useMemo<ColumnDef<WarehouseLocation>[]>(() => {
    const baseColumns: ColumnDef<WarehouseLocation>[] = [
      {
        accessorKey: "name",
        header: t("inventory.entity.warehouse_location"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">{row.original.name}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.code
                ? `${t("inventory.common.code")}: ${row.original.code}`
                : t("inventory.common.no_manual_code")}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "zone",
        header: t("inventory.form.zone"),
        cell: ({ row }) =>
          [row.original.zone, row.original.aisle, row.original.rack].filter(Boolean).join(" / ") ||
          t("inventory.common.not_available"),
      },
      {
        accessorKey: "position",
        header: t("inventory.form.position"),
        cell: ({ row }) =>
          [row.original.level, row.original.position].filter(Boolean).join(" / ") ||
          t("inventory.common.not_available"),
      },
      {
        accessorKey: "updated_at",
        header: t("inventory.common.updated"),
        cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
      },
    ];

    if (canUpdate) {
      baseColumns.push({
        id: "actions",
        header: t("inventory.common.actions"),
        cell: ({ row }) => (
          <Button
            onClick={() => {
              setSelectedLocation(row.original);
              setDialogOpen(true);
            }}
            size="sm"
            variant="outline"
          >
            <Pencil className="size-4" />
            {t("inventory.common.edit")}
          </Button>
        ),
      });
    }

    return baseColumns;
  }, [canUpdate, t]);

  if (!canView) {
    return null;
  }

  return (
    <>
      <CatalogSectionCard
        action={
          canCreate ? (
            <Button
              disabled={!selectedWarehouse}
              onClick={() => {
                setSelectedLocation(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.warehouse_location"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.warehouse_locations.section_description")}
        title={t("inventory.entity.warehouse_locations")}
      >
        <div className="max-w-md space-y-2">
          <Label htmlFor="warehouse-locations-warehouse">{t("inventory.entity.warehouse")}</Label>
          <Select onValueChange={setSelectedWarehouseId} value={resolvedSelectedWarehouseId}>
            <SelectTrigger id="warehouse-locations-warehouse">
              <SelectValue placeholder={t("inventory.form.select_warehouse")} />
            </SelectTrigger>
            <SelectContent>
              {warehouseOptions.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {warehousesQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.warehouses"),
            })}
          />
        ) : null}
        {warehousesQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              warehousesQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.warehouses"),
              }),
            )}
            onRetry={() => warehousesQuery.refetch()}
          />
        ) : null}
        {!warehousesQuery.isLoading && !warehousesQuery.isError && !warehouseOptions.length ? (
          <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            {t("inventory.warehouse_locations.no_warehouses_with_locations")}
          </div>
        ) : null}
        {selectedWarehouse && locationsQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.warehouse_locations"),
            })}
          />
        ) : null}
        {selectedWarehouse && locationsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              locationsQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.warehouse_locations"),
              }),
            )}
            onRetry={() => locationsQuery.refetch()}
          />
        ) : null}
        {selectedWarehouse && !locationsQuery.isLoading && !locationsQuery.isError ? (
          <DataTable
            columns={columns}
            data={locationsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.warehouse_locations"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <WarehouseLocationDialog
        location={selectedLocation}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedLocation(null);
          }
        }}
        open={dialogOpen}
        warehouse={selectedWarehouse}
      />
    </>
  );
}

export { WarehouseLocationsSection };
