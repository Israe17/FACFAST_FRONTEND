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
  emptyMeasurementUnitFormValues,
  getMeasurementUnitFormValues,
} from "../form-values";
import {
  useCreateMeasurementUnitMutation,
  useMeasurementUnitsQuery,
  useUpdateMeasurementUnitMutation,
} from "../queries";
import { createMeasurementUnitSchema } from "../schemas";
import type { CreateMeasurementUnitInput, MeasurementUnit } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

type MeasurementUnitsSectionProps = {
  enabled?: boolean;
};

type MeasurementUnitFormProps = {
  form: UseFormReturn<CreateMeasurementUnitInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateMeasurementUnitInput) => Promise<void> | void;
  submitLabel: string;
};

function MeasurementUnitForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: MeasurementUnitFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="measurement-unit-code">{t("inventory.common.code")}</Label>
          <Input id="measurement-unit-code" placeholder="MU-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="measurement-unit-name">{t("inventory.common.name")}</Label>
          <Input
            id="measurement-unit-name"
            placeholder={t("inventory.entity.measurement_unit")}
            {...form.register("name")}
          />
          <FormFieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="measurement-unit-symbol">{t("inventory.common.symbol")}</Label>
          <Input id="measurement-unit-symbol" placeholder="kg" {...form.register("symbol")} />
          <FormFieldError message={errors.symbol?.message} />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("is_active", checked === true, { shouldDirty: true });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">{t("inventory.form.active_measurement_unit")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_measurement_unit_description")}
          </p>
        </div>
      </label>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

type MeasurementUnitDialogProps = {
  measurementUnit?: MeasurementUnit | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function MeasurementUnitDialog({
  measurementUnit,
  onOpenChange,
  open,
}: MeasurementUnitDialogProps) {
  const createMeasurementUnitMutation = useCreateMeasurementUnitMutation({
    showErrorToast: false,
  });
  const updateMeasurementUnitMutation = useUpdateMeasurementUnitMutation(
    measurementUnit?.id ?? "",
    { showErrorToast: false },
  );
  const { t } = useAppTranslator();
  const form = useForm<CreateMeasurementUnitInput>({
    defaultValues: measurementUnit
      ? getMeasurementUnitFormValues(measurementUnit)
      : emptyMeasurementUnitFormValues,
    resolver: buildFormResolver<CreateMeasurementUnitInput>(createMeasurementUnitSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = measurementUnit ? updateMeasurementUnitMutation : createMeasurementUnitMutation;

  useEffect(() => {
    form.reset(
      measurementUnit
        ? getMeasurementUnitFormValues(measurementUnit)
        : emptyMeasurementUnitFormValues,
    );
    resetBackendFormErrors();
  }, [form, measurementUnit, open, resetBackendFormErrors]);

  async function handleSubmit(values: CreateMeasurementUnitInput) {
    resetBackendFormErrors();

    try {
      if (measurementUnit) {
        await updateMeasurementUnitMutation.mutateAsync(values);
      } else {
        await createMeasurementUnitMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          measurementUnit
            ? "inventory.measurement_unit_update_error_fallback"
            : "inventory.measurement_unit_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {measurementUnit
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.measurement_unit"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.measurement_unit"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.measurement_units.dialog_description")}</DialogDescription>
        </DialogHeader>
        <MeasurementUnitForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            measurementUnit
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.measurement_unit"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function MeasurementUnitsSection({ enabled = true }: MeasurementUnitsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("measurement_units.view");
  const canCreate = can("measurement_units.create");
  const canUpdate = can("measurement_units.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeasurementUnit, setSelectedMeasurementUnit] =
    useState<MeasurementUnit | null>(null);
  const measurementUnitsQuery = useMeasurementUnitsQuery(enabled && canView);

  const columns = useMemo<ColumnDef<MeasurementUnit>[]>(() => {
    const baseColumns: ColumnDef<MeasurementUnit>[] = [
      {
        accessorKey: "name",
        header: t("inventory.entity.measurement_unit"),
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
        accessorKey: "symbol",
        header: t("inventory.common.symbol"),
        cell: ({ row }) => row.original.symbol,
      },
      {
        accessorKey: "is_active",
        header: t("inventory.common.status"),
        cell: ({ row }) =>
          row.original.is_active ? t("inventory.common.active") : t("inventory.common.inactive"),
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
              setSelectedMeasurementUnit(row.original);
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
              onClick={() => {
                setSelectedMeasurementUnit(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.measurement_unit"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.measurement_units.section_description")}
        title={t("inventory.entity.measurement_units")}
      >
        {measurementUnitsQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.measurement_units"),
            })}
          />
        ) : null}
        {measurementUnitsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              measurementUnitsQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.measurement_units"),
              }),
            )}
            onRetry={() => measurementUnitsQuery.refetch()}
          />
        ) : null}
        {!measurementUnitsQuery.isLoading && !measurementUnitsQuery.isError ? (
          <DataTable
            columns={columns}
            data={measurementUnitsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.measurement_units"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <MeasurementUnitDialog
        measurementUnit={selectedMeasurementUnit}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedMeasurementUnit(null);
          }
        }}
        open={dialogOpen}
      />
    </>
  );
}

export { MeasurementUnitsSection };
