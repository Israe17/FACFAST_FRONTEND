"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useServerTableState } from "@/shared/hooks/use-server-table-state";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";

import { useContactsQuery } from "@/features/contacts/queries";

import {
  useInventoryLotsPaginatedQuery,
  useProductsQuery,
  useWarehousesQuery,
} from "../queries";
import type { InventoryLot } from "../types";
import { CatalogSectionCard } from "./catalog-section-card";
import { InventoryLotDialog } from "./inventory-lot-dialog";
import { getInventoryLotsColumns } from "./inventory-lots-columns";

type InventoryLotsSectionProps = {
  enabled?: boolean;
};

function InventoryLotsSection({ enabled = true }: InventoryLotsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("inventory_lots.view");
  const canCreate = can("inventory_lots.create");
  const canUpdate = can("inventory_lots.update");
  const canViewContacts = can("contacts.view");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<InventoryLot | null>(null);
  const { serverState, onStateChange, queryParams } = useServerTableState({ sort_order: "DESC" });
  const inventoryLotsQuery = useInventoryLotsPaginatedQuery(queryParams, enabled && canView);
  const warehousesQuery = useWarehousesQuery(enabled && canView);
  const productsQuery = useProductsQuery(enabled && canView);
  const contactsQuery = useContactsQuery(enabled && canView && canViewContacts);
  const lotEnabledProducts = useMemo(
    () => (productsQuery.data ?? []).filter((product) => product.track_lots),
    [productsQuery.data],
  );
  const supplierContacts = useMemo(
    () =>
      (contactsQuery.data ?? []).filter(
        (contact) => contact.type === "supplier" || contact.type === "both",
      ),
    [contactsQuery.data],
  );

  const onEdit = useCallback((lot: InventoryLot) => {
    setSelectedLot(lot);
    setDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => getInventoryLotsColumns({ canUpdate, onEdit, t }),
    [canUpdate, onEdit, t],
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
                setSelectedLot(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("inventory.common.create_entity", {
                entity: t("inventory.entity.inventory_lot"),
              })}
            </Button>
          ) : null
        }
        description={t("inventory.inventory_lots.section_description")}
        title={t("inventory.entity.inventory_lots")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            inventoryLotsQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("inventory.entity.inventory_lots"),
            }),
          )}
          isError={inventoryLotsQuery.isError}
          isLoading={inventoryLotsQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("inventory.entity.inventory_lots"),
          })}
          onRetry={() => inventoryLotsQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={inventoryLotsQuery.data?.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("inventory.entity.inventory_lots"),
            })}
            onServerStateChange={onStateChange}
            serverSide
            serverState={serverState}
            total={inventoryLotsQuery.data?.total ?? 0}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <InventoryLotDialog
        lot={selectedLot}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedLot(null);
          }
        }}
        open={dialogOpen}
        products={lotEnabledProducts}
        suppliers={supplierContacts}
        warehouses={warehousesQuery.data ?? []}
      />
    </>
  );
}

export { InventoryLotsSection };
