"use client";

import { useEffect } from "react";
import { ArrowRightLeft, Building2, GitBranch, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  usePlatformBusinessBranchesQuery,
  usePlatformBusinessesQuery,
} from "@/features/platform-businesses/queries";
import { ActionButton } from "@/shared/components/action-button";
import { buildFormResolver } from "@/shared/lib/form-resolver";

import { useEnterTenantContextMutation } from "../queries";
import { enterTenantContextSchema } from "../schemas";
import type { EnterTenantContextInput, EnterTenantContextPayload } from "../types";
import { BranchSelector } from "./branch-selector";
import { BusinessSelector, getBusinessLabel } from "./business-selector";
import { TenantContextSummary } from "./tenant-context-summary";

const defaultValues: EnterTenantContextInput = {
  branch_id: "",
  business_id: "",
};

function EnterTenantContextForm() {
  const searchParams = useSearchParams();
  const enterContextMutation = useEnterTenantContextMutation();
  const businessesQuery = usePlatformBusinessesQuery(true);
  const form = useForm<EnterTenantContextInput>({
    defaultValues,
    resolver: buildFormResolver<EnterTenantContextInput>(enterTenantContextSchema),
  });
  const business_id = useWatch({
    control: form.control,
    name: "business_id",
  });
  const branch_id = useWatch({
    control: form.control,
    name: "branch_id",
  });
  const branchesQuery = usePlatformBusinessBranchesQuery(
    business_id ?? "",
    Boolean(business_id),
  );
  const selectedBusiness =
    businessesQuery.data?.find((business) => business.id === business_id) ?? null;
  const selectedBranch =
    branchesQuery.data?.find((branch) => branch.id === branch_id) ?? null;

  useEffect(() => {
    const businessIdFromQuery = searchParams.get("businessId");

    if (!businessIdFromQuery) {
      return;
    }

    form.setValue("business_id", businessIdFromQuery, {
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [form, searchParams]);

  useEffect(() => {
    if (!business_id) {
      form.setValue("branch_id", "", { shouldDirty: false, shouldTouch: false });
      return;
    }

    if (!branch_id) {
      return;
    }

    const branchStillExists = branchesQuery.data?.some((branch) => branch.id === branch_id) ?? false;

    if (!branchStillExists) {
      form.setValue("branch_id", "", { shouldDirty: false, shouldTouch: false });
    }
  }, [branch_id, branchesQuery.data, business_id, form]);

  async function handleSubmit(values: EnterTenantContextInput) {
    const payload: EnterTenantContextPayload = {
      business_id: Number(values.business_id),
      branch_id: values.branch_id ? Number(values.branch_id) : undefined,
    };

    try {
      await enterContextMutation.mutateAsync(payload);
    } catch {}
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <Card className="border-border/70 bg-card/95">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
            <ShieldCheck className="size-4" />
            Platform to tenant context
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Entrar a empresa</CardTitle>
            <CardDescription>
              Selecciona la empresa obligatoria y una sucursal opcional para operar dentro del
              dashboard normal.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="business_id">Empresa</Label>
              <BusinessSelector
                businesses={businessesQuery.data ?? []}
                isLoading={businessesQuery.isLoading}
                onValueChange={(value) =>
                  form.setValue("business_id", value, { shouldDirty: true })
                }
                value={business_id ?? ""}
              />
              {form.formState.errors.business_id ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.business_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch_id">Sucursal</Label>
              <BranchSelector
                branches={branchesQuery.data ?? []}
                disabled={!business_id}
                isLoading={branchesQuery.isLoading}
                onValueChange={(value) => form.setValue("branch_id", value, { shouldDirty: true })}
                value={branch_id}
              />
              <p className="text-sm text-muted-foreground">
                Si no eliges una sucursal, operaras a nivel empresa dentro del tenant.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Building2 className="size-4 text-muted-foreground" />
                  Empresa elegida
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedBusiness ? getBusinessLabel(selectedBusiness) : "Pendiente"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GitBranch className="size-4 text-muted-foreground" />
                  Sucursal elegida
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedBranch?.name ?? "Nivel empresa"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ArrowRightLeft className="size-4 text-muted-foreground" />
                  Resultado
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Dashboard tenant normal con sesion refrescada por `/auth/me`.
                </p>
              </div>
            </div>

            <ActionButton
              className="w-full sm:w-auto"
              icon={ArrowRightLeft}
              isLoading={enterContextMutation.isPending}
              loadingText="Entrando"
              type="submit"
            >
              Entrar a empresa
            </ActionButton>
          </form>
        </CardContent>
      </Card>

      <TenantContextSummary
        branchId={selectedBranch?.id ?? null}
        branchName={selectedBranch?.name ?? null}
        businessId={selectedBusiness?.id ?? null}
        businessName={selectedBusiness ? getBusinessLabel(selectedBusiness) : null}
        mode={selectedBusiness ? "tenant_context" : "platform"}
      />
    </div>
  );
}

export { EnterTenantContextForm };
