"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import {
  APP_ROUTES,
  getSuperadminBusinessDetailRoute,
} from "@/shared/lib/routes";
import { formatDateTime } from "@/shared/lib/utils";

import type { PlatformBusiness } from "../types";

type BusinessesTableProps = {
  data: PlatformBusiness[];
};

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge
      className={
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-100 text-zinc-700"
      }
      variant="outline"
    >
      {active ? "ACTIVE" : "INACTIVE"}
    </Badge>
  );
}

function BusinessesTable({ data }: BusinessesTableProps) {
  const router = useRouter();

  const columns = useMemo<ColumnDef<PlatformBusiness>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Business",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">{row.original.name ?? "Business"}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.legal_name ?? row.original.code ?? "No legal name"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "identification_number",
        header: "Fiscal",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{row.original.identification_type ?? "No type"}</p>
            <p>{row.original.identification_number ?? "No identification"}</p>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{row.original.email ?? "No email"}</p>
            <p>{row.original.phone ?? "No phone"}</p>
          </div>
        ),
      },
      {
        accessorKey: "province",
        header: "Location",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{row.original.country ?? "No country"}</p>
            <p>{row.original.province ?? "No province"}</p>
          </div>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
      {
        accessorKey: "updated_at",
        header: "Updated",
        cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TableRowActions
            actions={[
              {
                label: "View detail",
                icon: ArrowRight,
                onClick: () =>
                  router.push(getSuperadminBusinessDetailRoute(row.original.id ?? "")),
              },
              {
                label: "Enter business",
                icon: Building2,
                onClick: () =>
                  router.push(
                    `${APP_ROUTES.superadminEnterContext}?businessId=${row.original.id ?? ""}`,
                  ),
              },
            ]}
          />
        ),
      },
    ],
    [router],
  );

  return <DataTable columns={columns} data={data} emptyMessage="No businesses found." />;
}

export { BusinessesTable };
