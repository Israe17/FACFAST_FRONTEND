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
  emptyProductPriceFormValues,
  getProductPriceFormValues,
} from "../form-values";
import {
  useCreateProductPriceMutation,
  usePriceListsQuery,
  useProductPricesQuery,
  useProductsQuery,
  useUpdateProductPriceMutation,
} from "../queries";
import { createProductPriceSchema } from "../schemas";
import type {
  CreateProductPriceInput,
  PriceList,
  Product,
  ProductPrice,
} from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { FormFieldError } from "./form-field-error";

const EMPTY_SELECT_VALUE = "__none__";

type ProductPricesSectionProps = {
  enabled?: boolean;
};

type ProductPriceFormProps = {
  form: UseFormReturn<CreateProductPriceInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateProductPriceInput) => Promise<void> | void;
  priceLists: PriceList[];
  submitLabel: string;
};

function formatPrice(value: number | undefined, currency = "CRC") {
  if (value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("es-CR", {
    currency,
    maximumFractionDigits: 4,
    style: "currency",
  }).format(value);
}

function ProductPriceForm({
  form,
  formError,
  isPending,
  onSubmit,
  priceLists,
  submitLabel,
}: ProductPriceFormProps) {
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
          <Label htmlFor="product-price-price-list">{t("inventory.entity.price_list")}</Label>
          <Controller
            control={form.control}
            name="price_list_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="product-price-price-list">
                  <SelectValue placeholder={t("inventory.form.select_price_list")} />
                </SelectTrigger>
                <SelectContent>
                  {priceLists.map((priceList) => (
                    <SelectItem key={priceList.id} value={priceList.id}>
                      {priceList.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.price_list_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-price-price">{t("inventory.form.price")}</Label>
          <Input
            id="product-price-price"
            min={0}
            step="0.0001"
            type="number"
            {...form.register("price", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.price?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="product-price-min-quantity">{t("inventory.form.min_quantity")}</Label>
          <Input
            id="product-price-min-quantity"
            min={0}
            step="0.0001"
            type="number"
            {...form.register("min_quantity", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FormFieldError message={errors.min_quantity?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-price-valid-from">{t("inventory.form.valid_from")}</Label>
          <Input id="product-price-valid-from" type="datetime-local" {...form.register("valid_from")} />
          <FormFieldError message={errors.valid_from?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-price-valid-to">{t("inventory.form.valid_to")}</Label>
          <Input id="product-price-valid-to" type="datetime-local" {...form.register("valid_to")} />
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
          <p className="font-medium">{t("inventory.form.active_product_price")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.form.active_product_price_description")}
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

type ProductPriceDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  priceLists: PriceList[];
  product?: Product | null;
  productPrice?: ProductPrice | null;
};

function ProductPriceDialog({
  onOpenChange,
  open,
  priceLists,
  product,
  productPrice,
}: ProductPriceDialogProps) {
  const productId = product?.id ?? "";
  const createMutation = useCreateProductPriceMutation(productId, { showErrorToast: false });
  const updateMutation = useUpdateProductPriceMutation(productPrice?.id ?? "", productId, {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<CreateProductPriceInput>({
    defaultValues: productPrice ? getProductPriceFormValues(productPrice) : emptyProductPriceFormValues,
    resolver: buildFormResolver<CreateProductPriceInput>(createProductPriceSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);
  const activeMutation = productPrice ? updateMutation : createMutation;

  useEffect(() => {
    form.reset(productPrice ? getProductPriceFormValues(productPrice) : emptyProductPriceFormValues);
    resetBackendFormErrors();
  }, [form, open, productPrice, resetBackendFormErrors]);

  async function handleSubmit(values: CreateProductPriceInput) {
    resetBackendFormErrors();

    if (!productId) {
      return;
    }

    try {
      if (productPrice) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }

      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t(
          productPrice
            ? "inventory.product_price_update_error_fallback"
            : "inventory.product_price_create_error_fallback",
        ),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {productPrice
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.product_price"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product_price"),
                })}
          </DialogTitle>
          <DialogDescription>
            {t("inventory.product_prices.dialog_description", {
              product: product?.name ?? t("inventory.entity.product"),
            })}
          </DialogDescription>
        </DialogHeader>
        <ProductPriceForm
          form={form}
          formError={formError}
          isPending={activeMutation.isPending}
          onSubmit={handleSubmit}
          priceLists={priceLists}
          submitLabel={
            productPrice
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.product_price"),
                })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function ProductPricesSection({ enabled = true }: ProductPricesSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("product_prices.view");
  const canCreate = can("product_prices.create");
  const canUpdate = can("product_prices.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductPrice, setSelectedProductPrice] = useState<ProductPrice | null>(null);
  const productsQuery = useProductsQuery(enabled && canView);
  const priceListsQuery = usePriceListsQuery(enabled && canView);
  const resolvedSelectedProductId =
    selectedProductId && productsQuery.data?.some((product) => product.id === selectedProductId)
      ? selectedProductId
      : (productsQuery.data?.[0]?.id ?? "");
  const productPricesQuery = useProductPricesQuery(resolvedSelectedProductId, enabled && canView);
  const selectedProduct =
    productsQuery.data?.find((product) => product.id === resolvedSelectedProductId) ?? null;

  const columns = useMemo<ColumnDef<ProductPrice>[]>(() => {
    const baseColumns: ColumnDef<ProductPrice>[] = [
      {
        accessorKey: "price_list",
        header: t("inventory.entity.price_list"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">{row.original.price_list.name}</p>
            <Badge variant="outline">
              {row.original.price_list.kind
                ? t(`inventory.enum.price_list_kind.${row.original.price_list.kind}` as const)
                : t("inventory.common.not_available")}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: t("inventory.form.price"),
        cell: ({ row }) =>
          formatPrice(row.original.price, row.original.price_list.currency ?? "CRC"),
      },
      {
        accessorKey: "min_quantity",
        header: t("inventory.form.min_quantity"),
        cell: ({ row }) => row.original.min_quantity ?? t("inventory.common.not_available"),
      },
      {
        accessorKey: "valid_from",
        header: t("inventory.form.validity"),
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <p>{row.original.valid_from ? formatDateTime(row.original.valid_from) : "-"}</p>
            <p className="text-muted-foreground">
              {row.original.valid_to ? formatDateTime(row.original.valid_to) : "-"}
            </p>
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
              setSelectedProductPrice(row.original);
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
              disabled={!selectedProduct}
              onClick={() => {
                setSelectedProductPrice(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.product_price"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.product_prices.section_description")}
        title={t("inventory.entity.product_prices")}
      >
        <div className="max-w-md space-y-2">
          <Label htmlFor="product-prices-product">{t("inventory.form.product")}</Label>
          <Select
            onValueChange={setSelectedProductId}
            value={resolvedSelectedProductId || EMPTY_SELECT_VALUE}
          >
            <SelectTrigger id="product-prices-product">
              <SelectValue placeholder={t("inventory.form.select_product")} />
            </SelectTrigger>
            <SelectContent>
              {(productsQuery.data ?? []).length ? null : (
                <SelectItem value={EMPTY_SELECT_VALUE}>
                  {t("inventory.product_prices.no_products_available")}
                </SelectItem>
              )}
              {(productsQuery.data ?? []).map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {productsQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.products"),
            })}
          />
        ) : null}
        {productsQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              productsQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.products"),
              }),
            )}
            onRetry={() => productsQuery.refetch()}
          />
        ) : null}
        {!productsQuery.isLoading && !productsQuery.isError && !selectedProduct ? (
          <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            {t("inventory.product_prices.no_product_selected")}
          </div>
        ) : null}
        {selectedProduct && productPricesQuery.isLoading ? (
          <LoadingState
            description={t("inventory.common.loading_entity", {
              entity: t("inventory.entity.product_prices"),
            })}
          />
        ) : null}
        {selectedProduct && productPricesQuery.isError ? (
          <ErrorState
            description={getBackendErrorMessage(
              productPricesQuery.error,
              t("inventory.common.unable_to_load_entity", {
                entity: t("inventory.entity.product_prices"),
              }),
            )}
            onRetry={() => productPricesQuery.refetch()}
          />
        ) : null}
        {selectedProduct && !productPricesQuery.isLoading && !productPricesQuery.isError ? (
          <DataTable
            columns={columns}
            data={productPricesQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.product_prices"),
            })}
          />
        ) : null}
      </CatalogSectionCard>

      <ProductPriceDialog
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedProductPrice(null);
          }
        }}
        open={dialogOpen}
        priceLists={priceListsQuery.data ?? []}
        product={selectedProduct}
        productPrice={selectedProductPrice}
      />
    </>
  );
}

export { ProductPricesSection };
