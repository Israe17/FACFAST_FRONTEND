"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UseFormReturn } from "react-hook-form";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Pencil, Plus, Trash2 } from "lucide-react";

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

import {
  emptyPromotionFormValues,
  getPromotionFormValues,
} from "../form-values";
import {
  useCreatePromotionMutation,
  useProductsQuery,
  usePromotionsQuery,
  useUpdatePromotionMutation,
} from "../queries";
import { createPromotionSchema } from "../schemas";
import type { CreatePromotionInput, Product, Promotion } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

type PromotionsSectionProps = {
  enabled?: boolean;
};

type PromotionFormProps = {
  form: UseFormReturn<CreatePromotionInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreatePromotionInput) => Promise<void> | void;
  products: Product[];
  submitLabel: string;
};

function PromotionForm({
  form,
  formError,
  isPending,
  onSubmit,
  products,
  submitLabel,
}: PromotionFormProps) {
  const { t } = useAppTranslator();
  const {
    control,
    formState: { errors },
    watch,
  } = form;
  const isActive = watch("is_active");
  const promotionType = watch("type");
  const { append, fields, remove } = useFieldArray({
    control,
    name: "items",
  });
  const promotionTypeOptions = useMemo(
    () => [
      { label: t("inventory.enum.promotion_type.percentage"), value: "percentage" },
      { label: t("inventory.enum.promotion_type.fixed_amount"), value: "fixed_amount" },
      { label: t("inventory.enum.promotion_type.buy_x_get_y"), value: "buy_x_get_y" },
      { label: t("inventory.enum.promotion_type.price_override"), value: "price_override" },
    ],
    [t],
  );

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="promotion-code">{t("inventory.common.code")}</Label>
          <Input id="promotion-code" placeholder="PN-0001" {...form.register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promotion-name">{t("inventory.common.name")}</Label>
          <Input id="promotion-name" placeholder="Promo 3x2" {...form.register("name")} />
          <FormFieldError message={errors.name?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="promotion-type">{t("inventory.form.promotion_type")}</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="promotion-type">
                  <SelectValue placeholder={t("inventory.form.select_promotion_type")} />
                </SelectTrigger>
                <SelectContent>
                  {promotionTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.type?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promotion-valid-from">{t("inventory.form.valid_from")}</Label>
          <Input id="promotion-valid-from" type="datetime-local" {...form.register("valid_from")} />
          <FormFieldError message={errors.valid_from?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promotion-valid-to">{t("inventory.form.valid_to")}</Label>
          <Input id="promotion-valid-to" type="datetime-local" {...form.register("valid_to")} />
          <FormFieldError message={errors.valid_to?.message} />
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
          <p className="font-medium">{t("inventory.form.active_promotion")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_promotion_description")}
          </p>
        </div>
      </label>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-semibold">{t("inventory.promotions.items_title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("inventory.promotions.items_description")}
            </p>
          </div>
          <Button
            onClick={() =>
              append({
                bonus_quantity: undefined,
                discount_value: undefined,
                min_quantity: undefined,
                override_price: undefined,
                product_id: "",
              })
            }
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="size-4" />
            {t("inventory.promotions.add_item")}
          </Button>
        </div>

        {fields.length ? null : (
          <div className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            {t("inventory.promotions.no_items")}
          </div>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">
                {t("inventory.promotions.item_label", { index: String(index + 1) })}
              </p>
              <Button onClick={() => remove(index)} size="icon" type="button" variant="ghost">
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`promotion-item-product-${index}`}>{t("inventory.form.product")}</Label>
              <Controller
                control={control}
                name={`items.${index}.product_id`}
                render={({ field: productField }) => (
                  <Select onValueChange={productField.onChange} value={productField.value}>
                    <SelectTrigger id={`promotion-item-product-${index}`}>
                      <SelectValue placeholder={t("inventory.form.select_product")} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FormFieldError message={errors.items?.[index]?.product_id?.message} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor={`promotion-item-min-quantity-${index}`}>
                  {t("inventory.form.min_quantity")}
                </Label>
                <Input
                  id={`promotion-item-min-quantity-${index}`}
                  min={0}
                  step="0.0001"
                  type="number"
                  {...form.register(`items.${index}.min_quantity`, {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
                <FormFieldError message={errors.items?.[index]?.min_quantity?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`promotion-item-discount-value-${index}`}>
                  {t("inventory.form.discount_value")}
                </Label>
                <Input
                  disabled={promotionType === "buy_x_get_y" || promotionType === "price_override"}
                  id={`promotion-item-discount-value-${index}`}
                  min={0}
                  step="0.0001"
                  type="number"
                  {...form.register(`items.${index}.discount_value`, {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
                <FormFieldError message={errors.items?.[index]?.discount_value?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`promotion-item-override-price-${index}`}>
                  {t("inventory.form.override_price")}
                </Label>
                <Input
                  disabled={promotionType !== "price_override"}
                  id={`promotion-item-override-price-${index}`}
                  min={0}
                  step="0.0001"
                  type="number"
                  {...form.register(`items.${index}.override_price`, {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
                <FormFieldError message={errors.items?.[index]?.override_price?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`promotion-item-bonus-quantity-${index}`}>
                  {t("inventory.form.bonus_quantity")}
                </Label>
                <Input
                  disabled={promotionType !== "buy_x_get_y"}
                  id={`promotion-item-bonus-quantity-${index}`}
                  min={0}
                  step="0.0001"
                  type="number"
                  {...form.register(`items.${index}.bonus_quantity`, {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
                <FormFieldError message={errors.items?.[index]?.bonus_quantity?.message} />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

type PromotionDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  products: Product[];
  promotion?: Promotion | null;
};

function PromotionDialog({ onOpenChange, open, products, promotion }: PromotionDialogProps) {
  const createMutation = useCreatePromotionMutation({ showErrorToast: false });
  const updateMutation = useUpdatePromotionMutation(promotion?.id ?? "", {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<CreatePromotionInput>({
    defaultValues: promotion ? getPromotionFormValues(promotion) : emptyPromotionFormValues,
    resolver: buildFormResolver<CreatePromotionInput>(createPromotionSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = promotion ? updateMutation : createMutation;

  useEffect(() => {
    form.reset(promotion ? getPromotionFormValues(promotion) : emptyPromotionFormValues);
    resetBackendFormErrors();
  }, [form, open, promotion, resetBackendFormErrors]);

  async function handleSubmit(values: CreatePromotionInput) {
    resetBackendFormErrors();

    try {
      if (promotion) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          promotion
            ? "inventory.promotion_update_error_fallback"
            : "inventory.promotion_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {promotion
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.promotion"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.promotion"),
                })}
          </DialogTitle>
          <DialogDescription>{t("inventory.promotions.dialog_description")}</DialogDescription>
        </DialogHeader>
        <PromotionForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          products={products}
          submitLabel={
            promotion
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.promotion"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function PromotionsSection({ enabled = true }: PromotionsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("promotions.view");
  const canCreate = can("promotions.create");
  const canUpdate = can("promotions.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const promotionsQuery = usePromotionsQuery(enabled && canView);
  const productsQuery = useProductsQuery(enabled && canView);

  const columns = useMemo<ColumnDef<Promotion>[]>(() => {
    const baseColumns: ColumnDef<Promotion>[] = [
      {
        accessorKey: "name",
        header: t("inventory.entity.promotion"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{row.original.name}</p>
              {row.original.is_active ? null : (
                <Badge variant="outline">{t("inventory.common.inactive")}</Badge>
              )}
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
        accessorKey: "type",
        header: t("inventory.form.promotion_type"),
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.type
              ? t(`inventory.enum.promotion_type.${row.original.type}` as const)
              : t("inventory.common.not_available")}
          </Badge>
        ),
      },
      {
        accessorKey: "items",
        header: t("inventory.promotions.items_count"),
        cell: ({ row }) => row.original.items.length,
      },
      {
        accessorKey: "valid_from",
        header: t("inventory.form.validity"),
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <p>{formatDateTime(row.original.valid_from)}</p>
            <p className="text-muted-foreground">{formatDateTime(row.original.valid_to)}</p>
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
              setSelectedPromotion(row.original);
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
                setSelectedPromotion(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.promotion"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.promotions.section_description")}
        title={t("inventory.entity.promotions")}
      >
        {promotionsQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.promotions"),
            })}
          />
        ) : null}
        {promotionsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              promotionsQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.promotions"),
              }),
            )}
            onRetry={() => promotionsQuery.refetch()}
          />
        ) : null}
        {!promotionsQuery.isLoading && !promotionsQuery.isError ? (
          <DataTable
            columns={columns}
            data={promotionsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.promotions"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <PromotionDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedPromotion(null);
          }
        }}
        open={dialogOpen}
        products={productsQuery.data ?? []}
        promotion={selectedPromotion}
      />
    </>
  );
}

export { PromotionsSection };
