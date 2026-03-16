"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/features/auth/api";
import { sessionQueryKey } from "@/features/auth/queries";
import { loginSchema } from "@/features/auth/schemas";
import type { LoginInput } from "@/features/auth/types";
import { getLandingRoute } from "@/features/auth/utils";
import { ActionButton } from "@/shared/components/action-button";
import { buildFormResolver } from "@/shared/lib/form-resolver";
import { getErrorMessage } from "@/shared/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: buildFormResolver<LoginInput>(loginSchema),
  });

  useEffect(() => {
    const email = searchParams.get("email");

    if (email) {
      form.setValue("email", email, { shouldDirty: false });
    }
  }, [form, searchParams]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session);
      router.replace(getLandingRoute(session));
      router.refresh();
    },
    onError: (error) => {
      setSubmitError(getErrorMessage(error, "No fue posible iniciar sesión."));
    },
  });

  const { errors } = form.formState;

  async function onSubmit(values: LoginInput) {
    setSubmitError(null);

    try {
      await loginMutation.mutateAsync(values);
    } catch {}
  }

  return (
    <Card className="border-border/70 bg-card/95 shadow-xl shadow-primary/5">
      <CardHeader className="border-b-0 pb-2">
        <CardTitle className="text-2xl">Acceso administrativo</CardTitle>
        <CardDescription>
          Inicia sesión con tu cuenta actual. La sesión se mantiene con cookies HttpOnly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                autoComplete="email"
                className="pl-9"
                placeholder="admin@facfast.com"
                {...form.register("email")}
              />
            </div>
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                autoComplete="current-password"
                className="pl-9"
                placeholder="Ingresa tu contraseña"
                type="password"
                {...form.register("password")}
              />
            </div>
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          {submitError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}

          <ActionButton
            className="w-full"
            isLoading={loginMutation.isPending}
            loadingText="Ingresando"
            type="submit"
          >
            Entrar
          </ActionButton>
        </form>

        <div className="mt-6 rounded-xl border border-dashed border-border/80 bg-muted/40 p-4 text-sm text-muted-foreground">
          El onboarding de nuevas empresas ahora vive dentro del panel de plataforma para usuarios
          con acceso super admin.
        </div>
      </CardContent>
    </Card>
  );
}

export { LoginForm };
