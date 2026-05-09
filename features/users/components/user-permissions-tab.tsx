"use client";

import { useMemo } from "react";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import { useUserEffectivePermissionsQuery } from "../queries";

type UserPermissionsTabProps = {
  userId: string;
  enabled: boolean;
};

export function UserPermissionsTab({ userId, enabled }: UserPermissionsTabProps) {
  const { t } = useAppTranslator();
  const permissionsQuery = useUserEffectivePermissionsQuery(userId, enabled);

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
    return (
      <EmptyState
        icon={ShieldCheck}
        title={t("users.no_permissions_title")}
        description={t("users.no_permissions_description")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {Object.entries(grouped)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([group, permissions]) => (
          <section
            key={group}
            className="space-y-2 rounded-2xl border border-border/70 bg-background p-3"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {permissions.map((permission) => (
                <Badge key={permission} variant="outline">
                  {permission}
                </Badge>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
