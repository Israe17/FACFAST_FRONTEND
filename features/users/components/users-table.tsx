"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  KeyRound,
  Pencil,
  ShieldCheck,
  ToggleLeft,
  Trash2,
  Waypoints,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { DataTable } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import type { TableAction } from "@/shared/components/table-row-actions";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useSession } from "@/shared/hooks/use-session";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import type { User } from "../types";
import { useDeleteUserMutation } from "../queries";
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
  const { t } = useAppTranslator();
  const statusClassName =
    status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "suspended"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : status === "deleted"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-zinc-200 bg-zinc-100 text-zinc-700";

  const statusLabel =
    status === "active"
      ? t("common.active_status")
      : status === "inactive"
        ? t("common.inactive_status")
        : status;

  return (
    <Badge className={statusClassName} variant="outline">
      {statusLabel}
    </Badge>
  );
}

function UserRowActions({ ownerCount, user }: { ownerCount: number; user: User }) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const { user: sessionUser } = useSession();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const deleteUserMutation = useDeleteUserMutation(user.id);
  const isLastKnownOwner = user.user_type === "owner" && ownerCount <= 1;

  const actions: TableAction[] = [];
  if (can("users.update")) {
    actions.push({ icon: Pencil, label: t("users.actions.edit"), onClick: () => setActiveDialog("edit") });
  }
  if (can("users.change_status")) {
    actions.push({ icon: ToggleLeft, label: t("users.actions.change_status"), onClick: () => setActiveDialog("status") });
  }
  if (can("users.change_password")) {
    actions.push({ icon: KeyRound, label: t("users.actions.change_password"), onClick: () => setActiveDialog("password") });
  }
  if (can("users.assign_roles")) {
    actions.push({ icon: ShieldCheck, label: t("users.actions.assign_roles"), onClick: () => setActiveDialog("roles") });
  }
  if (can("users.assign_branches")) {
    actions.push({ icon: Waypoints, label: t("users.actions.assign_branches"), onClick: () => setActiveDialog("branches") });
  }
  if (can("users.view")) {
    actions.push({ icon: Eye, label: t("users.actions.view_permissions"), onClick: () => setActiveDialog("permissions") });
  }
  if (
    can("users.delete") &&
    user.id !== sessionUser?.id &&
    !user.is_platform_admin &&
    !isLastKnownOwner
  ) {
    actions.push({
      icon: Trash2,
      label: t("users.actions.delete"),
      onClick: () => setActiveDialog("delete"),
      variant: "destructive",
    });
  }

  async function handleDeleteConfirm() {
    try {
      await deleteUserMutation.mutateAsync();
      setActiveDialog(null);
    } catch {}
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
      <ConfirmDialog
        confirmLabel={t("users.actions.delete")}
        description={t("users.delete_dialog_description", { name: user.name })}
        onConfirm={handleDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null);
          }
        }}
        open={activeDialog === "delete"}
        title={t("users.delete_dialog_title")}
      />
    </>
  );
}

function UsersTable({ data }: UsersTableProps) {
  const { t } = useAppTranslator();
  const ownerCount = data.filter((user) => user.user_type === "owner").length;
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: t("users.table.header_user"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("users.table.header_status"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "roles",
      header: t("users.table.header_roles"),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          {row.original.roles.length ? (
            row.original.roles.map((role) => (
              <Badge key={role.id} variant="outline">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">{t("users.table.no_roles")}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "branch_ids",
      header: t("users.table.header_branches"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {t("users.table.branches_assigned", { count: String(row.original.branch_ids.length) })}
        </span>
      ),
    },
    {
      accessorKey: "max_sale_discount",
      header: t("users.table.header_max_discount"),
      cell: ({ row }) => <span>{row.original.max_sale_discount}%</span>,
    },
    {
      accessorKey: "updated_at",
      header: t("users.table.header_updated"),
      cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
    },
    {
      id: "actions",
      header: t("users.table.header_actions"),
      cell: ({ row }) => <UserRowActions ownerCount={ownerCount} user={row.original} />,
    },
  ];

  return <DataTable columns={columns} data={data} emptyMessage={t("users.table.empty")} />;
}

export { UsersTable };
