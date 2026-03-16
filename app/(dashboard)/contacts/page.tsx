"use client";

import { useState, type FormEvent } from "react";
import { ContactRound, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreateContactDialog } from "@/features/contacts/components/create-contact-dialog";
import { EditContactDialog } from "@/features/contacts/components/edit-contact-dialog";
import { ContactTypeBadge } from "@/features/contacts/components/contact-type-badge";
import { ContactsTable } from "@/features/contacts/components/contacts-table";
import { useContactLookupQuery, useContactsQuery } from "@/features/contacts/queries";
import { DataCard } from "@/shared/components/data-card";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { formatDateTime } from "@/shared/lib/utils";

export default function ContactsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [lookupInput, setLookupInput] = useState("");
  const [submittedLookup, setSubmittedLookup] = useState("");
  const [lookupEditOpen, setLookupEditOpen] = useState(false);
  const { activeBranchId, isBusinessLevelContext } = useActiveBranch();
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const { isTenantContextMode, isTenantMode } = usePlatformMode();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const contactsQuery = useContactsQuery(can("contacts.view") && canRunTenantQueries);
  const lookupQuery = useContactLookupQuery(
    submittedLookup,
    canRunTenantQueries && Boolean(submittedLookup),
  );
  const totalContacts = contactsQuery.data?.length ?? 0;
  const activeContacts = contactsQuery.data?.filter((contact) => contact.is_active).length ?? 0;

  function handleLookupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextLookup = lookupInput.trim();

    if (!nextLookup) {
      toast.info(t("contacts.lookup_empty_input"));
      return;
    }

    if (nextLookup === submittedLookup) {
      lookupQuery.refetch();
      return;
    }

    setSubmittedLookup(nextLookup);
  }

  if (!can("contacts.view")) {
    return (
      <ErrorState
        description="You do not have permission to view contacts."
        title="Access denied"
      />
    );
  }

  return (
    <>
      <PageHeader
        actions={
          can("contacts.create") ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" />
              Create contact
            </Button>
          ) : null
        }
        description="Manage customers, suppliers and identification lookups from the same administrative screen."
        eyebrow="Administration"
        title="Contacts"
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          Active branch context: {isBusinessLevelContext ? "Company level" : (activeBranchId ?? "None")}
        </Badge>
        <Badge variant="outline">Query source: /api/contacts</Badge>
        {submittedLookup ? <Badge variant="outline">Lookup: {submittedLookup}</Badge> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.7fr_0.7fr_1.6fr]">
        <DataCard
          description="Contacts returned by the backend for the authenticated tenant."
          icon={<ContactRound className="size-5" />}
          title="Registered contacts"
          value={totalContacts}
        />
        <DataCard
          description="Active records ready to be reused by future modules."
          icon={<Plus className="size-5" />}
          title="Active contacts"
          value={activeContacts}
        />

        <Card>
          <CardHeader>
            <CardTitle>Lookup by identification</CardTitle>
            <CardDescription>
              Search a contact record using the backend lookup endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleLookupSubmit}>
              <Input
                onChange={(event) => setLookupInput(event.target.value)}
                placeholder="3101123456"
                value={lookupInput}
              />
              <Button type="submit">
                <Search className="size-4" />
                Search
              </Button>
            </form>

            {submittedLookup ? (
              <>
                {lookupQuery.isLoading ? (
                  <LoadingState
                    className="min-h-0 p-6"
                    description="Searching contact by identification."
                  />
                ) : null}
                {lookupQuery.isError ? (
                  <ErrorState
                    className="min-h-0 p-6"
                    description={getBackendErrorMessage(
                      lookupQuery.error,
                      t("contacts.lookup_error_fallback"),
                    )}
                    onRetry={() => lookupQuery.refetch()}
                  />
                ) : null}
                {lookupQuery.isSuccess && !lookupQuery.data ? (
                  <EmptyState
                    className="min-h-0 py-10"
                    description={`No contact was returned for ${submittedLookup}.`}
                    icon={Search}
                    title="No contact found"
                  />
                ) : null}
                {lookupQuery.data ? (
                  <div className="space-y-3 rounded-xl border border-border/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{lookupQuery.data.name}</p>
                      <ContactTypeBadge type={lookupQuery.data.type} />
                      <Badge variant="outline">
                        {lookupQuery.data.is_active ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </div>
                    <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                      <p>
                        Identification:{" "}
                        {lookupQuery.data.identification_number || "No identification number"}
                      </p>
                      <p>Email: {lookupQuery.data.email || "No email"}</p>
                      <p>Phone: {lookupQuery.data.phone || "No phone"}</p>
                      <p>Updated: {formatDateTime(lookupQuery.data.updated_at)}</p>
                    </div>
                    {can("contacts.update") ? (
                      <div className="flex justify-end">
                        <Button onClick={() => setLookupEditOpen(true)} variant="outline">
                          Edit contact
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {contactsQuery.isLoading ? <LoadingState description="Loading contacts." /> : null}
      {contactsQuery.isError ? (
        <ErrorState
          description={getBackendErrorMessage(
            contactsQuery.error,
            t("common.load_failed"),
          )}
          onRetry={() => contactsQuery.refetch()}
        />
      ) : null}
      {contactsQuery.data?.length === 0 ? (
        <EmptyState
          action={
            can("contacts.create") ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                Create contact
              </Button>
            ) : null
          }
          description="Create the first contact record for customers, suppliers or both."
          icon={ContactRound}
          title="No contacts found"
        />
      ) : null}
      {contactsQuery.data?.length ? <ContactsTable data={contactsQuery.data} /> : null}

      <CreateContactDialog onOpenChange={setCreateDialogOpen} open={createDialogOpen} />
      {lookupQuery.data ? (
        <EditContactDialog
          contactId={lookupQuery.data.id}
          onOpenChange={setLookupEditOpen}
          open={lookupEditOpen}
        />
      ) : null}
    </>
  );
}
