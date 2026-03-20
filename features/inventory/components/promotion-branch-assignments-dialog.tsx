"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Pencil, Power, RotateCcw, Trash2 } from "lucide-react";
import { Controller, useForm, type UseFormReturn } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionButton } from "@/shared/components/action-button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { DataTable } from "@/shared/components/data-table";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { buildFormResolver } from "@/shared/lib/form-resolver";
import { formatDateTime } from "@/shared/lib/utils";

import { useBranchesQuery } from "@/features/branches/queries";
import type { Branch } from "@/features/branches/types";

import {
  createPromotionBranchAssignmentSchema,
  updatePromotionBranchAssignmentSchema,
} from "../schemas";
import {
  useCreatePromotionBranchAssignmentMutation,
  useDeletePromotionBranchAssignmentMutation,
  usePromotionBranchAssignmentsQuery,
  useUpdatePromotionBranchAssignmentMutation,
} from "../queries";
import type {
  CreatePromotionBranchAssignmentInput,
  Promotion,
  PromotionBranchAssignment,
  UpdatePromotionBranchAssignmentInput,
} from "../types";
import { FormFieldError } from "./form-field-error";

type PromotionBranchAssignmentsDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  promotion: Promotion;
};

const emptyPromotionBranchAssignmentValues: CreatePromotionBranchAssignmentInput = {
  branch_id: "",
  is_active: true,
  notes: "",
};

function mapAssignmentToForm(
  assignment: PromotionBranchAssignment,
): UpdatePromotionBranchAssignmentInput {
  return {
    is_active: assignment.is_active,
    notes: assignment.notes ?? "",
  };
}

function PromotionBranchAssignmentForm({
  assignmentBranch,
  branches,
  form,
  formError,
  isEditing,
  isPending,
  onSubmit,
  submitLabel,
}: {
  assignmentBranch?: PromotionBranchAssignment["branch"];
  branches: Branch[];
  form: UseFormReturn<CreatePromotionBranchAssignmentInput | UpdatePromotionBranchAssignmentInput>;
  formError?: string | null;
  isEditing: boolean;
  isPending?: boolean;
  onSubmit: (
    values: CreatePromotionBranchAssignmentInput | UpdatePromotionBranchAssignmentInput,
  ) => Promise<void> | void;
  submitLabel: string;
}) {
  const { t } = useAppTranslator();
  const {
    control,
    formState: { errors },
    watch,
  } = form;
  const branchFieldError =
    !isEditing && "branch_id" in errors ? errors.branch_id?.message : undefined;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="space-y-2">
        <Label htmlFor="promotion-branch-assignment-branch">{t("inventory.form.branch")}</Label>
        {isEditing ? (
          <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm">
            <p className="font-medium">{assignmentBranch?.name ?? t("inventory.common.unknown")}</p>
            <p className="text-muted-foreground">
              {assignmentBranch?.code ??
                assignmentBranch?.branch_number ??
                t("inventory.common.not_available")}
            </p>
          </div>
        ) : (
          <>
            <Controller
              control={control}
              name="branch_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="promotion-branch-assignment-branch">
                    <SelectValue placeholder={t("inventory.form.select_branch")} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormFieldError message={branchFieldError} />
          </>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(watch("is_active"))}
          onCheckedChange={(checked) =>
            form.setValue("is_active", checked === true, { shouldDirty: true })
          }
        />
        <div className="space-y-1">
          <p className="font-medium">{t("inventory.common.active")}</p>
          <p className="text-sm text-muted-foreground">
            {t("inventory.promotion_branch_assignments.active_hint")}
          </p>
        </div>
      </label>

      <div className="space-y-2">
        <Label htmlFor="promotion-branch-assignment-notes">{t("inventory.common.notes")}</Label>
        <Input
          id="promotion-branch-assignment-notes"
          {...form.register("notes", {
            setValueAs: (value) => (value === "" ? (isEditing ? null : undefined) : value),
          })}
        />
        <FormFieldError message={errors.notes?.message} />
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

function PromotionBranchAssignmentEditorDialog({
  assignment,
  branches,
  onOpenChange,
  open,
  promotionId,
}: {
  assignment?: PromotionBranchAssignment | null;
  branches: Branch[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  promotionId: string;
}) {
  const { t } = useAppTranslator();
  const isEditing = Boolean(assignment);
  const createMutation = useCreatePromotionBranchAssignmentMutation(promotionId, {
    showErrorToast: false,
  });
  const updateMutation = useUpdatePromotionBranchAssignmentMutation(promotionId, assignment?.id ?? "", {
    showErrorToast: false,
  });
  const mutation = isEditing ? updateMutation : createMutation;
  const form = useForm<CreatePromotionBranchAssignmentInput | UpdatePromotionBranchAssignmentInput>({
    defaultValues: assignment ? mapAssignmentToForm(assignment) : emptyPromotionBranchAssignmentValues,
    resolver: buildFormResolver(
      isEditing ? updatePromotionBranchAssignmentSchema : createPromotionBranchAssignmentSchema,
    ),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } = useBackendFormErrors(form);

  function resetForm() {
    form.reset(assignment ? mapAssignmentToForm(assignment) : emptyPromotionBranchAssignmentValues);
    resetBackendFormErrors();
  }

  async function handleSubmit(
    values: CreatePromotionBranchAssignmentInput | UpdatePromotionBranchAssignmentInput,
  ) {
    resetBackendFormErrors();

    try {
      await mutation.mutateAsync(values as never);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: isEditing
          ? t("inventory.promotion_branch_assignment_update_error_fallback")
          : t("inventory.promotion_branch_assignment_create_error_fallback"),
      });
    }
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
        }
        onOpenChange(nextOpen);
      }}
      open={open}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("inventory.promotion_branch_assignments.edit_title")
              : t("inventory.promotion_branch_assignments.create_title")}
          </DialogTitle>
          <DialogDescription>
            {t("inventory.promotion_branch_assignments.dialog_description")}
          </DialogDescription>
        </DialogHeader>

        <PromotionBranchAssignmentForm
          assignmentBranch={assignment?.branch}
          branches={branches}
          form={form}
          formError={formError}
          isEditing={isEditing}
          isPending={mutation.isPending}
          onSubmit={handleSubmit}
          submitLabel={
            isEditing
              ? t("inventory.common.save_changes")
              : t("inventory.promotion_branch_assignments.create_action")
          }
        />
      </DialogContent>
    </Dialog>
  );
}

