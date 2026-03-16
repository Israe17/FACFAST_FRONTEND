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
import type { BusinessOnboardingInput } from "@/features/businesses/types";
import { ActionButton } from "@/shared/components/action-button";
import { identificationTypeValues } from "@/shared/lib/validation";

import { BusinessSectionFields } from "./business-section-fields";

type BusinessOnboardingFormProps = {
  form: UseFormReturn<BusinessOnboardingInput>;
  isPending?: boolean;
  onSubmit: (values: BusinessOnboardingInput) => Promise<void> | void;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function BusinessOnboardingForm({
  form,
  isPending,
  onSubmit,
}: BusinessOnboardingFormProps) {
  const getError = (name: string) => form.getFieldState(name as never).error?.message;
  const createInitialTerminal = form.watch("initial_terminal.create_initial_terminal");
  const branchIsActive = form.watch("initial_branch.is_active");

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <BusinessSectionFields form={form} includeCode={false} prefix="business" />

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Propietario inicial</h3>
          <p className="text-sm text-muted-foreground">
            Credenciales del usuario administrador creado durante el onboarding.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="owner.owner_name">Nombre</Label>
            <Input
              id="owner.owner_name"
              placeholder="Ana"
              {...form.register("owner.owner_name")}
            />
            <FieldError message={getError("owner.owner_name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner.owner_last_name">Apellido</Label>
            <Input
              id="owner.owner_last_name"
              placeholder="Ramírez"
              {...form.register("owner.owner_last_name")}
            />
            <FieldError message={getError("owner.owner_last_name")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="owner.owner_email">Correo</Label>
            <Input
              id="owner.owner_email"
              placeholder="owner@empresa.com"
              {...form.register("owner.owner_email")}
            />
            <FieldError message={getError("owner.owner_email")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner.owner_password">Contraseña</Label>
            <Input
              id="owner.owner_password"
              placeholder="Mínimo 10 caracteres"
              type="password"
              {...form.register("owner.owner_password")}
            />
            <FieldError message={getError("owner.owner_password")} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Sucursal inicial</h3>
          <p className="text-sm text-muted-foreground">
            Se crea junto con la empresa dentro del flujo transaccional de onboarding.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="initial_branch.branch_name">Nombre de sucursal</Label>
            <Input
              id="initial_branch.branch_name"
              placeholder="Casa Matriz"
              {...form.register("initial_branch.branch_name")}
            />
            <FieldError message={getError("initial_branch.branch_name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial_branch.branch_number">Número de sucursal</Label>
            <Input
              id="initial_branch.branch_number"
              placeholder="001"
              {...form.register("initial_branch.branch_number")}
            />
            <FieldError message={getError("initial_branch.branch_number")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="initial_branch.branch_identification_type">
              Tipo de identificación
            </Label>
            <Controller
              control={form.control}
              name={"initial_branch.branch_identification_type"}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger id="initial_branch.branch_identification_type">
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
            <FieldError message={getError("initial_branch.branch_identification_type")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial_branch.branch_identification_number">
              Número de identificación
            </Label>
            <Input
              id="initial_branch.branch_identification_number"
              placeholder="3101123456"
              {...form.register("initial_branch.branch_identification_number")}
            />
            <FieldError message={getError("initial_branch.branch_identification_number")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="initial_branch.branch_email">Correo de sucursal</Label>
            <Input
              id="initial_branch.branch_email"
              placeholder="sucursal@empresa.com"
              {...form.register("initial_branch.branch_email")}
            />
            <FieldError message={getError("initial_branch.branch_email")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial_branch.branch_phone">Teléfono</Label>
            <Input
              id="initial_branch.branch_phone"
              placeholder="+506 2222-3333"
              {...form.register("initial_branch.branch_phone")}
            />
            <FieldError message={getError("initial_branch.branch_phone")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="initial_branch.branch_address">Dirección</Label>
          <Textarea
            id="initial_branch.branch_address"
            placeholder="Dirección exacta y referencias"
            {...form.register("initial_branch.branch_address")}
          />
          <FieldError message={getError("initial_branch.branch_address")} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="initial_branch.branch_province">Provincia</Label>
            <Input
              id="initial_branch.branch_province"
              placeholder="San José"
              {...form.register("initial_branch.branch_province")}
            />
            <FieldError message={getError("initial_branch.branch_province")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial_branch.branch_canton">Cantón</Label>
            <Input
              id="initial_branch.branch_canton"
              placeholder="Escazú"
              {...form.register("initial_branch.branch_canton")}
            />
            <FieldError message={getError("initial_branch.branch_canton")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial_branch.branch_district">Distrito</Label>
            <Input
              id="initial_branch.branch_district"
              placeholder="San Rafael"
              {...form.register("initial_branch.branch_district")}
            />
            <FieldError message={getError("initial_branch.branch_district")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial_branch.branch_city">Ciudad</Label>
            <Input
              id="initial_branch.branch_city"
              placeholder="San José"
              {...form.register("initial_branch.branch_city")}
            />
            <FieldError message={getError("initial_branch.branch_city")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="initial_branch.activity_code">Código de actividad</Label>
            <Input
              id="initial_branch.activity_code"
              placeholder="123456"
              {...form.register("initial_branch.activity_code")}
            />
            <FieldError message={getError("initial_branch.activity_code")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial_branch.provider_code">Código de proveedor</Label>
            <Input
              id="initial_branch.provider_code"
              placeholder="PROV-01"
              {...form.register("initial_branch.provider_code")}
            />
            <FieldError message={getError("initial_branch.provider_code")} />
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(branchIsActive)}
            onCheckedChange={(checked) => {
              form.setValue("initial_branch.is_active", checked === true, {
                shouldDirty: true,
              });
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">Sucursal activa</p>
            <p className="text-sm text-muted-foreground">
              Mantén activa la sucursal inicial para empezar a operar.
            </p>
          </div>
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-border/70 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Terminal inicial</h3>
          <p className="text-sm text-muted-foreground">
            Puedes crear la primera terminal durante el onboarding o dejarla para después.
          </p>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
          <Checkbox
            checked={Boolean(createInitialTerminal)}
            onCheckedChange={(checked) => {
              form.setValue(
                "initial_terminal.create_initial_terminal",
                checked === true,
                { shouldDirty: true },
              );
            }}
          />
          <div className="space-y-1">
            <p className="font-medium">Crear terminal inicial</p>
            <p className="text-sm text-muted-foreground">
              Si la activas, debes indicar nombre y número de terminal.
            </p>
          </div>
        </label>

        {createInitialTerminal ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="initial_terminal.terminal_name">Nombre de terminal</Label>
              <Input
                id="initial_terminal.terminal_name"
                placeholder="Caja principal"
                {...form.register("initial_terminal.terminal_name")}
              />
              <FieldError message={getError("initial_terminal.terminal_name")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial_terminal.terminal_number">Número de terminal</Label>
              <Input
                id="initial_terminal.terminal_number"
                placeholder="00001"
                {...form.register("initial_terminal.terminal_number")}
              />
              <FieldError message={getError("initial_terminal.terminal_number")} />
            </div>
          </div>
        ) : null}
      </section>

      <div className="flex justify-end">
        <ActionButton isLoading={isPending} loadingText="Creando" type="submit">
          Crear empresa
        </ActionButton>
      </div>
    </form>
  );
}

export { BusinessOnboardingForm };
