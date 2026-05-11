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
  canton_id: null,
  code: "",
  commercial_name: "",
  country_id: null,
  delivery_latitude: null,
  delivery_longitude: null,
  district: "",
  district_id: null,
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
  province_id: null,
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
          <SheetTitle>{t("contacts.create_title")}</SheetTitle>
          <SheetDescription>{t("contacts.create_description")}</SheetDescription>
        </SheetHeader>
        <ContactForm
          form={form as unknown as UseFormReturn<ContactFormValues>}
          formError={formError}
          isPending={isPending}
          onSubmit={(values) => handleSubmit(values as CreateContactInput)}
          submitLabel={t("contacts.create_title")}
        />
      </SheetContent>
    </Sheet>
  );
}

export { CreateContactDialog };
