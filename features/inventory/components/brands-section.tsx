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
import { Textarea } from "@/components/ui/textarea";
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

import { emptyBrandFormValues, getBrandFormValues } from "../form-values";
import { useBrandsQuery, useCreateBrandMutation, useUpdateBrandMutation } from "../queries";
import { createBrandSchema } from "../schemas";
import type { Brand, CreateBrandInput } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

type BrandsSectionProps = {
  enabled?: boolean;
};

type BrandFormProps = {
  form: UseFormReturn<CreateBrandInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateBrandInput) => Promise<void> | void;
  submitLabel: string;
};

function BrandForm({ form, formError, isPending, onSubmit, submitLabel }: BrandFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brand-code">{t("inventory.common.code")}</Label>
          <Input id="brand-code" placeholder="MK-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-name">{t("inventory.common.name")}</Label>
          <Input id="brand-name" placeholder="Michelin" {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand-description">{t("inventory.common.description")}</Label>
        <Textarea
          id="brand-description"
          placeholder={t("inventory.common.description")}
          {...form.register("description")}
        />
        <FormFieldError message={errors.description?.message} />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("is_active", checked === true, { shouldDirty: true });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">{t("inventory.form.active_brand")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_brand_description")}
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

type BrandDialogProps = {
  brand?: Brand | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function BrandDialog({ brand, onOpenChange, open }: BrandDialogProps) {
  const isEditing = Boolean(brand);
  const createBrandMutation = useCreateBrandMutation({ showErrorToast: false });
  const updateBrandMutation = useUpdateBrandMutation(brand?.id ?? "", { showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<CreateBrandInput>({
    defaultValues: brand ? getBrandFormValues(brand) : emptyBrandFormValues,
    resolver: buildFormResolver<CreateBrandInput>(createBrandSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = isEditing ? updateBrandMutation : createBrandMutation;

  useEffect(() => {
    form.reset(brand ? getBrandFormValues(brand) : emptyBrandFormValues);
    resetBackendFormErrors();
  }, [brand, form, open, resetBackendFormErrors]);

  async function handleSubmit(values: CreateBrandInput) {
    resetBackendFormErrors();

    try {
      if (brand) {
        await updateBrandMutation.mutateAsync(values);
      } else {
        await createBrandMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          brand ? "inventory.brand_update_error_fallback" : "inventory.brand_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {brand
              ? t("inventory.common.edit_entity", { entity: t("inventory.entity.brand") })
              : t("inventory.common.create_entity", { entity: t("inventory.entity.brand") })}
          </DialogTitle>
          <DialogDescription>{t("inventory.brands.dialog_description")}</DialogDescription>
        </DialogHeader>
        <BrandForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            brand
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", { entity: t("inventory.entity.brand") })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function BrandsSection({ enabled = true }: BrandsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("brands.view");
  const canCreate = can("brands.create");
  const canUpdate = can("brands.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const brandsQuery = useBrandsQuery(enabled && canView);

  const columns = useMemo<ColumnDef<Brand>[]>(() => {
    const baseColumns: ColumnDef<Brand>[] = [
      {
        accessorKey: "name",
        header: t("inventory.entity.brand"),
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
        accessorKey: "description",
        header: t("inventory.common.description"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.description ?? t("inventory.common.no_description")}
          </span>
        ),
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
              setSelectedBrand(row.original);
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
                setSelectedBrand(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", { entity: t("inventory.entity.brand") })}
            </Button>
          ) : null
        }
        description={t("inventory.brands.section_description")}
        title={t("inventory.entity.brands")}
      >
        {brandsQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.brands"),
            })}
          />
        ) : null}
        {brandsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              brandsQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.brands"),
              }),
            )}
            onRetry={() => brandsQuery.refetch()}
          />
        ) : null}
        {!brandsQuery.isLoading && !brandsQuery.isError ? (
          <DataTable
            columns={columns}
            data={brandsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.brands"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <BrandDialog
        brand={selectedBrand}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedBrand(null);
          }
        }}
        open={dialogOpen}
      />
    </>
  );
}

export { BrandsSection };
