"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseFormReturn } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { Pencil, Plus } from "lucide-react";

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

import {
  emptyWarrantyProfileFormValues,
  getWarrantyProfileFormValues,
} from "../form-values";
import {
  useCreateWarrantyProfileMutation,
  useUpdateWarrantyProfileMutation,
  useWarrantyProfilesQuery,
} from "../queries";
import { createWarrantyProfileSchema } from "../schemas";
import type { CreateWarrantyProfileInput, WarrantyProfile } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

type WarrantyProfilesSectionProps = {
  enabled?: boolean;
};

type WarrantyProfileFormProps = {
  form: UseFormReturn<CreateWarrantyProfileInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateWarrantyProfileInput) => Promise<void> | void;
  submitLabel: string;
};

function WarrantyProfileForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: WarrantyProfileFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");
  const warrantyDurationUnitOptions = useMemo(
    () => [
      { label: t("inventory.enum.warranty_duration_unit.days"), value: "days" },
      { label: t("inventory.enum.warranty_duration_unit.months"), value: "months" },
      { label: t("inventory.enum.warranty_duration_unit.years"), value: "years" },
    ],
    [t],
  );

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warranty-profile-code">{t("inventory.common.code")}</Label>
          <Input id="warranty-profile-code" placeholder="WP-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warranty-profile-name">{t("inventory.common.name")}</Label>
          <Input
            id="warranty-profile-name"
            placeholder={t("inventory.entity.warranty_profile")}
            {...form.register("name")}
          />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="warranty-profile-duration-value">{t("inventory.form.duration_value")}</Label>
          <Input
            id="warranty-profile-duration-value"
            min={1}
            step="1"
            type="number"
            {...form.register("duration_value", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.duration_value?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warranty-profile-duration-unit">{t("inventory.form.duration_unit")}</Label>
          <Controller
            control={form.control}
            name="duration_unit"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="warranty-profile-duration-unit">
                  <SelectValue placeholder={t("inventory.form.select_duration_unit")} />
                </SelectTrigger>
                <SelectContent>
                  {warrantyDurationUnitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.duration_unit?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="warranty-profile-coverage-notes">{t("inventory.form.coverage_notes")}</Label>
        <Textarea
          id="warranty-profile-coverage-notes"
          placeholder={t("inventory.form.coverage_notes")}
          {...form.register("coverage_notes")}
        />
        <FormFieldError message={errors.coverage_notes?.message} />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("is_active", checked === true, { shouldDirty: true });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">{t("inventory.form.active_warranty_profile")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_warranty_profile_description")}
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

type WarrantyProfileDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  warrantyProfile?: WarrantyProfile | null;
};

function WarrantyProfileDialog({
  onOpenChange,
  open,
  warrantyProfile,
}: WarrantyProfileDialogProps) {
  const createWarrantyProfileMutation = useCreateWarrantyProfileMutation({
    showErrorToast: false,
  });
  const updateWarrantyProfileMutation = useUpdateWarrantyProfileMutation(
    warrantyProfile?.id ?? "",
    { showErrorToast: false },
  );
  const { t } = useAppTranslator();
  const form = useForm<CreateWarrantyProfileInput>({
    defaultValues: warrantyProfile
      ? getWarrantyProfileFormValues(warrantyProfile)
      : emptyWarrantyProfileFormValues,
    resolver: buildFormResolver<CreateWarrantyProfileInput>(createWarrantyProfileSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = warrantyProfile
    ? updateWarrantyProfileMutation
    : createWarrantyProfileMutation;

  useEffect(() => {
    form.reset(
      warrantyProfile
        ? getWarrantyProfileFormValues(warrantyProfile)
        : emptyWarrantyProfileFormValues,
    );
    resetBackendFormErrors();
  }, [form, open, resetBackendFormErrors, warrantyProfile]);

  async function handleSubmit(values: CreateWarrantyProfileInput) {
    resetBackendFormErrors();

    try {
      if (warrantyProfile) {
        await updateWarrantyProfileMutation.mutateAsync(values);
      } else {
        await createWarrantyProfileMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          warrantyProfile
            ? "inventory.warranty_profile_update_error_fallback"
            : "inventory.warranty_profile_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {warrantyProfile
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.warranty_profile"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warranty_profile"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.warranty_profiles.dialog_description")}</DialogDescription>
        </DialogHeader>
        <WarrantyProfileForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            warrantyProfile
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.warranty_profile"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function WarrantyProfilesSection({ enabled = true }: WarrantyProfilesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("warranty_profiles.view");
  const canCreate = can("warranty_profiles.create");
  const canUpdate = can("warranty_profiles.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWarrantyProfile, setSelectedWarrantyProfile] =
    useState<WarrantyProfile | null>(null);
  const warrantyProfilesQuery = useWarrantyProfilesQuery(enabled && canView);

  const columns = useMemo<ColumnDef<WarrantyProfile>[]>(() => {
    const baseColumns: ColumnDef<WarrantyProfile>[] = [
      {
        accessorKey: "name",
        header: t("inventory.entity.warranty_profile"),
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
        accessorKey: "duration_value",
        header: t("inventory.common.coverage"),
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.duration_value ?? 0}{" "}
            {row.original.duration_unit
              ? t(`inventory.enum.warranty_duration_unit.${row.original.duration_unit}` as const)
              : t("inventory.enum.warranty_duration_unit.months")}
          </Badge>
        ),
      },
      {
        accessorKey: "coverage_notes",
        header: t("inventory.common.notes"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.coverage_notes ?? t("inventory.common.no_notes")}
          </span>
        ),
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
              setSelectedWarrantyProfile(row.original);
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
                setSelectedWarrantyProfile(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.warranty_profile"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.warranty_profiles.section_description")}
        title={t("inventory.entity.warranty_profiles")}
      >
        {warrantyProfilesQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.warranty_profiles"),
            })}
          />
        ) : null}
        {warrantyProfilesQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              warrantyProfilesQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.warranty_profiles"),
              }),
            )}
            onRetry={() => warrantyProfilesQuery.refetch()}
          />
        ) : null}
        {!warrantyProfilesQuery.isLoading && !warrantyProfilesQuery.isError ? (
          <DataTable
            columns={columns}
            data={warrantyProfilesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.warranty_profiles"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <WarrantyProfileDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedWarrantyProfile(null);
          }
        }}
        open={dialogOpen}
        warrantyProfile={selectedWarrantyProfile}
      />
    </>
  );
}

export { WarrantyProfilesSection };
