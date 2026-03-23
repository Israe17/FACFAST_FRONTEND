"use client";

import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import {
  saleModeValues,
  fulfillmentModeValues,
  deliveryChargeTypeValues,
} from "../constants";
import {
  emptySaleOrderLineFormValues,
  emptySaleOrderDeliveryChargeFormValues,
} from "../form-values";
import type { CreateSaleOrderInput } from "../types";
import { FormFieldError } from "@/features/inventory/components/form-field-error";

type SaleOrderFormProps = {
  form: UseFormReturn<CreateSaleOrderInput>;
  formError?: string | null;
  isPending?: boolean;
  onSubmit: (values: CreateSaleOrderInput) => Promise<void> | void;
  submitLabel: string;
};

function SaleOrderForm({
  form,
  formError,
  isPending,
  onSubmit,
  submitLabel,
}: SaleOrderFormProps) {
  const { t } = useAppTranslator();
  const {
    formState: { errors },
    control,
    register,
    watch,
  } = form;

  const fulfillmentMode = watch("fulfillment_mode");

  const {
    fields: lineFields,
    append: appendLine,
    remove: removeLine,
  } = useFieldArray({ control, name: "lines" });

  const {
    fields: chargeFields,
    append: appendCharge,
    remove: removeCharge,
  } = useFieldArray({ control, name: "delivery_charges" });

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorBanner message={formError} />

      {/* Basic fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="so-code">{t("sales.form.code")}</Label>
          <Input id="so-code" placeholder="SO-0001" {...register("code")} />
          <FormFieldError message={errors.code?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="so-order-date">{t("sales.form.order_date")}</Label>
          <Input
            id="so-order-date"
            type="date"
            {...register("order_date")}
          />
          <FormFieldError message={errors.order_date?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="so-sale-mode">{t("sales.form.sale_mode")}</Label>
          <Controller
            control={control}
            name="sale_mode"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="so-sale-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {saleModeValues.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.sale_mode?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="so-fulfillment-mode">
            {t("sales.form.fulfillment_mode")}
          </Label>
          <Controller
            control={control}
            name="fulfillment_mode"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="so-fulfillment-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fulfillmentModeValues.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormFieldError message={errors.fulfillment_mode?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="so-branch-id">{t("sales.form.branch_id")}</Label>
          <Input
            id="so-branch-id"
            placeholder="1"
            {...register("branch_id")}
          />
          <FormFieldError message={errors.branch_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="so-customer-contact-id">
            {t("sales.form.customer_contact_id")}
          </Label>
          <Input
            id="so-customer-contact-id"
            placeholder="1"
            {...register("customer_contact_id")}
          />
          <FormFieldError message={errors.customer_contact_id?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="so-seller-user-id">
            {t("sales.form.seller_user_id")}
          </Label>
          <Input
            id="so-seller-user-id"
            placeholder=""
            {...register("seller_user_id")}
          />
          <FormFieldError message={errors.seller_user_id?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="so-warehouse-id">
            {t("sales.form.warehouse_id")}
          </Label>
          <Input
            id="so-warehouse-id"
            placeholder=""
            {...register("warehouse_id")}
          />
          <FormFieldError message={errors.warehouse_id?.message} />
        </div>
      </div>

      {/* Delivery fields (conditional) */}
      {fulfillmentMode === "delivery" && (
        <div className="space-y-4 rounded-xl border border-border/70 p-4">
          <h3 className="font-medium">{t("sales.fulfillment_delivery")}</h3>

          <div className="space-y-2">
            <Label htmlFor="so-delivery-address">
              {t("sales.form.delivery_address")}
            </Label>
            <Input
              id="so-delivery-address"
              {...register("delivery_address")}
            />
            <FormFieldError message={errors.delivery_address?.message} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="so-delivery-province">
                {t("sales.form.delivery_province")}
              </Label>
              <Input
                id="so-delivery-province"
                {...register("delivery_province")}
              />
              <FormFieldError message={errors.delivery_province?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="so-delivery-canton">
                {t("sales.form.delivery_canton")}
              </Label>
              <Input
                id="so-delivery-canton"
                {...register("delivery_canton")}
              />
              <FormFieldError message={errors.delivery_canton?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="so-delivery-district">
                {t("sales.form.delivery_district")}
              </Label>
              <Input
                id="so-delivery-district"
                {...register("delivery_district")}
              />
              <FormFieldError message={errors.delivery_district?.message} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="so-delivery-zone-id">
                {t("sales.form.delivery_zone_id")}
              </Label>
              <Input
                id="so-delivery-zone-id"
                {...register("delivery_zone_id")}
              />
              <FormFieldError message={errors.delivery_zone_id?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="so-delivery-requested-date">
                {t("sales.form.delivery_requested_date")}
              </Label>
              <Input
                id="so-delivery-requested-date"
                type="date"
                {...register("delivery_requested_date")}
              />
              <FormFieldError
                message={errors.delivery_requested_date?.message}
              />
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="so-notes">{t("sales.form.notes")}</Label>
          <Textarea id="so-notes" {...register("notes")} />
          <FormFieldError message={errors.notes?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="so-internal-notes">
            {t("sales.form.internal_notes")}
          </Label>
          <Textarea id="so-internal-notes" {...register("internal_notes")} />
          <FormFieldError message={errors.internal_notes?.message} />
        </div>
      </div>

      {/* Order Lines */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t("sales.form.lines")}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendLine(emptySaleOrderLineFormValues)}
          >
            <Plus className="size-4" />
            {t("sales.form.add_line")}
          </Button>
        </div>

        {errors.lines?.message && (
          <FormFieldError message={errors.lines.message} />
        )}

        {lineFields.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.product_variant_id")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.quantity")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.unit_price")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.discount_percent")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.tax_amount")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {lineFields.map((field, index) => (
                  <tr key={field.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2">
                      <Input
                        {...register(`lines.${index}.product_variant_id`)}
                        placeholder="1"
                        className="h-8"
                      />
                      <FormFieldError
                        message={
                          errors.lines?.[index]?.product_variant_id?.message
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        {...register(`lines.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="any"
                        className="h-8"
                      />
                      <FormFieldError
                        message={errors.lines?.[index]?.quantity?.message}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        {...register(`lines.${index}.unit_price`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="any"
                        className="h-8"
                      />
                      <FormFieldError
                        message={errors.lines?.[index]?.unit_price?.message}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        {...register(`lines.${index}.discount_percent`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="any"
                        className="h-8"
                      />
                      <FormFieldError
                        message={
                          errors.lines?.[index]?.discount_percent?.message
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        {...register(`lines.${index}.tax_amount`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="any"
                        className="h-8"
                      />
                      <FormFieldError
                        message={errors.lines?.[index]?.tax_amount?.message}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeLine(index)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery Charges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t("sales.form.delivery_charges")}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendCharge(emptySaleOrderDeliveryChargeFormValues)}
          >
            <Plus className="size-4" />
            {t("sales.form.add_charge")}
          </Button>
        </div>

        {chargeFields.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.charge_type")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.amount")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("sales.form.notes")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {chargeFields.map((field, index) => (
                  <tr key={field.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2">
                      <Controller
                        control={control}
                        name={`delivery_charges.${index}.charge_type`}
                        render={({ field: selectField }) => (
                          <Select
                            onValueChange={selectField.onChange}
                            value={selectField.value}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {deliveryChargeTypeValues.map((ct) => (
                                <SelectItem key={ct} value={ct}>
                                  {ct}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FormFieldError
                        message={
                          errors.delivery_charges?.[index]?.charge_type?.message
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        {...register(`delivery_charges.${index}.amount`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="any"
                        className="h-8"
                      />
                      <FormFieldError
                        message={
                          errors.delivery_charges?.[index]?.amount?.message
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        {...register(`delivery_charges.${index}.notes`)}
                        className="h-8"
                      />
                      <FormFieldError
                        message={
                          errors.delivery_charges?.[index]?.notes?.message
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeCharge(index)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText={t("common.saving")} type="submit">
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}

export { SaleOrderForm };
export type { SaleOrderFormProps };
