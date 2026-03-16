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
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

export default function BranchesPage() {
  const [createBranchOpen, setCreateBranchOpen] = useState(false);
  const [createTerminalOpen, setCreateTerminalOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
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
        description="You do not have permission to view branches."
        title="Access denied"
      />
    );
  }

  return (
    <>
      <PageHeader
        actions={
          can("branches.create") ? (
            <Button onClick={() => setCreateBranchOpen(true)}>
              <Plus className="size-4" />
              Create branch
            </Button>
          ) : null
        }
        description="Manage branch metadata and terminal configuration without leaving the admin shell."
        eyebrow="Administration"
        title="Branches"
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          Active context: {isBusinessLevelContext ? "Company level" : (activeBranchId ?? "None")}
        </Badge>
        <Badge variant="outline">Query source: /api/branches</Badge>
        {selectedBranch ? <Badge variant="outline">Selected: {selectedBranch.name}</Badge> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DataCard
          description="Branches returned by the backend for the authenticated tenant."
          icon={<Building2 className="size-5" />}
          title="Visible branches"
          value={totalBranches}
        />
        <DataCard
          description="Terminal count aggregated from the current branch list."
          icon={<Monitor className="size-5" />}
          title="Visible terminals"
          value={totalTerminals}
        />
        <DataCard
          description="The branch context used by the shared shell and switcher."
          icon={<Waypoints className="size-5" />}
          title="Current branch context"
          value={isBusinessLevelContext ? "Company level" : (activeBranchId ?? "None")}
        />
      </div>

      {branchesQuery.isLoading ? <LoadingState description="Loading branches." /> : null}
      {branchesQuery.isError ? (
        <ErrorState
          description={getBackendErrorMessage(
            branchesQuery.error,
            "Unable to load branches.",
          )}
          onRetry={() => branchesQuery.refetch()}
        />
      ) : null}
      {branchesQuery.data?.length === 0 ? (
        <EmptyState
          action={
            can("branches.create") ? (
              <Button onClick={() => setCreateBranchOpen(true)}>
                <Plus className="size-4" />
                Create branch
              </Button>
            ) : null
          }
          description="Create the first branch to start configuring the multisucursal context."
          icon={Building2}
          title="No branches found"
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
                {selectedBranch?.name ?? "Selected branch"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Review and manage the terminals assigned to this branch.
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
                  Use as active context
                </Button>
              ) : null}
              {can("branches.create_terminal") && selectedBranch ? (
                <Button onClick={() => setCreateTerminalOpen(true)}>
                  <Plus className="size-4" />
                  Create terminal
                </Button>
              ) : null}
            </div>
          </div>

          {selectedBranchQuery.isLoading ? (
            <LoadingState description="Loading branch detail and terminals." />
          ) : null}
          {selectedBranchQuery.isError ? (
            <ErrorState
              description={getBackendErrorMessage(
                selectedBranchQuery.error,
                "Unable to load the selected branch.",
              )}
              onRetry={() => selectedBranchQuery.refetch()}
            />
          ) : null}
          {selectedBranch ? (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                <DataCard
                  description="Active or inactive state returned by the backend."
                  icon={<Building2 className="size-5" />}
                  title="Branch status"
                  value={selectedBranch.is_active ? "ACTIVE" : "INACTIVE"}
                />
                <DataCard
                  description="Branch code if available, otherwise the internal id."
                  icon={<Waypoints className="size-5" />}
                  title="Reference"
                  value={selectedBranch.code ?? selectedBranch.id}
                />
                <DataCard
                  description="Terminal count resolved from the branch detail endpoint."
                  icon={<Monitor className="size-5" />}
                  title="Assigned terminals"
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
                        Create terminal
                      </Button>
                    ) : null
                  }
                  description="This branch has no terminals yet."
                  icon={Monitor}
                  title="No terminals found"
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
