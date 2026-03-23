"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/shared/components/data-table";
import { QueryStateWrapper } from "@/shared/components/query-state-wrapper";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { CatalogSectionCard } from "@/features/inventory/components/catalog-section-card";

import { useElectronicDocumentsQuery } from "../queries";
import { getElectronicDocumentsColumns } from "./electronic-documents-columns";
import { EmitDocumentDialog } from "./emit-document-dialog";

type ElectronicDocumentsSectionProps = {
  enabled?: boolean;
};

function ElectronicDocumentsSection({
  enabled = true,
}: ElectronicDocumentsSectionProps) {
  const { can } = usePermissions();
  const { t } = useAppTranslator();
  const canView = can("electronic_documents.view");
  const canEmit = can("electronic_documents.emit");
  const [dialogOpen, setDialogOpen] = useState(false);
  const documentsQuery = useElectronicDocumentsQuery(enabled && canView);

  const columns = useMemo(
    () => getElectronicDocumentsColumns({ t }),
    [t],
  );

  if (!canView) {
    return null;
  }

  return (
    <>
      <CatalogSectionCard
        action={
          canEmit ? (
            <Button
              onClick={() => {
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("sales.documents.emit")}
            </Button>
          ) : null
        }
        description={t("sales.documents.section_description")}
        title={t("sales.entity.electronic_documents")}
      >
        <QueryStateWrapper
          errorDescription={getBackendErrorMessage(
            documentsQuery.error,
            t("inventory.common.unable_to_load_entity", {
              entity: t("sales.entity.electronic_documents"),
            }),
          )}
          isError={documentsQuery.isError}
          isLoading={documentsQuery.isLoading}
          loadingDescription={t("inventory.common.loading_entity", {
            entity: t("sales.entity.electronic_documents"),
          })}
          onRetry={() => documentsQuery.refetch()}
        >
          <DataTable
            columns={columns}
            data={documentsQuery.data ?? []}
            emptyMessage={t("inventory.common.empty_entity", {
              entity: t("sales.entity.electronic_documents"),
            })}
          />
        </QueryStateWrapper>
      </CatalogSectionCard>

      <EmitDocumentDialog
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      />
    </>
  );
}

export { ElectronicDocumentsSection };
