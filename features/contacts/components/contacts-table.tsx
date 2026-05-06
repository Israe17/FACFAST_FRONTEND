"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Eye, Pencil, Power, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { DataTable, type ServerSideState } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import type { TableAction } from "@/shared/components/table-row-actions";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { formatDateTime } from "@/shared/lib/utils";

import type { Contact } from "../types";
import { useDeleteContactMutation, useUpdateContactMutation } from "../queries";
import { getIdentificationTypeLabel } from "../constants";
import { ContactTypeBadge } from "./contact-type-badge";
import { ContactBranchAssignmentsDialog } from "./contact-branch-assignments-dialog";
import { EditContactDialog } from "./edit-contact-dialog";

type ContactsTableProps = {
  data: Contact[];
  onServerStateChange?: (state: ServerSideState) => void;
  serverState?: ServerSideState;
  total?: number;
};

function ContactStatusBadge({ isActive }: { isActive: boolean }) {
  const { t } = useAppTranslator();
  return (
    <Badge
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-100 text-zinc-700"
      }
      variant="outline"
    >
      {isActive ? t("common.active_status") : t("common.inactive_status")}
    </Badge>
  );
}

function ContactRowActions({ contact }: { contact: Contact }) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const [activeDialog, setActiveDialog] = useState<
    "branches" | "deactivate" | "delete" | "edit" | "reactivate" | null
  >(null);
  const updateContactMutation = useUpdateContactMutation(contact.id);
  const deleteContactMutation = useDeleteContactMutation(contact.id);

  const actions: TableAction[] = [];
  if (can("contacts.update")) {
    actions.push({ icon: Pencil, label: t("contacts.actions.edit"), onClick: () => setActiveDialog("edit") });
    actions.push(
      contact.is_active
        ? {
            icon: Power,
            label: t("contacts.actions.deactivate"),
            onClick: () => setActiveDialog("deactivate"),
            variant: "destructive",
          }
        : {
            icon: RotateCcw,
            label: t("contacts.actions.reactivate"),
            onClick: () => setActiveDialog("reactivate"),
          },
    );
  }
  if (can("contacts.delete")) {
    actions.push({
      icon: Trash2,
      label: t("contacts.actions.delete"),
      onClick: () => setActiveDialog("delete"),
      variant: "destructive",
    });
  }
  if (can("contacts.view_branch_assignments")) {
    actions.push({
      icon: Building2,
      label: t("contacts.actions.branch_context"),
      onClick: () => setActiveDialog("branches"),
    });
  }

  async function handleConfirm() {
    try {
      if (activeDialog === "delete") {
        await deleteContactMutation.mutateAsync();
      } else if (activeDialog === "deactivate") {
        await updateContactMutation.mutateAsync({ is_active: false });
      } else if (activeDialog === "reactivate") {
        await updateContactMutation.mutateAsync({ is_active: true });
      }

      setActiveDialog(null);
    } catch {}
  }

  const dialogCopy =
    activeDialog === "delete"
      ? {
          confirmLabel: t("contacts.actions.delete"),
          description: t("contacts.delete_dialog_description", { name: contact.name }),
          title: t("contacts.delete_dialog_title"),
        }
      : activeDialog === "deactivate"
        ? {
            confirmLabel: t("contacts.actions.deactivate"),
            description: t("contacts.deactivate_dialog_description", { name: contact.name }),
            title: t("contacts.deactivate_dialog_title"),
          }
        : activeDialog === "reactivate"
          ? {
              confirmLabel: t("contacts.actions.reactivate"),
              description: t("contacts.reactivate_dialog_description", { name: contact.name }),
              title: t("contacts.reactivate_dialog_title"),
            }
          : null;

  if (!actions.length) {
    return null;
  }

  return (
    <>
      <TableRowActions actions={actions} />
      <EditContactDialog
        contactId={contact.id}
        onOpenChange={(open) => setActiveDialog(open ? "edit" : null)}
        open={activeDialog === "edit"}
      />
      <ContactBranchAssignmentsDialog
        contact={contact}
        onOpenChange={(open) => setActiveDialog(open ? "branches" : null)}
        open={activeDialog === "branches"}
      />
      {dialogCopy ? (
        <ConfirmDialog
          confirmLabel={dialogCopy.confirmLabel}
          description={dialogCopy.description}
          onConfirm={handleConfirm}
          onOpenChange={(open) => {
            if (!open) {
              setActiveDialog(null);
            }
          }}
          open={activeDialog === "deactivate" || activeDialog === "delete" || activeDialog === "reactivate"}
          title={dialogCopy.title}
        />
      ) : null}
    </>
  );
}

function ContactsTable({ data, onServerStateChange, serverState, total }: ContactsTableProps) {
  const { t } = useAppTranslator();
  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "name",
      header: t("contacts.table.header_contact"),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/contacts/${row.original.id}`} className="font-medium hover:underline text-primary">
              {row.original.name}
            </Link>
            <ContactTypeBadge type={row.original.type} />
          </div>
          <p className="text-sm text-muted-foreground">
            {row.original.commercial_name || t("contacts.table.no_commercial_name")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "identification_number",
      header: t("contacts.table.header_identification"),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.identification_number || t("contacts.table.no_id_number")}</p>
          <p className="text-muted-foreground">
            {row.original.identification_type
              ? `${row.original.identification_type} - ${getIdentificationTypeLabel(row.original.identification_type)}`
              : t("contacts.table.no_id_type")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: t("contacts.table.header_contact_info"),
      cell: ({ row }) => (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{row.original.email || t("common.no_email")}</p>
          <p>{row.original.phone || t("common.no_phone")}</p>
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: t("common.status"),
      cell: ({ row }) => <ContactStatusBadge isActive={row.original.is_active} />,
    },
    {
      accessorKey: "updated_at",
      header: t("common.updated"),
      cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
    },
    {
      id: "actions",
      header: t("common.actions"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/contacts/${row.original.id}`}>
              <Eye className="size-4" />
              Ver
            </Link>
          </Button>
          <ContactRowActions contact={row.original} />
        </div>
      ),
    },
  ];

  if (serverState && onServerStateChange && total !== undefined) {
    return (
      <DataTable
        columns={columns}
        data={data}
        emptyMessage={t("contacts.table.empty")}
        onServerStateChange={onServerStateChange}
        serverSide
        serverState={serverState}
        total={total}
      />
    );
  }

  return <DataTable columns={columns} data={data} emptyMessage={t("contacts.table.empty")} />;
}

export { ContactsTable };
