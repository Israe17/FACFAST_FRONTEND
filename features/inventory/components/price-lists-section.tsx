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
import { getInventoryPriceListRoute } from "@/shared/lib/routes";

import { emptyPriceListFormValues, getPriceListFormValues } from "../form-values";
import {
  useCreatePriceListMutation,
  usePriceListsQuery,
  useUpdatePriceListMutation,
} from "../queries";
import { createPriceListSchema } from "../schemas";
import type { CreatePriceListInput, PriceList } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

type PriceListsSectionProps = {
  enabled?: boolean;
};

type PriceListFormProps = {
  form: UseFormReturn<CreatePriceListInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreatePriceListInput) => Promise<void> | void;
  submitLabel: string;
};

function PriceListForm({ form, formError, isPending, onSubmit, submitLabel }: PriceListFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const isDefault = form.watch("is_default");
  const isActive = form.watch("is_active");
  const kindOptions = useMemo(
    () => [
      { label: t("inventory.enum.price_list_kind.retail"), value: "retail" },
      { label: t("inventory.enum.price_list_kind.wholesale"), value: "wholesale" },
      { label: t("inventory.enum.price_list_kind.credit"), value: "credit" },
      { label: t("inventory.enum.price_list_kind.special"), value: "special" },
    ],
    [t],
  );

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price-list-code">{t("inventory.common.code")}</Label>
          <Input id="price-list-code" placeholder="PL-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price-list-name">{t("inventory.common.name")}</Label>
          <Input id="price-list-name" placeholder={t("inventory.entity.price_list")} {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price-list-kind">{t("inventory.common.kind")}</Label>
          <Controller
            control={form.control}
            name="kind"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="price-list-kind">
                  <SelectValue placeholder={t("inventory.form.select_kind")} />
                </SelectTrigger>
                <SelectContent>
                  {kindOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.kind?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price-list-currency">{t("inventory.common.currency")}</Label>
          <Input id="price-list-currency" maxLength={3} placeholder="CRC" {...form.register("currency")} />
          <FormFieldError message={errors.currency?.message} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(isDefault)}
            onCheckedChange={(checked) => {
              form.setValue("is_default", checked === true, { shouldDirty: true });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">{t("inventory.form.default_price_list")}</p>
            <p className="text-sm text-muted-foreground">{t("inventory.form.default_price_list_description")}</p>
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
            <p className="font-medium">{t("inventory.form.active_price_list")}</p>
            <p className="text-sm text-muted-foreground">{t("inventory.form.active_price_list_description")}</p>
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

type PriceListDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  priceList?: PriceList | null;
};

function PriceListDialog({ onOpenChange, open, priceList }: PriceListDialogProps) {
  const createPriceListMutation = useCreatePriceListMutation({ showErrorToast: false });
  const updatePriceListMutation = useUpdatePriceListMutation(priceList?.id ?? "", {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<CreatePriceListInput>({
    defaultValues: priceList ? getPriceListFormValues(priceList) : emptyPriceListFormValues,
    resolver: buildFormResolver<CreatePriceListInput>(createPriceListSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = priceList ? updatePriceListMutation : createPriceListMutation;

  useEffect(() => {
    form.reset(priceList ? getPriceListFormValues(priceList) : emptyPriceListFormValues);
    resetBackendFormErrors();
  }, [form, open, priceList, resetBackendFormErrors]);

  async function handleSubmit(values: CreatePriceListInput) {
    resetBackendFormErrors();

    try {
      if (priceList) {
        await updatePriceListMutation.mutateAsync(values);
      } else {
        await createPriceListMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          priceList
            ? "inventory.price_list_update_error_fallback"
            : "inventory.price_list_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {priceList
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.price_list"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.price_list"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.price_lists.dialog_description")}</DialogDescription>
        </DialogHeader>
        <PriceListForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            priceList
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.price_list"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function PriceListsSection({ enabled = true }: PriceListsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("price_lists.view");
  const canCreate = can("price_lists.create");
  const canUpdate = can("price_lists.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const priceListsQuery = usePriceListsQuery(enabled && canView);

  const columns = useMemo<ColumnDef<PriceList>[]>(() => {
    const baseColumns: ColumnDef<PriceList>[] = [
      {
        accessorKey: "name",
        header: t("inventory.entity.price_list"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{row.original.name}</p>
              {row.original.is_default ? <Badge>{t("inventory.form.default_price_list")}</Badge> : null}
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
        accessorKey: "kind",
        header: t("inventory.common.kind"),
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.kind
              ? t(`inventory.enum.price_list_kind.${row.original.kind}` as const)
              : t("inventory.common.not_available")}
          </Badge>
        ),
      },
      {
        accessorKey: "currency",
        header: t("inventory.common.currency"),
        cell: ({ row }) => row.original.currency,
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
              <Link href={getInventoryPriceListRoute(row.original.id)}>
                <Eye className="size-4" />
                {t("inventory.common.view")}
              </Link>
            </Button>
            {canUpdate ? (
              <Button
                onClick={() => {
                  setSelectedPriceList(row.original);
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
  }, [canUpdate, canView, t]);

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
                setSelectedPriceList(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.price_list"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.price_lists.section_description")}
        title={t("inventory.entity.price_lists")}
      >
        {priceListsQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.price_lists"),
            })}
          />
        ) : null}
        {priceListsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              priceListsQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.price_lists"),
              }),
            )}
            onRetry={() => priceListsQuery.refetch()}
          />
        ) : null}
        {!priceListsQuery.isLoading && !priceListsQuery.isError ? (
          <DataTable
            columns={columns}
            data={priceListsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.price_lists"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <PriceListDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedPriceList(null);
          }
        }}
        open={dialogOpen}
        priceList={selectedPriceList}
      />
    </>
  );
}

export { PriceListsSection };
