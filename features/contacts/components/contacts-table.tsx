"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable, type ServerSideState } from "@/shared/components/data-table";
import { TableRowActions } from "@/shared/components/table-row-actions";
import type { TableAction } from "@/shared/components/table-row-actions";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { formatDateTime } from "@/shared/lib/utils";

import type { Contact } from "../types";
import { getIdentificationTypeLabel } from "../constants";
import { ContactTypeBadge } from "./contact-type-badge";
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
  const [editOpen, setEditOpen] = useState(false);

  const actions: TableAction[] = [];
  if (can("contacts.update")) {
    actions.push({ icon: Pencil, label: "Edit contact", onClick: () => setEditOpen(true) });
  }

  return (
    <>
      <TableRowActions actions={actions} />
      <EditContactDialog contactId={contact.id} onOpenChange={setEditOpen} open={editOpen} />
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
            <p className="font-medium">{row.original.name}</p>
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
