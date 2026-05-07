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
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
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

function BranchRowActions({
  branch,
  onSelectBranch,
}: {
  branch: Branch;
  onSelectBranch: (branchId: string) => void;
}) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const [activeDialog, setActiveDialog] = useState<"deactivate" | "delete" | "edit" | "reactivate" | null>(null);
  const updateBranchMutation = useUpdateBranchMutation(branch.id);
  const deleteBranchMutation = useDeleteBranchMutation(branch.id);

  const actions: TableAction[] = [
    { icon: Monitor, label: t("branches.actions.view_terminals"), onClick: () => onSelectBranch(branch.id) },
  ];
  if (can("branches.update")) {
    actions.push({ icon: Pencil, label: t("branches.actions.edit"), onClick: () => setActiveDialog("edit") });
    actions.push(
      branch.is_active
        ? {
            icon: Power,
            label: t("branches.actions.deactivate"),
            onClick: () => setActiveDialog("deactivate"),
            variant: "destructive",
          }
        : {
            icon: RotateCcw,
            label: t("branches.actions.reactivate"),
            onClick: () => setActiveDialog("reactivate"),
          },
    );
  }
  if (can("branches.delete")) {
    actions.push({
      icon: Trash2,
      label: t("branches.actions.delete"),
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
          confirmLabel: t("branches.actions.delete"),
          description: t("branches.delete_dialog_description"),
          title: t("branches.delete_dialog_title"),
        }
      : activeDialog === "deactivate"
        ? {
            confirmLabel: t("branches.actions.deactivate"),
            description: t("branches.deactivate_dialog_description", { name: branch.name }),
            title: t("branches.deactivate_dialog_title"),
          }
        : activeDialog === "reactivate"
          ? {
              confirmLabel: t("branches.actions.reactivate"),
              description: t("branches.reactivate_dialog_description", { name: branch.name }),
              title: t("branches.reactivate_dialog_title"),
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
  const { t } = useAppTranslator();
  const { activeBranchId } = useActiveBranch();

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: "name",
      header: t("branches.table.header_branch"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{row.original.name}</p>
            {row.original.id === activeBranchId ? (
              <Badge variant="outline">{t("branches.table.active_context_badge")}</Badge>
            ) : null}
            {row.original.id === selectedBranchId ? (
              <Badge variant="outline">{t("branches.table.viewing_terminals_badge")}</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {row.original.code
              ? t("branches.table.code_prefix", { code: row.original.code })
              : row.original.address || t("branches.table.no_address")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: t("common.status"),
      cell: ({ row }) => <BranchStatusBadge isActive={row.original.is_active} />,
    },
    {
      accessorKey: "terminals",
      header: t("branches.table.header_terminals"),
      cell: ({ row }) => <Badge variant="outline">{row.original.terminals.length}</Badge>,
    },
    {
      accessorKey: "phone",
      header: t("branches.table.header_contact"),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{row.original.phone || t("common.no_phone")}</p>
          <p>{row.original.email || t("common.no_email")}</p>
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: t("common.updated"),
      cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
    },
    {
      id: "actions",
      header: t("common.actions"),
      cell: ({ row }) => <BranchRowActions branch={row.original} onSelectBranch={onSelectBranch} />,
    },
  ];

  return <DataTable columns={columns} data={data} emptyMessage={t("branches.table.empty")} />;
}

export { BranchesTable };
