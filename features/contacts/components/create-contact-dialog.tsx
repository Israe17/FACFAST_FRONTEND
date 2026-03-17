"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";

import { createContactSchema } from "../schemas";
import { useCreateContactMutation } from "../queries";
import type { CreateContactInput } from "../types";
import { ContactForm, type ContactFormValues } from "./contact-form";

type CreateContactDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

const defaultValues: CreateContactInput = {
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
};

function CreateContactDialog({ onOpenChange, open }: CreateContactDialogProps) {
  const { t } = useAppTranslator();

  const { form, formError, isPending, handleSubmit } = useDialogForm<CreateContactInput>({
    open,
    onOpenChange,
    schema: createContactSchema,
    defaultValues,
    mutation: useCreateContactMutation({ showErrorToast: false }),
    fallbackErrorMessage: t("contacts.create_error_fallback"),
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create contact</DialogTitle>
          <DialogDescription>
            Register a new customer, supplier or tenant contact record.
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          form={form as unknown as UseFormReturn<ContactFormValues>}
          formError={formError}
          isPending={isPending}
          onSubmit={(values) => handleSubmit(values as CreateContactInput)}
          submitLabel="Create contact"
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateContactDialog };
