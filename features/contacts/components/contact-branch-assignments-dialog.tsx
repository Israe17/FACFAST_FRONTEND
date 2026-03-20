"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Pencil, Power, RotateCcw, Trash2 } from "lucide-react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
          <Label htmlFor="contact-branch-assignment-branch">Branch</Label>
          {isEditing ? (
            <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm">
              <p className="font-medium">{assignmentBranch?.name ?? "Unknown branch"}</p>
              <p className="text-muted-foreground">
                {assignmentBranch?.code ?? assignmentBranch?.branch_number ?? "No code"}
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
                      <SelectValue placeholder="Select a branch" />
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
          <Label htmlFor="contact-branch-assignment-credit-limit">Custom credit limit</Label>
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
          <Label htmlFor="contact-branch-assignment-price-list">Custom price list</Label>
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
                  <SelectValue placeholder="No custom price list" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>No custom price list</SelectItem>
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
          <Label htmlFor="contact-branch-assignment-account-manager">Account manager</Label>
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
                  <SelectValue placeholder="No account manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION}>No account manager</SelectItem>
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
            <p className="font-medium">Active</p>
            <p className="text-sm text-muted-foreground">Allow this branch context to operate.</p>
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
            <p className="font-medium">Default</p>
            <p className="text-sm text-muted-foreground">Marks this branch context as default.</p>
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
            <p className="font-medium">Preferred</p>
            <p className="text-sm text-muted-foreground">Advisory preference for this branch.</p>
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
            <p className="font-medium">Exclusive</p>
            <p className="text-sm text-muted-foreground">Restricts the contact to one branch.</p>
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
            <p className="font-medium">Sales enabled</p>
            <p className="text-sm text-muted-foreground">Allows future sales usage in this branch.</p>
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
            <p className="font-medium">Purchases enabled</p>
            <p className="text-sm text-muted-foreground">
              Allows future purchases usage in this branch.
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
          <p className="font-medium">Credit enabled</p>
          <p className="text-sm text-muted-foreground">
            Stores branch-level credit policy metadata for future commercial flows.
          </p>
        </div>
      </label>

      <div className="space-y-2">
        <Label htmlFor="contact-branch-assignment-notes">Notes</Label>
        <Textarea
          id="contact-branch-assignment-notes"
          {...form.register("notes", {
            setValueAs: (value) => (value === "" ? (isEditing ? null : undefined) : value),
          })}
        />
        <FormFieldError message={errors.notes?.message} />
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText="Saving" type="submit">
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
          ? "Unable to update the branch commercial context."
          : "Unable to create the branch commercial context.",
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit branch commercial context" : "Add branch commercial context"}
          </DialogTitle>
          <DialogDescription>
            Store branch-specific commercial preferences for this contact without duplicating the
            global contact record.
          </DialogDescription>
        </DialogHeader>

        <ContactBranchAssignmentForm
          assignmentBranch={assignment?.branch}
          branches={branches}
          form={form}
          formError={formError}
          isEditing={isEditing}
          isPending={mutation.isPending}
          onSubmit={handleSubmit}
          priceLists={priceLists}
          submitLabel={isEditing ? "Save changes" : "Create assignment"}
          users={users}
        />
      </DialogContent>
    </Dialog>
  );
}

