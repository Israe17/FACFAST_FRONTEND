"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/shared/components/action-button";
import { DataCard } from "@/shared/components/data-card";
import { DataTable } from "@/shared/components/data-table";
import { ErrorState } from "@/shared/components/error-state";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useBackendFormErrors } from "@/shared/hooks/use-backend-form-errors";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { buildFormResolver } from "@/shared/lib/form-resolver";
import { APP_ROUTES } from "@/shared/lib/routes";
import { formatDateTime } from "@/shared/lib/utils";

import {
  useCancelInventoryMovementMutation,
  useInventoryMovementQuery,
} from "../queries";
import { cancelInventoryMovementSchema } from "../schemas";
import type {
  CancelInventoryMovementInput,
  InventoryMovementLine,
} from "../types";
import { useInventoryModule } from "../use-inventory-module";
import { DetailBlock } from "@/shared/components/detail-block";
import { InventoryEntityHeader } from "./inventory-entity-header";

type InventoryMovementDetailProps = {
  headerId: string;
};

function InventoryMovementDetail({ headerId }: InventoryMovementDetailProps) {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const canViewMovements = can("inventory_movements.view");
  const canCancelMovement = can("inventory_movements.cancel");
  const [cancelOpen, setCancelOpen] = useState(false);
  const movementQuery = useInventoryMovementQuery(
    headerId,
    canRunTenantQueries && canViewMovements,
  );
  const cancelMutation = useCancelInventoryMovementMutation(headerId, { showErrorToast: false });
  const cancelForm = useForm<CancelInventoryMovementInput>({
    defaultValues: { notes: "" },
    resolver: buildFormResolver<CancelInventoryMovementInput>(cancelInventoryMovementSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(cancelForm);

  const movement = movementQuery.data;
  const lines = useMemo(
    () => [...(movement?.lines ?? [])].sort((a, b) => (a.line_no ?? 0) - (b.line_no ?? 0)),
    [movement?.lines],
  );

  if (!canViewMovements) {
    return (
      <ErrorState
        description={t("inventory.access_denied_description")}
        title={t("inventory.access_denied_title")}
      />
    );
  }

  if (movementQuery.isLoading) {
    return <LoadingState description={t("inventory.detail.loading_movement")} />;
  }

  if (movementQuery.isError || !movement) {
    return (
      <ErrorState
        description={t("inventory.detail.movement_not_found_description")}
        title={t("inventory.detail.movement_not_found_title")}
      />
    );
  }

  const lineColumns: ColumnDef<InventoryMovementLine>[] = [
    {
      accessorKey: "line_no",
      header: "#",
      size: 40,
    },
    {
      accessorKey: "product",
      header: t("inventory.entity.product"),
      cell: ({ row }) => {
        const variant = row.original.product_variant;
        return (
          <div>
            <span className="font-medium">{row.original.product.name}</span>
            {variant?.variant_name || variant?.sku ? (
              <p className="text-xs text-muted-foreground">{variant.variant_name ?? variant.sku}</p>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "warehouse",
      header: t("inventory.entity.warehouse"),
      cell: ({ row }) => {
        const loc = row.original.location;
        return (
          <div>
            <span>{row.original.warehouse.name}</span>
            {loc?.name ? (
              <p className="text-xs text-muted-foreground">{loc.name}</p>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "inventory_lot",
      header: t("inventory.entity.inventory_lot"),
      cell: ({ row }) =>
        row.original.inventory_lot?.lot_number ?? "—",
    },
    {
      accessorKey: "quantity",
      header: t("inventory.form.quantity"),
      cell: ({ row }) => row.original.quantity ?? 0,
    },
    {
      accessorKey: "on_hand_delta",
      header: t("inventory.form.on_hand_delta"),
      cell: ({ row }) => {
        const val = row.original.on_hand_delta ?? 0;
        return <span className={val > 0 ? "text-green-600" : val < 0 ? "text-red-600" : ""}>{val > 0 ? `+${val}` : val}</span>;
      },
    },
    {
      accessorKey: "reserved_delta",
      header: t("inventory.form.reserved_delta"),
      cell: ({ row }) => {
        const val = row.original.reserved_delta ?? 0;
        return val !== 0 ? <span>{val > 0 ? `+${val}` : val}</span> : "—";
      },
    },
    {
      accessorKey: "unit_cost",
      header: t("inventory.form.unit_cost"),
      cell: ({ row }) => row.original.unit_cost ?? "—",
    },
  ];

  async function handleCancel(values: CancelInventoryMovementInput) {
    resetBackendFormErrors();

    try {
      await cancelMutation.mutateAsync(values);
      setCancelOpen(false);
    } catch (error) {
      handleBackendFormError(error, {
        fallbackMessage: t("inventory.inventory_movement_cancel_error_fallback"),
      });
    }
  }

  return (
    <div className="space-y-6">
      <InventoryEntityHeader
        actions={
          movement.status === "posted" &&
          canCancelMovement &&
          movement.source_document_type !== "SaleOrder" &&
          movement.source_document_type !== "DispatchOrder" ? (
            <Button onClick={() => setCancelOpen(true)} variant="outline">
              {t("inventory.inventory_movements.cancel_action")}
            </Button>
          ) : null
        }
        backHref={APP_ROUTES.inventoryOperationsMovements}
        backLabel={t("inventory.detail.back_to_movements")}
        badges={
          <>
            {movement.status ? (
              <Badge variant="outline">
                {t(`inventory.enum.inventory_movement_status.${movement.status}` as const)}
              </Badge>
            ) : null}
            {movement.movement_type ? (
              <Badge variant="outline">
                {t(`inventory.enum.ledger_movement_type.${movement.movement_type}` as const)}
              </Badge>
            ) : null}
            {movement.source_document_type === "SaleOrder" ||
            movement.source_document_type === "DispatchOrder" ? (
              <Badge variant="secondary">
                {t("inventory.inventory_movements.managed_badge")}
              </Badge>
            ) : null}
          </>
        }
        breadcrumbs={[
          { href: APP_ROUTES.inventory, label: t("inventory.page_title") },
          { href: APP_ROUTES.inventoryOperations, label: t("inventory.nav.operations") },
          { href: APP_ROUTES.inventoryOperationsMovements, label: t("inventory.entity.inventory_movements") },
          { label: movement.code ?? headerId },
        ]}
        code={movement.code}
        description={t("inventory.detail.movement_description")}
        title={movement.code ?? `${t("inventory.form.header_id")} ${headerId}`}
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <DataCard
          description={t("inventory.detail.movement_kpi_lines")}
          title={t("inventory.detail.line_items")}
          value={movement.line_count ?? lines.length}
        />
        <DataCard
          description={t("inventory.detail.movement_kpi_quantity")}
          title={t("inventory.form.quantity")}
          value={lines.reduce((total, line) => total + (line.quantity ?? 0), 0)}
        />
        <DataCard
          description={t("inventory.detail.movement_kpi_warehouses")}
          title={t("inventory.entity.warehouses")}
          value={new Set(lines.map((line) => line.warehouse.id)).size}
        />
        <DataCard
          description={t("inventory.detail.movement_kpi_date")}
          title={t("inventory.form.occurred_at")}
          value={formatDateTime(movement.occurred_at)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DetailBlock
          description={t("inventory.detail.summary_block_description")}
          title={t("inventory.detail.summary_block_title")}
        >
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.form.movement_type")}</dt>
              <dd className="font-medium">
                {movement.movement_type
                  ? t(`inventory.enum.ledger_movement_type.${movement.movement_type}` as const)
                  : t("inventory.common.not_available")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.common.status")}</dt>
              <dd className="font-medium">
                {movement.status
                  ? t(`inventory.enum.inventory_movement_status.${movement.status}` as const)
                  : t("inventory.common.not_available")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.form.branch")}</dt>
              <dd className="font-medium">
                {movement.branch?.name ??
                  movement.branch?.business_name ??
                  t("inventory.common.not_available")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.detail.registered_by")}</dt>
              <dd className="font-medium">
                {movement.performed_by?.name ?? t("inventory.common.not_available")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                {t("inventory.detail.source_document")}
              </dt>
              <dd className="font-medium">
                {movement.source_document_type ?? t("inventory.common.not_available")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                {t("inventory.detail.source_document_number")}
              </dt>
              <dd className="font-medium">
                {movement.source_document_number ?? t("inventory.common.not_available")}
              </dd>
            </div>
          </dl>
          <div className="mt-4 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
            {movement.notes ?? t("inventory.common.no_notes")}
          </div>
        </DetailBlock>

        <DetailBlock
          description={t("inventory.detail.movement_relation_block_description")}
          title={t("inventory.detail.movement_relation_block_title")}
        >
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.form.reference_id")}</dt>
              <dd className="font-medium">
                {movement.source_document_id ?? t("inventory.common.not_available")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                {t("inventory.detail.transferred_serial_ids")}
              </dt>
              <dd className="font-medium">
                {movement.transferred_serial_ids.length
                  ? movement.transferred_serial_ids.join(", ")
                  : t("inventory.common.not_available")}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm text-muted-foreground">
                {t("inventory.detail.legacy_reference")}
              </dt>
              <dd className="font-medium">
                {movement.legacy_movement_ids.length
                  ? movement.legacy_movement_ids.join(", ")
                  : t("inventory.common.not_available")}
              </dd>
            </div>
          </dl>
        </DetailBlock>
      </div>

      <DetailBlock
        description={t("inventory.detail.line_items_description")}
        title={t("inventory.detail.line_items")}
      >
        <div className="overflow-x-auto">
          <DataTable
            enablePagination={false}
            columns={lineColumns}
            data={lines}
            emptyMessage={t("inventory.detail.no_movement_lines")}
          />
        </div>
      </DetailBlock>

      <Sheet onOpenChange={setCancelOpen} open={cancelOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("inventory.inventory_movements.cancel_title")}</SheetTitle>
            <SheetDescription>
              {t("inventory.inventory_movements.cancel_description", {
                code: movement.code ?? headerId,
              })}
            </SheetDescription>
          </SheetHeader>
          <form className="space-y-4" onSubmit={cancelForm.handleSubmit(handleCancel)}>
            <FormErrorBanner message={formError} />
            <div className="space-y-2">
              <Label htmlFor="movement-cancel-notes">{t("inventory.common.notes")}</Label>
              <Textarea id="movement-cancel-notes" {...cancelForm.register("notes")} />
            </div>
            <div className="flex justify-end">
              <ActionButton
                isLoading={cancelMutation.isPending}
                loadingText={t("common.saving")}
                type="submit"
              >
                {t("inventory.inventory_movements.cancel_action")}
              </ActionButton>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export { InventoryMovementDetail };
