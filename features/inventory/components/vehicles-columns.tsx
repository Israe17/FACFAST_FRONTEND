import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { formatDateTime } from "@/shared/lib/utils";

import type { Vehicle } from "../types";

type GetVehiclesColumnsParams = {
  canDelete: boolean;
  canUpdate: boolean;
  onDelete: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  t: ReturnType<typeof useAppTranslator>["t"];
};

function getVehiclesColumns({
  canDelete,
  canUpdate,
  onDelete,
  onEdit,
  t,
}: GetVehiclesColumnsParams): ColumnDef<Vehicle>[] {
  const baseColumns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "name",
      header: t("inventory.entity.vehicle"),
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
      accessorKey: "plate_number",
      header: t("inventory.vehicles.plate_number"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.plate_number}</span>
      ),
    },
    {
      accessorKey: "vehicle_type",
      header: t("inventory.vehicles.vehicle_type"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.vehicle_type ?? "-"}
        </span>
      ),
    },
    {
      id: "capacity",
      header: t("inventory.vehicles.capacity"),
      cell: ({ row }) => {
        const weight = row.original.max_weight_kg;
        const volume = row.original.max_volume_m3;
        const parts: string[] = [];
        if (weight != null) parts.push(`${weight} kg`);
        if (volume != null) parts.push(`${volume} m³`);
        return (
          <span className="text-sm text-muted-foreground">
            {parts.length > 0 ? parts.join(" / ") : "-"}
          </span>
        );
      },
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

export { getVehiclesColumns };
