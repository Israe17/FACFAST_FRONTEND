"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Monitor, MoreHorizontal, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/shared/components/data-table";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { formatDateTime } from "@/shared/lib/utils";

import type { Branch } from "../types";
import { EditBranchDialog } from "./edit-branch-dialog";

type BranchesTableProps = {
  data: Branch[];
  onSelectBranch: (branchId: string) => void;
  selectedBranchId?: string | null;
};

function BranchStatusBadge({ isActive }: { isActive: boolean }) {
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

function BranchRowActions({
  branch,
  onSelectBranch,
}: {
  branch: Branch;
  onSelectBranch: (branchId: string) => void;
}) {
  const { can } = usePermissions();
  const [editOpen, setEditOpen] = useState(false);

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
          <DropdownMenuItem onClick={() => onSelectBranch(branch.id)}>
            <Monitor className="size-4" />
            View terminals
          </DropdownMenuItem>
          {can("branches.update") ? (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Edit branch
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditBranchDialog branch={branch} onOpenChange={setEditOpen} open={editOpen} />
    </>
  );
}

function BranchesTable({ data, onSelectBranch, selectedBranchId }: BranchesTableProps) {
  const { activeBranchId } = useActiveBranch();

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: "name",
      header: "Branch",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{row.original.name}</p>
            {row.original.id === activeBranchId ? <Badge variant="outline">Active context</Badge> : null}
            {row.original.id === selectedBranchId ? (
              <Badge variant="outline">Viewing terminals</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {row.original.code ? `Code: ${row.original.code}` : row.original.address || "No address provided."}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => <BranchStatusBadge isActive={row.original.is_active} />,
    },
    {
      accessorKey: "terminals",
      header: "Terminals",
      cell: ({ row }) => <Badge variant="outline">{row.original.terminals.length}</Badge>,
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{row.original.phone || "No phone"}</p>
          <p>{row.original.email || "No email"}</p>
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <BranchRowActions branch={row.original} onSelectBranch={onSelectBranch} />,
    },
  ];

  return <DataTable columns={columns} data={data} emptyMessage="No branches found." />;
}

export { BranchesTable };
