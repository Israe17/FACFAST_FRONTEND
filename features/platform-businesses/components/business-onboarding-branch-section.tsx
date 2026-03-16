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
import { identificationTypeValues } from "@/shared/lib/validation";

import type { PlatformBusinessOnboardingInput } from "../types";

type BusinessOnboardingBranchSectionProps = {
  form: UseFormReturn<PlatformBusinessOnboardingInput>;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function BusinessOnboardingBranchSection({
  form,
}: BusinessOnboardingBranchSectionProps) {
  const getError = (name: string) => form.getFieldState(name as never).error?.message;
  const isActive = form.watch("initial_branch.is_active");

  return (
    <section className="space-y-4 rounded-xl border border-border/70 p-4">
      <div className="space-y-1">
        <h3 className="font-semibold">Sucursal inicial</h3>
        <p className="text-sm text-muted-foreground">
          Primera sucursal creada dentro del onboarding transaccional.
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
          <Label htmlFor="initial_branch.branch_number">Numero de sucursal</Label>
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
            Tipo de identificacion
          </Label>
          <Controller
            control={form.control}
            name="initial_branch.branch_identification_type"
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
            Numero de identificacion
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
          <Label htmlFor="initial_branch.branch_phone">Telefono</Label>
          <Input
            id="initial_branch.branch_phone"
            placeholder="+506 2222-3333"
            {...form.register("initial_branch.branch_phone")}
          />
          <FieldError message={getError("initial_branch.branch_phone")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="initial_branch.branch_address">Direccion</Label>
        <Textarea
          id="initial_branch.branch_address"
          placeholder="Direccion exacta y referencias"
          {...form.register("initial_branch.branch_address")}
        />
        <FieldError message={getError("initial_branch.branch_address")} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="initial_branch.branch_province">Provincia</Label>
          <Input
            id="initial_branch.branch_province"
            placeholder="San Jose"
            {...form.register("initial_branch.branch_province")}
          />
          <FieldError message={getError("initial_branch.branch_province")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="initial_branch.branch_canton">Canton</Label>
          <Input
            id="initial_branch.branch_canton"
            placeholder="Escazu"
            {...form.register("initial_branch.branch_canton")}
          />
          <FieldError message={getError("initial_branch.branch_canton")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="initial_branch.branch_district">District</Label>
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
            placeholder="San Jose"
            {...form.register("initial_branch.branch_city")}
          />
          <FieldError message={getError("initial_branch.branch_city")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="initial_branch.activity_code">Activity code</Label>
          <Input
            id="initial_branch.activity_code"
            placeholder="123456"
            {...form.register("initial_branch.activity_code")}
          />
          <FieldError message={getError("initial_branch.activity_code")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="initial_branch.provider_code">Provider code</Label>
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
          checked={Boolean(isActive)}
          onCheckedChange={(checked) => {
            form.setValue("initial_branch.is_active", checked === true, {
              shouldDirty: true,
            });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">Sucursal activa</p>
          <p className="text-sm text-muted-foreground">
            Mantiene la sucursal inicial lista para operar desde el primer login.
          </p>
        </div>
      </label>
    </section>
  );
}

export { BusinessOnboardingBranchSection };
