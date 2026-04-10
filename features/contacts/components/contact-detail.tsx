"use client";

import Link from "next/link";
import { ArrowLeft, Building2, FileText, Mail, MapPin, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/shared/components/data-card";
import { DetailBlock } from "@/shared/components/detail-block";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { MapView } from "@/shared/components/map-view";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { formatDateTime } from "@/shared/lib/utils";

import { useContactQuery } from "../queries";
import { ContactTypeBadge } from "./contact-type-badge";

type ContactDetailProps = {
  contactId: string;
};

function ContactDetail({ contactId }: ContactDetailProps) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const canView = can("contacts.view");
  const contactQuery = useContactQuery(contactId, canView);

  if (!canView) {
    return (
      <ErrorState
        description={t("contacts.detail.access_denied_description")}
        title={t("contacts.detail.access_denied_title")}
      />
    );
  }

  if (contactQuery.isLoading) {
    return <LoadingState description={t("contacts.detail.loading")} />;
  }

  if (contactQuery.isError || !contactQuery.data) {
    return (
      <ErrorState
        description={t("contacts.detail.not_found_description")}
        title={t("contacts.detail.not_found_title")}
      />
    );
  }

  const contact = contactQuery.data;
  const hasAddress = contact.address || contact.province || contact.canton || contact.district;
  const hasExoneration = contact.exoneration_type || contact.exoneration_document_number;
  const hasCoordinates = contact.delivery_latitude && contact.delivery_longitude;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <PageHeader
          actions={
            <Button asChild variant="outline">
              <Link href="/contacts">
                <ArrowLeft className="size-4" />
                {t("contacts.detail.back_to_list")}
              </Link>
            </Button>
          }
          description={contact.commercial_name ?? undefined}
          eyebrow={t("contacts.eyebrow")}
          title={contact.name}
        />
        <div className="flex flex-wrap gap-2">
          {contact.code ? <Badge>{contact.code}</Badge> : null}
          <ContactTypeBadge type={contact.type} />
          <Badge variant={contact.is_active ? "default" : "secondary"}>
            {contact.is_active ? t("contacts.detail.active") : t("contacts.detail.inactive")}
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <DataCard
          title={t("contacts.field.identification")}
          value={contact.identification_number ?? "—"}
          description={contact.identification_type ?? t("contacts.detail.not_available")}
          icon={<FileText className="size-4" />}
        />
        <DataCard
          title={t("contacts.field.email")}
          value={<span className="text-base break-all">{contact.email ?? t("contacts.detail.not_available")}</span>}
          description={t("contacts.detail.email_description")}
          icon={<Mail className="size-4" />}
        />
        <DataCard
          title={t("contacts.field.phone")}
          value={<span className="text-base">{contact.phone ?? t("contacts.detail.not_available")}</span>}
          description={t("contacts.detail.phone_description")}
          icon={<Phone className="size-4" />}
        />
        <DataCard
          title={t("contacts.field.economic_activity")}
          value={contact.economic_activity_code ?? "—"}
          description={contact.tax_condition ?? t("contacts.detail.not_available")}
          icon={<Building2 className="size-4" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Address */}
        <DetailBlock
          title={t("contacts.detail.address_title")}
          description={t("contacts.detail.address_description")}
        >
          {hasAddress ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              {contact.address ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">{t("contacts.field.address")}</dt>
                  <dd className="text-sm font-medium">{contact.address}</dd>
                </div>
              ) : null}
              {contact.province ? (
                <div>
                  <dt className="text-xs text-muted-foreground">{t("contacts.field.province")}</dt>
                  <dd className="text-sm font-medium">{contact.province}</dd>
                </div>
              ) : null}
              {contact.canton ? (
                <div>
                  <dt className="text-xs text-muted-foreground">{t("contacts.field.canton")}</dt>
                  <dd className="text-sm font-medium">{contact.canton}</dd>
                </div>
              ) : null}
              {contact.district ? (
                <div>
                  <dt className="text-xs text-muted-foreground">{t("contacts.field.district")}</dt>
                  <dd className="text-sm font-medium">{contact.district}</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">{t("contacts.detail.no_address")}</p>
          )}
        </DetailBlock>

        {/* Map */}
        <DetailBlock
          title={t("contacts.detail.map_title")}
          description={t("contacts.detail.map_description")}
        >
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
              <p className="text-sm font-medium">{t("contacts.detail.no_location")}</p>
              <p className="text-xs mt-1">{t("contacts.detail.no_location_hint")}</p>
            </div>
          )}
        </DetailBlock>
      </div>

      {/* Exoneration */}
      {hasExoneration ? (
        <DetailBlock
          title={t("contacts.detail.exoneration_title")}
          description={t("contacts.detail.exoneration_description")}
        >
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {contact.exoneration_type ? (
              <div>
                <dt className="text-xs text-muted-foreground">{t("contacts.field.exoneration_type")}</dt>
                <dd className="text-sm font-medium">{contact.exoneration_type}</dd>
              </div>
            ) : null}
            {contact.exoneration_document_number ? (
              <div>
                <dt className="text-xs text-muted-foreground">{t("contacts.field.exoneration_document")}</dt>
                <dd className="text-sm font-medium">{contact.exoneration_document_number}</dd>
              </div>
            ) : null}
            {contact.exoneration_institution ? (
              <div>
                <dt className="text-xs text-muted-foreground">{t("contacts.field.exoneration_institution")}</dt>
                <dd className="text-sm font-medium">{contact.exoneration_institution}</dd>
              </div>
            ) : null}
            {contact.exoneration_issue_date ? (
              <div>
                <dt className="text-xs text-muted-foreground">{t("contacts.field.exoneration_date")}</dt>
                <dd className="text-sm font-medium">{contact.exoneration_issue_date}</dd>
              </div>
            ) : null}
            {contact.exoneration_percentage != null ? (
              <div>
                <dt className="text-xs text-muted-foreground">{t("contacts.field.exoneration_percentage")}</dt>
                <dd className="text-sm font-medium">{contact.exoneration_percentage}%</dd>
              </div>
            ) : null}
          </dl>
        </DetailBlock>
      ) : null}

      {/* Metadata */}
      <DetailBlock
        title={t("contacts.detail.metadata_title")}
        description={t("contacts.detail.metadata_description")}
      >
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">{t("contacts.detail.created_at")}</dt>
            <dd className="font-medium">{formatDateTime(contact.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("contacts.detail.updated_at")}</dt>
            <dd className="font-medium">{formatDateTime(contact.updated_at)}</dd>
          </div>
          {contact.delivery_latitude ? (
            <div>
              <dt className="text-xs text-muted-foreground">{t("contacts.field.latitude")}</dt>
              <dd className="font-medium">{contact.delivery_latitude}</dd>
            </div>
          ) : null}
          {contact.delivery_longitude ? (
            <div>
              <dt className="text-xs text-muted-foreground">{t("contacts.field.longitude")}</dt>
              <dd className="font-medium">{contact.delivery_longitude}</dd>
            </div>
          ) : null}
        </dl>
      </DetailBlock>
    </div>
  );
}

export { ContactDetail };
