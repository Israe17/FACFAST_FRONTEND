"use client";

import { useMemo } from "react";
import { Lock, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import { useRolesQuery } from "@/features/roles/queries";
import { buildRoleInitials, pickRoleColor } from "@/features/roles/role-visuals";

import type { User } from "../types";

type UserRolesTabProps = {
  user: User;
  canAssign: boolean;
  onAssignClick?: () => void;
};

type AssignedRoleEntry = {
  id: string;
  name: string;
  role_key: string;
  is_system: boolean;
};

export function UserRolesTab({ user, canAssign, onAssignClick }: UserRolesTabProps) {
  const { t } = useAppTranslator();
  const rolesQuery = useRolesQuery(true);

  const assignedRoles = useMemo<AssignedRoleEntry[]>(() => {
    const assignedIds = new Set<string>([
      ...user.role_ids.map(String),
      ...user.roles.map((role) => String(role.id)),
    ]);

    const catalog = rolesQuery.data ?? [];
    const matches = catalog
      .filter((role) => assignedIds.has(String(role.id)))
      .map((role) => ({
        id: String(role.id),
        name: role.name,
        role_key: role.role_key,
        is_system: Boolean(role.is_system),
      }));

    if (matches.length) {
      return matches;
    }

    return user.roles.map((role) => ({
      id: String(role.id),
      name: role.name,
      role_key: role.role_key ?? "",
      is_system: Boolean(role.is_system),
    }));
  }, [rolesQuery.data, user.role_ids, user.roles]);

  if (user.is_platform_admin) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title={t("users.detail.roles_platform_admin_title")}
        description={t("users.detail.roles_platform_admin_description", {
          name: user.name,
        })}
      />
    );
  }

  if (!assignedRoles.length) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title={t("users.detail.roles_empty_title")}
        description={t("users.detail.roles_empty_guidance", { name: user.name })}
        action={
          canAssign && onAssignClick ? (
            <Button onClick={onAssignClick} size="sm">
              <ShieldCheck className="size-4" />
              {t("users.actions.assign_roles")}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <ul className="space-y-2">
      {assignedRoles.map((role) => {
        const color = pickRoleColor(role.role_key, role.name);
        const initials = buildRoleInitials(role.name);
        return (
          <li
            key={role.id}
            className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-3"
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${color.bubble}`}
              aria-hidden="true"
            >
              {initials}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{role.name}</p>
                {role.is_system ? (
                  <Lock className="size-3 text-muted-foreground" aria-hidden="true" />
                ) : null}
              </div>
              {role.role_key ? (
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {role.role_key}
                </p>
              ) : null}
            </div>
            {role.is_system ? (
              <Badge variant="outline" className="capitalize">
                {t("roles.system_badge")}
              </Badge>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
