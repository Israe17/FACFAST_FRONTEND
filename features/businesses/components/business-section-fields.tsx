"use client";

import { Controller, type FieldValues, type UseFormReturn } from "react-hook-form";

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
import { DetailBlock } from "@/shared/components/detail-block";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { identificationTypeValues } from "@/shared/lib/validation";

type BusinessFieldsBaseProps = {
  disabled?: boolean;
  prefix?: "business";
};

type BusinessIdentityFieldsProps = BusinessFieldsBaseProps & {
  includeCode?: boolean;
};

type BusinessFieldsGenericProps<TFormValues extends FieldValues> = BusinessFieldsBaseProps & {
  form: UseFormReturn<TFormValues>;
};

type BusinessIdentityFieldsGenericProps<TFormValues extends FieldValues> =
  BusinessIdentityFieldsProps & {
    form: UseFormReturn<TFormValues>;
  };

type BusinessSectionFieldsGenericProps<TFormValues extends FieldValues> =
  BusinessIdentityFieldsGenericProps<TFormValues>;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function buildFieldHelpers<TFormValues extends FieldValues>(
  form: UseFormReturn<TFormValues>,
  prefix?: "business",
) {
  const fieldName = (name: string) => (prefix ? `${prefix}.${name}` : name);
  const getError = (name: string) =>
    form.getFieldState(fieldName(name) as never).error?.message;
  return { fieldName, getError };
}

