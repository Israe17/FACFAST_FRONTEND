"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { emptyBranchFormValues, stripSensitiveBranchFields } from "../form-values";
import { createBranchSchema } from "../schemas";
import { useCreateBranchMutation } from "../queries";
import type { CreateBranchInput } from "../types";
import { BranchForm, type BranchFormValues } from "./branch-form";

type CreateBranchDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function CreateBranchDialog({ onOpenChange, open }: CreateBranchDialogProps) {
  const createBranchMutation = useCreateBranchMutation({ showErrorToast: false });
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canConfigure = can("branches.configure");
  const form = useForm<CreateBranchInput>({
    defaultValues: emptyBranchFormValues,
    resolver: buildFormResolver<CreateBranchInput>(createBranchSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (!open) {
      form.reset(emptyBranchFormValues);
      resetBackendFormErrors();
    }
  }, [form, open, resetBackendFormErrors]);

  async function handleSubmit(values: CreateBranchInput) {
    resetBackendFormErrors();

    try {
      await createBranchMutation.mutateAsync(
        stripSensitiveBranchFields(values, canConfigure),
      );
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("branches.create_error_fallback"),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create branch</DialogTitle>
          <DialogDescription>
            Register a new branch using the current backend contract.
          </DialogDescription>
        </DialogHeader>
        <BranchForm
          form={form as unknown as UseFormReturn<BranchFormValues>}
          formError={formError}
          isPending={createBranchMutation.isPending}
          onSubmit={(values) => handleSubmit(values as CreateBranchInput)}
          submitLabel="Create branch"
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateBranchDialog };
