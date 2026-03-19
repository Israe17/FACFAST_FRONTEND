"use client";

import { useState, useCallback, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Power } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";

import {
  useDeactivateProductVariantMutation,
  useMeasurementUnitsQuery,
  useProductVariantsQuery,
  useTaxProfilesQuery,
  useWarrantyProfilesQuery,
} from "../queries";
import type { Product, ProductVariant } from "../types";
import { useInventoryModule } from "../use-inventory-module";
import { InventoryDetailBlock } from "./inventory-detail-block";
import { ProductVariantDialog } from "./product-variant-dialog";
import { VariantAttributesManager } from "./variant-attributes-manager";

type ProductVariantsSectionProps = {
  product: Product;
};

function ProductVariantsSection({ product }: ProductVariantsSectionProps) {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const canCreate = can("products.create");
  const canUpdate = can("products.update");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ProductVariant | null>(null);

  const variantsQuery = useProductVariantsQuery(
    product.id,
    canRunTenantQueries && can("products.view"),
  );
  const taxProfilesQuery = useTaxProfilesQuery(canRunTenantQueries && can("tax_profiles.view"));
  const measurementUnitsQuery = useMeasurementUnitsQuery(
    canRunTenantQueries && can("measurement_units.view"),
  );
  const warrantyProfilesQuery = useWarrantyProfilesQuery(
    canRunTenantQueries && can("warranty_profiles.view"),
  );
  const deactivateMutation = useDeactivateProductVariantMutation(product.id);

  const handleCreate = useCallback(() => {
    setSelectedVariant(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    setDialogOpen(true);
  }, []);

  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivateTarget) return;
    await deactivateMutation.mutateAsync(deactivateTarget.id);
    setDeactivateTarget(null);
  }, [deactivateTarget, deactivateMutation]);

  const variants = variantsQuery.data ?? [];
  const activeVariantCount = variants.filter((v) => v.is_active).length;

  const columns = useMemo<ColumnDef<ProductVariant>[]>(
    () => [
      {
        accessorKey: "variant_name",
        header: t("inventory.form.variant_name"),
        cell: ({ row }) => {
          const v = row.original;
          const attrValues = v.attribute_values ?? [];
          const isGenerated = attrValues.length > 0;

          return (
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={v.is_active ? "" : "text-muted-foreground line-through"}>
                  {v.variant_name ?? t("inventory.detail.default_variant")}
                </span>
                {v.is_default ? (
                  <Badge variant="secondary">{t("inventory.detail.default_variant_badge")}</Badge>
                ) : null}
                {!v.is_active ? (
                  <Badge variant="outline">{t("inventory.common.inactive")}</Badge>
                ) : null}
              </div>
              {isGenerated && !v.is_default ? (
                <div className="flex flex-wrap gap-1">
                  {attrValues.map((av) => (
                    <Badge key={av.id} className="text-xs" variant="outline">
                      {av.value}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => (
          <span className={row.original.is_active ? "" : "text-muted-foreground"}>
            {row.original.sku}
          </span>
        ),
      },
      {
        accessorKey: "barcode",
        header: t("inventory.form.barcode"),
        cell: ({ row }) => row.original.barcode ?? t("inventory.common.not_available"),
      },
      {
        accessorKey: "fiscal_profile",
        header: t("inventory.form.tax_profile"),
        cell: ({ row }) =>
          row.original.fiscal_profile?.name ?? t("inventory.common.not_available"),
      },
      {
        accessorKey: "tracking",
        header: t("inventory.variants.tracking"),
        cell: ({ row }) => {
          const v = row.original;
          const flags: string[] = [];
          if (v.track_inventory) flags.push(t("inventory.variants.flag_inventory"));
          if (v.track_lots) flags.push(t("inventory.variants.flag_lots"));
          if (v.track_serials) flags.push(t("inventory.variants.flag_serials"));
          if (!flags.length) return t("inventory.common.not_available");
          return (
            <div className="flex flex-wrap gap-1">
              {flags.map((flag) => (
                <Badge key={flag} className="text-xs" variant="outline">
                  {flag}
                </Badge>
              ))}
            </div>
          );
        },
      },
      ...(canUpdate
        ? [
            {
              id: "actions",
              cell: ({ row }: { row: { original: ProductVariant } }) => {
                const v = row.original;
                if (v.is_default && !product.has_variants) {
                  return null;
                }

                const actions = [
                  {
                    icon: Pencil,
                    label: t("inventory.common.edit"),
                    onClick: () => handleEdit(v),
                  },
                ];

                if (!v.is_default && v.is_active && activeVariantCount > 1) {
                  actions.push({
                    icon: Power,
                    label: t("inventory.variants.deactivate"),
                    onClick: () => setDeactivateTarget(v),
                  });
                }

                return <TableRowActions actions={actions} />;
              },
            } satisfies ColumnDef<ProductVariant>,
          ]
        : []),
    ],
    [t, canUpdate, product.has_variants, handleEdit, activeVariantCount],
  );

  return (
    <>
      <InventoryDetailBlock
        description={t("inventory.variants.section_description")}
        title={t("inventory.variants.section_title")}
      >
        {product.has_variants ? (
          <VariantAttributesManager product={product} />
        ) : null}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("inventory.variants.variant_count", {
              count: variants.length,
            })}
          </p>
          {canCreate && product.has_variants ? (
            <Button onClick={handleCreate} size="sm" variant="outline">
              <Plus className="mr-1 size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.variant"),
              })}
            </Button>
          ) : null}
        </div>

        <DataTable
          columns={columns}
          data={variants}
          emptyMessage={t("inventory.variants.no_variants")}
          enablePagination={false}
        />
      </InventoryDetailBlock>

      <ProductVariantDialog
        measurementUnits={measurementUnitsQuery.data ?? []}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        productId={product.id}
        taxProfiles={taxProfilesQuery.data ?? []}
        variant={selectedVariant}
        warrantyProfiles={warrantyProfilesQuery.data ?? []}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null);
        }}
        open={deactivateTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inventory.variants.deactivate_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.variants.deactivate_description", {
                name: deactivateTarget?.variant_name ?? deactivateTarget?.sku ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateConfirm}>
              {t("inventory.variants.deactivate_confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { ProductVariantsSection };
