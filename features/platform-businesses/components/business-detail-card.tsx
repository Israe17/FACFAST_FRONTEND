"use client";

import type { ReactNode } from "react";
import {
  Building2,
  Landmark,
  Mail,
  MapPin,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDateTime, getInitials } from "@/shared/lib/utils";

import type { PlatformBusinessDetail } from "../types";

type FieldProps = {
  label: string;
  value?: string | null | boolean;
};

function resolveValue(value?: string | null | boolean) {
  if (typeof value === "boolean") {
    return value ? "Activo" : "Inactivo";
  }

  return value || "No disponible";
}

function InfoRow({ label, value }: FieldProps) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start sm:gap-4">
      <p className="text-[0.72rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="break-words text-sm leading-6 text-foreground">{resolveValue(value)}</p>
    </div>
  );
}

function SummaryItem({ label, value }: FieldProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/35 px-4 py-3">
      <p className="text-[0.7rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium leading-6 text-foreground">{resolveValue(value)}</p>
    </div>
  );
}

function SectionBlock({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-background/60 p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-[0.08em] uppercase">{title}</h3>
      </div>
      <div className="divide-y divide-border/60">{children}</div>
    </section>
  );
}

function StatusBadge({ active }: { active?: boolean }) {
  return (
    <Badge
      className={
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-100 text-zinc-700"
      }
      variant="outline"
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

type BusinessDetailCardProps = {
  business: PlatformBusinessDetail;
};

function BusinessDetailCard({ business }: BusinessDetailCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border/70 px-6 py-6 sm:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.45fr)] xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-primary/8 text-base font-semibold text-primary">
              {getInitials(business.name ?? business.code ?? business.id)}
            </div>

            <div className="min-w-0 space-y-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {business.name ?? "Business"}
                  </h2>
                  <StatusBadge active={business.is_active} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {business.legal_name ?? "Sin razon social"}
                </p>
              </div>

              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Registro corporativo visible desde plataforma para control administrativo,
                validacion fiscal y referencia operacional.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryItem label="Business ID" value={business.id} />
            <SummaryItem label="Creado" value={formatDateTime(business.created_at)} />
            <SummaryItem label="Actualizado" value={formatDateTime(business.updated_at)} />
            <SummaryItem label="Idioma base" value={business.language} />
            <SummaryItem label="Moneda operativa" value={business.currency_code} />
            <SummaryItem label="Timezone" value={business.timezone} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 sm:px-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-6">
          <SectionBlock icon={Building2} title="Informacion corporativa">
            <InfoRow label="Nombre comercial" value={business.name} />
            <InfoRow label="Razon social" value={business.legal_name} />
            <InfoRow label="Codigo" value={business.code} />
            <InfoRow label="Estado general" value={business.is_active} />
          </SectionBlock>

          <SectionBlock icon={MapPin} title="Direccion fiscal">
            <InfoRow label="Pais" value={business.country} />
            <InfoRow label="Provincia" value={business.province} />
            <InfoRow label="Canton" value={business.canton} />
            <InfoRow label="Distrito" value={business.district} />
            <InfoRow label="Ciudad" value={business.city} />
            <InfoRow label="Codigo postal" value={business.postal_code} />
            <InfoRow label="Direccion" value={business.address} />
          </SectionBlock>
        </div>

        <div className="space-y-6">
          <SectionBlock icon={Landmark} title="Informacion fiscal">
            <InfoRow label="Tipo identificacion" value={business.identification_type} />
            <InfoRow label="Numero identificacion" value={business.identification_number} />
          </SectionBlock>

          <SectionBlock icon={Mail} title="Contacto corporativo">
            <InfoRow label="Correo" value={business.email} />
            <InfoRow label="Telefono" value={business.phone} />
            <InfoRow label="Sitio web" value={business.website} />
            <InfoRow label="Logo URL" value={business.logo_url} />
          </SectionBlock>
        </div>
      </div>
    </section>
  );
}

export { BusinessDetailCard };
