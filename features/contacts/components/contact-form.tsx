"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

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
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";

import { contactTypeOptions, identificationTypeOptions } from "../constants";

type ContactFormValues = {
  address?: string;
  canton?: string;
  code?: string;
  commercial_name?: string;
  district?: string;
  economic_activity_code?: string;
  email?: string;
  exoneration_document_number?: string;
  exoneration_institution?: string;
  exoneration_issue_date?: string;
  exoneration_percentage?: number;
  exoneration_type?: string;
  identification_number?: string;
  identification_type?: string;
  is_active: boolean;
  name: string;
  phone?: string;
  province?: string;
  tax_condition?: string;
  type?: string;
};

type ContactFormProps = {
  form: UseFormReturn<ContactFormValues>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: ContactFormValues) => Promise<void> | void;
  submitLabel: string;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function ContactForm({ form, formError, isPending, onSubmit, submitLabel }: ContactFormProps) {
  const {
    formState: { errors },
  } = form;
  const isActive = form.watch("is_active");

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">General information</h3>
          <p className="text-sm text-muted-foreground">
            Main contact identity and operational state.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="contact-type">Type</Label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger id="contact-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.type?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input id="contact-name" placeholder="Legal or personal name" {...form.register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-code">Code</Label>
            <Input id="contact-code" placeholder="CT-0001" {...form.register("code")} />
            <FieldError message={errors.code?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-commercial-name">Commercial name</Label>
            <Input
              id="contact-commercial-name"
              placeholder="Trading name"
              {...form.register("commercial_name")}
            />
            <FieldError message={errors.commercial_name?.message} />
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
            <Checkbox
              checked={Boolean(isActive)}
              onCheckedChange={(checked) => {
                form.setValue("is_active", checked === true, { shouldDirty: true });
              }}
            />
            <div className="space-y-1">
              <p className="font-medium">Active contact</p>
              <p className="text-sm text-muted-foreground">
                Keep inactive records available without using them in future operations.
              </p>
            </div>
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Identification and tax</h3>
          <p className="text-sm text-muted-foreground">
            Fiscal identifiers and taxpayer metadata.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-identification-type">Identification type</Label>
            <Controller
              control={form.control}
              name="identification_type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger id="contact-identification-type">
                    <SelectValue placeholder="Select an identification type" />
                  </SelectTrigger>
                  <SelectContent>
                    {identificationTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.identification_type?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-identification-number">Identification number</Label>
            <Input
              id="contact-identification-number"
              placeholder="3101123456"
              {...form.register("identification_number")}
            />
            <FieldError message={errors.identification_number?.message} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-tax-condition">Tax condition</Label>
            <Input
              id="contact-tax-condition"
              placeholder="TAXPAYER"
              {...form.register("tax_condition")}
            />
            <FieldError message={errors.tax_condition?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-activity-code">Economic activity code</Label>
            <Input
              id="contact-activity-code"
              placeholder="620100"
              {...form.register("economic_activity_code")}
            />
            <FieldError message={errors.economic_activity_code?.message} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Contact and location</h3>
          <p className="text-sm text-muted-foreground">
            Communication channels and geographic data.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input id="contact-email" placeholder="contact@company.com" {...form.register("email")} />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input id="contact-phone" placeholder="+506 2222-2222" {...form.register("phone")} />
            <FieldError message={errors.phone?.message} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-address">Address</Label>
          <Textarea id="contact-address" placeholder="Exact address and references" {...form.register("address")} />
          <FieldError message={errors.address?.message} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="contact-province">Province</Label>
            <Input id="contact-province" placeholder="San Jose" {...form.register("province")} />
            <FieldError message={errors.province?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-canton">Canton</Label>
            <Input id="contact-canton" placeholder="Central" {...form.register("canton")} />
            <FieldError message={errors.canton?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-district">District</Label>
            <Input id="contact-district" placeholder="Carmen" {...form.register("district")} />
            <FieldError message={errors.district?.message} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Exoneration</h3>
          <p className="text-sm text-muted-foreground">
            Optional exoneration fields used for special tax conditions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-exoneration-type">Exoneration type</Label>
            <Input
              id="contact-exoneration-type"
              placeholder="PARTIAL"
              {...form.register("exoneration_type")}
            />
            <FieldError message={errors.exoneration_type?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-exoneration-document">Document number</Label>
            <Input
              id="contact-exoneration-document"
              placeholder="EXO-2026-001"
              {...form.register("exoneration_document_number")}
            />
            <FieldError message={errors.exoneration_document_number?.message} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-exoneration-institution">Institution</Label>
            <Input
              id="contact-exoneration-institution"
              placeholder="Institution name"
              {...form.register("exoneration_institution")}
            />
            <FieldError message={errors.exoneration_institution?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-exoneration-issue-date">Issue date</Label>
            <Input
              id="contact-exoneration-issue-date"
              type="date"
              {...form.register("exoneration_issue_date")}
            />
            <FieldError message={errors.exoneration_issue_date?.message} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-exoneration-percentage">Exoneration percentage</Label>
          <Input
            id="contact-exoneration-percentage"
            max={100}
            min={0}
            step="0.01"
            type="number"
            {...form.register("exoneration_percentage", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
          <FieldError message={errors.exoneration_percentage?.message} />
        </div>
      </section>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText="Saving" type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { ContactForm };
export type { ContactFormValues };
