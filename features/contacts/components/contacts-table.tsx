"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Pencil, Power, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { DataTable, type ServerSideState } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import type { TableAction } from "@/shared/components/table-row-actions";
import { usePermissions } from "@/shared/hooks/use-permissions";
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
  return (
    <Badge
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-100 text-zinc-700"
      }
      variant="outline"
    >
      {isActive ? "ACTIVE" : "INACTIVE"}
    </Badge>
  );
}

function ContactRowActions({ contact }: { contact: Contact }) {
  const { can } = usePermissions();
  const [activeDialog, setActiveDialog] = useState<
    "branches" | "deactivate" | "delete" | "edit" | "reactivate" | null
  >(null);
  const updateContactMutation = useUpdateContactMutation(contact.id);
  const deleteContactMutation = useDeleteContactMutation(contact.id);

  const actions: TableAction[] = [];
  if (can("contacts.update")) {
    actions.push({ icon: Pencil, label: "Edit contact", onClick: () => setActiveDialog("edit") });
    actions.push(
      contact.is_active
        ? {
            icon: Power,
            label: "Deactivate",
            onClick: () => setActiveDialog("deactivate"),
            variant: "destructive",
          }
        : {
            icon: RotateCcw,
            label: "Reactivate",
            onClick: () => setActiveDialog("reactivate"),
          },
    );
  }
  if (can("contacts.delete")) {
    actions.push({
      icon: Trash2,
      label: "Delete permanently",
      onClick: () => setActiveDialog("delete"),
      variant: "destructive",
    });
  }
  if (can("contacts.view_branch_assignments")) {
    actions.push({
      icon: Building2,
      label: "Branch context",
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
          confirmLabel: "Delete permanently",
          description: `This permanently deletes ${contact.name}. This action cannot be undone.`,
          title: "Delete contact permanently",
        }
      : activeDialog === "deactivate"
        ? {
            confirmLabel: "Deactivate",
            description: `${contact.name} will remain visible for history, but it should no longer be used in new operations.`,
            title: "Deactivate contact",
          }
        : activeDialog === "reactivate"
          ? {
              confirmLabel: "Reactivate",
              description: `${contact.name} will become available again for new operations and lookups.`,
              title: "Reactivate contact",
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
  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "name",
      header: "Contact",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/contacts/${row.original.id}`} className="font-medium hover:underline text-primary">
              {row.original.name}
            </Link>
            <ContactTypeBadge type={row.original.type} />
          </div>
          <p className="text-sm text-muted-foreground">
            {row.original.commercial_name || "No commercial name provided."}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "identification_number",
      header: "Identification",
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.identification_number || "No ID number"}</p>
          <p className="text-muted-foreground">
            {row.original.identification_type
              ? `${row.original.identification_type} - ${getIdentificationTypeLabel(row.original.identification_type)}`
              : "No ID type"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Contact info",
      cell: ({ row }) => (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{row.original.email || "No email"}</p>
          <p>{row.original.phone || "No phone"}</p>
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => <ContactStatusBadge isActive={row.original.is_active} />,
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) => <span>{formatDateTime(row.original.updated_at)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ContactRowActions contact={row.original} />,
    },
  ];

  if (serverState && onServerStateChange && total !== undefined) {
    return (
      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No contacts found."
        onServerStateChange={onServerStateChange}
        serverSide
        serverState={serverState}
        total={total}
      />
    );
  }

  return <DataTable columns={columns} data={data} emptyMessage="No contacts found." />;
}

export { ContactsTable };
