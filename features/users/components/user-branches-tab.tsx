"use client";

import { useMemo } from "react";
import { Building2, Waypoints } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import { useAssignableBranchesQuery } from "../queries";
import type { BranchOption, User } from "../types";

type UserBranchesTabProps = {
  user: User;
  canAssign: boolean;
  onAssignClick?: () => void;
};

export function UserBranchesTab({ user, canAssign, onAssignClick }: UserBranchesTabProps) {
  const { t } = useAppTranslator();
  const branchesQuery = useAssignableBranchesQuery(true);

  const assignedBranches = useMemo<BranchOption[]>(() => {
    const assignedIds = new Set<string>(user.branch_ids.map(String));
    const catalog = branchesQuery.data ?? [];
    const fromCatalog = catalog.filter((branch) =>
      assignedIds.has(String(branch.id)),
    );

    if (fromCatalog.length) {
      return fromCatalog;
    }

    return user.branches.map((branch) => ({
      id: branch.id,
      name: branch.name,
      branch_number: branch.branch_number,
      business_name: branch.business_name,
      code: branch.code,
    }));
  }, [branchesQuery.data, user.branch_ids, user.branches]);

  const isPrivilegedNoBranch =
    user.user_type === "owner" || user.is_platform_admin;

  if (!assignedBranches.length) {
    return (
      <EmptyState
        icon={Waypoints}
        title={t("users.detail.branches_empty_title")}
        description={
          isPrivilegedNoBranch
            ? t("users.detail.branches_empty_privileged", { name: user.name })
            : t("users.detail.branches_empty_guidance", { name: user.name })
        }
        action={
          !isPrivilegedNoBranch && canAssign && onAssignClick ? (
            <Button onClick={onAssignClick} size="sm">
              <Waypoints className="size-4" />
              {t("users.actions.assign_branches")}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <ul className="space-y-2">
      {assignedBranches.map((branch) => (
        <li
          key={branch.id}
          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-3"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Building2 className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate font-medium">{branch.name}</p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              {branch.code ? (
                <span className="font-mono">{branch.code}</span>
              ) : null}
              {branch.branch_number ? (
                <span>#{branch.branch_number}</span>
              ) : null}
              {branch.business_name ? (
                <span className="truncate">{branch.business_name}</span>
              ) : null}
            </div>
          </div>
          <Badge variant="outline" className="font-mono">
            {branch.id}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
