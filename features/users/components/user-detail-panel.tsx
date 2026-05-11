"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  KeyRound,
  Mail,
  Pencil,
  Percent,
  ShieldCheck,
  ToggleLeft,
  Trash2,
  Waypoints,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useSession } from "@/shared/hooks/use-session";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { cn } from "@/shared/lib/utils";
import { formatDateTime } from "@/shared/lib/utils";

import { useDeleteUserMutation } from "../queries";
import type { User } from "../types";
import { buildUserInitials, pickUserColor } from "../user-visuals";
import { AssignUserBranchesDialog } from "./assign-user-branches-dialog";
import { AssignUserDirectPermissionsDialog } from "./assign-user-direct-permissions-dialog";
import { AssignUserRolesDialog } from "./assign-user-roles-dialog";
import { ChangeUserPasswordDialog } from "./change-user-password-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { UpdateUserStatusDialog } from "./update-user-status-dialog";
import { UserActivityTab } from "./user-activity-tab";
import { UserBranchesTab } from "./user-branches-tab";
import { UserPermissionsTab } from "./user-permissions-tab";
import { UserRolesTab } from "./user-roles-tab";

type UserDetailPanelProps = {
  user: User;
  ownerCount: number;
};

const STATUS_LABEL_KEY = {
  active: "users.status.active",
  inactive: "users.status.inactive",
  suspended: "users.status.suspended",
  deleted: "users.status.deleted",
} as const;

type UserStatus = keyof typeof STATUS_LABEL_KEY;

