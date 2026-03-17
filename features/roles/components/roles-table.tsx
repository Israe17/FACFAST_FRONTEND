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
import { formatDateTime } from "@/shared/lib/utils";

import { useDeleteRoleMutation } from "../queries";
import type { Role } from "../types";
import { AssignRolePermissionsDialog } from "./assign-role-permissions-dialog";
import { EditRoleDialog } from "./edit-role-dialog";

type RolesTableProps = {
  data: Role[];
};

function RoleRowActions({ role }: { role: Role }) {
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
    actions.push({ icon: Pencil, label: "Edit role", onClick: () => setActiveDialog("edit") });
  }
  if (canAll(["roles.assign_permissions", "permissions.view"])) {
    actions.push({ icon: ShieldCheck, label: "Assign permissions", onClick: () => setActiveDialog("permissions") });
  }
  if (can("roles.delete")) {
    actions.push({ icon: Trash2, label: "Delete role", onClick: () => setActiveDialog("delete"), variant: "destructive" });
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
        confirmLabel="Delete role"
        description={`This will remove the role ${role.name}.`}
        onConfirm={handleDelete}
        onOpenChange={(open) => setActiveDialog(open ? "delete" : null)}
        open={activeDialog === "delete"}
        title="Delete role"
      />
    </>
  );
}

function RolesTable({ data }: RolesTableProps) {
  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Role",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{row.original.name}</p>
            {row.original.is_system ? <Badge variant="outline">System</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {row.original.code ? `Code: ${row.original.code}` : `Key: ${row.original.role_key}`}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "role_key",
      header: "Role key",
      cell: ({ row }) => <Badge variant="outline">{row.original.role_key}</Badge>,
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
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
            <span className="text-sm text-muted-foreground">No permissions</span>
          ) : null}
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
      cell: ({ row }) => <RoleRowActions role={row.original} />,
    },
  ];

  return <DataTable columns={columns} data={data} emptyMessage="No roles found." />;
}

export { RolesTable };
