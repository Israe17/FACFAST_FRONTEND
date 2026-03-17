"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, KeyRound, Pencil, ShieldCheck, ToggleLeft, Waypoints } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import type { TableAction } from "@/shared/components/table-row-actions";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { formatDateTime } from "@/shared/lib/utils";

import type { User } from "../types";
import { AssignUserBranchesDialog } from "./assign-user-branches-dialog";
import { AssignUserRolesDialog } from "./assign-user-roles-dialog";
import { ChangeUserPasswordDialog } from "./change-user-password-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { EffectiveUserPermissionsDialog } from "./effective-user-permissions-dialog";
import { UpdateUserStatusDialog } from "./update-user-status-dialog";

type UsersTableProps = {
  data: User[];
};

function StatusBadge({ status }: { status: User["status"] }) {
  const statusClassName =
    status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "suspended"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : status === "deleted"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-zinc-200 bg-zinc-100 text-zinc-700";

  return (
    <Badge className={statusClassName} variant="outline">
      {status}
    </Badge>
  );
}

function UserRowActions({ user }: { user: User }) {
  const { can } = usePermissions();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const actions: TableAction[] = [];
  if (can("users.update")) {
    actions.push({ icon: Pencil, label: "Edit user", onClick: () => setActiveDialog("edit") });
  }
  if (can("users.change_status")) {
    actions.push({ icon: ToggleLeft, label: "Change status", onClick: () => setActiveDialog("status") });
  }
  if (can("users.change_password")) {
    actions.push({ icon: KeyRound, label: "Change password", onClick: () => setActiveDialog("password") });
  }
  if (can("users.assign_roles")) {
    actions.push({ icon: ShieldCheck, label: "Assign roles", onClick: () => setActiveDialog("roles") });
  }
  if (can("users.assign_branches")) {
    actions.push({ icon: Waypoints, label: "Assign branches", onClick: () => setActiveDialog("branches") });
  }
  if (can("users.view")) {
    actions.push({ icon: Eye, label: "Effective permissions", onClick: () => setActiveDialog("permissions") });
  }

  return (
    <>
      <TableRowActions actions={actions} />

      <EditUserDialog
        onOpenChange={(open) => setActiveDialog(open ? "edit" : null)}
        open={activeDialog === "edit"}
        userId={user.id}
      />
      <UpdateUserStatusDialog
        onOpenChange={(open) => setActiveDialog(open ? "status" : null)}
        open={activeDialog === "status"}
        user={user}
      />
      <ChangeUserPasswordDialog
        onOpenChange={(open) => setActiveDialog(open ? "password" : null)}
        open={activeDialog === "password"}
        userId={user.id}
      />
      <AssignUserRolesDialog
        onOpenChange={(open) => setActiveDialog(open ? "roles" : null)}
        open={activeDialog === "roles"}
        user={user}
      />
      <AssignUserBranchesDialog
        onOpenChange={(open) => setActiveDialog(open ? "branches" : null)}
        open={activeDialog === "branches"}
        user={user}
      />
      <EffectiveUserPermissionsDialog
        onOpenChange={(open) => setActiveDialog(open ? "permissions" : null)}
        open={activeDialog === "permissions"}
        userId={user.id}
        userName={user.name}
      />
    </>
  );
}

function UsersTable({ data }: UsersTableProps) {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          {row.original.roles.length ? (
            row.original.roles.map((role) => (
              <Badge key={role.id} variant="outline">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No roles</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "branch_ids",
      header: "Branches",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.branch_ids.length} assigned</span>
      ),
    },
    {
      accessorKey: "max_sale_discount",
      header: "Max discount",
      cell: ({ row }) => <span>{row.original.max_sale_discount}%</span>,
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <UserRowActions user={row.original} />,
    },
  ];

  return <DataTable columns={columns} data={data} emptyMessage="No users found." />;
}

export { UsersTable };