export function UserDetailPanel({ user, ownerCount }: UserDetailPanelProps) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const { user: sessionUser } = useSession();
  const [activeTab, setActiveTab] = useState<string>("roles");
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const deleteUserMutation = useDeleteUserMutation(user.id);
  const canViewActivity =
    can("inventory_movements.view") ||
    can("sale_orders.view") ||
    can("dispatch_orders.view");

  useEffect(() => {
    setActiveTab("roles");
  }, [user.id]);

  const seed = user.code ?? user.email ?? String(user.id);
  const color = pickUserColor(seed, user.name);
  const initials = buildUserInitials(user.name);
  const status: UserStatus = (user.status ?? "inactive") as UserStatus;
  const statusLabel = t(STATUS_LABEL_KEY[status] ?? STATUS_LABEL_KEY.inactive);
  const isLastKnownOwner = user.user_type === "owner" && ownerCount <= 1;
  const canDelete =
    can("users.delete") &&
    user.id !== sessionUser?.id &&
    !user.is_platform_admin &&
    !isLastKnownOwner;

  async function handleDeleteConfirm() {
    try {
      await deleteUserMutation.mutateAsync();
      setActiveDialog(null);
    } catch {}
  }

  return (
    <div className="space-y-3">
      <section
        className={cn(
          "relative overflow-hidden rounded-xl bg-gradient-to-br p-3 shadow-sm sm:p-4",
          color.hero,
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="flex size-12 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white backdrop-blur"
            aria-hidden="true"
          >
            {initials}
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold leading-tight sm:text-xl">
                {user.name}
              </h2>
              <Badge className="bg-white/20 px-1.5 py-0 text-[11px] text-white hover:bg-white/30">
                {statusLabel}
              </Badge>
              {user.user_type ? (
                <Badge className="bg-white/15 px-1.5 py-0 text-[11px] text-white hover:bg-white/25">
                  {user.user_type}
                </Badge>
              ) : null}
              {user.is_platform_admin ? (
                <Badge className="bg-white/15 px-1.5 py-0 text-[11px] text-white hover:bg-white/25">
                  {t("users.detail.platform_admin_badge")}
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-white/85">
              <span className="inline-flex items-center gap-1">
                <Mail className="size-3" aria-hidden="true" />
                <span className="truncate">{user.email}</span>
              </span>
              {user.code ? (
                <span className="font-mono text-[11px] text-white/80">
                  {user.code}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="size-3" aria-hidden="true" />
                {t("users.detail.roles_count", {
                  count: String(user.roles.length),
                })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Waypoints className="size-3" aria-hidden="true" />
                {t("users.detail.branches_count", {
                  count: String(user.branch_ids.length),
                })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Percent className="size-3" aria-hidden="true" />
                {user.max_sale_discount}%
              </span>
            </div>
            {user.last_login_at ? (
              <p className="text-[11px] text-white/75">
                {t("users.detail.last_login", {
                  value: formatDateTime(user.last_login_at),
                })}
              </p>
            ) : null}
          </div>

          <UserActionsMenu
            canEdit={can("users.update")}
            canChangeStatus={can("users.change_status")}
            canChangePassword={can("users.change_password")}
            canDelete={canDelete}
            onSelect={(dialog) => setActiveDialog(dialog)}
          />
        </div>
      </section>

      {status !== "active" && can("users.change_status") ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <ToggleLeft className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="flex-1 space-y-2">
            <p className="font-medium">
              {t("users.detail.status_warning_title", { status: statusLabel })}
            </p>
            <p>{t("users.detail.status_warning_description")}</p>
            <Button
              onClick={() => setActiveDialog("status")}
              size="sm"
              variant="outline"
            >
              <ToggleLeft className="size-4" />
              {t("users.actions.change_status")}
            </Button>
          </div>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">
            {t("users.detail.tabs.roles", { count: String(user.roles.length) })}
          </TabsTrigger>
          <TabsTrigger value="branches">
            {t("users.detail.tabs.branches", {
              count: String(user.branch_ids.length),
            })}
          </TabsTrigger>
          <TabsTrigger value="permissions">
            {t("users.detail.tabs.permissions")}
          </TabsTrigger>
          {canViewActivity ? (
            <TabsTrigger value="activity">
              {t("users.detail.tabs.activity")}
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="roles" className="space-y-3">
          <div className="flex items-center justify-end">
            {can("users.assign_roles") && !user.is_platform_admin ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveDialog("roles")}
              >
                <ShieldCheck className="size-4" />
                {t("users.actions.assign_roles")}
              </Button>
            ) : null}
          </div>
          <UserRolesTab
            user={user}
            canAssign={can("users.assign_roles") && !user.is_platform_admin}
            onAssignClick={() => setActiveDialog("roles")}
          />
        </TabsContent>

        <TabsContent value="branches" className="space-y-3">
          <div className="flex items-center justify-end">
            {can("users.assign_branches") && !user.is_platform_admin ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveDialog("branches")}
              >
                <Waypoints className="size-4" />
                {t("users.actions.assign_branches")}
              </Button>
            ) : null}
          </div>
          <UserBranchesTab
            user={user}
            canAssign={can("users.assign_branches") && !user.is_platform_admin}
            onAssignClick={() => setActiveDialog("branches")}
          />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-3">
          <div className="flex items-center justify-end">
            {can("users.assign_permissions") && !user.is_platform_admin ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveDialog("direct_permissions")}
              >
                <ShieldCheck className="size-4" />
                {t("users.actions.assign_direct_permissions")}
              </Button>
            ) : null}
          </div>
          <UserPermissionsTab
            user={user}
            enabled={activeTab === "permissions"}
            canAssignRoles={can("users.assign_roles")}
            onAssignRolesClick={() => setActiveDialog("roles")}
          />
        </TabsContent>

        {canViewActivity ? (
          <TabsContent value="activity" className="space-y-3">
            <UserActivityTab
              user={user}
              enabled={activeTab === "activity"}
              onRequestTab={setActiveTab}
            />
          </TabsContent>
        ) : null}
      </Tabs>

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
      <AssignUserDirectPermissionsDialog
        onOpenChange={(open) =>
          setActiveDialog(open ? "direct_permissions" : null)
        }
        open={activeDialog === "direct_permissions"}
        user={user}
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
    </div>
  );
}

type ActionDialog = "edit" | "status" | "password" | "delete";

function UserActionsMenu({
  canEdit,
  canChangeStatus,
  canChangePassword,
  canDelete,
  onSelect,
}: {
  canEdit: boolean;
  canChangeStatus: boolean;
  canChangePassword: boolean;
  canDelete: boolean;
  onSelect: (dialog: ActionDialog) => void;
}) {
  const { t } = useAppTranslator();
  const hasAny = canEdit || canChangeStatus || canChangePassword || canDelete;
  if (!hasAny) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary">
          {t("users.actions.menu_label")}
          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit ? (
          <DropdownMenuItem onSelect={() => onSelect("edit")}>
            <Pencil className="size-4" aria-hidden="true" />
            {t("users.actions.edit")}
          </DropdownMenuItem>
        ) : null}
        {canChangeStatus ? (
          <DropdownMenuItem onSelect={() => onSelect("status")}>
            <ToggleLeft className="size-4" aria-hidden="true" />
            {t("users.actions.change_status")}
          </DropdownMenuItem>
        ) : null}
        {canChangePassword ? (
          <DropdownMenuItem onSelect={() => onSelect("password")}>
            <KeyRound className="size-4" aria-hidden="true" />
            {t("users.actions.change_password")}
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <>
            {canEdit || canChangeStatus || canChangePassword ? (
              <DropdownMenuSeparator />
            ) : null}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive data-[highlighted]:bg-destructive/10"
              onSelect={() => onSelect("delete")}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t("users.actions.delete")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
