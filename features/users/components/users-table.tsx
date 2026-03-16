"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, KeyRound, MoreHorizontal, Pencil, ShieldCheck, ToggleLeft, Waypoints } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/shared/components/data-table";
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
          {can("users.update") ? (
            <DropdownMenuItem onClick={() => setActiveDialog("edit")}>
              <Pencil className="size-4" />
              Edit user
            </DropdownMenuItem>
          ) : null}
          {can("users.change_status") ? (
            <DropdownMenuItem onClick={() => setActiveDialog("status")}>
              <ToggleLeft className="size-4" />
              Change status
            </DropdownMenuItem>
          ) : null}
          {can("users.change_password") ? (
            <DropdownMenuItem onClick={() => setActiveDialog("password")}>
              <KeyRound className="size-4" />
              Change password
            </DropdownMenuItem>
          ) : null}
          {can("users.assign_roles") ? (
            <DropdownMenuItem onClick={() => setActiveDialog("roles")}>
              <ShieldCheck className="size-4" />
              Assign roles
            </DropdownMenuItem>
          ) : null}
          {can("users.assign_branches") ? (
            <DropdownMenuItem onClick={() => setActiveDialog("branches")}>
              <Waypoints className="size-4" />
              Assign branches
            </DropdownMenuItem>
          ) : null}
          {can("users.view") ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveDialog("permissions")}>
                <Eye className="size-4" />
                Effective permissions
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

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
