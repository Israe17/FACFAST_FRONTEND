"use client";

import { useEffect } from "react";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCantonsQuery,
  useCountriesQuery,
  useDistrictsQuery,
  useProvincesQuery,
} from "@/features/regions/queries";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

type RegionFields<TForm extends FieldValues> = {
  countryId: FieldPath<TForm>;
  provinceId: FieldPath<TForm>;
  cantonId: FieldPath<TForm>;
  districtId: FieldPath<TForm>;
};

type RegionPickerProps<TForm extends FieldValues> = {
  form: UseFormReturn<TForm>;
  fields: RegionFields<TForm>;
  /** When set, the country dropdown is hidden and the value is locked. */
  lockedCountryId?: number | null;
  disabled?: boolean;
  /** Override the prefix used to derive HTML ids for the selects. */
  idPrefix?: string;
};

const toFormValue = (value: number | null) =>
  value as unknown as Parameters<UseFormReturn<FieldValues>["setValue"]>[1];

function RegionPicker<TForm extends FieldValues>({
  form,
  fields,
  lockedCountryId,
  disabled,
  idPrefix = "region",
}: RegionPickerProps<TForm>) {
  const { t } = useAppTranslator();
  const countryId = form.watch(fields.countryId) as number | null | undefined;
  const provinceId = form.watch(fields.provinceId) as number | null | undefined;
  const cantonId = form.watch(fields.cantonId) as number | null | undefined;

  const countriesQuery = useCountriesQuery(lockedCountryId == null);
  const provincesQuery = useProvincesQuery(countryId ?? null);
  const cantonsQuery = useCantonsQuery(provinceId ?? null);
  const districtsQuery = useDistrictsQuery(cantonId ?? null);

  useEffect(() => {
    if (lockedCountryId != null && countryId !== lockedCountryId) {
      form.setValue(fields.countryId, toFormValue(lockedCountryId), {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [lockedCountryId, countryId, fields.countryId, form]);

  const handleCountryChange = (value: string) => {
    const parsed = value ? Number(value) : null;
    form.setValue(fields.countryId, toFormValue(parsed), { shouldDirty: true });
    form.setValue(fields.provinceId, toFormValue(null), { shouldDirty: true });
    form.setValue(fields.cantonId, toFormValue(null), { shouldDirty: true });
    form.setValue(fields.districtId, toFormValue(null), { shouldDirty: true });
  };

  const handleProvinceChange = (value: string) => {
    const parsed = value ? Number(value) : null;
    form.setValue(fields.provinceId, toFormValue(parsed), { shouldDirty: true });
    form.setValue(fields.cantonId, toFormValue(null), { shouldDirty: true });
    form.setValue(fields.districtId, toFormValue(null), { shouldDirty: true });
  };

  const handleCantonChange = (value: string) => {
    const parsed = value ? Number(value) : null;
    form.setValue(fields.cantonId, toFormValue(parsed), { shouldDirty: true });
    form.setValue(fields.districtId, toFormValue(null), { shouldDirty: true });
  };

  const showCountry = lockedCountryId == null;
  const provinceDisabled = disabled || countryId == null;
  const cantonDisabled = disabled || provinceId == null;
  const districtDisabled = disabled || cantonId == null;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {showCountry ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-country`}>{t("region.country")}</Label>
          <Controller
            control={form.control}
            name={fields.countryId}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={handleCountryChange}
                disabled={disabled || countriesQuery.isLoading}
              >
                <SelectTrigger id={`${idPrefix}-country`}>
                  <SelectValue
                    placeholder={
                      countriesQuery.isLoading
                        ? t("region.loading")
                        : t("region.select_placeholder")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(countriesQuery.data ?? []).map((country) => (
                    <SelectItem key={country.id} value={String(country.id)}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-province`}>{t("region.province")}</Label>
        <Controller
          control={form.control}
          name={fields.provinceId}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={handleProvinceChange}
              disabled={provinceDisabled}
            >
              <SelectTrigger id={`${idPrefix}-province`}>
                <SelectValue
                  placeholder={
                    countryId == null
                      ? t("region.parent_required")
                      : provincesQuery.isLoading
                        ? t("region.loading")
                        : (provincesQuery.data?.length ?? 0) === 0
                          ? t("region.empty")
                          : t("region.select_placeholder")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(provincesQuery.data ?? []).map((province) => (
                  <SelectItem key={province.id} value={String(province.id)}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-canton`}>{t("region.canton")}</Label>
        <Controller
          control={form.control}
          name={fields.cantonId}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={handleCantonChange}
              disabled={cantonDisabled}
            >
              <SelectTrigger id={`${idPrefix}-canton`}>
                <SelectValue
                  placeholder={
                    provinceId == null
                      ? t("region.parent_required")
                      : cantonsQuery.isLoading
                        ? t("region.loading")
                        : (cantonsQuery.data?.length ?? 0) === 0
                          ? t("region.empty")
                          : t("region.select_placeholder")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(cantonsQuery.data ?? []).map((canton) => (
                  <SelectItem key={canton.id} value={String(canton.id)}>
                    {canton.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-district`}>{t("region.district")}</Label>
        <Controller
          control={form.control}
          name={fields.districtId}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={(value) =>
                form.setValue(
                  fields.districtId,
                  toFormValue(value ? Number(value) : null),
                  { shouldDirty: true },
                )
              }
              disabled={districtDisabled}
            >
              <SelectTrigger id={`${idPrefix}-district`}>
                <SelectValue
                  placeholder={
                    cantonId == null
                      ? t("region.parent_required")
                      : districtsQuery.isLoading
                        ? t("region.loading")
                        : (districtsQuery.data?.length ?? 0) === 0
                          ? t("region.empty")
                          : t("region.select_placeholder")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(districtsQuery.data ?? []).map((district) => (
                  <SelectItem key={district.id} value={String(district.id)}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
}

export { RegionPicker };
