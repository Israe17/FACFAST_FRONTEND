"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import { useCancelInventoryMovementMutation, useInventoryMovementsQuery } from "../queries";
import { cancelInventoryMovementSchema } from "../schemas";
import type { CancelInventoryMovementInput, InventoryMovementRow } from "../types";
import { useInventoryModule } from "../use-inventory-module";
import { InventoryDetailBlock } from "./inventory-detail-block";
import { InventoryEntityHeader } from "./inventory-entity-header";

type InventoryMovementDetailProps = {
  headerId: string;
};

function InventoryMovementDetail({ headerId }: InventoryMovementDetailProps) {
  const { t } = useAppTranslator();
  const { canRunTenantQueries } = useInventoryModule();
  const { can } = usePermissions();
  const canViewMovements = can("inventory_movements.view");
  const [cancelOpen, setCancelOpen] = useState(false);
  const movementsQuery = useInventoryMovementsQuery(
    canRunTenantQueries && canViewMovements,
  );
  const cancelMutation = useCancelInventoryMovementMutation(headerId, { showErrorToast: false });
  const cancelForm = useForm<CancelInventoryMovementInput>({
    defaultValues: { notes: "" },
    resolver: buildFormResolver<CancelInventoryMovementInput>(cancelInventoryMovementSchema),
  });
  const { formError, handleBackendFormError, resetBackendFormErrors } =
    useBackendFormErrors(cancelForm);

  if (!canViewMovements) {
    return (
      <ErrorState
        description={t("inventory.access_denied_description")}
        title={t("inventory.access_denied_title")}
      />
    );
  }

  const headerLines = (movementsQuery.data ?? [])
    .filter((row) => row.header_id === headerId)
    .sort((a, b) => (a.line_no ?? 0) - (b.line_no ?? 0));
  const primaryLine = headerLines[0];

  const lineColumns: ColumnDef<InventoryMovementRow>[] = [
    {
      accessorKey: "line_no",
      header: t("inventory.detail.line_no"),
    },
    {
      accessorKey: "warehouse",
      header: t("inventory.entity.warehouse"),
      cell: ({ row }) => row.original.warehouse.name,
    },
    {
      accessorKey: "product",
      header: t("inventory.entity.product"),
      cell: ({ row }) => row.original.product.name,
    },
    {
      accessorKey: "quantity",
      header: t("inventory.form.quantity"),
      cell: ({ row }) => row.original.quantity ?? 0,
    },
    {
      accessorKey: "on_hand_delta",
      header: t("inventory.form.on_hand_delta"),
      cell: ({ row }) => row.original.on_hand_delta ?? 0,
    },
    {
      accessorKey: "unit_cost",
      header: t("inventory.form.unit_cost"),
      cell: ({ row }) => row.original.unit_cost ?? t("inventory.common.not_available"),
    },
    {
      accessorKey: "total_cost",
      header: t("inventory.detail.total_cost"),
      cell: ({ row }) => row.original.total_cost ?? t("inventory.common.not_available"),
    },
    {
      accessorKey: "linked_line_id",
      header: t("inventory.detail.linked_line"),
      cell: ({ row }) => row.original.linked_line_id ?? t("inventory.common.not_available"),
    },
  ];

  if (movementsQuery.isLoading) {
    return <LoadingState description={t("inventory.detail.loading_movement")} />;
  }

  if (movementsQuery.isError || !primaryLine) {
    return (
      <ErrorState
        description={t("inventory.detail.movement_not_found_description")}
        title={t("inventory.detail.movement_not_found_title")}
      />
    );
  }

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
          primaryLine.status === "posted" && can("inventory_movements.adjust") ? (
            <Button onClick={() => setCancelOpen(true)} variant="outline">
              {t("inventory.inventory_movements.cancel_action")}
            </Button>
          ) : null
        }
        backHref={APP_ROUTES.inventoryOperationsMovements}
        backLabel={t("inventory.detail.back_to_movements")}
        badges={
          <>
            {primaryLine.status ? (
              <Badge variant="outline">
                {t(`inventory.enum.inventory_movement_status.${primaryLine.status}` as const)}
              </Badge>
            ) : null}
            {primaryLine.movement_type ? (
              <Badge variant="outline">
                {t(`inventory.enum.ledger_movement_type.${primaryLine.movement_type}` as const)}
              </Badge>
            ) : null}
          </>
        }
        breadcrumbs={[
          { href: APP_ROUTES.inventory, label: t("inventory.page_title") },
          { href: APP_ROUTES.inventoryOperations, label: t("inventory.nav.operations") },
          { href: APP_ROUTES.inventoryOperationsMovements, label: t("inventory.entity.inventory_movements") },
          { label: primaryLine.code ?? headerId },
        ]}
        code={primaryLine.code}
        description={t("inventory.detail.movement_description")}
        title={primaryLine.code ?? `${t("inventory.form.header_id")} ${headerId}`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DataCard
          description={t("inventory.detail.movement_kpi_lines")}
          title={t("inventory.detail.line_items")}
          value={headerLines.length}
        />
        <DataCard
          description={t("inventory.detail.movement_kpi_quantity")}
          title={t("inventory.form.quantity")}
          value={headerLines.reduce((total, row) => total + (row.quantity ?? 0), 0)}
        />
        <DataCard
          description={t("inventory.detail.movement_kpi_warehouses")}
          title={t("inventory.entity.warehouses")}
          value={new Set(headerLines.map((row) => row.warehouse.id)).size}
        />
        <DataCard
          description={t("inventory.detail.movement_kpi_date")}
          title={t("inventory.form.occurred_at")}
          value={formatDateTime(primaryLine.occurred_at)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <InventoryDetailBlock
          description={t("inventory.detail.summary_block_description")}
          title={t("inventory.detail.summary_block_title")}
        >
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.form.movement_type")}</dt>
              <dd className="font-medium">
                {primaryLine.movement_type
                  ? t(`inventory.enum.ledger_movement_type.${primaryLine.movement_type}` as const)
                  : t("inventory.common.not_available")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.common.status")}</dt>
              <dd className="font-medium">
                {primaryLine.status
                  ? t(`inventory.enum.inventory_movement_status.${primaryLine.status}` as const)
                  : t("inventory.common.not_available")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.form.branch")}</dt>
              <dd className="font-medium">{primaryLine.branch?.business_name ?? t("inventory.common.not_available")}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.detail.registered_by")}</dt>
              <dd className="font-medium">{primaryLine.created_by?.name ?? t("inventory.common.not_available")}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.form.reference_type")}</dt>
              <dd className="font-medium">{primaryLine.reference_type ?? t("inventory.common.not_available")}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{t("inventory.form.reference_id")}</dt>
              <dd className="font-medium">{primaryLine.reference_id ?? t("inventory.common.not_available")}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
            {primaryLine.notes ?? t("inventory.common.no_notes")}
          </div>
        </InventoryDetailBlock>

        <InventoryDetailBlock
          description={t("inventory.detail.movement_relation_block_description")}
          title={t("inventory.detail.movement_relation_block_title")}
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>{t("inventory.detail.movement_relation_note_1")}</p>
            <p>{t("inventory.detail.movement_relation_note_2")}</p>
            <p>{t("inventory.detail.movement_relation_note_3")}</p>
          </div>
        </InventoryDetailBlock>
      </div>

      <InventoryDetailBlock
        description={t("inventory.detail.line_items_description")}
        title={t("inventory.detail.line_items")}
      >
        <DataTable
          columns={lineColumns}
          data={headerLines}
          emptyMessage={t("inventory.detail.no_movement_lines")}
        />
      </InventoryDetailBlock>

      <Dialog onOpenChange={setCancelOpen} open={cancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("inventory.inventory_movements.cancel_title")}</DialogTitle>
            <DialogDescription>
              {t("inventory.inventory_movements.cancel_description", {
                code: primaryLine.code ?? headerId,
              })}
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { InventoryMovementDetail };
