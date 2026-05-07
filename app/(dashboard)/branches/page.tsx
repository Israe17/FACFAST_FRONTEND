"use client";

import { useState } from "react";
import { Building2, Monitor, Plus, Waypoints } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateBranchDialog } from "@/features/branches/components/create-branch-dialog";
import { CreateTerminalDialog } from "@/features/branches/components/create-terminal-dialog";
import { BranchesTable } from "@/features/branches/components/branches-table";
import { TerminalsTable } from "@/features/branches/components/terminals-table";
import { useBranchQuery, useBranchesQuery } from "@/features/branches/queries";
import { DataCard } from "@/shared/components/data-card";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { PageHeader } from "@/shared/components/page-header";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";

export default function BranchesPage() {
  const [createBranchOpen, setCreateBranchOpen] = useState(false);
  const [createTerminalOpen, setCreateTerminalOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const { t } = useAppTranslator();
  const {
    activeBranchId,
    availableBranchIds,
    canSwitchBranchContext,
    isBusinessLevelContext,
    setActiveBranchId,
  } = useActiveBranch();
  const { can } = usePermissions();
  const { isTenantContextMode, isTenantMode } = usePlatformMode();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const branchesQuery = useBranchesQuery(can("branches.view") && canRunTenantQueries);
  const branchIds = branchesQuery.data?.map((branch) => branch.id) ?? [];
  const resolvedSelectedBranchId =
    selectedBranchId && branchIds.includes(selectedBranchId)
      ? selectedBranchId
      : (activeBranchId && branchIds.includes(activeBranchId) ? activeBranchId : undefined) ??
        branchIds[0] ??
        "";

  const selectedBranchQuery = useBranchQuery(
    resolvedSelectedBranchId,
    canRunTenantQueries && can("branches.view") && Boolean(resolvedSelectedBranchId),
  );
  const selectedBranch =
    selectedBranchQuery.data ??
    branchesQuery.data?.find((branch) => branch.id === resolvedSelectedBranchId) ??
    null;
  const totalBranches = branchesQuery.data?.length ?? 0;
  const totalTerminals =
    branchesQuery.data?.reduce((count, branch) => count + branch.terminals.length, 0) ?? 0;
  const canUseSelectedAsContext = resolvedSelectedBranchId
    ? availableBranchIds.includes(resolvedSelectedBranchId)
    : false;

  if (!can("branches.view")) {
    return (
      <ErrorState
        description={t("branches.page_access_denied")}
        title={t("common.access_denied_title")}
      />
    );
  }

  const activeBranchValue = isBusinessLevelContext
    ? t("common.enterprise_level")
    : (activeBranchId ?? t("common.none"));

  return (
    <>
      <PageHeader
        actions={
          can("branches.create") ? (
            <Button onClick={() => setCreateBranchOpen(true)}>
              <Plus className="size-4" />
              {t("branches.create_button")}
            </Button>
          ) : null
        }
        description={t("branches.page_description")}
        eyebrow={t("branches.page_eyebrow")}
        title={t("branches.page_title")}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          {t("branches.active_context_badge", { value: activeBranchValue })}
        </Badge>
        <Badge variant="outline">Query source: /api/branches</Badge>
        {selectedBranch ? (
          <Badge variant="outline">
            {t("branches.selected_badge", { name: selectedBranch.name })}
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DataCard
          description={t("branches.stats.visible_branches_description")}
          icon={<Building2 className="size-5" />}
          title={t("branches.stats.visible_branches_title")}
          value={totalBranches}
        />
        <DataCard
          description={t("branches.stats.visible_terminals_description")}
          icon={<Monitor className="size-5" />}
          title={t("branches.stats.visible_terminals_title")}
          value={totalTerminals}
        />
        <DataCard
          description={t("branches.stats.context_description")}
          icon={<Waypoints className="size-5" />}
          title={t("branches.stats.context_title")}
          value={activeBranchValue}
        />
      </div>

      {branchesQuery.isLoading ? <LoadingState description={t("branches.loading_branches")} /> : null}
      {branchesQuery.isError ? (
        <ErrorState
          description={getTranslatedBackendErrorMessage(branchesQuery.error, {
            fallbackMessage: t("branches.load_error_fallback"),
            translateMessage: t,
          }) ?? undefined}
          onRetry={() => branchesQuery.refetch()}
        />
      ) : null}
      {branchesQuery.data?.length === 0 ? (
        <EmptyState
          action={
            can("branches.create") ? (
              <Button onClick={() => setCreateBranchOpen(true)}>
                <Plus className="size-4" />
                {t("branches.create_button")}
              </Button>
            ) : null
          }
          description={t("branches.empty_description")}
          icon={Building2}
          title={t("branches.empty_title")}
        />
      ) : null}
      {branchesQuery.data?.length ? (
        <BranchesTable
          data={branchesQuery.data}
          onSelectBranch={setSelectedBranchId}
          selectedBranchId={resolvedSelectedBranchId}
        />
      ) : null}

      {resolvedSelectedBranchId ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                {selectedBranch?.name ?? t("branches.selected_section_fallback")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("branches.selected_section_description")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canSwitchBranchContext &&
              canUseSelectedAsContext &&
              resolvedSelectedBranchId !== activeBranchId ? (
                <Button
                  onClick={() => {
                    setActiveBranchId(resolvedSelectedBranchId);
                  }}
                  variant="outline"
                >
                  {t("branches.use_as_context_button")}
                </Button>
              ) : null}
              {can("branches.create_terminal") && selectedBranch ? (
                <Button onClick={() => setCreateTerminalOpen(true)}>
                  <Plus className="size-4" />
                  {t("branches.create_terminal_button")}
                </Button>
              ) : null}
            </div>
          </div>

          {selectedBranchQuery.isLoading ? (
            <LoadingState description={t("branches.detail.loading")} />
          ) : null}
          {selectedBranchQuery.isError ? (
            <ErrorState
              description={getTranslatedBackendErrorMessage(selectedBranchQuery.error, {
                fallbackMessage: t("branches.selected_load_error_fallback"),
                translateMessage: t,
              }) ?? undefined}
              onRetry={() => selectedBranchQuery.refetch()}
            />
          ) : null}
          {selectedBranch ? (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                <DataCard
                  description={t("branches.detail.status_description")}
                  icon={<Building2 className="size-5" />}
                  title={t("branches.detail.status_title")}
                  value={selectedBranch.is_active ? t("common.active_status") : t("common.inactive_status")}
                />
                <DataCard
                  description={t("branches.detail.reference_description")}
                  icon={<Waypoints className="size-5" />}
                  title={t("branches.detail.reference_title")}
                  value={selectedBranch.code ?? selectedBranch.id}
                />
                <DataCard
                  description={t("branches.detail.assigned_terminals_description")}
                  icon={<Monitor className="size-5" />}
                  title={t("branches.detail.assigned_terminals_title")}
                  value={selectedBranch.terminals.length}
                />
              </div>

              {selectedBranch.terminals.length ? (
                <TerminalsTable branchId={selectedBranch.id} data={selectedBranch.terminals} />
              ) : (
                <EmptyState
                  action={
                    can("branches.create_terminal") ? (
                      <Button onClick={() => setCreateTerminalOpen(true)}>
                        <Plus className="size-4" />
                        {t("branches.create_terminal_button")}
                      </Button>
                    ) : null
                  }
                  description={t("branches.no_terminals_description")}
                  icon={Monitor}
                  title={t("branches.no_terminals_title")}
                />
              )}
            </>
          ) : null}
        </section>
      ) : null}

      <CreateBranchDialog onOpenChange={setCreateBranchOpen} open={createBranchOpen} />
      {selectedBranch ? (
        <CreateTerminalDialog
          branchId={selectedBranch.id}
          branchName={selectedBranch.name}
          onOpenChange={setCreateTerminalOpen}
          open={createTerminalOpen}
        />
      ) : null}
    </>
  );
}
