import type { ColumnDef } from "@tanstack/react-table";
import { CornerDownRight, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";

import type { ProductCategory } from "../types";
import { taxProfileItemKindTranslationMap } from "../constants";

type GetProductCategoriesColumnsParams = {
  canDelete: boolean;
  canUpdate: boolean;
  childrenCountById: Map<string, number>;
  onDelete: (category: ProductCategory) => void;
  onEdit: (category: ProductCategory) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

function getProductCategoriesColumns({
  canDelete,
  canUpdate,
  childrenCountById,
  onDelete,
  onEdit,
  t,
}: GetProductCategoriesColumnsParams): ColumnDef<ProductCategory>[] {
  const baseColumns: ColumnDef<ProductCategory>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.category"),
      cell: ({ row }) => {
        const level = row.original.level ?? 0;
        return (
          <div className="flex items-start gap-2" style={{ paddingLeft: `${level * 20}px` }}>
            {level > 0 ? (
              <CornerDownRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
            ) : null}
            <div className="space-y-1">
              <p className="font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">
                {row.original.code
                  ? `${t("inventory.common.code")}: ${row.original.code}`
                  : t("inventory.common.no_manual_code")}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "cabys",
      header: t("inventory.cabys.tax_rate") + " / CABYS",
      cell: ({ row }) => {
        const cabysCode = row.original.default_tax_profile?.cabys_code;
        if (!cabysCode) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        return <span className="font-mono text-xs">{cabysCode}</span>;
      },
    },
    {
      id: "tax_profile",
      header: t("inventory.entity.tax_profile"),
      cell: ({ row }) => {
        const profile = row.original.default_tax_profile;
        if (!profile) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        return (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">{profile.name}</span>
            {profile.iva_rate != null ? (
              <Badge variant="secondary">IVA {profile.iva_rate}%</Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "item_kind",
      header: t("inventory.form.category_item_kind"),
      cell: ({ row }) => {
        const itemKind = row.original.default_tax_profile?.item_kind;
        if (!itemKind) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        return (
          <Badge variant="outline">
            {t(taxProfileItemKindTranslationMap[itemKind] ?? "inventory.common.not_available")}
          </Badge>
        );
      },
    },
    {
      id: "children_count",
      header: t("inventory.categories.subcategories_count"),
      cell: ({ row }) => {
        const count = childrenCountById.get(row.original.id) ?? 0;
        return (
          <span className="text-sm">
            {count > 0 ? count : <span className="text-muted-foreground">—</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: t("inventory.common.status"),
      cell: ({ row }) => (
        <Badge
          className={
            row.original.is_active
              ? "border-transparent bg-emerald-100 text-emerald-700"
              : undefined
          }
          variant={row.original.is_active ? "default" : "outline"}
        >
          {row.original.is_active
            ? t("inventory.common.active")
            : t("inventory.common.inactive")}
        </Badge>
      ),
    },
  ];

  if (canUpdate || canDelete) {
    baseColumns.push({
      id: "actions",
      header: t("inventory.common.actions"),
      cell: ({ row }) => (
        <TableRowActions
          actions={[
            ...(canUpdate
              ? [
                  {
                    label: t("inventory.common.edit"),
                    icon: Pencil,
                    onClick: () => onEdit(row.original),
                  },
                ]
              : []),
            ...(canDelete && row.original.lifecycle.can_delete
              ? [
                  {
                    label: t("inventory.common.delete"),
                    icon: Trash2,
                    variant: "destructive" as const,
                    onClick: () => onDelete(row.original),
                  },
                ]
              : []),
          ]}
        />
      ),
    });
  }

  return baseColumns;
}

export { getProductCategoriesColumns };
