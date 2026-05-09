"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Plus, Search, ShieldCheck, UserCircle2, Users, Waypoints } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateUserDialog } from "@/features/users/components/create-user-dialog";
import { UserDetailPanel } from "@/features/users/components/user-detail-panel";
import { UserListCard } from "@/features/users/components/user-list-card";
import { useAssignableBranchesQuery, useUsersQuery } from "@/features/users/queries";
import { useRolesQuery } from "@/features/roles/queries";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { useSession } from "@/shared/hooks/use-session";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";

const ALL_BRANCHES = "all";
const NO_BRANCH = "none";

type StatChipProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
};

function StatChip({ icon: Icon, label, value, hint }: StatChipProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold leading-tight">{value}</p>
        {hint ? (
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const { activeBranchId, isBusinessLevelContext } = useActiveBranch();
  const { isTenantContextMode, isTenantMode } = usePlatformMode();
  const { isPlatformAdmin } = useSession();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const canViewUsers = can("users.view");

  const usersQuery = useUsersQuery(canViewUsers && canRunTenantQueries);
  const branchesQuery = useAssignableBranchesQuery(canViewUsers && canRunTenantQueries);
  // Prefetch roles for row-action dialogs and the detail panel.
  useRolesQuery(can("roles.view") && canRunTenantQueries);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [branchFilter, setBranchFilter] = useState<string>(ALL_BRANCHES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const users = useMemo(() => {
    const raw = usersQuery.data ?? [];
    return isPlatformAdmin
      ? raw
      : raw.filter((user) => !user.is_platform_admin);
  }, [usersQuery.data, isPlatformAdmin]);
  const branches = branchesQuery.data ?? [];
  const ownerCount = useMemo(
    () => users.filter((user) => user.user_type === "owner").length,
    [users],
  );

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      if (branchFilter === NO_BRANCH) {
        if (user.branch_ids.length > 0) return false;
      } else if (branchFilter !== ALL_BRANCHES) {
        if (!user.branch_ids.some((id) => String(id) === branchFilter)) {
          return false;
        }
      }
      if (!term) return true;
      const haystack = `${user.name} ${user.email} ${user.code ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [users, branchFilter, searchTerm]);

  useEffect(() => {
    if (!filteredUsers.length) {
      if (selectedUserId !== null) {
        setSelectedUserId(null);
      }
      return;
    }
    if (
      !selectedUserId ||
      !filteredUsers.some((user) => String(user.id) === selectedUserId)
    ) {
      setSelectedUserId(String(filteredUsers[0].id));
    }
  }, [filteredUsers, selectedUserId]);

  if (!canViewUsers) {
    return (
      <ErrorState
        description={t("users.page_access_denied")}
        title={t("common.access_denied_title")}
      />
    );
  }

  const selectedUser =
    filteredUsers.find((user) => String(user.id) === selectedUserId) ?? null;
  const totalUsers = users.length;
  const activeUserCount = users.filter((user) => user.status === "active").length;
  const totalBranches = branches.length;

  const activeBranchValue = isBusinessLevelContext
    ? t("common.enterprise_level")
    : (activeBranchId ?? t("common.none"));

  const branchFilterLabel =
    branchFilter === ALL_BRANCHES
      ? t("users.branch_filter.all")
      : branchFilter === NO_BRANCH
        ? t("users.branch_filter.none")
        : branches.find((branch) => String(branch.id) === branchFilter)?.name ??
          branchFilter;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("users.page_eyebrow")}
          </p>
          <h1 className="text-xl font-semibold sm:text-2xl">
            {t("users.page_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("users.page_description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <StatChip
              icon={Users}
              label={t("users.kpi.total_title")}
              value={totalUsers}
              hint={t("users.kpi.active_hint", { count: String(activeUserCount) })}
            />
            <StatChip
              icon={Building2}
              label={t("users.kpi.branches_title")}
              value={totalBranches}
            />
            <StatChip
              icon={ShieldCheck}
              label={t("users.kpi.filtered_title")}
              value={filteredUsers.length}
              hint={branchFilterLabel}
            />
          </div>

          {can("users.create") ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" />
              {t("users.create_button")}
            </Button>
          ) : null}
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          {t("users.active_branch_context", { value: activeBranchValue })}
        </Badge>
        <Badge variant="outline">Query source: /api/users</Badge>
      </div>

      {usersQuery.isLoading ? (
        <LoadingState description={t("users.loading_users")} />
      ) : null}
      {usersQuery.isError ? (
        <ErrorState
          description={
            getTranslatedBackendErrorMessage(usersQuery.error, {
              fallbackMessage: t("common.load_failed"),
              translateMessage: t,
            }) ?? undefined
          }
          onRetry={() => usersQuery.refetch()}
        />
      ) : null}
      {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? (
        <EmptyState
          action={
            can("users.create") ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                {t("users.create_button")}
              </Button>
            ) : null
          }
          description={t("users.empty_description")}
          icon={Users}
          title={t("users.empty_title")}
        />
      ) : null}

      {users.length ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <aside className="flex min-w-0 flex-col gap-3 lg:max-h-[calc(100vh-12rem)] lg:overflow-hidden">
            <div className="space-y-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  className="pl-8"
                  placeholder={t("users.search_placeholder")}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("users.branch_filter.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_BRANCHES}>
                    {t("users.branch_filter.all")}
                  </SelectItem>
                  <SelectItem value={NO_BRANCH}>
                    {t("users.branch_filter.none")}
                  </SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {t("users.filter_results", {
                  count: String(filteredUsers.length),
                  total: String(users.length),
                })}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {filteredUsers.length ? (
                <ul className="space-y-1.5">
                  {filteredUsers.map((user) => (
                    <li key={user.id}>
                      <UserListCard
                        user={user}
                        selected={String(user.id) === selectedUserId}
                        onSelect={(next) => setSelectedUserId(String(next.id))}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={UserCircle2}
                  title={t("users.filter_empty_title")}
                  description={t("users.filter_empty_description")}
                />
              )}
            </div>
          </aside>

          <div className="min-w-0">
            {selectedUser ? (
              <UserDetailPanel
                key={selectedUser.id}
                ownerCount={ownerCount}
                user={selectedUser}
              />
            ) : (
              <EmptyState
                icon={UserCircle2}
                title={t("users.select_user_title")}
                description={t("users.select_user_description")}
              />
            )}
          </div>
        </div>
      ) : null}

      <CreateUserDialog onOpenChange={setCreateDialogOpen} open={createDialogOpen} />
    </>
  );
}
