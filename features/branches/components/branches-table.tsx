"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Monitor, Pencil, Power, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { DataTable } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import type { TableAction } from "@/shared/components/table-row-actions";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { formatDateTime } from "@/shared/lib/utils";

import type { Branch } from "../types";
import { useDeleteBranchMutation, useUpdateBranchMutation } from "../queries";
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
  const [activeDialog, setActiveDialog] = useState<"deactivate" | "delete" | "edit" | "reactivate" | null>(null);
  const updateBranchMutation = useUpdateBranchMutation(branch.id);
  const deleteBranchMutation = useDeleteBranchMutation(branch.id);

  const actions: TableAction[] = [
    { icon: Monitor, label: "View terminals", onClick: () => onSelectBranch(branch.id) },
  ];
  if (can("branches.update")) {
    actions.push({ icon: Pencil, label: "Edit branch", onClick: () => setActiveDialog("edit") });
    actions.push(
      branch.is_active
        ? {
            icon: Power,
            label: "Deactivate",
            onClick: () => setActiveDialog("deactivate"),
            variant: "destructive",
          }
        : {
            icon: RotateCcw,
            label: "Reactivate",
            onClick: () => setActiveDialog("reactivate"),
          },
    );
  }
  if (can("branches.delete")) {
    actions.push({
      icon: Trash2,
      label: "Delete permanently",
      onClick: () => setActiveDialog("delete"),
      variant: "destructive",
    });
  }

  async function handleConfirm() {
    try {
      if (activeDialog === "delete") {
        await deleteBranchMutation.mutateAsync();
      } else if (activeDialog === "deactivate") {
        await updateBranchMutation.mutateAsync({ is_active: false });
      } else if (activeDialog === "reactivate") {
        await updateBranchMutation.mutateAsync({ is_active: true });
      }

      setActiveDialog(null);
    } catch {}
  }

  const dialogCopy =
    activeDialog === "delete"
      ? {
          confirmLabel: "Delete permanently",
          description:
            "This permanently deletes the branch if the backend confirms there are no operational dependencies.",
          title: "Delete branch permanently",
        }
      : activeDialog === "deactivate"
        ? {
            confirmLabel: "Deactivate",
            description: `${branch.name} will stay registered, but it should stop being used for new operations.`,
            title: "Deactivate branch",
          }
        : activeDialog === "reactivate"
          ? {
              confirmLabel: "Reactivate",
              description: `${branch.name} will become available again for branch selection and operational use.`,
              title: "Reactivate branch",
            }
          : null;

  return (
    <>
      <TableRowActions actions={actions} />
      <EditBranchDialog
        branch={branch}
        onOpenChange={(open) => setActiveDialog(open ? "edit" : null)}
        open={activeDialog === "edit"}
      />
      {dialogCopy ? (
        <ConfirmDialog
          confirmLabel={dialogCopy.confirmLabel}
          description={dialogCopy.description}
          onConfirm={handleConfirm}
          onOpenChange={(open) => {
            if (!open) {
              setActiveDialog(null);
            }
          }}
          open={activeDialog === "deactivate" || activeDialog === "delete" || activeDialog === "reactivate"}
          title={dialogCopy.title}
        />
      ) : null}
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
