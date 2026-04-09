"use client";

import { Badge } from "@/components/ui/badge";
import { DataCard } from "@/shared/components/data-card";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { MapView, type MapMarker } from "@/shared/components/map-view";
import { formatDateTime } from "@/shared/lib/utils";
import { MapPin, Mail, Phone, Building2, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useContactQuery } from "../queries";

type ContactDetailProps = {
  contactId: string;
};

function ContactDetail({ contactId }: ContactDetailProps) {
  const contactQuery = useContactQuery(contactId);

  if (contactQuery.isLoading) {
    return <LoadingState description="Cargando contacto..." />;
  }

  if (contactQuery.isError || !contactQuery.data) {
    return (
      <ErrorState
        description="No se encontró el contacto solicitado."
        title="Contacto no encontrado"
      />
    );
  }

  const contact = contactQuery.data;

  const hasAddress = contact.address || contact.province || contact.canton || contact.district;
  const hasExoneration = contact.exoneration_type || contact.exoneration_document_number;
  const hasCoordinates = contact.delivery_latitude && contact.delivery_longitude;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <Link href="/contacts">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
            <ArrowLeft className="size-4" />
            Volver a contactos
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              Contacto
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">{contact.name}</h1>
            {contact.commercial_name ? (
              <p className="text-sm text-muted-foreground">{contact.commercial_name}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {contact.code ? <Badge variant="outline">{contact.code}</Badge> : null}
            {contact.type ? (
              <Badge>{contact.type === "customer" ? "Cliente" : contact.type === "supplier" ? "Proveedor" : contact.type}</Badge>
            ) : null}
            <Badge variant={contact.is_active ? "default" : "secondary"}>
              {contact.is_active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <DataCard
          title="Identificación"
          value={contact.identification_number ?? "—"}
          description={contact.identification_type ?? "Sin tipo"}
          icon={<FileText className="size-4" />}
        />
        <DataCard
          title="Correo"
          value={contact.email ?? "Sin correo"}
          description="Email de contacto"
          icon={<Mail className="size-4" />}
        />
        <DataCard
          title="Teléfono"
          value={contact.phone ?? "Sin teléfono"}
          description="Número de contacto"
          icon={<Phone className="size-4" />}
        />
        <DataCard
          title="Actividad económica"
          value={contact.economic_activity_code ?? "—"}
          description={contact.tax_condition ?? "Sin condición fiscal"}
          icon={<Building2 className="size-4" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Dirección */}
        <div className="rounded-2xl border border-border/70 p-5 space-y-4">
          <div>
            <h3 className="font-semibold">Dirección</h3>
            <p className="text-sm text-muted-foreground">Ubicación de entrega del contacto.</p>
          </div>
          {hasAddress ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              {contact.address ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Dirección</dt>
                  <dd className="text-sm font-medium">{contact.address}</dd>
                </div>
              ) : null}
              {contact.province ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Provincia</dt>
                  <dd className="text-sm font-medium">{contact.province}</dd>
                </div>
              ) : null}
              {contact.canton ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Cantón</dt>
                  <dd className="text-sm font-medium">{contact.canton}</dd>
                </div>
              ) : null}
              {contact.district ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Distrito</dt>
                  <dd className="text-sm font-medium">{contact.district}</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Sin dirección registrada.</p>
          )}
        </div>

        {/* Mapa */}
        <div className="rounded-2xl border border-border/70 p-5 space-y-4">
          <div>
            <h3 className="font-semibold">Ubicación en mapa</h3>
            <p className="text-sm text-muted-foreground">Coordenadas de entrega.</p>
          </div>
          {hasCoordinates ? (
            <div className="h-56 rounded-lg overflow-hidden relative z-0">
              <MapView
                markers={[
                  {
                    id: `contact-${contact.id}`,
                    lat: contact.delivery_latitude!,
                    lng: contact.delivery_longitude!,
                    color: "#3b82f6",
                    popup: `<strong>${contact.name}</strong>`,
                  },
                ]}
                center={[contact.delivery_latitude!, contact.delivery_longitude!]}
                zoom={14}
                className="h-full rounded-none"
              />
            </div>
          ) : (
            <div className="h-40 rounded-lg border border-dashed border-border/70 flex flex-col items-center justify-center text-muted-foreground">
              <MapPin className="size-8 mb-2" />
              <p className="text-sm font-medium">Sin ubicación configurada</p>
              <p className="text-xs mt-1">Editá el contacto para agregar coordenadas</p>
            </div>
          )}
        </div>
      </div>

      {/* Exoneración */}
      {hasExoneration ? (
        <div className="rounded-2xl border border-border/70 p-5 space-y-4">
          <div>
            <h3 className="font-semibold">Exoneración fiscal</h3>
            <p className="text-sm text-muted-foreground">Información de exoneración tributaria.</p>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {contact.exoneration_type ? (
              <div>
                <dt className="text-xs text-muted-foreground">Tipo</dt>
                <dd className="text-sm font-medium">{contact.exoneration_type}</dd>
              </div>
            ) : null}
            {contact.exoneration_document_number ? (
              <div>
                <dt className="text-xs text-muted-foreground">Número de documento</dt>
                <dd className="text-sm font-medium">{contact.exoneration_document_number}</dd>
              </div>
            ) : null}
            {contact.exoneration_institution ? (
              <div>
                <dt className="text-xs text-muted-foreground">Institución</dt>
                <dd className="text-sm font-medium">{contact.exoneration_institution}</dd>
              </div>
            ) : null}
            {contact.exoneration_issue_date ? (
              <div>
                <dt className="text-xs text-muted-foreground">Fecha de emisión</dt>
                <dd className="text-sm font-medium">{contact.exoneration_issue_date}</dd>
              </div>
            ) : null}
            {contact.exoneration_percentage != null ? (
              <div>
                <dt className="text-xs text-muted-foreground">Porcentaje</dt>
                <dd className="text-sm font-medium">{contact.exoneration_percentage}%</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      {/* Metadata */}
      <div className="rounded-2xl border border-border/70 p-5">
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Creado</dt>
            <dd className="font-medium">{formatDateTime(contact.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Actualizado</dt>
            <dd className="font-medium">{formatDateTime(contact.updated_at)}</dd>
          </div>
          {contact.delivery_latitude ? (
            <div>
              <dt className="text-xs text-muted-foreground">Latitud</dt>
              <dd className="font-medium">{contact.delivery_latitude}</dd>
            </div>
          ) : null}
          {contact.delivery_longitude ? (
            <div>
              <dt className="text-xs text-muted-foreground">Longitud</dt>
              <dd className="font-medium">{contact.delivery_longitude}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </div>
  );
}

export { ContactDetail };
