"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, ShieldCheck, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { DataTable } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import type { TableAction } from "@/shared/components/table-row-actions";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import { useDeleteRoleMutation } from "../queries";
import type { Role } from "../types";
import { AssignRolePermissionsDialog } from "./assign-role-permissions-dialog";
import { EditRoleDialog } from "./edit-role-dialog";

type RolesTableProps = {
  data: Role[];
};

function RoleRowActions({ role }: { role: Role }) {
  const { t } = useAppTranslator();
  const { can, canAll } = usePermissions();
  const deleteRoleMutation = useDeleteRoleMutation();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  async function handleDelete() {
    try {
      await deleteRoleMutation.mutateAsync(role.id);
      setActiveDialog(null);
    } catch {}
  }

  const actions: TableAction[] = [];
  if (can("roles.update")) {
    actions.push({ icon: Pencil, label: t("roles.actions.edit"), onClick: () => setActiveDialog("edit") });
  }
  if (canAll(["roles.assign_permissions", "permissions.view"])) {
    actions.push({ icon: ShieldCheck, label: t("roles.actions.assign_permissions"), onClick: () => setActiveDialog("permissions") });
  }
  if (can("roles.delete")) {
    actions.push({ icon: Trash2, label: t("roles.actions.delete"), onClick: () => setActiveDialog("delete"), variant: "destructive" });
  }

  return (
    <>
      <TableRowActions actions={actions} />

      <EditRoleDialog
        onOpenChange={(open) => setActiveDialog(open ? "edit" : null)}
        open={activeDialog === "edit"}
        role={role}
      />
      <AssignRolePermissionsDialog
        onOpenChange={(open) => setActiveDialog(open ? "permissions" : null)}
        open={activeDialog === "permissions"}
        role={role}
      />
      <ConfirmDialog
        confirmLabel={t("roles.delete_confirm")}
        description={t("roles.delete_description", { name: role.name })}
        onConfirm={handleDelete}
        onOpenChange={(open) => setActiveDialog(open ? "delete" : null)}
        open={activeDialog === "delete"}
        title={t("roles.delete_title")}
      />
    </>
  );
}

function RolesTable({ data }: RolesTableProps) {
  const { t } = useAppTranslator();
  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: t("roles.table.header_role"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{row.original.name}</p>
            {row.original.is_system ? <Badge variant="outline">{t("roles.table.system_badge")}</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {row.original.code
              ? t("roles.table.code_prefix", { code: row.original.code })
              : t("roles.table.key_prefix", { key: row.original.role_key })}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "role_key",
      header: t("roles.table.header_role_key"),
      cell: ({ row }) => <Badge variant="outline">{row.original.role_key}</Badge>,
    },
    {
      accessorKey: "permissions",
      header: t("roles.table.header_permissions"),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          {row.original.permissions.slice(0, 3).map((permission) => (
            <Badge key={`${row.original.id}-${permission.id}`} variant="outline">
              {permission.key}
            </Badge>
          ))}
          {row.original.permissions.length > 3 ? (
            <Badge variant="outline">+{row.original.permissions.length - 3}</Badge>
          ) : null}
          {row.original.permissions.length === 0 ? (
            <span className="text-sm text-muted-foreground">{t("roles.table.no_permissions")}</span>
          ) : null}
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
      cell: ({ row }) => <RoleRowActions role={row.original} />,
    },
  ];

  return <DataTable columns={columns} data={data} emptyMessage={t("roles.table.empty")} />;
}

export { RolesTable };
