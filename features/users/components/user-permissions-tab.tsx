"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { cn } from "@/shared/lib/utils";

import { useUserEffectivePermissionsQuery } from "../queries";
import type { User } from "../types";

type UserPermissionsTabProps = {
  user: User;
  enabled: boolean;
  canAssignRoles: boolean;
  onAssignRolesClick?: () => void;
};

export function UserPermissionsTab({
  user,
  enabled,
  canAssignRoles,
  onAssignRolesClick,
}: UserPermissionsTabProps) {
  const { t } = useAppTranslator();
  const permissionsQuery = useUserEffectivePermissionsQuery(user.id, enabled);

  const grouped = useMemo(() => {
    const data = permissionsQuery.data ?? [];
    return data.reduce<Record<string, string[]>>((groups, permission) => {
      const group = permission.split(".")[0] ?? "general";
      groups[group] ??= [];
      groups[group].push(permission);
      return groups;
    }, {});
  }, [permissionsQuery.data]);

  if (permissionsQuery.isLoading) {
    return <LoadingState description={t("users.loading_permissions")} />;
  }

  if (permissionsQuery.isError) {
    return (
      <ErrorState
        description={getBackendErrorMessage(
          permissionsQuery.error,
          t("users.load_permissions_error"),
        )}
        onRetry={() => permissionsQuery.refetch()}
      />
    );
  }

  if (!permissionsQuery.data?.length) {
    const hasNoRoles =
      user.roles.length === 0 && user.role_ids.length === 0;
    const isPrivileged =
      user.user_type === "owner" || user.is_platform_admin;

    if (isPrivileged) {
      return (
        <EmptyState
          icon={ShieldCheck}
          title={t("users.detail.permissions_empty_privileged_title")}
          description={t("users.detail.permissions_empty_privileged_description", {
            name: user.name,
          })}
        />
      );
    }

    if (hasNoRoles) {
      return (
        <EmptyState
          icon={ShieldCheck}
          title={t("users.detail.permissions_no_roles_title")}
          description={t("users.detail.permissions_no_roles_description", {
            name: user.name,
          })}
          action={
            canAssignRoles && onAssignRolesClick ? (
              <Button onClick={onAssignRolesClick} size="sm">
                <ShieldCheck className="size-4" />
                {t("users.actions.assign_roles")}
              </Button>
            ) : undefined
          }
        />
      );
    }

    return (
      <EmptyState
        icon={ShieldCheck}
        title={t("users.detail.permissions_empty_with_roles_title")}
        description={t("users.detail.permissions_empty_with_roles_description", {
          name: user.name,
        })}
      />
    );
  }

  return (
    <div className="space-y-3">
      {Object.entries(grouped)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([group, permissions]) => (
          <PermissionGroup
            key={group}
            group={group}
            permissions={permissions}
          />
        ))}
    </div>
  );
}

function PermissionGroup({
  group,
  permissions,
}: {
  group: string;
  permissions: string[];
}) {
  const { t } = useAppTranslator();
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-border/70 bg-background p-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {group}
        </h3>
        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
          {t("users.detail.permissions_group_count", {
            count: String(permissions.length),
          })}
        </Badge>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "ml-auto size-4 text-muted-foreground transition-transform",
            !open && "-rotate-90",
          )}
        />
      </button>
      {open ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {permissions.map((permission) => (
            <Badge key={permission} variant="outline">
              {permission}
            </Badge>
          ))}
        </div>
      ) : null}
    </section>
  );
}
