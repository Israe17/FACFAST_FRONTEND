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
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { updateContactSchema } from "../schemas";
import { useContactQuery, useUpdateContactMutation } from "../queries";
import type { UpdateContactInput } from "../types";
import { ContactForm, type ContactFormValues } from "./contact-form";

type EditContactDialogProps = {
  contactId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function EditContactDialog({ contactId, onOpenChange, open }: EditContactDialogProps) {
  const contactQuery = useContactQuery(contactId, open);
  const updateContactMutation = useUpdateContactMutation(contactId, { showErrorToast: false });
  const { t } = useAppTranslator();
  const form = useForm<UpdateContactInput>({
    defaultValues: {
      address: "",
      canton: "",
      code: "",
      commercial_name: "",
      district: "",
      economic_activity_code: "",
      email: "",
      exoneration_document_number: "",
      exoneration_institution: "",
      exoneration_issue_date: "",
      exoneration_percentage: undefined,
      exoneration_type: "",
      identification_number: "",
      identification_type: "01",
      is_active: true,
      name: "",
      phone: "",
      province: "",
      tax_condition: "",
      type: "customer",
    },
    resolver: buildFormResolver<UpdateContactInput>(updateContactSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(form);

  useEffect(() => {
    if (contactQuery.data) {
      form.reset({
        address: contactQuery.data.address ?? "",
        canton: contactQuery.data.canton ?? "",
        code: contactQuery.data.code ?? "",
        commercial_name: contactQuery.data.commercial_name ?? "",
        district: contactQuery.data.district ?? "",
        economic_activity_code: contactQuery.data.economic_activity_code ?? "",
        email: contactQuery.data.email ?? "",
        exoneration_document_number: contactQuery.data.exoneration_document_number ?? "",
        exoneration_institution: contactQuery.data.exoneration_institution ?? "",
        exoneration_issue_date: contactQuery.data.exoneration_issue_date ?? "",
        exoneration_percentage: contactQuery.data.exoneration_percentage,
        exoneration_type: contactQuery.data.exoneration_type ?? "",
        identification_number: contactQuery.data.identification_number ?? "",
        identification_type: contactQuery.data.identification_type ?? "01",
        is_active: contactQuery.data.is_active,
        name: contactQuery.data.name,
        phone: contactQuery.data.phone ?? "",
        province: contactQuery.data.province ?? "",
        tax_condition: contactQuery.data.tax_condition ?? "",
        type: contactQuery.data.type ?? "customer",
      });
      resetBackendFormErrors();
    }
  }, [contactQuery.data, form, resetBackendFormErrors]);

  useEffect(() => {
    if (!open) {
      resetBackendFormErrors();
    }
  }, [open, resetBackendFormErrors]);

  async function handleSubmit(values: UpdateContactInput) {
    resetBackendFormErrors();

    try {
      await updateContactMutation.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("contacts.update_error_fallback"),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit contact</DialogTitle>
          <DialogDescription>
            Update the selected contact without leaving the administrative table.
          </DialogDescription>
        </DialogHeader>

        {contactQuery.isLoading ? <LoadingState description="Loading contact details." /> : null}
        {contactQuery.isError ? (
          <ErrorState
            description={getTranslatedBackendErrorMessage(contactQuery.error, {
              fallbackMessage: t("common.load_failed"),
              translateMessage: t,
            }) ?? undefined}
            onRetry={() => contactQuery.refetch()}
          />
        ) : null}
        {contactQuery.data ? (
          <ContactForm
            form={form as unknown as UseFormReturn<ContactFormValues>}
            formError={formError}
            isPending={updateContactMutation.isPending}
            onSubmit={(values) => handleSubmit(values as UpdateContactInput)}
            submitLabel="Save changes"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export { EditContactDialog };
