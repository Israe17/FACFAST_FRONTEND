"use client";

import { useState, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";

import {
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

  const handleCreate = useCallback(() => {
    setSelectedVariant(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    setDialogOpen(true);
  }, []);

  const variants = variantsQuery.data ?? [];

  const columns: ColumnDef<ProductVariant>[] = [
    {
      accessorKey: "variant_name",
      header: t("inventory.form.variant_name"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.variant_name ?? t("inventory.detail.default_variant")}</span>
          {row.original.is_default ? (
            <Badge variant="secondary">{t("inventory.detail.default_variant_badge")}</Badge>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
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
      accessorKey: "is_active",
      header: t("inventory.common.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "outline"}>
          {row.original.is_active
            ? t("inventory.common.active")
            : t("inventory.common.inactive")}
        </Badge>
      ),
    },
    ...(canUpdate
      ? [
          {
            id: "actions",
            cell: ({ row }: { row: { original: ProductVariant } }) => {
              if (row.original.is_default && !product.has_variants) {
                return null;
              }

              return (
                <TableRowActions
                  actions={[
                    {
                      icon: Pencil,
                      label: t("inventory.common.edit"),
                      onClick: () => handleEdit(row.original),
                    },
                  ]}
                />
              );
            },
          } satisfies ColumnDef<ProductVariant>,
        ]
      : []),
  ];

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
    </>
  );
}

export { ProductVariantsSection };