function ContactBranchAssignmentsDialog({
  contact,
  onOpenChange,
  open,
}: ContactBranchAssignmentsDialogProps) {
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
        header: "Branch",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">{row.original.branch.name}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.branch.code ?? row.original.branch.branch_number ?? "No code"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "flags",
        header: "Commercial flags",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.is_default ? <Badge>Default</Badge> : null}
            {row.original.is_preferred ? <Badge variant="outline">Preferred</Badge> : null}
            {row.original.is_exclusive ? <Badge variant="outline">Exclusive</Badge> : null}
            {row.original.sales_enabled ? <Badge variant="outline">Sales</Badge> : null}
            {row.original.purchases_enabled ? <Badge variant="outline">Purchases</Badge> : null}
            {row.original.credit_enabled ? <Badge variant="outline">Credit</Badge> : null}
          </div>
        ),
      },
      {
        accessorKey: "custom_price_list",
        header: "Commercial defaults",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <p>
              Price list: {row.original.custom_price_list?.name ?? "No custom price list"}
            </p>
            <p className="text-muted-foreground">
              Manager: {row.original.account_manager?.name ?? "No account manager"}
            </p>
            <p className="text-muted-foreground">
              Credit limit:{" "}
              {row.original.custom_credit_limit != null ? row.original.custom_credit_limit : "N/A"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant={row.original.is_active ? "default" : "outline"}>
              {row.original.is_active ? "Active" : "Inactive"}
            </Badge>
            <p className="text-xs text-muted-foreground">{formatDateTime(row.original.updated_at)}</p>
          </div>
        ),
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => row.original.notes || "No notes",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TableRowActions
            actions={[
              ...(canUpdateAssignments
                ? [
                    {
                      label: "Edit assignment",
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
                      label: "Deactivate",
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
                      label: "Reactivate",
                      icon: RotateCcw,
                      onClick: () =>
                        setPendingAction({ assignment: row.original, type: "reactivate" }),
                    },
                  ]
                : []),
              ...(canDeleteAssignments && row.original.lifecycle.can_delete
                ? [
                    {
                      label: "Delete assignment",
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
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Branch commercial context</DialogTitle>
            <DialogDescription>
              Manage branch-specific commercial assignments for {contact.name} while keeping the
              contact itself global at business level.
            </DialogDescription>
          </DialogHeader>

          {!canViewAssignments ? (
            <p className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
              You do not have permission to review branch commercial assignments for this contact.
            </p>
          ) : (
            <QueryStateWrapper
              errorDescription={getBackendErrorMessage(
                contextQuery.error,
                "Unable to load the branch commercial context for this contact.",
              )}
              isError={contextQuery.isError}
              isLoading={contextQuery.isLoading}
              loadingDescription="Loading branch commercial context."
              onRetry={() => contextQuery.refetch()}
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        Mode: {contextQuery.data?.mode === "scoped" ? "Scoped" : "Global"}
                      </Badge>
                      {contextQuery.data?.global_applies_to_all_branches ? (
                        <Badge variant="outline">Applies to all branches</Badge>
                      ) : null}
                      <Badge variant="outline">{assignments.length} assignment(s)</Badge>
                    </div>
                     <p className="text-sm text-muted-foreground">
                      {scopedAssignmentsHidden
                        ? "This contact is branch-scoped, but there are no assignments visible inside your current branch scope."
                        : contextQuery.data?.mode === "scoped"
                          ? "This contact already has branch-specific commercial context."
                          : "No branch assignments exist yet, so the contact still behaves as a company-wide commercial record."}
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
                      Add branch context
                    </Button>
                  ) : null}
                </div>

                {canCreateAssignments && !canViewBranches ? (
                  <p className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
                    Branch creation and edition require visible branch options. Grant branch access
                    to enable this form.
                  </p>
                ) : null}

                <DataTable
                  columns={assignmentColumns}
                  data={assignments}
                  emptyMessage={
                    scopedAssignmentsHidden
                      ? "This contact has branch assignments, but none are visible in your current scope."
                      : "This contact does not have branch commercial assignments yet."
                  }
                  enablePagination={false}
                />
              </div>
            </QueryStateWrapper>
          )}
        </DialogContent>
      </Dialog>

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
            ? "Delete assignment"
            : pendingAction?.type === "reactivate"
              ? "Reactivate"
              : "Deactivate"
        }
        description={
          pendingAction?.type === "delete"
            ? `This will permanently remove the assignment for ${pendingAction.assignment.branch.name}. The contact itself will remain untouched.`
            : pendingAction?.type === "reactivate"
              ? `This branch assignment will become operative again for ${pendingAction.assignment.branch.name}.`
              : `This branch assignment will remain visible for history, but it should no longer be used operationally in ${pendingAction?.assignment.branch.name}.`
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
            ? "Delete branch assignment"
            : pendingAction?.type === "reactivate"
              ? "Reactivate branch assignment"
              : "Deactivate branch assignment"
        }
      />
    </>
  );
}

export { ContactBranchAssignmentsDialog };
