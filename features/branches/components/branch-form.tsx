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
import { usePermissions } from "@/shared/hooks/use-permissions";
import { identificationTypeValues } from "@/shared/lib/validation";

type BranchFormValues = {
  activity_code?: string;
  address: string;
  branch_number: string;
  business_name: string;
  canton: string;
  cedula_juridica: string;
  cert_path?: string;
  city?: string;
  code?: string;
  crypto_key?: string;
  district: string;
  email?: string;
  hacienda_password?: string;
  hacienda_username?: string;
  identification_number?: string;
  identification_type?: string;
  is_active: boolean;
  legal_name: string;
  mail_key?: string;
  name?: string;
  phone?: string;
  provider_code?: string;
  province: string;
  signature_type?: string;
};

type BranchFormProps = {
  form: UseFormReturn<BranchFormValues>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: BranchFormValues) => Promise<void> | void;
  secretState?: {
    has_crypto_key?: boolean;
    has_hacienda_password?: boolean;
    has_mail_key?: boolean;
  };
  submitLabel: string;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function BranchForm({
  form,
  formError,
  isPending,
  onSubmit,
  secretState,
  submitLabel,
}: BranchFormProps) {
  const {
    formState: { errors },
  } = form;
  const { can } = usePermissions();
  const isActive = form.watch("is_active");
  const canConfigure = can("branches.configure");

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Branch identity</h3>
          <p className="text-sm text-muted-foreground">
            Main branch data required by the backend contract.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-code">Code</Label>
            <Input id="branch-code" placeholder="BR-0001" {...form.register("code")} />
            <FieldError message={errors.code?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-number">Branch number</Label>
            <Input id="branch-number" placeholder="001" {...form.register("branch_number")} />
            <FieldError message={errors.branch_number?.message} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-business-name">Business name</Label>
            <Input
              id="branch-business-name"
              placeholder="FastFact Escazu"
              {...form.register("business_name")}
            />
            <FieldError message={errors.business_name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-legal-name">Legal name</Label>
            <Input
              id="branch-legal-name"
              placeholder="FastFact Sociedad Anonima"
              {...form.register("legal_name")}
            />
            <FieldError message={errors.legal_name?.message} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-name">Branch name</Label>
            <Input id="branch-name" placeholder="Escazu" {...form.register("name")} />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-cedula">Cedula juridica</Label>
            <Input
              id="branch-cedula"
              placeholder="3101123456"
              {...form.register("cedula_juridica")}
            />
            <FieldError message={errors.cedula_juridica?.message} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-identification-type">Identification type</Label>
            <Controller
              control={form.control}
              name="identification_type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger id="branch-identification-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {identificationTypeValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.identification_type?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-identification-number">Identification number</Label>
            <Input
              id="branch-identification-number"
              placeholder="3101123456"
              {...form.register("identification_number")}
            />
            <FieldError message={errors.identification_number?.message} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Location and contact</h3>
          <p className="text-sm text-muted-foreground">
            Branch address plus optional communication channels.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch-address">Address</Label>
          <Textarea
            id="branch-address"
            placeholder="Centro Comercial Plaza, Local 5"
            {...form.register("address")}
          />
          <FieldError message={errors.address?.message} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="branch-province">Province</Label>
            <Input id="branch-province" placeholder="San Jose" {...form.register("province")} />
            <FieldError message={errors.province?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-canton">Canton</Label>
            <Input id="branch-canton" placeholder="Escazu" {...form.register("canton")} />
            <FieldError message={errors.canton?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-district">District</Label>
            <Input id="branch-district" placeholder="San Rafael" {...form.register("district")} />
            <FieldError message={errors.district?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-city">City</Label>
            <Input id="branch-city" placeholder="San Jose" {...form.register("city")} />
            <FieldError message={errors.city?.message} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-phone">Phone</Label>
            <Input id="branch-phone" placeholder="2222-3333" {...form.register("phone")} />
            <FieldError message={errors.phone?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-email">Email</Label>
            <Input id="branch-email" placeholder="sucursal@empresa.com" {...form.register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
        </div>
      </section>

      {canConfigure ? (
        <section className="space-y-4 rounded-xl border border-border/70 p-4">
          <div className="space-y-1">
            <h3 className="font-semibold">Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Sensitive configuration fields only visible with `branches.configure`.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="branch-activity-code">Activity code</Label>
              <Input
                id="branch-activity-code"
                placeholder="123456"
                {...form.register("activity_code")}
              />
              <FieldError message={errors.activity_code?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-provider-code">Provider code</Label>
              <Input
                id="branch-provider-code"
                placeholder="PROV-01"
                {...form.register("provider_code")}
              />
              <FieldError message={errors.provider_code?.message} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="branch-cert-path">Cert path</Label>
              <Input
                id="branch-cert-path"
                placeholder="C:/certs/sucursal.p12"
                {...form.register("cert_path")}
              />
              <FieldError message={errors.cert_path?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-signature-type">Signature type</Label>
              <Input
                id="branch-signature-type"
                placeholder="p12"
                {...form.register("signature_type")}
              />
              <FieldError message={errors.signature_type?.message} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="branch-crypto-key">Crypto key</Label>
              <Input
                id="branch-crypto-key"
                placeholder="clave-privada"
                type="password"
                {...form.register("crypto_key")}
              />
              <FieldError message={errors.crypto_key?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-mail-key">Mail key</Label>
              <Input
                id="branch-mail-key"
                placeholder="mail-secret"
                type="password"
                {...form.register("mail_key")}
              />
              <FieldError message={errors.mail_key?.message} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="branch-hacienda-username">Hacienda username</Label>
              <Input
                id="branch-hacienda-username"
                placeholder="usuario_hacienda"
                {...form.register("hacienda_username")}
              />
              <FieldError message={errors.hacienda_username?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-hacienda-password">Hacienda password</Label>
              <Input
                id="branch-hacienda-password"
                placeholder="password_hacienda"
                type="password"
                {...form.register("hacienda_password")}
              />
              <FieldError message={errors.hacienda_password?.message} />
            </div>
          </div>

          {secretState ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Existing backend secret flags:
              {" "}
              crypto key {secretState.has_crypto_key ? "configured" : "empty"},
              {" "}
              Hacienda password {secretState.has_hacienda_password ? "configured" : "empty"},
              {" "}
              mail key {secretState.has_mail_key ? "configured" : "empty"}.
            </div>
          ) : null}
        </section>
      ) : null}

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("is_active", checked === true, { shouldDirty: true });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">Active branch</p>
          <p className="text-sm text-muted-foreground">
            Inactive branches remain registered but should not be used operationally.
          </p>
        </div>
      </label>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText="Saving" type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { BranchForm };
export type { BranchFormValues };
