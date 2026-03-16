"use client";

import { useRouter } from "next/navigation";
import { Building2, ClipboardCheck, Store } from "lucide-react";
import { useForm } from "react-hook-form";

import { CreateBusinessOnboardingForm } from "@/features/platform-businesses/components/create-business-onboarding-form";
import { useCreatePlatformBusinessOnboardingMutation } from "@/features/platform-businesses/queries";
import { platformBusinessOnboardingSchema } from "@/features/platform-businesses/schemas";
import type { PlatformBusinessOnboardingInput } from "@/features/platform-businesses/types";
import { DataCard } from "@/shared/components/data-card";
import { PageHeader } from "@/shared/components/page-header";
import { buildFormResolver } from "@/shared/lib/form-resolver";
import { APP_ROUTES } from "@/shared/lib/routes";

const defaultValues: PlatformBusinessOnboardingInput = {
  business: {
    address: "",
    canton: "",
    city: "",
    country: "Costa Rica",
    currency_code: "CRC",
    district: "",
    email: "",
    identification_number: "",
    identification_type: "02",
    is_active: true,
    language: "es-CR",
    legal_name: "",
    logo_url: "",
    name: "",
    phone: "",
    postal_code: "",
    province: "",
    timezone: "America/Costa_Rica",
    website: "",
  },
  initial_branch: {
    activity_code: "",
    branch_address: "",
    branch_canton: "",
    branch_city: "",
    branch_district: "",
    branch_email: "",
    branch_identification_number: "",
    branch_identification_type: "02",
    branch_name: "",
    branch_number: "001",
    branch_phone: "",
    branch_province: "",
    is_active: true,
    provider_code: "",
  },
  initial_terminal: {
    create_initial_terminal: false,
    terminal_name: "",
    terminal_number: "",
  },
  owner: {
    owner_email: "",
    owner_last_name: "",
    owner_name: "",
    owner_password: "",
  },
};

export default function SuperadminBusinessNewPage() {
  const router = useRouter();
  const createBusinessMutation = useCreatePlatformBusinessOnboardingMutation();
  const form = useForm<PlatformBusinessOnboardingInput>({
    defaultValues,
    resolver: buildFormResolver<PlatformBusinessOnboardingInput>(
      platformBusinessOnboardingSchema,
    ),
  });

  async function handleSubmit(values: PlatformBusinessOnboardingInput) {
    try {
      await createBusinessMutation.mutateAsync(values);
      router.replace(APP_ROUTES.superadminBusinesses);
    } catch {}
  }

  return (
    <>
      <PageHeader
        description="Onboarding transaccional para crear empresa, owner, sucursal inicial y terminal opcional."
        eyebrow="Platform"
        title="New Business"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DataCard
          description="Datos base del tenant y configuración global."
          icon={<Building2 className="size-5" />}
          title="Empresa"
          value="General"
        />
        <DataCard
          description="Credenciales del owner inicial y activación del negocio."
          icon={<ClipboardCheck className="size-5" />}
          title="Owner"
          value="Required"
        />
        <DataCard
          description="Sucursal inicial y terminal opcional en el mismo flujo."
          icon={<Store className="size-5" />}
          title="Bootstrap"
          value="Branch + Terminal"
        />
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <CreateBusinessOnboardingForm
          form={form}
          isPending={createBusinessMutation.isPending}
          onSubmit={handleSubmit}
        />
      </section>
    </>
  );
}

