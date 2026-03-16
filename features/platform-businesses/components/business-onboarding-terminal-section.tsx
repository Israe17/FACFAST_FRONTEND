"use client";

import type { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { PlatformBusinessOnboardingInput } from "../types";

type BusinessOnboardingTerminalSectionProps = {
  form: UseFormReturn<PlatformBusinessOnboardingInput>;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function BusinessOnboardingTerminalSection({
  form,
}: BusinessOnboardingTerminalSectionProps) {
  const getError = (name: string) => form.getFieldState(name as never).error?.message;
  const createInitialTerminal = form.watch("initial_terminal.create_initial_terminal");

  return (
    <section className="space-y-4 rounded-xl border border-border/70 p-4">
      <div className="space-y-1">
        <h3 className="font-semibold">Terminal inicial</h3>
        <p className="text-sm text-muted-foreground">
          La terminal se crea solo si el operador decide incluirla en el onboarding.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
        <Checkbox
          checked={Boolean(createInitialTerminal)}
          onCheckedChange={(checked) => {
            form.setValue("initial_terminal.create_initial_terminal", checked === true, {
              shouldDirty: true,
            });
          }}
        />
        <div className="space-y-1">
          <p className="font-medium">Crear terminal inicial</p>
          <p className="text-sm text-muted-foreground">
            Si la activas, debes indicar nombre y numero de terminal.
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
            <Label htmlFor="initial_terminal.terminal_number">Numero de terminal</Label>
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
  );
}

export { BusinessOnboardingTerminalSection };

