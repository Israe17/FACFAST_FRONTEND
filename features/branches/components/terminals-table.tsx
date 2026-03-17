"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import type { TableAction } from "@/shared/components/table-row-actions";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { formatDateTime } from "@/shared/lib/utils";

import type { Terminal } from "../types";
import { EditTerminalDialog } from "./edit-terminal-dialog";

type TerminalsTableProps = {
  branchId: string;
  data: Terminal[];
};

function TerminalStatusBadge({ isActive }: { isActive: boolean }) {
  const label = isActive ? "ACTIVE" : "INACTIVE";

  return (
    <Badge
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-100 text-zinc-700"
      }
      variant="outline"
    >
      {label}
    </Badge>
  );
}

function TerminalRowActions({ branchId, terminal }: { branchId: string; terminal: Terminal }) {
  const { can } = usePermissions();
  const [editOpen, setEditOpen] = useState(false);

  const actions: TableAction[] = [];
  if (can("branches.update_terminal")) {
    actions.push({ icon: Pencil, label: "Edit terminal", onClick: () => setEditOpen(true) });
  }

  return (
    <>
      <TableRowActions actions={actions} />
      <EditTerminalDialog
        branchId={branchId}
        onOpenChange={setEditOpen}
        open={editOpen}
        terminal={terminal}
      />
    </>
  );
}

function TerminalsTable({ branchId, data }: TerminalsTableProps) {
  const columns: ColumnDef<Terminal>[] = [
    {
      accessorKey: "name",
      header: "Terminal",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground">
            {row.original.code ? `Code: ${row.original.code}` : "No code provided."}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => <TerminalStatusBadge isActive={row.original.is_active} />,
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <TerminalRowActions branchId={branchId} terminal={row.original} />,
    },
  ];

  return <DataTable columns={columns} data={data} emptyMessage="No terminals found for this branch." />;
}

export { TerminalsTable };