function PromotionBranchAssignmentsDialog({
  onOpenChange,
  open,
  promotion,
}: PromotionBranchAssignmentsDialogProps) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const canViewAssignments = can("promotions.view_branch_assignments");
  const canCreateAssignments = can("promotions.create_branch_assignment");
  const canUpdateAssignments = can("promotions.update_branch_assignment");
  const canDeleteAssignments = can("promotions.delete_branch_assignment");
  const canViewBranches = can("branches.view");
  const assignmentsQuery = usePromotionBranchAssignmentsQuery(promotion.id, open && canViewAssignments);
  const branchesQuery = useBranchesQuery(
    open && (canCreateAssignments || canUpdateAssignments) && canViewBranches,
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<PromotionBranchAssignment | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    assignment: PromotionBranchAssignment;
    type: "deactivate" | "delete" | "reactivate";
  } | null>(null);
  const deleteMutation = useDeletePromotionBranchAssignmentMutation(promotion.id, {
    showErrorToast: true,
  });
  const updateMutation = useUpdatePromotionBranchAssignmentMutation(
    promotion.id,
    pendingAction?.assignment.id ?? "",
    { showErrorToast: true },
  );

  const columns = useMemo<ColumnDef<PromotionBranchAssignment>[]>(
    () => [
      {
        accessorKey: "branch",
        header: t("inventory.form.branch"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">{row.original.branch.name}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.branch.code ??
                row.original.branch.branch_number ??
                t("inventory.common.not_available")}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t("inventory.common.status"),
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "outline"}>
            {row.original.is_active ? t("inventory.common.active") : t("inventory.common.inactive")}
          </Badge>
        ),
      },
      {
        accessorKey: "notes",
        header: t("inventory.common.notes"),
        cell: ({ row }) => row.original.notes ?? t("inventory.common.no_notes"),
      },
      {
        accessorKey: "updated_at",
        header: t("inventory.common.updated"),
        cell: ({ row }) => formatDateTime(row.original.updated_at),
      },
      {
        id: "actions",
        header: t("inventory.common.actions"),
        cell: ({ row }) => (
          <TableRowActions
            actions={[
              ...(canUpdateAssignments
                ? [
                    {
                      label: t("inventory.common.edit"),
                      icon: Pencil,
                      onClick: () => {
                        setSelectedAssignment(row.original);
                        setEditorOpen(true);
                      },
                    },
                  ]
                : []),
              ...(canUpdateAssignments && row.original.lifecycle.can_deactivate
                ? [
                    {
                      label: t("inventory.common.deactivate"),
                      icon: Power,
                      onClick: () =>
                        setPendingAction({ assignment: row.original, type: "deactivate" }),
                      variant: "destructive" as const,
                    },
                  ]
                : []),
              ...(canUpdateAssignments && row.original.lifecycle.can_reactivate
                ? [
                    {
                      label: t("inventory.common.reactivate"),
                      icon: RotateCcw,
                      onClick: () =>
                        setPendingAction({ assignment: row.original, type: "reactivate" }),
                    },
                  ]
                : []),
              ...(canDeleteAssignments && row.original.lifecycle.can_delete
                ? [
                    {
                      label: t("inventory.common.delete"),
                      icon: Trash2,
                      onClick: () => setPendingAction({ assignment: row.original, type: "delete" }),
                      variant: "destructive" as const,
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    [canDeleteAssignments, canUpdateAssignments, t],
  );

  async function handleLifecycleConfirm() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === "delete") {
      await deleteMutation.mutateAsync({
        assignmentId: pendingAction.assignment.id,
        branchId: pendingAction.assignment.branch.id,
      });
    } else {
      await updateMutation.mutateAsync({
        is_active: pendingAction.type === "reactivate",
      });
    }

    setPendingAction(null);
  }

  const assignments = assignmentsQuery.data?.assignments ?? [];
  const branches = branchesQuery.data ?? [];

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{t("inventory.promotion_branch_assignments.section_title")}</DialogTitle>
            <DialogDescription>
              {t("inventory.promotion_branch_assignments.section_description", {
                promotion: promotion.name,
              })}
            </DialogDescription>
          </DialogHeader>

          {!canViewAssignments ? (
            <p className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
              {t("inventory.promotion_branch_assignments.permission_hint")}
            </p>
          ) : (
            <QueryStateWrapper
              errorDescription={getBackendErrorMessage(
                assignmentsQuery.error,
                t("inventory.promotion_branch_assignments.load_error"),
              )}
              isError={assignmentsQuery.isError}
              isLoading={assignmentsQuery.isLoading}
              loadingDescription={t("inventory.promotion_branch_assignments.loading")}
              onRetry={() => assignmentsQuery.refetch()}
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {t("inventory.promotion_branch_assignments.count", {
                        count: String(assignments.length),
                      })}
                    </Badge>
                    <Badge variant="outline">
                      {promotion.is_active ? t("inventory.common.active") : t("inventory.common.inactive")}
                    </Badge>
                  </div>

                  {canCreateAssignments && branches.length > 0 ? (
                    <Button
                      onClick={() => {
                        setSelectedAssignment(null);
                        setEditorOpen(true);
                      }}
                    >
                      <Building2 className="size-4" />
                      {t("inventory.promotion_branch_assignments.create_action")}
                    </Button>
                  ) : null}
                </div>

                {canCreateAssignments && !canViewBranches ? (
                  <p className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
                    {t("inventory.promotion_branch_assignments.branch_access_hint")}
                  </p>
                ) : null}

                <DataTable
                  columns={columns}
                  data={assignments}
                  emptyMessage={t("inventory.promotion_branch_assignments.empty")}
                  enablePagination={false}
                />
              </div>
            </QueryStateWrapper>
          )}
        </DialogContent>
      </Dialog>

      <PromotionBranchAssignmentEditorDialog
        assignment={selectedAssignment}
        branches={branches}
        onOpenChange={(nextOpen) => {
          setEditorOpen(nextOpen);
          if (!nextOpen) {
            setSelectedAssignment(null);
          }
        }}
        open={editorOpen}
        promotionId={promotion.id}
      />

      <ConfirmDialog
        confirmLabel={
          pendingAction?.type === "delete"
            ? t("inventory.common.delete")
            : pendingAction?.type === "reactivate"
              ? t("inventory.common.reactivate")
              : t("inventory.common.deactivate")
        }
        description={
          pendingAction?.type === "delete"
            ? t("inventory.promotion_branch_assignments.delete_description", {
                branch: pendingAction.assignment.branch.name ?? "",
              })
            : pendingAction?.type === "reactivate"
              ? t("inventory.promotion_branch_assignments.reactivate_description", {
                  branch: pendingAction.assignment.branch.name ?? "",
                })
              : t("inventory.promotion_branch_assignments.deactivate_description", {
                  branch: pendingAction?.assignment.branch.name ?? "",
                })
        }
        onConfirm={handleLifecycleConfirm}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPendingAction(null);
          }
        }}
        open={pendingAction !== null}
        title={
          pendingAction?.type === "delete"
            ? t("inventory.promotion_branch_assignments.delete_title")
            : pendingAction?.type === "reactivate"
              ? t("inventory.promotion_branch_assignments.reactivate_title")
              : t("inventory.promotion_branch_assignments.deactivate_title")
        }
      />
    </>
  );
}

export { PromotionBranchAssignmentsDialog };
