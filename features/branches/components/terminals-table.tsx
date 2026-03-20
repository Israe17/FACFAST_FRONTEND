"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Power, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { DataTable } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import type { TableAction } from "@/shared/components/table-row-actions";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { formatDateTime } from "@/shared/lib/utils";

import type { Terminal } from "../types";
import { useDeleteTerminalMutation, useUpdateTerminalMutation } from "../queries";
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
  const [activeDialog, setActiveDialog] = useState<"deactivate" | "delete" | "edit" | "reactivate" | null>(null);
  const updateTerminalMutation = useUpdateTerminalMutation(branchId, terminal.id);
  const deleteTerminalMutation = useDeleteTerminalMutation(branchId, terminal.id);

  const actions: TableAction[] = [];
  if (can("branches.update_terminal")) {
    actions.push({ icon: Pencil, label: "Edit terminal", onClick: () => setActiveDialog("edit") });
    actions.push(
      terminal.is_active
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
  if (can("branches.delete_terminal")) {
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
        await deleteTerminalMutation.mutateAsync();
      } else if (activeDialog === "deactivate") {
        await updateTerminalMutation.mutateAsync({ is_active: false });
      } else if (activeDialog === "reactivate") {
        await updateTerminalMutation.mutateAsync({ is_active: true });
      }

      setActiveDialog(null);
    } catch {}
  }

  const dialogCopy =
    activeDialog === "delete"
      ? {
          confirmLabel: "Delete permanently",
          description: `This permanently deletes terminal ${terminal.name}. This action cannot be undone.`,
          title: "Delete terminal permanently",
        }
      : activeDialog === "deactivate"
        ? {
            confirmLabel: "Deactivate",
            description: `${terminal.name} will remain registered, but it should stop being used operationally.`,
            title: "Deactivate terminal",
          }
        : activeDialog === "reactivate"
          ? {
              confirmLabel: "Reactivate",
              description: `${terminal.name} will become available again for operational use.`,
              title: "Reactivate terminal",
            }
          : null;

  return (
    <>
      <TableRowActions actions={actions} />
      <EditTerminalDialog
        branchId={branchId}
        onOpenChange={(open) => setActiveDialog(open ? "edit" : null)}
        open={activeDialog === "edit"}
        terminal={terminal}
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
