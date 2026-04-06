"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Pencil, Power, RotateCcw, Trash2 } from "lucide-react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { FormFieldError } from "@/features/inventory/components/form-field-error";
import { TableRowActions } from "@/shared/components/table-row-actions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { buildFormResolver } from "@/shared/lib/form-resolver";
import { formatDateTime } from "@/shared/lib/utils";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import { useBranchesQuery } from "@/features/branches/queries";
import type { Branch } from "@/features/branches/types";
import { usePriceListsQuery } from "@/features/inventory/queries";
import type { PriceList } from "@/features/inventory/types";
import { useUsersQuery } from "@/features/users/queries";
import type { User } from "@/features/users/types";

import {
  createContactBranchAssignmentSchema,
  updateContactBranchAssignmentSchema,
} from "../schemas";
import {
  useContactBranchContextQuery,
  useCreateContactBranchAssignmentMutation,
  useDeleteContactBranchAssignmentMutation,
  useUpdateContactBranchAssignmentMutation,
} from "../queries";
import type {
  Contact,
  ContactBranchAssignment,
  CreateContactBranchAssignmentInput,
  UpdateContactBranchAssignmentInput,
} from "../types";

const NONE_OPTION = "__none__";

type ContactBranchAssignmentsDialogProps = {
  contact: Contact;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function ContactBranchAssignmentForm({
  assignmentBranch,
  branches,
  form,
  formError,
  isEditing,
  isPending,
  onSubmit,
  priceLists,
  submitLabel,
  users,
}: {
  assignmentBranch?: ContactBranchAssignment["branch"];
  branches: Branch[];
  form: UseFormReturn<CreateContactBranchAssignmentInput | UpdateContactBranchAssignmentInput>;
  formError?: string | null;
  isEditing: boolean;
  isPending?: boolean;
  onSubmit: (
    values: CreateContactBranchAssignmentInput | UpdateContactBranchAssignmentInput,
  ) => Promise<void> | void;
  priceLists: PriceList[];
  submitLabel: string;
  users: User[];
}) {
  const { t } = useAppTranslator();
  const {
    control,
    formState: { errors },
    watch,
  } = form;
  const creditEnabled = watch("credit_enabled");
  const selectedPriceListId = watch("custom_price_list_id");
  const selectedAccountManagerId = watch("account_manager_user_id");
  const branchFieldError =
    !isEditing && "branch_id" in errors ? errors.branch_id?.message : undefined;
  const availablePriceLists = priceLists.filter(
    (priceList) => priceList.is_active || priceList.id === selectedPriceListId,
  );
  const availableUsers = users.filter(
    (user) => user.status !== "deleted" || user.id === selectedAccountManagerId,
  );

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-branch-assignment-branch">{t("contacts.branch_assignments.branch")}</Label>
          {isEditing ? (
            <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm">
              <p className="font-medium">{assignmentBranch?.name ?? t("contacts.branch_assignments.unknown_branch")}</p>
              <p className="text-muted-foreground">
                {assignmentBranch?.code ?? assignmentBranch?.branch_number ?? t("contacts.branch_assignments.no_code")}
              </p>
            </div>
          ) : (
            <>
              <Controller
                control={control}
                name="branch_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="contact-branch-assignment-branch">
                      <SelectValue placeholder={t("contacts.branch_assignments.select_branch")} />
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

        <div className="space-y-2">
          <Label htmlFor="contact-branch-assignment-credit-limit">{t("contacts.branch_assignments.custom_credit_limit")}</Label>
          <Input
            disabled={!creditEnabled}
            id="contact-branch-assignment-credit-limit"
            min={0}
            step="0.01"
            type="number"
            {...form.register("custom_credit_limit", {
              setValueAs: (value) =>
                value === "" ? (isEditing ? null : undefined) : Number(value),
            })}
          />
          <FormFieldError message={errors.custom_credit_limit?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-branch-assignment-price-list">{t("contacts.branch_assignments.custom_price_list")}</Label>
          <Controller
            control={control}
            name="custom_price_list_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  field.onChange(value === NONE_OPTION ? (isEditing ? null : undefined) : value)
                }
                value={field.value ?? NONE_OPTION}
              >
                <SelectTrigger id="contact-branch-assignment-price-list">
                  <SelectValue placeholder={t("contacts.branch_assignments.no_custom_price_list")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>{t("contacts.branch_assignments.no_custom_price_list")}</SelectItem>
                  {availablePriceLists.map((priceList) => (
                    <SelectItem key={priceList.id} value={priceList.id}>
                      {priceList.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.custom_price_list_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-branch-assignment-account-manager">{t("contacts.branch_assignments.account_manager")}</Label>
          <Controller
            control={control}
            name="account_manager_user_id"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  field.onChange(value === NONE_OPTION ? (isEditing ? null : undefined) : value)
                }
                value={field.value ?? NONE_OPTION}
              >
                <SelectTrigger id="contact-branch-assignment-account-manager">
                  <SelectValue placeholder={t("contacts.branch_assignments.no_account_manager")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>{t("contacts.branch_assignments.no_account_manager")}</SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.account_manager_user_id?.message} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(watch("is_active"))}
            onCheckedChange={(checked) =>
              form.setValue("is_active", checked === true, { shouldDirty: true })
            }
          />
          <div>
            <p className="font-medium">{t("contacts.branch_assignments.active")}</p>
            <p className="text-sm text-muted-foreground">{t("contacts.branch_assignments.active_description")}</p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(watch("is_default"))}
            onCheckedChange={(checked) =>
              form.setValue("is_default", checked === true, { shouldDirty: true })
            }
          />
          <div>
            <p className="font-medium">{t("contacts.branch_assignments.default")}</p>
            <p className="text-sm text-muted-foreground">{t("contacts.branch_assignments.default_description")}</p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(watch("is_preferred"))}
            onCheckedChange={(checked) =>
              form.setValue("is_preferred", checked === true, { shouldDirty: true })
            }
          />
          <div>
            <p className="font-medium">{t("contacts.branch_assignments.preferred")}</p>
            <p className="text-sm text-muted-foreground">{t("contacts.branch_assignments.preferred_description")}</p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(watch("is_exclusive"))}
            onCheckedChange={(checked) =>
              form.setValue("is_exclusive", checked === true, { shouldDirty: true })
            }
          />
          <div>
            <p className="font-medium">{t("contacts.branch_assignments.exclusive")}</p>
            <p className="text-sm text-muted-foreground">{t("contacts.branch_assignments.exclusive_description")}</p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(watch("sales_enabled"))}
            onCheckedChange={(checked) =>
              form.setValue("sales_enabled", checked === true, { shouldDirty: true })
            }
          />
          <div>
            <p className="font-medium">{t("contacts.branch_assignments.sales_enabled")}</p>
            <p className="text-sm text-muted-foreground">{t("contacts.branch_assignments.sales_enabled_description")}</p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(watch("purchases_enabled"))}
            onCheckedChange={(checked) =>
              form.setValue("purchases_enabled", checked === true, { shouldDirty: true })
            }
          />
          <div>
            <p className="font-medium">{t("contacts.branch_assignments.purchases_enabled")}</p>
            <p className="text-sm text-muted-foreground">
              {t("contacts.branch_assignments.purchases_enabled_description")}
            </p>
          </div>
        </label>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(creditEnabled)}
          onCheckedChange={(checked) =>
            form.setValue("credit_enabled", checked === true, { shouldDirty: true })
          }
        />
        <div>
          <p className="font-medium">{t("contacts.branch_assignments.credit_enabled")}</p>
          <p className="text-sm text-muted-foreground">
            {t("contacts.branch_assignments.credit_enabled_description")}
          </p>
        </div>
      </label>

      <div className="space-y-2">
        <Label htmlFor="contact-branch-assignment-notes">{t("contacts.branch_assignments.notes")}</Label>
        <Textarea
          id="contact-branch-assignment-notes"
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

function mapAssignmentToForm(
  assignment: ContactBranchAssignment,
): UpdateContactBranchAssignmentInput {
  return {
    account_manager_user_id: assignment.account_manager?.id ?? null,
    credit_enabled: assignment.credit_enabled,
    custom_credit_limit: assignment.custom_credit_limit ?? null,
    custom_price_list_id: assignment.custom_price_list?.id ?? null,
    is_active: assignment.is_active,
    is_default: assignment.is_default,
    is_exclusive: assignment.is_exclusive,
    is_preferred: assignment.is_preferred,
    notes: assignment.notes ?? "",
    purchases_enabled: assignment.purchases_enabled,
    sales_enabled: assignment.sales_enabled,
  };
}

const emptyContactBranchAssignmentValues: CreateContactBranchAssignmentInput = {
  account_manager_user_id: undefined,
  branch_id: "",
  credit_enabled: false,
  custom_credit_limit: undefined,
  custom_price_list_id: undefined,
  is_active: true,
  is_default: false,
  is_exclusive: false,
  is_preferred: false,
  notes: "",
  purchases_enabled: true,
  sales_enabled: true,
};

function ContactBranchAssignmentEditorDialog({
  assignment,
  branches,
  contactId,
  onOpenChange,
  open,
  priceLists,
  users,
}: {
  assignment?: ContactBranchAssignment | null;
  branches: Branch[];
  contactId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  priceLists: PriceList[];
  users: User[];
}) {
  const { t } = useAppTranslator();
  const isEditing = Boolean(assignment);
  const createMutation = useCreateContactBranchAssignmentMutation(contactId, {
    showErrorToast: false,
  });
  const updateMutation = useUpdateContactBranchAssignmentMutation(contactId, assignment?.id ?? "", {
    showErrorToast: false,
  });
  const mutation = isEditing ? updateMutation : createMutation;
  const form = useForm<CreateContactBranchAssignmentInput | UpdateContactBranchAssignmentInput>({
    defaultValues: assignment ? mapAssignmentToForm(assignment) : emptyContactBranchAssignmentValues,
    resolver: buildFormResolver(
      isEditing ? updateContactBranchAssignmentSchema : createContactBranchAssignmentSchema,
    ),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } = useBackendFormErrors(form);

  function resetForm() {
    form.reset(assignment ? mapAssignmentToForm(assignment) : emptyContactBranchAssignmentValues);
    resetBackendFormErrors();
  }

  async function handleSubmit(
    values: CreateContactBranchAssignmentInput | UpdateContactBranchAssignmentInput,
  ) {
    resetBackendFormErrors();

    try {
      await mutation.mutateAsync(values as never);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: isEditing
          ? t("contacts.branch_assignments.update_error")
          : t("contacts.branch_assignments.create_error"),
      });
    }
  }

  return (
    <Sheet
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
        }
        onOpenChange(nextOpen);
      }}
      open={open}
    >
      <SheetContent size="md">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? t("contacts.branch_assignments.edit_title") : t("contacts.branch_assignments.add_title")}
          </SheetTitle>
          <SheetDescription>
            {t("contacts.branch_assignments.editor_description")}
          </SheetDescription>
        </SheetHeader>

        <ContactBranchAssignmentForm
          assignmentBranch={assignment?.branch}
          branches={branches}
          form={form}
          formError={formError}
          isEditing={isEditing}
          isPending={mutation.isPending}
          onSubmit={handleSubmit}
          priceLists={priceLists}
          submitLabel={isEditing ? t("contacts.branch_assignments.save_changes") : t("contacts.branch_assignments.create_assignment")}
          users={users}
        />
      </SheetContent>
    </Sheet>
  );
}

