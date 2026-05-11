"use client";

import { ArrowRightLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useInventoryMovementQuery } from "@/features/inventory/queries";
import { DetailBlock } from "@/shared/components/detail-block";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import {
  inventoryMovementStatusTranslationMap,
  ledgerMovementTypeTranslationMap,
} from "@/features/inventory/constants";

type InventoryMovementDetailSheetProps = {
  movementId: string | null;
  onOpenChange: (open: boolean) => void;
};

export function InventoryMovementDetailSheet({
  movementId,
  onOpenChange,
}: InventoryMovementDetailSheetProps) {
  const { t } = useAppTranslator();
  const open = Boolean(movementId);
  const movementQuery = useInventoryMovementQuery(movementId ?? "", open);
  const movement = movementQuery.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ArrowRightLeft className="size-5" aria-hidden="true" />
            {movement?.code ?? t("inventory.detail.loading_movement")}
          </SheetTitle>
          <SheetDescription>
            {t("users.activity.detail.movement_description")}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          {movementQuery.isLoading ? (
            <LoadingState description={t("inventory.detail.loading_movement")} />
          ) : movementQuery.isError || !movement ? (
            <ErrorState
              description={t("inventory.detail.movement_not_found_description")}
              onRetry={() => movementQuery.refetch()}
            />
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {movement.status ? (
                  <Badge variant="outline">
                    {t(
                      inventoryMovementStatusTranslationMap[movement.status] ??
                        "inventory.common.not_available",
                    )}
                  </Badge>
                ) : null}
                {movement.movement_type ? (
                  <Badge variant="outline">
                    {t(
                      ledgerMovementTypeTranslationMap[movement.movement_type] ??
                        "inventory.common.not_available",
                    )}
                  </Badge>
                ) : null}
              </div>

              <DetailBlock title={t("inventory.detail.summary_block_title")}>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {t("inventory.form.occurred_at")}
                    </dt>
                    <dd className="text-sm font-semibold">
                      {formatDateTime(movement.occurred_at)}
                    </dd>
                  </div>
                  {movement.branch?.name ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        {t("users.activity.filters.branch_label")}
                      </dt>
                      <dd className="text-sm font-semibold">
                        {movement.branch.name}
                      </dd>
                    </div>
                  ) : null}
                  {movement.source_document_number ? (
                    <div className="col-span-2">
                      <dt className="text-xs text-muted-foreground">
                        {t("users.activity.detail.source_document")}
                      </dt>
                      <dd className="text-sm font-semibold">
                        {movement.source_document_type
                          ? `${movement.source_document_type} · `
                          : ""}
                        {movement.source_document_number}
                      </dd>
                    </div>
                  ) : null}
                  {movement.notes ? (
                    <div className="col-span-2">
                      <dt className="text-xs text-muted-foreground">
                        {t("users.activity.detail.notes")}
                      </dt>
                      <dd className="whitespace-pre-wrap text-sm font-semibold">
                        {movement.notes}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </DetailBlock>

              {movement.lines && movement.lines.length > 0 ? (
                <DetailBlock
                  title={`${t("inventory.detail.line_items")} (${movement.lines.length})`}
                >
                  <div className="overflow-hidden rounded-lg border border-border/70">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/70 bg-muted/40 text-xs text-muted-foreground">
                          <th className="px-2 py-1.5 text-left">#</th>
                          <th className="px-2 py-1.5 text-left">
                            {t("inventory.entity.product")}
                          </th>
                          <th className="px-2 py-1.5 text-left">
                            {t("inventory.entity.warehouse")}
                          </th>
                          <th className="px-2 py-1.5 text-right">
                            {t("inventory.form.quantity")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...movement.lines]
                          .sort(
                            (a, b) => (a.line_no ?? 0) - (b.line_no ?? 0),
                          )
                          .map((line) => (
                            <tr
                              key={line.id}
                              className="border-b border-border/40 last:border-0"
                            >
                              <td className="px-2 py-1.5 text-muted-foreground">
                                {line.line_no}
                              </td>
                              <td className="px-2 py-1.5">
                                <div className="font-semibold">
                                  {line.product.name}
                                </div>
                                {line.product_variant?.variant_name ||
                                line.product_variant?.sku ? (
                                  <div className="text-xs text-muted-foreground">
                                    {line.product_variant.variant_name ??
                                      line.product_variant.sku}
                                  </div>
                                ) : null}
                              </td>
                              <td className="px-2 py-1.5">
                                {line.warehouse.name}
                              </td>
                              <td className="px-2 py-1.5 text-right font-semibold tabular-nums">
                                {line.quantity ?? 0}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </DetailBlock>
              ) : null}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
