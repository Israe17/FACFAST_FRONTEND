"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";
import { usePermissions } from "@/shared/hooks/use-permissions";

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
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canConfigure = can("branches.configure");

  const { form, formError, isPending, handleSubmit } = useDialogForm<CreateBranchInput>({
    open,
    onOpenChange,
    schema: createBranchSchema,
    defaultValues: emptyBranchFormValues,
    mutation: useCreateBranchMutation({ showErrorToast: false }),
    fallbackErrorMessage: t("branches.create_error_fallback"),
    transformBeforeSubmit: (values) => stripSensitiveBranchFields(values, canConfigure),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Create branch</SheetTitle>
          <SheetDescription>
            Register a new branch using the current backend contract.
          </SheetDescription>
        </SheetHeader>
        <BranchForm
          form={form as unknown as UseFormReturn<BranchFormValues>}
          formError={formError}
          isPending={isPending}
          onSubmit={(values) => handleSubmit(values as CreateBranchInput)}
          submitLabel="Create branch"
        />
      </SheetContent>
    </Sheet>
  );
}

export { CreateBranchDialog };