function ContactBranchAssignmentsDialog({
  contact,
  onOpenChange,
  open,
}: ContactBranchAssignmentsDialogProps) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const canViewAssignments = can("contacts.view_branch_assignments");
  const canCreateAssignments = can("contacts.create_branch_assignment");
  const canUpdateAssignments = can("contacts.update_branch_assignment");
  const canDeleteAssignments = can("contacts.delete_branch_assignment");
  const canViewBranches = can("branches.view");
  const canViewPriceLists = can("price_lists.view");
  const canViewUsers = can("users.view");
  const contextQuery = useContactBranchContextQuery(contact.id, open && canViewAssignments);
  const branchesQuery = useBranchesQuery(
    open && (canCreateAssignments || canUpdateAssignments) && canViewBranches,
  );
  const priceListsQuery = usePriceListsQuery(
    open && (canCreateAssignments || canUpdateAssignments) && canViewPriceLists,
  );
  const usersQuery = useUsersQuery(open && (canCreateAssignments || canUpdateAssignments) && canViewUsers);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ContactBranchAssignment | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    assignment: ContactBranchAssignment;
    type: "deactivate" | "delete" | "reactivate";
  } | null>(null);
  const deleteMutation = useDeleteContactBranchAssignmentMutation(
    contact.id,
    pendingAction?.assignment.id ?? "",
    { showErrorToast: true },
  );
  const updateMutation = useUpdateContactBranchAssignmentMutation(
    contact.id,
    pendingAction?.assignment.id ?? "",
    { showErrorToast: true },
  );

  const assignmentColumns = useMemo<ColumnDef<ContactBranchAssignment>[]>(
    () => [
      {
        accessorKey: "branch",
        header: t("contacts.branch_assignments.branch"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">{row.original.branch.name}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.branch.code ?? row.original.branch.branch_number ?? t("contacts.branch_assignments.no_code")}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "flags",
        header: t("contacts.branch_assignments.commercial_flags"),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.is_default ? <Badge>{t("contacts.branch_assignments.default")}</Badge> : null}
            {row.original.is_preferred ? <Badge variant="outline">{t("contacts.branch_assignments.preferred")}</Badge> : null}
            {row.original.is_exclusive ? <Badge variant="outline">{t("contacts.branch_assignments.exclusive")}</Badge> : null}
            {row.original.sales_enabled ? <Badge variant="outline">{t("contacts.branch_assignments.sales")}</Badge> : null}
            {row.original.purchases_enabled ? <Badge variant="outline">{t("contacts.branch_assignments.purchases")}</Badge> : null}
            {row.original.credit_enabled ? <Badge variant="outline">{t("contacts.branch_assignments.credit")}</Badge> : null}
          </div>
        ),
      },
      {
        accessorKey: "custom_price_list",
        header: t("contacts.branch_assignments.commercial_defaults"),
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <p>
              {t("contacts.branch_assignments.price_list_label")}: {row.original.custom_price_list?.name ?? t("contacts.branch_assignments.no_custom_price_list")}
            </p>
            <p className="text-muted-foreground">
              {t("contacts.branch_assignments.manager_label")}: {row.original.account_manager?.name ?? t("contacts.branch_assignments.no_account_manager")}
            </p>
            <p className="text-muted-foreground">
              {t("contacts.branch_assignments.credit_limit_label")}:{" "}
              {row.original.custom_credit_limit != null ? row.original.custom_credit_limit : t("contacts.branch_assignments.not_available")}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t("contacts.branch_assignments.status"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant={row.original.is_active ? "default" : "outline"}>
              {row.original.is_active ? t("contacts.branch_assignments.active") : t("contacts.branch_assignments.inactive")}
            </Badge>
            <p className="text-xs text-muted-foreground">{formatDateTime(row.original.updated_at)}</p>
          </div>
        ),
      },
      {
        accessorKey: "notes",
        header: t("contacts.branch_assignments.notes"),
        cell: ({ row }) => row.original.notes || t("contacts.branch_assignments.no_notes"),
      },
      {
        id: "actions",
        header: t("contacts.branch_assignments.actions"),
        cell: ({ row }) => (
          <TableRowActions
            actions={[
              ...(canUpdateAssignments
                ? [
                    {
                      label: t("contacts.branch_assignments.edit_assignment"),
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
                      label: t("contacts.branch_assignments.deactivate"),
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
                      label: t("contacts.branch_assignments.reactivate"),
                      icon: RotateCcw,
                      onClick: () =>
                        setPendingAction({ assignment: row.original, type: "reactivate" }),
                    },
                  ]
                : []),
              ...(canDeleteAssignments && row.original.lifecycle.can_delete
                ? [
                    {
                      label: t("contacts.branch_assignments.delete_assignment"),
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
    [canDeleteAssignments, canUpdateAssignments],
  );

  async function handleLifecycleConfirm() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === "delete") {
      await deleteMutation.mutateAsync();
    } else {
      await updateMutation.mutateAsync({ is_active: pendingAction.type === "reactivate" });
    }

    setPendingAction(null);
  }

  const branches = branchesQuery.data ?? [];
  const priceLists = priceListsQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const assignments = contextQuery.data?.assignments ?? [];
  const scopedAssignmentsHidden =
    contextQuery.data?.mode === "scoped" &&
    !contextQuery.data?.global_applies_to_all_branches &&
    assignments.length === 0;
  const canOpenEditor = (canCreateAssignments || canUpdateAssignments) && branches.length > 0;

  return (
    <>
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetContent size="lg">
          <SheetHeader>
            <SheetTitle>{t("contacts.branch_assignments.dialog_title")}</SheetTitle>
            <SheetDescription>
              {t("contacts.branch_assignments.dialog_description")}
            </SheetDescription>
          </SheetHeader>

          {!canViewAssignments ? (
            <p className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
              {t("contacts.branch_assignments.no_permission")}
            </p>
          ) : (
            <QueryStateWrapper
              errorDescription={getBackendErrorMessage(
                contextQuery.error,
                t("contacts.branch_assignments.load_error"),
              )}
              isError={contextQuery.isError}
              isLoading={contextQuery.isLoading}
              loadingDescription={t("contacts.branch_assignments.loading")}
              onRetry={() => contextQuery.refetch()}
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {t("contacts.branch_assignments.mode_label")}: {contextQuery.data?.mode === "scoped" ? t("contacts.branch_assignments.mode_scoped") : t("contacts.branch_assignments.mode_global")}
                      </Badge>
                      {contextQuery.data?.global_applies_to_all_branches ? (
                        <Badge variant="outline">{t("contacts.branch_assignments.applies_to_all")}</Badge>
                      ) : null}
                      <Badge variant="outline">{assignments.length} {t("contacts.branch_assignments.assignment_count")}</Badge>
                    </div>
                     <p className="text-sm text-muted-foreground">
                      {scopedAssignmentsHidden
                        ? t("contacts.branch_assignments.scoped_no_visible")
                        : contextQuery.data?.mode === "scoped"
                          ? t("contacts.branch_assignments.has_branch_context")
                          : t("contacts.branch_assignments.no_branch_context")}
                    </p>
                  </div>

                  {canOpenEditor ? (
                    <Button
                      onClick={() => {
                        setSelectedAssignment(null);
                        setEditorOpen(true);
                      }}
                    >
                      <Building2 className="size-4" />
                      {t("contacts.branch_assignments.add_branch_context")}
                    </Button>
                  ) : null}
                </div>

                {canCreateAssignments && !canViewBranches ? (
                  <p className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
                    {t("contacts.branch_assignments.branch_access_required")}
                  </p>
                ) : null}

                <DataTable
                  columns={assignmentColumns}
                  data={assignments}
                  emptyMessage={
                    scopedAssignmentsHidden
                      ? t("contacts.branch_assignments.empty_scoped")
                      : t("contacts.branch_assignments.empty")
                  }
                  enablePagination={false}
                />
              </div>
            </QueryStateWrapper>
          )}
        </SheetContent>
      </Sheet>

      <ContactBranchAssignmentEditorDialog
        assignment={selectedAssignment}
        branches={branches}
        contactId={contact.id}
        onOpenChange={(nextOpen) => {
          setEditorOpen(nextOpen);
          if (!nextOpen) {
            setSelectedAssignment(null);
          }
        }}
        open={editorOpen}
        priceLists={priceLists}
        users={users}
      />

      <ConfirmDialog
        confirmLabel={
          pendingAction?.type === "delete"
            ? t("contacts.branch_assignments.delete_assignment")
            : pendingAction?.type === "reactivate"
              ? t("contacts.branch_assignments.reactivate")
              : t("contacts.branch_assignments.deactivate")
        }
        description={
          pendingAction?.type === "delete"
            ? t("contacts.branch_assignments.confirm_delete_description")
            : pendingAction?.type === "reactivate"
              ? t("contacts.branch_assignments.confirm_reactivate_description")
              : t("contacts.branch_assignments.confirm_deactivate_description")
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
            ? t("contacts.branch_assignments.confirm_delete_title")
            : pendingAction?.type === "reactivate"
              ? t("contacts.branch_assignments.confirm_reactivate_title")
              : t("contacts.branch_assignments.confirm_deactivate_title")
        }
      />
    </>
  );
}

export { ContactBranchAssignmentsDialog };
