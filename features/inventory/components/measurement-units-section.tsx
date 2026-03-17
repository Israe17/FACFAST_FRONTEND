"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import { useMeasurementUnitsQuery } from "../queries";
import type { MeasurementUnit } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { MeasurementUnitDialog } from "./measurement-unit-dialog";
import { getMeasurementUnitsColumns } from "./measurement-units-columns";

type MeasurementUnitsSectionProps = {
  enabled?: boolean;
};

function MeasurementUnitsSection({ enabled = true }: MeasurementUnitsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("measurement_units.view");
  const canCreate = can("measurement_units.create");
  const canUpdate = can("measurement_units.update");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeasurementUnit, setSelectedMeasurementUnit] =
    useState<MeasurementUnit | null>(null);
  const measurementUnitsQuery = useMeasurementUnitsQuery(enabled && canView);

  const handleEdit = useCallback((measurementUnit: MeasurementUnit) => {
    setSelectedMeasurementUnit(measurementUnit);
    setDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => getMeasurementUnitsColumns({ canUpdate, onEdit: handleEdit, t }),
    [canUpdate, handleEdit, t],
  );

  if (!canView) {
    return null;
  }

  return (
    <>
      <CatalogSectionCard
        action={
          canCreate ? (
            <Button
              onClick={() => {
                setSelectedMeasurementUnit(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.measurement_unit"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.measurement_units.section_description")}
        title={t("inventory.entity.measurement_units")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            measurementUnitsQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.measurement_units"),
            }),
          )}
          isError={measurementUnitsQuery.isError}
          isLoading={measurementUnitsQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.measurement_units"),
          })}
          onRetry={() => measurementUnitsQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={measurementUnitsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.measurement_units"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <MeasurementUnitDialog
        measurementUnit={selectedMeasurementUnit}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedMeasurementUnit(null);
          }
        }}
        open={dialogOpen}
      />
    </>
  );
}

export { MeasurementUnitsSection };
