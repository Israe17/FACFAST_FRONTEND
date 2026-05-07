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
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import type { Terminal } from "../types";
import { useDeleteTerminalMutation, useUpdateTerminalMutation } from "../queries";
import { EditTerminalDialog } from "./edit-terminal-dialog";

type TerminalsTableProps = {
  branchId: string;
  data: Terminal[];
};

function TerminalStatusBadge({ isActive }: { isActive: boolean }) {
  const { t } = useAppTranslator();
  return (
    <Badge
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-100 text-zinc-700"
      }
      variant="outline"
    >
      {isActive ? t("common.active_status") : t("common.inactive_status")}
    </Badge>
  );
}

function TerminalRowActions({ branchId, terminal }: { branchId: string; terminal: Terminal }) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const [activeDialog, setActiveDialog] = useState<"deactivate" | "delete" | "edit" | "reactivate" | null>(null);
  const updateTerminalMutation = useUpdateTerminalMutation(branchId, terminal.id);
  const deleteTerminalMutation = useDeleteTerminalMutation(branchId, terminal.id);

  const actions: TableAction[] = [];
  if (can("branches.update_terminal")) {
    actions.push({ icon: Pencil, label: t("branches.terminals.actions.edit"), onClick: () => setActiveDialog("edit") });
    actions.push(
      terminal.is_active
        ? {
            icon: Power,
            label: t("common.deactivate"),
            onClick: () => setActiveDialog("deactivate"),
            variant: "destructive",
          }
        : {
            icon: RotateCcw,
            label: t("common.reactivate"),
            onClick: () => setActiveDialog("reactivate"),
          },
    );
  }
  if (can("branches.delete_terminal")) {
    actions.push({
      icon: Trash2,
      label: t("common.delete_permanently"),
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
          confirmLabel: t("common.delete_permanently"),
          description: t("branches.terminals.delete_description", { name: terminal.name }),
          title: t("branches.terminals.delete_title"),
        }
      : activeDialog === "deactivate"
        ? {
            confirmLabel: t("common.deactivate"),
            description: t("branches.terminals.deactivate_description", { name: terminal.name }),
            title: t("branches.terminals.deactivate_title"),
          }
        : activeDialog === "reactivate"
          ? {
              confirmLabel: t("common.reactivate"),
              description: t("branches.terminals.reactivate_description", { name: terminal.name }),
              title: t("branches.terminals.reactivate_title"),
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
  const { t } = useAppTranslator();
  const columns: ColumnDef<Terminal>[] = [
    {
      accessorKey: "name",
      header: t("branches.terminals.table.header_terminal"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground">
            {row.original.code
              ? t("branches.terminals.table.code_prefix", { code: row.original.code })
              : t("branches.terminals.table.no_code")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: t("common.status"),
      cell: ({ row }) => <TerminalStatusBadge isActive={row.original.is_active} />,
    },
    {
      accessorKey: "updated_at",
      header: t("common.updated"),
      cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
    },
    {
      id: "actions",
      header: t("common.actions"),
      cell: ({ row }) => <TerminalRowActions branchId={branchId} terminal={row.original} />,
    },
  ];

  return <DataTable columns={columns} data={data} emptyMessage={t("branches.terminals.table.empty")} />;
}

export { TerminalsTable };
