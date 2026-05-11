"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Monitor, Plus, Search, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BranchDetailPanel } from "@/features/branches/components/branch-detail-panel";
import { BranchListCard } from "@/features/branches/components/branch-list-card";
import { CreateBranchDialog } from "@/features/branches/components/create-branch-dialog";
import { useBranchesQuery } from "@/features/branches/queries";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";

const ALL_STATUSES = "all";
const ACTIVE_ONLY = "active";
const INACTIVE_ONLY = "inactive";

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

export default function BranchesPage() {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const { isTenantContextMode, isTenantMode } = usePlatformMode();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const canViewBranches = can("branches.view");

  const branchesQuery = useBranchesQuery(canViewBranches && canRunTenantQueries);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUSES);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const branches = useMemo(() => branchesQuery.data ?? [], [branchesQuery.data]);

  const filteredBranches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return branches.filter((branch) => {
      if (statusFilter === ACTIVE_ONLY && !branch.is_active) return false;
      if (statusFilter === INACTIVE_ONLY && branch.is_active) return false;
      if (!term) return true;
      const haystack = `${branch.name} ${branch.code ?? ""} ${branch.address ?? ""} ${branch.branch_number ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [branches, searchTerm, statusFilter]);

  useEffect(() => {
    if (!filteredBranches.length) {
      if (selectedBranchId !== null) {
        setSelectedBranchId(null);
      }
      return;
    }
    if (
      !selectedBranchId ||
      !filteredBranches.some((branch) => branch.id === selectedBranchId)
    ) {
      setSelectedBranchId(filteredBranches[0].id);
    }
  }, [filteredBranches, selectedBranchId]);

  if (!canViewBranches) {
    return (
      <ErrorState
        description={t("branches.page_access_denied")}
        title={t("common.access_denied_title")}
      />
    );
  }

  const selectedBranch =
    filteredBranches.find((branch) => branch.id === selectedBranchId) ?? null;
  const totalBranches = branches.length;
  const activeBranchCount = branches.filter((branch) => branch.is_active).length;
  const totalTerminals = branches.reduce(
    (count, branch) => count + branch.terminals.length,
    0,
  );

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("branches.page_eyebrow")}
          </p>
          <h1 className="text-xl font-semibold sm:text-2xl">
            {t("branches.page_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("branches.page_description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <StatChip
              icon={Building2}
              label={t("branches.kpi.total_title")}
              value={totalBranches}
              hint={t("branches.kpi.active_hint", {
                count: String(activeBranchCount),
              })}
            />
            <StatChip
              icon={Monitor}
              label={t("branches.kpi.terminals_title")}
              value={totalTerminals}
            />
            <StatChip
              icon={Users}
              label={t("branches.kpi.filtered_title")}
              value={filteredBranches.length}
            />
          </div>

          {can("branches.create") ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              {t("branches.create_button")}
            </Button>
          ) : null}
        </div>
      </header>

      {branchesQuery.isLoading ? (
        <LoadingState description={t("branches.loading_branches")} />
      ) : null}
      {branchesQuery.isError ? (
        <ErrorState
          description={
            getTranslatedBackendErrorMessage(branchesQuery.error, {
              fallbackMessage: t("branches.load_error_fallback"),
              translateMessage: t,
            }) ?? undefined
          }
          onRetry={() => branchesQuery.refetch()}
        />
      ) : null}
      {!branchesQuery.isLoading && !branchesQuery.isError && branches.length === 0 ? (
        <EmptyState
          action={
            can("branches.create") ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" aria-hidden="true" />
                {t("branches.create_button")}
              </Button>
            ) : null
          }
          description={t("branches.empty_description")}
          icon={Building2}
          title={t("branches.empty_title")}
        />
      ) : null}

      {branches.length ? (
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
                  placeholder={t("branches.search_placeholder")}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUSES}>
                    {t("branches.status_filter.all")}
                  </SelectItem>
                  <SelectItem value={ACTIVE_ONLY}>
                    {t("branches.status_filter.active")}
                  </SelectItem>
                  <SelectItem value={INACTIVE_ONLY}>
                    {t("branches.status_filter.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {t("branches.filter_results", {
                  count: String(filteredBranches.length),
                  total: String(branches.length),
                })}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {filteredBranches.length ? (
                <ul className="space-y-1.5">
                  {filteredBranches.map((branch) => (
                    <li key={branch.id}>
                      <BranchListCard
                        branch={branch}
                        selected={branch.id === selectedBranchId}
                        onSelect={(next) => setSelectedBranchId(next.id)}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={Building2}
                  title={t("branches.filter_empty_title")}
                  description={t("branches.filter_empty_description")}
                />
              )}
            </div>
          </aside>

          <div className="min-w-0">
            {selectedBranch ? (
              <BranchDetailPanel key={selectedBranch.id} branch={selectedBranch} />
            ) : (
              <EmptyState
                icon={Building2}
                title={t("branches.select_branch_title")}
                description={t("branches.select_branch_description")}
              />
            )}
          </div>
        </div>
      ) : null}

      <CreateBranchDialog
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
      />
    </>
  );
}
