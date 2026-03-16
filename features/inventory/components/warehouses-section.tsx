"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseFormReturn } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { Eye, Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { getInventoryWarehouseRoute } from "@/shared/lib/routes";

import { useBranchesQuery } from "@/features/branches/queries";
import type { Branch } from "@/features/branches/types";

import { emptyWarehouseFormValues, getWarehouseFormValues } from "../form-values";
import {
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useWarehousesQuery,
} from "../queries";
import { createWarehouseSchema } from "../schemas";
import type { CreateWarehouseInput, Warehouse } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

type WarehousesSectionProps = {
  enabled?: boolean;
};

type WarehouseFormProps = {
  branches: Branch[];
  form: UseFormReturn<CreateWarehouseInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateWarehouseInput) => Promise<void> | void;
  submitLabel: string;
};

function WarehouseForm({
  branches,
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: WarehouseFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");
  const isDefault = form.watch("is_default");
  const usesLocations = form.watch("uses_locations");

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warehouse-code">{t("inventory.common.code")}</Label>
          <Input id="warehouse-code" placeholder="WH-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouse-branch">{t("inventory.form.branch")}</Label>
          <Controller
            control={form.control}
            name="branch_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="warehouse-branch">
                  <SelectValue placeholder={t("inventory.form.select_branch")} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warehouse-name">{t("inventory.common.name")}</Label>
          <Input id="warehouse-name" placeholder="Bodega Principal" {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouse-description">{t("inventory.common.description")}</Label>
          <Input
            id="warehouse-description"
            placeholder={t("inventory.common.description")}
            {...form.register("description")}
          />
          <FormFieldError message={errors.description?.message} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(usesLocations)}
            onCheckedChange={(checked) => {
              form.setValue("uses_locations", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.uses_locations")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.uses_locations_description")}
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(isDefault)}
            onCheckedChange={(checked) => {
              form.setValue("is_default", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.default_warehouse")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.default_warehouse_description")}
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(isActive)}
            onCheckedChange={(checked) => {
              form.setValue("is_active", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.active_warehouse")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.active_warehouse_description")}
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

type WarehouseDialogProps = {
  branches: Branch[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  warehouse?: Warehouse | null;
};

function WarehouseDialog({ branches, onOpenChange, open, warehouse }: WarehouseDialogProps) {
  const createMutation = useCreateWarehouseMutation({ showErrorToast: false });
  const updateMutation = useUpdateWarehouseMutation(warehouse?.id ?? "", {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<CreateWarehouseInput>({
    defaultValues: warehouse ? getWarehouseFormValues(warehouse) : emptyWarehouseFormValues,
    resolver: buildFormResolver<CreateWarehouseInput>(createWarehouseSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = warehouse ? updateMutation : createMutation;

  useEffect(() => {
    form.reset(warehouse ? getWarehouseFormValues(warehouse) : emptyWarehouseFormValues);
    resetBackendFormErrors();
  }, [form, open, resetBackendFormErrors, warehouse]);

  async function handleSubmit(values: CreateWarehouseInput) {
    resetBackendFormErrors();

    try {
      if (warehouse) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          warehouse
            ? "inventory.warehouse_update_error_fallback"
            : "inventory.warehouse_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {warehouse
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.warehouse"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warehouse"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.warehouses.dialog_description")}</DialogDescription>
        </DialogHeader>
        <WarehouseForm
          branches={branches}
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            warehouse
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warehouse"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function WarehousesSection({ enabled = true }: WarehousesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("warehouses.view");
  const canCreate = can("warehouses.create");
  const canUpdate = can("warehouses.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const warehousesQuery = useWarehousesQuery(enabled && canView);
  const branchesQuery = useBranchesQuery(enabled && canView);

  const branchNameById = useMemo(
    () =>
      new Map((branchesQuery.data ?? []).map((branch) => [branch.id, branch.name])),
    [branchesQuery.data],
  );

  const columns = useMemo<ColumnDef<Warehouse>[]>(() => {
    const baseColumns: ColumnDef<Warehouse>[] = [
      {
        accessorKey: "name",
        header: t("inventory.entity.warehouse"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{row.original.name}</p>
              {row.original.is_default ? <Badge>{t("inventory.form.default_warehouse")}</Badge> : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {row.original.code
                ? `${t("inventory.common.code")}: ${row.original.code}`
                : t("inventory.common.no_manual_code")}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "branch_id",
        header: t("inventory.form.branch"),
        cell: ({ row }) =>
          branchNameById.get(row.original.branch_id ?? "") ??
          row.original.branch_id ??
          t("inventory.common.not_available"),
      },
      {
        accessorKey: "purpose",
        header: t("inventory.form.purpose"),
        cell: ({ row }) =>
          row.original.purpose
            ? t(`inventory.enum.warehouse_purpose.${row.original.purpose}` as const)
            : t("inventory.common.not_available"),
      },
      {
        accessorKey: "uses_locations",
        header: t("inventory.form.locations"),
        cell: ({ row }) =>
          row.original.uses_locations
            ? t("inventory.common.active")
            : t("inventory.common.inactive"),
      },
      {
        accessorKey: "updated_at",
        header: t("inventory.common.updated"),
        cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
      },
    ];

    if (canUpdate || canView) {
      baseColumns.push({
        id: "actions",
        header: t("inventory.common.actions"),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={getInventoryWarehouseRoute(row.original.id)}>
                <Eye className="size-4" />
                {t("inventory.common.view")}
              </Link>
            </Button>
            {canUpdate ? (
              <Button
                onClick={() => {
                  setSelectedWarehouse(row.original);
                  setDialogOpen(true);
                }}
                size="sm"
                variant="outline"
              >
                <Pencil className="size-4" />
                {t("inventory.common.edit")}
              </Button>
            ) : null}
          </div>
        ),
      });
    }

    return baseColumns;
  }, [branchNameById, canUpdate, canView, t]);

  if (!canView) {
    return null;
  }

  return (
    <>
      <CatalogSectionCard
        action={
          canCreate ? (
            <Button
              onClick={() => {
                setSelectedWarehouse(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.warehouse"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.warehouses.section_description")}
        title={t("inventory.entity.warehouses")}
      >
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
        {!warehousesQuery.isLoading && !warehousesQuery.isError ? (
          <DataTable
            columns={columns}
            data={warehousesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.warehouses"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <WarehouseDialog
        branches={branchesQuery.data ?? []}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedWarehouse(null);
          }
        }}
        open={dialogOpen}
        warehouse={selectedWarehouse}
      />
    </>
  );
}

export { WarehousesSection };
