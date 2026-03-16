"use client";

import { Badge } from "@/components/ui/badge";

import type { PlatformBusinessDetail } from "../types";

type DetailItemProps = {
  label: string;
  value?: string | null | boolean;
};

function DetailItem({ label, value }: DetailItemProps) {
  const resolvedValue =
    typeof value === "boolean" ? (value ? "Activo" : "Inactivo") : value || "No disponible";

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-sm leading-6">{resolvedValue}</p>
    </div>
  );
}

type BusinessDetailCardProps = {
  business: PlatformBusinessDetail;
};

function BusinessDetailCard({ business }: BusinessDetailCardProps) {
  return (
    <section className="space-y-6 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{business.name ?? "Business"}</h2>
          <p className="text-sm text-muted-foreground">{business.legal_name ?? "Sin razón social"}</p>
        </div>
        <Badge variant="outline">{business.is_active ? "Active" : "Inactive"}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <h3 className="font-medium">Datos generales</h3>
          <DetailItem label="Codigo" value={business.code} />
          <DetailItem label="Idioma" value={business.language} />
          <DetailItem label="Timezone" value={business.timezone} />
          <DetailItem label="Moneda" value={business.currency_code} />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Datos fiscales</h3>
          <DetailItem label="Tipo identificacion" value={business.identification_type} />
          <DetailItem label="Identificacion" value={business.identification_number} />
          <DetailItem label="Estado general" value={business.is_active} />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Contacto</h3>
          <DetailItem label="Correo" value={business.email} />
          <DetailItem label="Telefono" value={business.phone} />
          <DetailItem label="Sitio web" value={business.website} />
          <DetailItem label="Logo URL" value={business.logo_url} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-medium">Direccion fiscal</h3>
          <DetailItem label="Pais" value={business.country} />
          <DetailItem label="Provincia" value={business.province} />
          <DetailItem label="Canton" value={business.canton} />
          <DetailItem label="Distrito" value={business.district} />
          <DetailItem label="Ciudad" value={business.city} />
          <DetailItem label="Direccion" value={business.address} />
          <DetailItem label="Postal code" value={business.postal_code} />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Configuracion global</h3>
          <DetailItem label="Actualizado" value={business.updated_at} />
          <DetailItem label="Creado" value={business.created_at} />
        </div>
      </div>
    </section>
  );
}

export { BusinessDetailCard };
