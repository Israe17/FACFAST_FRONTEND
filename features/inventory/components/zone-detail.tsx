"use client";

import { useMemo } from "react";
import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataCard } from "@/shared/components/data-card";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { MapView, type MapMarker, type MapPolygon } from "@/shared/components/map-view";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { APP_ROUTES } from "@/shared/lib/routes";
import { formatDateTime } from "@/shared/lib/utils";

import { useZoneQuery, useZoneBranchAssignmentsQuery } from "../queries";
import { DetailBlock } from "@/shared/components/detail-block";
import { InventoryEntityHeader } from "./inventory-entity-header";

type ZoneDetailProps = {
  zoneId: string;
};

function ZoneDetail({ zoneId }: ZoneDetailProps) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const canView = can("zones.view");
  const zoneQuery = useZoneQuery(zoneId, canView);
  const branchesQuery = useZoneBranchAssignmentsQuery(zoneId, canView);

  const zone = zoneQuery.data;
  const assignedBranches = branchesQuery.data?.assigned_branches ?? [];

  const mapPolygons = useMemo<MapPolygon[]>(() => {
    if (!zone?.boundary || zone.boundary.length < 3) return [];
    return [
      {
        id: `zone-${zone.id}`,
        points: zone.boundary as [number, number][],
        color: "#6366f1",
        fillColor: "#6366f1",
        fillOpacity: 0.15,
      },
    ];
  }, [zone?.boundary, zone?.id]);

  const mapMarkers = useMemo<MapMarker[]>(() => {
    if (!zone || !Boolean(zone.center_latitude) || !Boolean(zone.center_longitude)) return [];
    return [
      {
        id: `zone-center-${zone.id}`,
        lat: zone.center_latitude!,
        lng: zone.center_longitude!,
        color: "#6366f1",
        popup: `<strong>${zone.name}</strong>`,
      },
    ];
  }, [zone?.center_latitude, zone?.center_longitude, zone?.id, zone?.name]);

  if (!canView) {
    return (
      <ErrorState
        description={t("inventory.zones.detail.access_denied_description")}
        title={t("inventory.zones.detail.access_denied_title")}
      />
    );
  }

  if (zoneQuery.isLoading) {
    return <LoadingState description={t("inventory.zones.detail.loading")} />;
  }

  if (zoneQuery.isError || !zone) {
    return (
      <ErrorState
        description={t("inventory.zones.detail.not_found_description")}
        title={t("inventory.zones.detail.not_found_title")}
      />
    );
  }

  const hasBoundary = zone.boundary && zone.boundary.length >= 3;
  const hasCenter = Boolean(zone.center_latitude) && Boolean(zone.center_longitude);
  const location = [zone.province, zone.canton, zone.district].filter(Boolean).join(" / ");

  return (
    <div className="space-y-6">
      <InventoryEntityHeader
        backHref={APP_ROUTES.dispatchZones}
        backLabel={t("inventory.zones.detail.back_to_list")}
        badges={
          <>
            <Badge variant={zone.is_active ? "default" : "outline"}>
              {zone.is_active ? t("inventory.common.active") : t("inventory.common.inactive")}
            </Badge>
            {zone.is_global ? (
              <Badge variant="outline">{t("inventory.zones.detail.global")}</Badge>
            ) : null}
          </>
        }
        breadcrumbs={[
          { href: APP_ROUTES.dispatchZones, label: t("inventory.entity.zones") },
          { label: zone.name },
        ]}
        code={zone.code}
        description={location || undefined}
        title={zone.name}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <DataCard
          title={t("inventory.zones.detail.province")}
          value={zone.province ?? "—"}
        />
        <DataCard
          title={t("inventory.zones.detail.canton")}
          value={zone.canton ?? "—"}
        />
        <DataCard
          title={t("inventory.zones.detail.district")}
          value={zone.district ?? "—"}
        />
        <DataCard
          title={t("inventory.zones.detail.branches_count")}
          value={assignedBranches.length}
          description={t("inventory.zones.detail.branches_assigned")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Summary */}
        <DetailBlock
          title={t("inventory.zones.detail.summary_title")}
          description={t("inventory.zones.detail.summary_description")}
        >
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.common.name")}</dt>
              <dd className="font-medium">{zone.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.common.code")}</dt>
              <dd className="font-medium">{zone.code ?? t("inventory.common.not_available")}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm text-muted-foreground">{t("inventory.common.description")}</dt>
              <dd className="font-medium">{zone.description ?? t("inventory.common.not_available")}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.common.status")}</dt>
              <dd className="font-medium">
                {zone.is_active ? t("inventory.common.active") : t("inventory.common.inactive")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.zones.detail.scope")}</dt>
              <dd className="font-medium">
                {zone.is_global ? t("inventory.zones.detail.global") : t("inventory.zones.detail.scoped")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.detail.created_at")}</dt>
              <dd className="font-medium">{formatDateTime(zone.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.common.updated")}</dt>
              <dd className="font-medium">{formatDateTime(zone.updated_at)}</dd>
            </div>
          </dl>
        </DetailBlock>

        {/* Map */}
        <DetailBlock
          title={t("inventory.zones.detail.map_title")}
          description={t("inventory.zones.detail.map_description")}
        >
          {hasBoundary || hasCenter ? (
            <div className="h-64 rounded-lg overflow-hidden relative z-0">
              <MapView
                markers={mapMarkers}
                polygons={mapPolygons}
                className="h-full rounded-none"
              />
            </div>
          ) : (
            <div className="h-48 rounded-lg border border-dashed border-border/70 flex flex-col items-center justify-center text-muted-foreground">
              <MapPin className="size-8 mb-2" />
              <p className="text-sm font-medium">{t("inventory.zones.detail.no_location")}</p>
              <p className="text-xs mt-1">{t("inventory.zones.detail.no_location_hint")}</p>
            </div>
          )}
        </DetailBlock>
      </div>

      {/* Assigned branches */}
      <DetailBlock
        title={t("inventory.zones.detail.branches_title")}
        description={t("inventory.zones.detail.branches_description")}
      >
        {assignedBranches.length > 0 ? (
          <div className="divide-y">
            {assignedBranches.map((branch) => (
              <div key={branch.id} className="flex items-center justify-between py-2.5">
                <p className="font-medium text-sm">{branch.name ?? `#${branch.id}`}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("inventory.zones.detail.no_branches")}</p>
        )}
      </DetailBlock>
    </div>
  );
}

export { ZoneDetail };
