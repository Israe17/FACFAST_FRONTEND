"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/shared/components/action-button";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { useSession } from "@/shared/hooks/use-session";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { assignUserBranchesSchema } from "../schemas";
import { useAssignableBranchesQuery, useAssignUserBranchesMutation } from "../queries";
import type { AssignUserBranchesInput, User } from "../types";

type AssignUserBranchesDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: User;
};

function AssignUserBranchesDialog({
  onOpenChange,
  open,
  user,
}: AssignUserBranchesDialogProps) {
  const { activeBranchId, isBusinessLevelContext } = useActiveBranch();
  const { user: sessionUser } = useSession();
  const branchesQuery = useAssignableBranchesQuery(open);
  const assignBranchesMutation = useAssignUserBranchesMutation(user.id, {
    showErrorToast: false,
  });
  const { t } = useAppTranslator();
  const form = useForm<AssignUserBranchesInput>({
    defaultValues: {
      branch_ids: user.branch_ids,
    },
    resolver: buildFormResolver<AssignUserBranchesInput>(assignUserBranchesSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (open) {
      form.reset({
        branch_ids: user.branch_ids,
      });
      resetBackendFormErrors();
    }
  }, [form, open, resetBackendFormErrors, user.branch_ids]);

  const selectedBranchIds =
    useWatch({
      control: form.control,
      name: "branch_ids",
    }) ?? [];
  const allowedBranchIds = sessionUser?.branch_ids ?? [];
  const branches =
    branchesQuery.data?.filter(
      (branch) =>
        !allowedBranchIds.length ||
        allowedBranchIds.includes(branch.id) ||
        user.branch_ids.includes(branch.id),
    ) ?? [];

  function toggleBranch(branchId: string) {
    const nextValues = selectedBranchIds.includes(branchId)
      ? selectedBranchIds.filter((currentBranchId) => currentBranchId !== branchId)
      : [...selectedBranchIds, branchId];

    form.setValue("branch_ids", nextValues, { shouldDirty: true });
  }

  async function handleSubmit(values: AssignUserBranchesInput) {
    resetBackendFormErrors();

    try {
      await assignBranchesMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("users.branches_update_error_fallback"),
      });
    }
  }

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Assign branches</DrawerTitle>
          <DrawerDescription>
            Update the branch access for {user.name}. The current session branch context is kept in
            sync.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Active branch: {isBusinessLevelContext ? "Company level" : (activeBranchId ?? "None")}
          </Badge>
          <Badge variant="outline">Allowed branches: {allowedBranchIds.length || "All"}</Badge>
        </div>

        {branchesQuery.isLoading ? <LoadingState description="Loading branches." /> : null}
        {branchesQuery.isError ? (
          <ErrorState
            description={getTranslatedBackendErrorMessage(branchesQuery.error, {
              fallbackMessage: "Unable to load branches.",
              translateMessage: t,
            }) ?? undefined}
            onRetry={() => branchesQuery.refetch()}
          />
        ) : null}
        {branchesQuery.data?.length === 0 ? (
          <EmptyState
            description="No branches were returned by the backend."
            title="No branches available"
          />
        ) : null}
        {branches.length ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormErrorBanner message={formError} />

            <div className="max-h-80 space-y-3 rounded-xl border border-border p-4">
              {branches.map((branch) => (
                <label
                  key={branch.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/40"
                >
                  <Checkbox
                    checked={selectedBranchIds.includes(branch.id)}
                    onCheckedChange={() => toggleBranch(branch.id)}
                  />
                  <div className="space-y-1">
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {branch.id}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end">
              <ActionButton
                isLoading={assignBranchesMutation.isPending}
                loadingText="Updating"
                type="submit"
              >
                Save branches
              </ActionButton>
            </div>
          </form>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

export { AssignUserBranchesDialog };
