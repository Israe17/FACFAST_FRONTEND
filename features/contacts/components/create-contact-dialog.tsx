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
  delivery_latitude: null,
  delivery_longitude: null,
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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent size="md">
        <SheetHeader>
          <SheetTitle>Create contact</SheetTitle>
          <SheetDescription>
            Register a new customer, supplier or tenant contact record.
          </SheetDescription>
        </SheetHeader>
        <ContactForm
          form={form as unknown as UseFormReturn<ContactFormValues>}
          formError={formError}
          isPending={isPending}
          onSubmit={(values) => handleSubmit(values as CreateContactInput)}
          submitLabel="Create contact"
        />
      </SheetContent>
    </Sheet>
  );
}

export { CreateContactDialog };
