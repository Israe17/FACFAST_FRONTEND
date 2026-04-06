"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import {
  getBranchFormValues,
  getBranchSecretState,
  stripSensitiveBranchFields,
} from "../form-values";
import { updateBranchSchema } from "../schemas";
import { useUpdateBranchMutation } from "../queries";
import type { Branch, UpdateBranchInput } from "../types";
import { BranchForm, type BranchFormValues } from "./branch-form";

type EditBranchDialogProps = {
  branch: Branch;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function EditBranchDialog({ branch, onOpenChange, open }: EditBranchDialogProps) {
  const updateBranchMutation = useUpdateBranchMutation(branch.id, { showErrorToast: false });
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canConfigure = can("branches.configure");
  const form = useForm<UpdateBranchInput>({
    defaultValues: getBranchFormValues(branch),
    resolver: buildFormResolver<UpdateBranchInput>(updateBranchSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (open) {
      form.reset(getBranchFormValues(branch));
      resetBackendFormErrors();
    }
  }, [branch, form, open, resetBackendFormErrors]);

  async function handleSubmit(values: UpdateBranchInput) {
    resetBackendFormErrors();

    try {
      await updateBranchMutation.mutateAsync(
        stripSensitiveBranchFields(values, canConfigure),
      );
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("branches.update_error_fallback"),
      });
    }
  }

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>Edit branch</DrawerTitle>
          <DrawerDescription>
            Update the branch using the same backend payload shape.
          </DrawerDescription>
        </DrawerHeader>
        <BranchForm
          form={form as unknown as UseFormReturn<BranchFormValues>}
          formError={formError}
          isPending={updateBranchMutation.isPending}
          onSubmit={(values) => handleSubmit(values as UpdateBranchInput)}
          secretState={getBranchSecretState(branch)}
          submitLabel="Save changes"
        />
      </DrawerContent>
    </Drawer>
  );
}

export { EditBranchDialog };
