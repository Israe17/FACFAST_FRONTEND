"use client";

import { useMemo } from "react";
import { Mail, UserCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useUsersQuery } from "@/features/users/queries";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import type { Role } from "../types";

type RoleUsersTabProps = {
  role: Role;
  canViewUsers: boolean;
};

const STATUS_BADGE_VARIANT: Record<string, "default" | "outline" | "destructive"> = {
  active: "default",
  inactive: "outline",
  suspended: "destructive",
  deleted: "destructive",
};

const STATUS_LABEL_KEY = {
  active: "users.status.active",
  inactive: "users.status.inactive",
  suspended: "users.status.suspended",
  deleted: "users.status.deleted",
} as const;

type UserStatus = keyof typeof STATUS_LABEL_KEY;

export function RoleUsersTab({ role, canViewUsers }: RoleUsersTabProps) {
  const { t } = useAppTranslator();
  const usersQuery = useUsersQuery(canViewUsers);

  const usersInRole = useMemo(() => {
    if (!usersQuery.data) {
      return [];
    }
    return usersQuery.data.filter((user) =>
      user.role_ids.some((id) => String(id) === String(role.id)),
    );
  }, [usersQuery.data, role.id]);

  if (!canViewUsers) {
    return (
      <EmptyState
        icon={UserCircle2}
        title={t("roles.users_tab.permission_required_title")}
        description={t("roles.users_tab.permission_required_description")}
      />
    );
  }

  if (usersQuery.isLoading) {
    return <LoadingState description={t("roles.users_tab.loading")} />;
  }

  if (usersQuery.isError) {
    return (
      <ErrorState
        description={getBackendErrorMessage(
          usersQuery.error,
          t("roles.users_tab.load_error_fallback"),
        )}
        onRetry={() => usersQuery.refetch()}
      />
    );
  }

  if (usersInRole.length === 0) {
    return (
      <EmptyState
        icon={UserCircle2}
        title={t("roles.users_tab.empty_title")}
        description={t("roles.users_tab.empty_description")}
      />
    );
  }

  return (
    <ul className="space-y-2">
      {usersInRole.map((user) => {
        const status: UserStatus = (user.status ?? "inactive") as UserStatus;
        const variant = STATUS_BADGE_VARIANT[status] ?? "outline";
        const labelKey = STATUS_LABEL_KEY[status] ?? STATUS_LABEL_KEY.inactive;
        return (
          <li
            key={user.id}
            className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-3"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserCircle2 className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate font-medium">{user.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="size-3" aria-hidden="true" />
                <span className="truncate">{user.email}</span>
              </p>
            </div>
            <Badge variant={variant} className="capitalize">
              {t(labelKey)}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
