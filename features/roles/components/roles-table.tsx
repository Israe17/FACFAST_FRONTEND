"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, ShieldCheck, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { DataTable } from "@/shared/components/data-table";
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
          {can("roles.update") ? (
            <DropdownMenuItem onClick={() => setActiveDialog("edit")}>
              <Pencil className="size-4" />
              Edit role
            </DropdownMenuItem>
          ) : null}
          {canAll(["roles.assign_permissions", "permissions.view"]) ? (
            <DropdownMenuItem onClick={() => setActiveDialog("permissions")}>
              <ShieldCheck className="size-4" />
              Assign permissions
            </DropdownMenuItem>
          ) : null}
          {can("roles.delete") ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
                onClick={() => setActiveDialog("delete")}
              >
                <Trash2 className="size-4" />
                Delete role
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

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
