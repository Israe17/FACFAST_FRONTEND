"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/shared/components/data-table";
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

  if (!can("branches.update_terminal")) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="outline">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit terminal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
