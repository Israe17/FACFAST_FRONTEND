import type { ColumnDef } from "@tanstack/react-table";

import type { FrontendTranslationKey } from "@/shared/i18n/translations";
import type { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import type { ElectronicDocument } from "../types";

type GetElectronicDocumentsColumnsParams = {
  t: ReturnType<typeof useAppTranslator>["t"];
};

const haciendaColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  submitted: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  error: "bg-red-100 text-red-800",
};

const haciendaTranslationMap: Record<string, FrontendTranslationKey> = {
  pending: "sales.documents.hacienda_pending",
  submitted: "sales.documents.hacienda_submitted",
  accepted: "sales.documents.hacienda_accepted",
  rejected: "sales.documents.hacienda_rejected",
  error: "sales.documents.hacienda_error",
};

const documentTypeTranslationMap: Record<string, FrontendTranslationKey> = {
  factura_electronica: "sales.documents.type_factura_electronica",
  tiquete_electronico: "sales.documents.type_tiquete_electronico",
  nota_credito: "sales.documents.type_nota_credito",
  nota_debito: "sales.documents.type_nota_debito",
};

function getElectronicDocumentsColumns({
  t,
}: GetElectronicDocumentsColumnsParams): ColumnDef<ElectronicDocument>[] {
  return [
    {
      accessorKey: "code",
      header: t("sales.documents.document_type"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">{row.original.code ?? "-"}</p>
          <p className="text-sm text-muted-foreground">
            {t(
              documentTypeTranslationMap[row.original.document_type] ??
                "sales.documents.type_factura_electronica",
            )}
          </p>
        </div>
      ),
    },
    {
      id: "sale_order",
      header: t("sales.entity.sale_order"),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.sale_order?.code ?? "-"}
        </span>
      ),
    },
    {
      id: "receiver",
      header: t("sales.documents.receiver"),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.receiver_name || "-"}</span>
      ),
    },
    {
      id: "total",
      header: t("sales.total"),
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {(row.original.total ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      accessorKey: "hacienda_status",
      header: t("sales.documents.hacienda_status"),
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${haciendaColorMap[row.original.hacienda_status] ?? ""}`}
        >
          {t(
            haciendaTranslationMap[row.original.hacienda_status] ??
              "sales.documents.hacienda_pending",
          )}
        </span>
      ),
    },
    {
      accessorKey: "emission_date",
      header: t("inventory.common.date"),
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDateTime(row.original.emission_date)}
        </span>
      ),
    },
  ];
}

export { getElectronicDocumentsColumns };
