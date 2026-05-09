"use client";

import { useEffect, useState } from "react";
import { Lock, Pencil, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { cn } from "@/shared/lib/utils";

import { buildRoleInitials, pickRoleColor } from "../role-visuals";
import type { Role } from "../types";
import { EditRoleDialog } from "./edit-role-dialog";
import { RolePermissionsMatrix } from "./role-permissions-matrix";
import { RoleUsersTab } from "./role-users-tab";

type RoleDetailPanelProps = {
  role: Role;
  userCount: number;
  canUpdate: boolean;
  canDelete: boolean;
  canViewUsers: boolean;
  onRequestDelete: (role: Role) => void;
};

export function RoleDetailPanel({
  role,
  userCount,
  canUpdate,
  canDelete,
  canViewUsers,
  onRequestDelete,
}: RoleDetailPanelProps) {
  const { t } = useAppTranslator();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("permissions");
  const color = pickRoleColor(role.role_key, role.name);
  const initials = buildRoleInitials(role.name);

  useEffect(() => {
    setActiveTab("permissions");
  }, [role.id]);

  const editable = canUpdate && !role.is_system;
  const deletable = canDelete && !role.is_system;

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
            className="flex size-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white backdrop-blur"
            aria-hidden="true"
          >
            {initials}
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold leading-tight sm:text-xl">
                {role.name}
              </h2>
              {role.is_system ? (
                <Badge className="bg-white/20 px-1.5 py-0 text-[11px] text-white hover:bg-white/30">
                  <Lock className="size-3" aria-hidden="true" />
                  {t("roles.system_badge")}
                </Badge>
              ) : null}
              <span className="font-mono text-[11px] text-white/80">
                {role.role_key}
              </span>
              {role.code ? (
                <span className="font-mono text-[11px] text-white/70">
                  · {role.code}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 text-[11px] text-white/85">
                <Users className="size-3" aria-hidden="true" />
                {t("roles.user_count", { count: String(userCount) })}
              </span>
            </div>
            {role.is_system ? (
              <p className="text-xs text-white/85">
                {t("roles.system_description")}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 gap-2">
            {editable ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditDialogOpen(true)}
              >
                <Pencil className="size-4" />
                {t("roles.actions.edit_metadata")}
              </Button>
            ) : null}
            {deletable ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRequestDelete(role)}
              >
                <Trash2 className="size-4" />
                {t("roles.actions.delete")}
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="permissions">
            {t("roles.tabs.permissions")}
          </TabsTrigger>
          <TabsTrigger value="users">
            {t("roles.tabs.users", { count: String(userCount) })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-3">
          <RolePermissionsMatrix role={role} canEdit={canUpdate} />
        </TabsContent>

        <TabsContent value="users" className="space-y-2">
          <RoleUsersTab role={role} canViewUsers={canViewUsers} />
        </TabsContent>
      </Tabs>

      {editable ? (
        <EditRoleDialog
          onOpenChange={setEditDialogOpen}
          open={editDialogOpen}
          role={role}
        />
      ) : null}
    </div>
  );
}
