"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ActionButton } from "@/shared/components/action-button";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import type { Branch } from "@/features/branches/types";

import type { BranchAssignmentsView, SetBranchAssignmentsInput } from "../types";

type BranchAssignmentsDialogProps = {
  assignmentsQuery: {
    data: BranchAssignmentsView | undefined;
    error: unknown;
    isError: boolean;
    isLoading: boolean;
    refetch: () => void;
  };
  branches: Branch[];
  entityLabel: string;
  entityName: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: SetBranchAssignmentsInput) => Promise<void>;
  open: boolean;
};

function BranchAssignmentsDialog({
  assignmentsQuery,
  branches,
  entityLabel,
  entityName,
  isPending,
  onOpenChange,
  onSave,
  open,
}: BranchAssignmentsDialogProps) {
  const { t } = useAppTranslator();

  const [isGlobal, setIsGlobal] = useState(true);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);

  useEffect(() => {
    if (assignmentsQuery.data) {
      setIsGlobal(assignmentsQuery.data.is_global);
      setSelectedBranchIds(assignmentsQuery.data.assigned_branch_ids);
    }
  }, [assignmentsQuery.data]);

  function handleBranchToggle(branchId: number, checked: boolean) {
    setSelectedBranchIds((prev) =>
      checked ? [...prev, branchId] : prev.filter((id) => id !== branchId),
    );
  }

  function handleSelectAll() {
    setSelectedBranchIds(branches.map((b) => Number(b.id)));
  }

  function handleDeselectAll() {
    setSelectedBranchIds([]);
  }

  async function handleSave() {
    await onSave({
      is_global: isGlobal,
      assigned_branch_ids: isGlobal ? [] : selectedBranchIds,
    });
  }

  const activeBranches = branches.filter((b) => b.is_active);

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent >
        <DrawerHeader>
          <DrawerTitle>
            {t("inventory.branch_assignments.dialog_title", { entity: entityLabel })}
          </DrawerTitle>
          <DrawerDescription>
            {t("inventory.branch_assignments.dialog_description", { name: entityName })}
          </DrawerDescription>
        </DrawerHeader>

        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            assignmentsQuery.error,
            t("inventory.branch_assignments.load_error"),
          )}
          isError={assignmentsQuery.isError}
          isLoading={assignmentsQuery.isLoading}
          loadingDescription={t("inventory.branch_assignments.loading")}
          onRetry={() => {
            assignmentsQuery.refetch();
          }}
        >
          <div className="space-y-4">
            <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
              <Checkbox
                checked={isGlobal}
                onCheckedChange={(checked) => setIsGlobal(checked === true)}
              />
              <div className="space-y-1">
                <p className="font-medium">
                  {t("inventory.branch_assignments.is_global")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("inventory.branch_assignments.is_global_hint", { entity: entityLabel })}
                </p>
              </div>
            </label>

            {!isGlobal && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {t("inventory.branch_assignments.select_branches")}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleSelectAll} size="sm" variant="outline">
                      {t("inventory.branch_assignments.select_all")}
                    </Button>
                    <Button onClick={handleDeselectAll} size="sm" variant="outline">
                      {t("inventory.branch_assignments.deselect_all")}
                    </Button>
                  </div>
                </div>

                <div className="max-h-64 space-y-1 rounded-xl border border-border/70 p-2">
                  {activeBranches.length === 0 ? (
                    <p className="p-3 text-center text-sm text-muted-foreground">
                      {t("inventory.branch_assignments.no_branches")}
                    </p>
                  ) : (
                    activeBranches.map((branch) => (
                      <BranchCheckboxItem
                        branch={branch}
                        checked={selectedBranchIds.includes(Number(branch.id))}
                        key={branch.id}
                        onCheckedChange={(checked) =>
                          handleBranchToggle(Number(branch.id), checked)
                        }
                      />
                    ))
                  )}
                </div>

                <Badge variant="outline">
                  {t("inventory.branch_assignments.selected_count", {
                    count: String(selectedBranchIds.length),
                  })}
                </Badge>
              </div>
            )}

            <div className="flex justify-end">
              <ActionButton
                isLoading={isPending}
                loadingText={t("common.saving")}
                onClick={handleSave}
                type="button"
              >
                <Building2 className="size-4" />
                {t("inventory.branch_assignments.save_action")}
              </ActionButton>
            </div>
          </div>
        </QueryStateWrapper>
      </DrawerContent>
    </Drawer>
  );
}

function BranchCheckboxItem({
  branch,
  checked,
  onCheckedChange,
}: {
  branch: Branch;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/30">
      <Checkbox checked={checked} onCheckedChange={(c) => onCheckedChange(c === true)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{branch.name}</p>
        {branch.code ? (
          <p className="text-xs text-muted-foreground">{branch.code}</p>
        ) : null}
      </div>
    </label>
  );
}

export { BranchAssignmentsDialog };
