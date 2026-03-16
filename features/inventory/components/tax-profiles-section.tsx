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

import { emptyTaxProfileFormValues, getTaxProfileFormValues } from "../form-values";
import {
  useCreateTaxProfileMutation,
  useTaxProfilesQuery,
  useUpdateTaxProfileMutation,
} from "../queries";
import { createTaxProfileSchema } from "../schemas";
import type { CreateTaxProfileInput, TaxProfile } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

type TaxProfilesSectionProps = {
  enabled?: boolean;
};

type TaxProfileFormProps = {
  form: UseFormReturn<CreateTaxProfileInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateTaxProfileInput) => Promise<void> | void;
  submitLabel: string;
};

function TaxProfileForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: TaxProfileFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");
  const taxType = form.watch("tax_type");
  const requiresCabys = form.watch("requires_cabys");
  const allowsExoneration = form.watch("allows_exoneration");
  const taxProfileItemKindOptions = useMemo(
    () => [
      { label: t("inventory.enum.tax_profile_item_kind.goods"), value: "goods" },
      { label: t("inventory.enum.tax_profile_item_kind.service"), value: "service" },
    ],
    [t],
  );
  const taxTypeOptions = useMemo(
    () => [
      { label: t("inventory.enum.tax_type.iva"), value: "iva" },
      { label: t("inventory.enum.tax_type.exento"), value: "exento" },
      { label: t("inventory.enum.tax_type.no_sujeto"), value: "no_sujeto" },
      { label: t("inventory.enum.tax_type.specific_tax"), value: "specific_tax" },
    ],
    [t],
  );

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tax-profile-code">{t("inventory.common.code")}</Label>
          <Input id="tax-profile-code" placeholder="TF-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax-profile-name">{t("inventory.common.name")}</Label>
          <Input id="tax-profile-name" placeholder="IVA General Bienes" {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="tax-profile-item-kind">{t("inventory.form.item_kind")}</Label>
          <Controller
            control={form.control}
            name="item_kind"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="tax-profile-item-kind">
                  <SelectValue placeholder={t("inventory.form.select_item_kind")} />
                </SelectTrigger>
                <SelectContent>
                  {taxProfileItemKindOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.item_kind?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax-profile-tax-type">{t("inventory.form.tax_type")}</Label>
          <Controller
            control={form.control}
            name="tax_type"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="tax-profile-tax-type">
                  <SelectValue placeholder={t("inventory.form.select_tax_type")} />
                </SelectTrigger>
                <SelectContent>
                  {taxTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.tax_type?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax-profile-cabys">{t("inventory.form.cabys_code")}</Label>
          <Input id="tax-profile-cabys" placeholder="1234567890123" {...form.register("cabys_code")} />
          <FormFieldError message={errors.cabys_code?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-profile-description">{t("inventory.common.description")}</Label>
        <Textarea
          id="tax-profile-description"
          placeholder={t("inventory.common.description")}
          {...form.register("description")}
        />
        <FormFieldError message={errors.description?.message} />
      </div>

      {taxType === "iva" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tax-profile-iva-rate-code">{t("inventory.form.iva_rate_code")}</Label>
            <Input
              id="tax-profile-iva-rate-code"
              placeholder="08"
              {...form.register("iva_rate_code")}
            />
            <FormFieldError message={errors.iva_rate_code?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-profile-iva-rate">{t("inventory.form.iva_rate")}</Label>
            <Input
              id="tax-profile-iva-rate"
              max={100}
              min={0}
              step="0.0001"
              type="number"
              {...form.register("iva_rate", {
                setValueAs: (value) => (value === "" ? undefined : Number(value)),
              })}
            />
            <FormFieldError message={errors.iva_rate?.message} />
          </div>
        </div>
      ) : null}

      {taxType === "specific_tax" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tax-profile-specific-tax-name">
              {t("inventory.form.specific_tax_name")}
            </Label>
            <Input
              id="tax-profile-specific-tax-name"
              placeholder={t("inventory.form.specific_tax_name")}
              {...form.register("specific_tax_name")}
            />
            <FormFieldError message={errors.specific_tax_name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-profile-specific-tax-rate">
              {t("inventory.form.specific_tax_rate")}
            </Label>
            <Input
              id="tax-profile-specific-tax-rate"
              min={0}
              step="0.0001"
              type="number"
              {...form.register("specific_tax_rate", {
                setValueAs: (value) => (value === "" ? undefined : Number(value)),
              })}
            />
            <FormFieldError message={errors.specific_tax_rate?.message} />
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(requiresCabys)}
            onCheckedChange={(checked) => {
              form.setValue("requires_cabys", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.requires_cabys")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.requires_cabys_description")}
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(allowsExoneration)}
            onCheckedChange={(checked) => {
              form.setValue("allows_exoneration", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.allows_exoneration")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.allows_exoneration_description")}
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
            <p className="font-medium">{t("inventory.form.active_tax_profile")}</p>
            <p className="text-sm text-muted-foreground">
              {t("inventory.form.active_tax_profile_description")}
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

type TaxProfileDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  taxProfile?: TaxProfile | null;
};

function TaxProfileDialog({ onOpenChange, open, taxProfile }: TaxProfileDialogProps) {
  const createTaxProfileMutation = useCreateTaxProfileMutation({ showErrorToast: false });
  const updateTaxProfileMutation = useUpdateTaxProfileMutation(taxProfile?.id ?? "", {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<CreateTaxProfileInput>({
    defaultValues: taxProfile ? getTaxProfileFormValues(taxProfile) : emptyTaxProfileFormValues,
    resolver: buildFormResolver<CreateTaxProfileInput>(createTaxProfileSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = taxProfile ? updateTaxProfileMutation : createTaxProfileMutation;

  useEffect(() => {
    form.reset(taxProfile ? getTaxProfileFormValues(taxProfile) : emptyTaxProfileFormValues);
    resetBackendFormErrors();
  }, [form, open, resetBackendFormErrors, taxProfile]);

  async function handleSubmit(values: CreateTaxProfileInput) {
    resetBackendFormErrors();

    try {
      if (taxProfile) {
        await updateTaxProfileMutation.mutateAsync(values);
      } else {
        await createTaxProfileMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          taxProfile
            ? "inventory.tax_profile_update_error_fallback"
            : "inventory.tax_profile_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {taxProfile
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.tax_profile"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.tax_profile"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.tax_profiles.dialog_description")}</DialogDescription>
        </DialogHeader>
        <TaxProfileForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            taxProfile
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.tax_profile"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function TaxProfilesSection({ enabled = true }: TaxProfilesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("tax_profiles.view");
  const canCreate = can("tax_profiles.create");
  const canUpdate = can("tax_profiles.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTaxProfile, setSelectedTaxProfile] = useState<TaxProfile | null>(null);
  const taxProfilesQuery = useTaxProfilesQuery(enabled && canView);

  const columns = useMemo<ColumnDef<TaxProfile>[]>(() => {
    const baseColumns: ColumnDef<TaxProfile>[] = [
      {
        accessorKey: "name",
        header: t("inventory.entity.tax_profile"),
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
        accessorKey: "item_kind",
        header: t("inventory.form.item_kind"),
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.item_kind
              ? t(`inventory.enum.tax_profile_item_kind.${row.original.item_kind}` as const)
              : t("inventory.common.not_available")}
          </Badge>
        ),
      },
      {
        accessorKey: "tax_type",
        header: t("inventory.form.tax_type"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant="outline">
              {row.original.tax_type
                ? t(`inventory.enum.tax_type.${row.original.tax_type}` as const)
                : t("inventory.common.not_available")}
            </Badge>
            {row.original.tax_type === "iva" && row.original.iva_rate !== undefined ? (
              <p className="text-xs text-muted-foreground">IVA {row.original.iva_rate}%</p>
            ) : null}
          </div>
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
              setSelectedTaxProfile(row.original);
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
                setSelectedTaxProfile(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.tax_profile"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.tax_profiles.section_description")}
        title={t("inventory.entity.tax_profiles")}
      >
        {taxProfilesQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.tax_profiles"),
            })}
          />
        ) : null}
        {taxProfilesQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              taxProfilesQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.tax_profiles"),
              }),
            )}
            onRetry={() => taxProfilesQuery.refetch()}
          />
        ) : null}
        {!taxProfilesQuery.isLoading && !taxProfilesQuery.isError ? (
          <DataTable
            columns={columns}
            data={taxProfilesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.tax_profiles"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <TaxProfileDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedTaxProfile(null);
          }
        }}
        open={dialogOpen}
        taxProfile={selectedTaxProfile}
      />
    </>
  );
}

export { TaxProfilesSection };
