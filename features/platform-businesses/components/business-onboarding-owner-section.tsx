"use client";

import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { PlatformBusinessOnboardingInput } from "../types";

type BusinessOnboardingOwnerSectionProps = {
  form: UseFormReturn<PlatformBusinessOnboardingInput>;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function BusinessOnboardingOwnerSection({
  form,
}: BusinessOnboardingOwnerSectionProps) {
  const getError = (name: string) => form.getFieldState(name as never).error?.message;

  return (
    <section className="space-y-4 rounded-xl border border-border/70 p-4">
      <div className="space-y-1">
        <h3 className="font-semibold">Owner</h3>
        <p className="text-sm text-muted-foreground">
          Usuario administrador inicial de la empresa creada desde plataforma.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="owner.owner_name">Nombre</Label>
          <Input id="owner.owner_name" placeholder="Ana" {...form.register("owner.owner_name")} />
          <FieldError message={getError("owner.owner_name")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner.owner_last_name">Apellido</Label>
          <Input
            id="owner.owner_last_name"
            placeholder="Ramirez"
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
            placeholder="Minimo 10 caracteres"
            type="password"
            {...form.register("owner.owner_password")}
          />
          <FieldError message={getError("owner.owner_password")} />
        </div>
      </div>
    </section>
  );
}

export { BusinessOnboardingOwnerSection };