export function BusinessIdentityFields<TFormValues extends FieldValues>({
  disabled,
  form,
  includeCode = true,
  prefix,
}: BusinessIdentityFieldsGenericProps<TFormValues>) {
  const { t } = useAppTranslator();
  const { fieldName, getError } = buildFieldHelpers(form, prefix);

  return (
    <div className="space-y-4">
      {includeCode ? (
        <div className="space-y-2">
          <Label htmlFor={fieldName("code")}>{t("business.field.code")}</Label>
          <Input
            disabled={disabled}
            id={fieldName("code")}
            placeholder={t("business.field.code_placeholder")}
            {...form.register(fieldName("code") as never)}
          />
          <FieldError message={getError("code")} />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={fieldName("name")}>{t("business.field.name")}</Label>
          <Input
            disabled={disabled}
            id={fieldName("name")}
            placeholder={t("business.field.name_placeholder")}
            {...form.register(fieldName("name") as never)}
          />
          <FieldError message={getError("name")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName("legal_name")}>
            {t("business.field.legal_name")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("legal_name")}
            placeholder={t("business.field.legal_name_placeholder")}
            {...form.register(fieldName("legal_name") as never)}
          />
          <FieldError message={getError("legal_name")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={fieldName("identification_type")}>
            {t("business.field.identification_type")}
          </Label>
          <Controller
            control={form.control}
            name={fieldName("identification_type") as never}
            render={({ field }) => (
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                value={field.value ?? ""}
              >
                <SelectTrigger id={fieldName("identification_type")}>
                  <SelectValue
                    placeholder={t(
                      "business.field.identification_type_placeholder",
                    )}
                  />
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
          <FieldError message={getError("identification_type")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName("identification_number")}>
            {t("business.field.identification_number")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("identification_number")}
            placeholder={t("business.field.identification_number_placeholder")}
            {...form.register(fieldName("identification_number") as never)}
          />
          <FieldError message={getError("identification_number")} />
        </div>
      </div>
    </div>
  );
}

export function BusinessOperationalFields<TFormValues extends FieldValues>({
  disabled,
  form,
  prefix,
}: BusinessFieldsGenericProps<TFormValues>) {
  const { t } = useAppTranslator();
  const { fieldName, getError } = buildFieldHelpers(form, prefix);
  const isActive = form.watch(fieldName("is_active") as never);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={fieldName("currency_code")}>
            {t("business.field.currency_code")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("currency_code")}
            placeholder={t("business.field.currency_code_placeholder")}
            {...form.register(fieldName("currency_code") as never)}
          />
          <FieldError message={getError("currency_code")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName("timezone")}>
            {t("business.field.timezone")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("timezone")}
            placeholder={t("business.field.timezone_placeholder")}
            {...form.register(fieldName("timezone") as never)}
          />
          <FieldError message={getError("timezone")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName("language")}>
            {t("business.field.language")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("language")}
            placeholder={t("business.field.language_placeholder")}
            {...form.register(fieldName("language") as never)}
          />
          <FieldError message={getError("language")} />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(isActive)}
          disabled={disabled}
          onCheckedChange={(checked) => {
            form.setValue(
              fieldName("is_active") as never,
              (checked === true) as never,
              { shouldDirty: true },
            );
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">{t("business.field.is_active")}</p>
          <p className="text-sm text-muted-foreground">
            {t("business.field.is_active_description")}
          </p>
        </div>
      </label>
    </div>
  );
}

export function BusinessContactFields<TFormValues extends FieldValues>({
  disabled,
  form,
  prefix,
}: BusinessFieldsGenericProps<TFormValues>) {
  const { t } = useAppTranslator();
  const { fieldName, getError } = buildFieldHelpers(form, prefix);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={fieldName("email")}>{t("business.field.email")}</Label>
          <Input
            disabled={disabled}
            id={fieldName("email")}
            placeholder={t("business.field.email_placeholder")}
            {...form.register(fieldName("email") as never)}
          />
          <FieldError message={getError("email")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName("phone")}>{t("business.field.phone")}</Label>
          <Input
            disabled={disabled}
            id={fieldName("phone")}
            placeholder={t("business.field.phone_placeholder")}
            {...form.register(fieldName("phone") as never)}
          />
          <FieldError message={getError("phone")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={fieldName("website")}>
            {t("business.field.website")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("website")}
            placeholder={t("business.field.website_placeholder")}
            {...form.register(fieldName("website") as never)}
          />
          <FieldError message={getError("website")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName("logo_url")}>
            {t("business.field.logo_url")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("logo_url")}
            placeholder={t("business.field.logo_url_placeholder")}
            {...form.register(fieldName("logo_url") as never)}
          />
          <FieldError message={getError("logo_url")} />
        </div>
      </div>
    </div>
  );
}

export function BusinessLocationFields<TFormValues extends FieldValues>({
  disabled,
  form,
  prefix,
}: BusinessFieldsGenericProps<TFormValues>) {
  const { t } = useAppTranslator();
  const { fieldName, getError } = buildFieldHelpers(form, prefix);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={fieldName("address")}>
          {t("business.field.address")}
        </Label>
        <Textarea
          disabled={disabled}
          id={fieldName("address")}
          placeholder={t("business.field.address_placeholder")}
          {...form.register(fieldName("address") as never)}
        />
        <FieldError message={getError("address")} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={fieldName("country")}>
            {t("business.field.country")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("country")}
            placeholder={t("business.field.country_placeholder")}
            {...form.register(fieldName("country") as never)}
          />
          <FieldError message={getError("country")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName("postal_code")}>
            {t("business.field.postal_code")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("postal_code")}
            placeholder={t("business.field.postal_code_placeholder")}
            {...form.register(fieldName("postal_code") as never)}
          />
          <FieldError message={getError("postal_code")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={fieldName("province")}>
            {t("business.field.province")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("province")}
            placeholder={t("business.field.province_placeholder")}
            {...form.register(fieldName("province") as never)}
          />
          <FieldError message={getError("province")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName("canton")}>
            {t("business.field.canton")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("canton")}
            placeholder={t("business.field.canton_placeholder")}
            {...form.register(fieldName("canton") as never)}
          />
          <FieldError message={getError("canton")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName("district")}>
            {t("business.field.district")}
          </Label>
          <Input
            disabled={disabled}
            id={fieldName("district")}
            placeholder={t("business.field.district_placeholder")}
            {...form.register(fieldName("district") as never)}
          />
          <FieldError message={getError("district")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName("city")}>{t("business.field.city")}</Label>
          <Input
            disabled={disabled}
            id={fieldName("city")}
            placeholder={t("business.field.city_placeholder")}
            {...form.register(fieldName("city") as never)}
          />
          <FieldError message={getError("city")} />
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the four business sub-sections wrapped in their own DetailBlocks,
 * preserving the public API used by BusinessSettingsForm,
 * BusinessOnboardingForm and BusinessOnboardingGeneralSection.
 */
function BusinessSectionFields<TFormValues extends FieldValues>({
  disabled,
  form,
  includeCode = true,
  prefix,
}: BusinessSectionFieldsGenericProps<TFormValues>) {
  const { t } = useAppTranslator();

  return (
    <div className="space-y-5">
      <DetailBlock
        title={t("business.identity.title")}
        description={t("business.identity.description")}
      >
        <BusinessIdentityFields
          disabled={disabled}
          form={form}
          includeCode={includeCode}
          prefix={prefix}
        />
      </DetailBlock>

      <DetailBlock
        title={t("business.operational.title")}
        description={t("business.operational.description")}
      >
        <BusinessOperationalFields
          disabled={disabled}
          form={form}
          prefix={prefix}
        />
      </DetailBlock>

      <DetailBlock
        title={t("business.contact.title")}
        description={t("business.contact.description")}
      >
        <BusinessContactFields disabled={disabled} form={form} prefix={prefix} />
      </DetailBlock>

      <DetailBlock
        title={t("business.location.title")}
        description={t("business.location.description")}
      >
        <BusinessLocationFields disabled={disabled} form={form} prefix={prefix} />
      </DetailBlock>
    </div>
  );
}

export { BusinessSectionFields };
