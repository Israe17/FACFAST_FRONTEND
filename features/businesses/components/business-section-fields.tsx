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
import { identificationTypeValues } from "@/shared/lib/validation";

type BusinessSectionFieldsProps = {
  disabled?: boolean;
  includeCode?: boolean;
  prefix?: "business";
};
type BusinessSectionFieldsGenericProps<TFormValues extends FieldValues> =
  BusinessSectionFieldsProps & {
    form: UseFormReturn<TFormValues>;
  };

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function BusinessSectionFields<TFormValues extends FieldValues>({
  disabled,
  form,
  includeCode = true,
  prefix,
}: BusinessSectionFieldsGenericProps<TFormValues>) {
  const fieldName = (name: string) => (prefix ? `${prefix}.${name}` : name);
  const getError = (name: string) =>
    form.getFieldState(fieldName(name) as never).error?.message;
  const isActive = form.watch(fieldName("is_active") as never);

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Identidad del negocio</h3>
          <p className="text-sm text-muted-foreground">
            Datos fiscales y operativos del tenant actual.
          </p>
        </div>

        {includeCode ? (
          <div className="space-y-2">
            <Label htmlFor={fieldName("code")}>Código</Label>
            <Input
              disabled={disabled}
              id={fieldName("code")}
              placeholder="BS-0001"
              {...form.register(fieldName("code") as never)}
            />
            <FieldError message={getError("code")} />
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={fieldName("name")}>Nombre comercial</Label>
            <Input
              disabled={disabled}
              id={fieldName("name")}
              placeholder="FACFAST"
              {...form.register(fieldName("name") as never)}
            />
            <FieldError message={getError("name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldName("legal_name")}>Razón social</Label>
            <Input
              disabled={disabled}
              id={fieldName("legal_name")}
              placeholder="FACFAST Sociedad Anónima"
              {...form.register(fieldName("legal_name") as never)}
            />
            <FieldError message={getError("legal_name")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={fieldName("identification_type")}>Tipo de identificación</Label>
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
                    <SelectValue placeholder="Selecciona un tipo" />
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
            <Label htmlFor={fieldName("identification_number")}>Número de identificación</Label>
            <Input
              disabled={disabled}
              id={fieldName("identification_number")}
              placeholder="3101123456"
              {...form.register(fieldName("identification_number") as never)}
            />
            <FieldError message={getError("identification_number")} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Configuración operativa</h3>
          <p className="text-sm text-muted-foreground">
            Preferencias de idioma, moneda y estado general.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={fieldName("currency_code")}>Moneda</Label>
            <Input
              disabled={disabled}
              id={fieldName("currency_code")}
              placeholder="CRC"
              {...form.register(fieldName("currency_code") as never)}
            />
            <FieldError message={getError("currency_code")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldName("timezone")}>Zona horaria</Label>
            <Input
              disabled={disabled}
              id={fieldName("timezone")}
              placeholder="America/Costa_Rica"
              {...form.register(fieldName("timezone") as never)}
            />
            <FieldError message={getError("timezone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldName("language")}>Idioma</Label>
            <Input
              disabled={disabled}
              id={fieldName("language")}
              placeholder="es-CR"
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
              form.setValue(fieldName("is_active") as never, (checked === true) as never, {
                shouldDirty: true,
              });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">Empresa activa</p>
            <p className="text-sm text-muted-foreground">
              Permite mantener el tenant disponible para operación.
            </p>
          </div>
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Contacto y ubicación</h3>
          <p className="text-sm text-muted-foreground">
            Canales de contacto y localización administrativa.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={fieldName("email")}>Correo</Label>
            <Input
              disabled={disabled}
              id={fieldName("email")}
              placeholder="admin@facfast.com"
              {...form.register(fieldName("email") as never)}
            />
            <FieldError message={getError("email")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldName("phone")}>Teléfono</Label>
            <Input
              disabled={disabled}
              id={fieldName("phone")}
              placeholder="+506 2222-3333"
              {...form.register(fieldName("phone") as never)}
            />
            <FieldError message={getError("phone")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={fieldName("website")}>Sitio web</Label>
            <Input
              disabled={disabled}
              id={fieldName("website")}
              placeholder="https://facfast.com"
              {...form.register(fieldName("website") as never)}
            />
            <FieldError message={getError("website")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldName("logo_url")}>Logo URL</Label>
            <Input
              disabled={disabled}
              id={fieldName("logo_url")}
              placeholder="https://cdn.facfast.com/logo.png"
              {...form.register(fieldName("logo_url") as never)}
            />
            <FieldError message={getError("logo_url")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName("address")}>Dirección</Label>
          <Textarea
            disabled={disabled}
            id={fieldName("address")}
            placeholder="Dirección exacta y referencias"
            {...form.register(fieldName("address") as never)}
          />
          <FieldError message={getError("address")} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={fieldName("country")}>País</Label>
            <Input
              disabled={disabled}
              id={fieldName("country")}
              placeholder="Costa Rica"
              {...form.register(fieldName("country") as never)}
            />
            <FieldError message={getError("country")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldName("postal_code")}>Código postal</Label>
            <Input
              disabled={disabled}
              id={fieldName("postal_code")}
              placeholder="10101"
              {...form.register(fieldName("postal_code") as never)}
            />
            <FieldError message={getError("postal_code")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor={fieldName("province")}>Provincia</Label>
            <Input
              disabled={disabled}
              id={fieldName("province")}
              placeholder="San José"
              {...form.register(fieldName("province") as never)}
            />
            <FieldError message={getError("province")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldName("canton")}>Cantón</Label>
            <Input
              disabled={disabled}
              id={fieldName("canton")}
              placeholder="Central"
              {...form.register(fieldName("canton") as never)}
            />
            <FieldError message={getError("canton")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldName("district")}>Distrito</Label>
            <Input
              disabled={disabled}
              id={fieldName("district")}
              placeholder="Catedral"
              {...form.register(fieldName("district") as never)}
            />
            <FieldError message={getError("district")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldName("city")}>Ciudad</Label>
            <Input
              disabled={disabled}
              id={fieldName("city")}
              placeholder="San José"
              {...form.register(fieldName("city") as never)}
            />
            <FieldError message={getError("city")} />
          </div>
        </div>
      </section>
    </div>
  );
}

export { BusinessSectionFields };
