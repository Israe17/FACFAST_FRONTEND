"use client";

import { useCallback, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { toast } from "sonner";

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
import { useCurrentBusinessQuery } from "@/features/businesses/queries";
import { ActivityPickerDialog } from "@/features/contacts/components/activity-picker-dialog";
import {
  useTaxpayerEmailLookupMutation,
  useTaxpayerLookupMutation,
} from "@/features/contacts/queries";
import type { HaciendaActivity } from "@/features/contacts/types";
import { ActionButton } from "@/shared/components/action-button";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { LocationPicker } from "@/shared/components/location-picker";
import { RegionPicker } from "@/shared/components/region-picker";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { identificationTypeValues } from "@/shared/lib/validation";

type BranchFormValues = {
  activity_code?: string;
  address: string;
  branch_number: string;
  business_name: string;
  canton?: string;
  canton_id: number | null;
  cedula_juridica: string;
  cert_path?: string;
  city?: string;
  code?: string;
  country_id: number | null;
  crypto_key?: string;
  district?: string;
  district_id: number | null;
  email?: string;
  hacienda_password?: string;
  hacienda_username?: string;
  identification_type?: string;
  is_active: boolean;
  latitude?: number | null;
  legal_name: string;
  longitude?: number | null;
  mail_key?: string;
  name?: string;
  phone?: string;
  provider_code?: string;
  province?: string;
  province_id: number | null;
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

function LocationPickerSection({ form }: { form: UseFormReturn<BranchFormValues> }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useAppTranslator();
  const latitude = form.watch("latitude") ?? null;
  const longitude = form.watch("longitude") ?? null;

  return (
    <div className="rounded-lg border border-border/50">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors rounded-lg"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {t("branches.form.map_location")}
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen ? (
        <div className="px-3 pb-3">
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => {
              form.setValue("latitude", lat, { shouldDirty: true });
              form.setValue("longitude", lng, { shouldDirty: true });
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function BranchForm({
  form,
  formError,
  isPending,
  onSubmit,
  secretState,
  submitLabel,
}: BranchFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
  } = form;
  const { can } = usePermissions();
  const isActive = form.watch("is_active");
  const watchedIdentificationType = form.watch("identification_type");
  const lookupDisabled = !watchedIdentificationType;
  const canConfigure = can("branches.configure");
  const currentBusinessQuery = useCurrentBusinessQuery();
  const businessCountryId =
    (currentBusinessQuery.data?.country_id as number | undefined) ?? null;
  const taxpayerLookup = useTaxpayerLookupMutation({ showErrorToast: false });
  const taxpayerEmailLookup = useTaxpayerEmailLookupMutation({
    showErrorToast: false,
  });
  const [activityPickerState, setActivityPickerState] = useState<{
    open: boolean;
    activities: HaciendaActivity[];
  }>({ open: false, activities: [] });

  const handleTaxpayerLookup = useCallback(async () => {
    const identificationType = form.getValues("identification_type");
    if (!identificationType) {
      toast.info(t("branches.hacienda.type_required"));
      return;
    }
    const identification = form.getValues("cedula_juridica")?.trim();
    if (!identification) {
      toast.info(t("branches.hacienda.empty_identification"));
      return;
    }
    try {
      const [result, email] = await Promise.all([
        taxpayerLookup.mutateAsync(identification),
        taxpayerEmailLookup.mutateAsync(identification).catch(() => null),
      ]);
      if (!result) {
        toast.info(t("branches.hacienda.not_found"));
        return;
      }
      form.setValue("business_name", result.nombre, { shouldDirty: true });
      form.setValue("legal_name", result.nombre, { shouldDirty: true });
      form.setValue("identification_type", result.tipoIdentificacion, {
        shouldDirty: true,
      });
      if (email && !form.getValues("email")) {
        form.setValue("email", email, { shouldDirty: true });
      }
      const activeActivities = result.actividades.filter((a) => a.estado === "A");
      if (activeActivities.length === 1) {
        form.setValue("activity_code", activeActivities[0].codigo, {
          shouldDirty: true,
        });
      } else if (activeActivities.length > 1) {
        setActivityPickerState({ open: true, activities: activeActivities });
      }
      toast.success(t("branches.hacienda.lookup_success"));
    } catch {
      toast.error(t("branches.hacienda.lookup_error"));
    }
  }, [form, taxpayerLookup, taxpayerEmailLookup, t]);

  const handleActivityPicked = useCallback(
    (activity: HaciendaActivity) => {
      form.setValue("activity_code", activity.codigo, { shouldDirty: true });
      setActivityPickerState({ open: false, activities: [] });
    },
    [form],
  );

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">{t("branches.form.identity_title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("branches.form.identity_description")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-identification-type">{t("branches.form.identification_type")}</Label>
            <Controller
              control={form.control}
              name="identification_type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger id="branch-identification-type">
                    <SelectValue placeholder={t("branches.form.select_type")} />
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
            <Label htmlFor="branch-cedula">{t("branches.form.cedula_juridica")}</Label>
            <div className="flex gap-2">
              <Input
                className="flex-1"
                id="branch-cedula"
                inputMode="numeric"
                maxLength={12}
                placeholder="3101123456"
                {...form.register("cedula_juridica")}
              />
              <ActionButton
                disabled={lookupDisabled}
                icon={Search}
                isLoading={taxpayerLookup.isPending}
                loadingText={t("branches.hacienda.looking_up")}
                onClick={handleTaxpayerLookup}
                title={
                  lookupDisabled
                    ? t("branches.hacienda.type_required")
                    : undefined
                }
                type="button"
                variant="outline"
              >
                {t("branches.hacienda.lookup_button")}
              </ActionButton>
            </div>
            <p className="text-xs text-muted-foreground">
              {lookupDisabled
                ? t("branches.hacienda.type_required")
                : t("branches.hacienda.ready_hint")}
            </p>
            <FieldError message={errors.cedula_juridica?.message} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-business-name">{t("branches.form.business_name")}</Label>
            <Input
              id="branch-business-name"
              placeholder="FastFact Escazu"
              {...form.register("business_name")}
            />
            <FieldError message={errors.business_name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-legal-name">{t("branches.form.legal_name")}</Label>
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
            <Label htmlFor="branch-number">{t("branches.form.branch_number")}</Label>
            <Input id="branch-number" placeholder="001" {...form.register("branch_number")} />
            <FieldError message={errors.branch_number?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-name">{t("branches.form.branch_name")}</Label>
            <Input id="branch-name" placeholder="Escazu" {...form.register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">{t("branches.form.location_title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("branches.form.location_description")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch-address">{t("branches.form.address")}</Label>
          <Textarea
            id="branch-address"
            placeholder="Centro Comercial Plaza, Local 5"
            {...form.register("address")}
          />
          <FieldError message={errors.address?.message} />
        </div>

        <RegionPicker
          form={form}
          fields={{
            countryId: "country_id",
            provinceId: "province_id",
            cantonId: "canton_id",
            districtId: "district_id",
          }}
          lockedCountryId={businessCountryId ?? null}
          idPrefix="branch-region"
        />
        <FieldError message={errors.country_id?.message} />
        <FieldError message={errors.province_id?.message} />
        <FieldError message={errors.canton_id?.message} />
        <FieldError message={errors.district_id?.message} />

        <div className="space-y-2 md:max-w-xs">
          <Label htmlFor="branch-city">{t("branches.form.city")}</Label>
          <Input id="branch-city" placeholder="San Jose" {...form.register("city")} />
          <FieldError message={errors.city?.message} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-phone">{t("branches.form.phone")}</Label>
            <Input id="branch-phone" placeholder="2222-3333" {...form.register("phone")} />
            <FieldError message={errors.phone?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-email">{t("branches.form.email")}</Label>
            <Input id="branch-email" placeholder="sucursal@empresa.com" {...form.register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
        </div>

        <LocationPickerSection form={form} />
      </section>

      {canConfigure ? (
        <section className="space-y-4 rounded-xl border border-border/70 p-4">
          <div className="space-y-1">
            <h3 className="font-semibold">{t("branches.form.configuration_title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("branches.form.configuration_description")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="branch-activity-code">{t("branches.form.activity_code")}</Label>
              <Input
                id="branch-activity-code"
                placeholder="123456"
                {...form.register("activity_code")}
              />
              <FieldError message={errors.activity_code?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-provider-code">{t("branches.form.provider_code")}</Label>
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
              <Label htmlFor="branch-cert-path">{t("branches.form.cert_path")}</Label>
              <Input
                id="branch-cert-path"
                placeholder="C:/certs/sucursal.p12"
                {...form.register("cert_path")}
              />
              <FieldError message={errors.cert_path?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-signature-type">{t("branches.form.signature_type")}</Label>
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
              <Label htmlFor="branch-crypto-key">{t("branches.form.crypto_key")}</Label>
              <Input
                id="branch-crypto-key"
                placeholder="clave-privada"
                type="password"
                {...form.register("crypto_key")}
              />
              <FieldError message={errors.crypto_key?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-mail-key">{t("branches.form.mail_key")}</Label>
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
              <Label htmlFor="branch-hacienda-username">{t("branches.form.hacienda_username")}</Label>
              <Input
                id="branch-hacienda-username"
                placeholder="usuario_hacienda"
                {...form.register("hacienda_username")}
              />
              <FieldError message={errors.hacienda_username?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch-hacienda-password">{t("branches.form.hacienda_password")}</Label>
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
              {t("branches.form.secret_flags_label")}:
              {" "}
              {t("branches.form.crypto_key")} {secretState.has_crypto_key ? t("branches.form.configured") : t("branches.form.empty")},
              {" "}
              {t("branches.form.hacienda_password")} {secretState.has_hacienda_password ? t("branches.form.configured") : t("branches.form.empty")},
              {" "}
              {t("branches.form.mail_key")} {secretState.has_mail_key ? t("branches.form.configured") : t("branches.form.empty")}.
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
          <p className="font-medium">{t("branches.form.active_branch")}</p>
          <p className="text-sm text-muted-foreground">
            {t("branches.form.active_branch_description")}
          </p>
        </div>
      </label>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>

      <ActivityPickerDialog
        activities={activityPickerState.activities}
        onClose={() => setActivityPickerState({ open: false, activities: [] })}
        onSelect={handleActivityPicked}
        open={activityPickerState.open}
      />
    </form>
  );
}

export { BranchForm };
export type { BranchFormValues };
