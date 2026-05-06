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
import { useBranchesQuery } from "@/features/branches/queries";
import { useContactLookupQuery, useContactsPaginatedQuery } from "@/features/contacts/queries";
import { useUsersQuery } from "@/features/users/queries";
import { usePriceListsQuery } from "@/features/inventory/queries";
import { useServerTableState } from "@/shared/hooks/use-server-table-state";
import { DataCard } from "@/shared/components/data-card";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { PageHeader } from "@/shared/components/page-header";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";
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
  const { serverState, onStateChange, queryParams } = useServerTableState({ sort_by: "name" });
  const contactsQuery = useContactsPaginatedQuery(queryParams, can("contacts.view") && canRunTenantQueries);
  // Prefetch catalogs for row-action dialogs (branch assignments)
  useBranchesQuery(can("branches.view") && canRunTenantQueries);
  usePriceListsQuery(can("contacts.view") && canRunTenantQueries);
  useUsersQuery(can("users.view") && canRunTenantQueries);
  const lookupQuery = useContactLookupQuery(
    submittedLookup,
    canRunTenantQueries && Boolean(submittedLookup),
  );
  const totalContacts = contactsQuery.data?.total ?? 0;
  const activeContacts = totalContacts;

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
        description={t("contacts.page_access_denied")}
        title={t("common.access_denied_title")}
      />
    );
  }

  const activeBranchValue = isBusinessLevelContext
    ? t("common.enterprise_level")
    : (activeBranchId ?? t("common.none"));

  return (
    <>
      <PageHeader
        actions={
          can("contacts.create") ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" />
              {t("contacts.create_button")}
            </Button>
          ) : null
        }
        description={t("contacts.page_description")}
        eyebrow={t("contacts.page_eyebrow")}
        title={t("contacts.page_title")}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          {t("contacts.active_branch_context", { value: activeBranchValue })}
        </Badge>
        <Badge variant="outline">Query source: /api/contacts</Badge>
        {submittedLookup ? (
          <Badge variant="outline">
            {t("contacts.lookup_badge", { value: submittedLookup })}
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.7fr_0.7fr_1.6fr]">
        <DataCard
          description={t("contacts.stats.registered_description")}
          icon={<ContactRound className="size-5" />}
          title={t("contacts.stats.registered_title")}
          value={totalContacts}
        />
        <DataCard
          description={t("contacts.stats.active_description")}
          icon={<Plus className="size-5" />}
          title={t("contacts.stats.active_title")}
          value={activeContacts}
        />

        <Card>
          <CardHeader>
            <CardTitle>{t("contacts.lookup.card_title")}</CardTitle>
            <CardDescription>{t("contacts.lookup.card_description")}</CardDescription>
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
                {t("contacts.lookup.search_button")}
              </Button>
            </form>

            {submittedLookup ? (
              <>
                {lookupQuery.isLoading ? (
                  <LoadingState
                    className="min-h-0 p-6"
                    description={t("contacts.lookup.searching")}
                  />
                ) : null}
                {lookupQuery.isError ? (
                  <ErrorState
                    className="min-h-0 p-6"
                    description={getTranslatedBackendErrorMessage(
                      lookupQuery.error,
                      {
                        fallbackMessage: t("contacts.lookup_error_fallback"),
                        translateMessage: t,
                      },
                    ) ?? undefined}
                    onRetry={() => lookupQuery.refetch()}
                  />
                ) : null}
                {lookupQuery.isSuccess && !lookupQuery.data ? (
                  <EmptyState
                    className="min-h-0 py-10"
                    description={t("contacts.lookup.not_found_description", { id: submittedLookup })}
                    icon={Search}
                    title={t("contacts.lookup.not_found_title")}
                  />
                ) : null}
                {lookupQuery.data ? (
                  <div className="space-y-3 rounded-xl border border-border/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{lookupQuery.data.name}</p>
                      <ContactTypeBadge type={lookupQuery.data.type} />
                      <Badge variant="outline">
                        {lookupQuery.data.is_active ? t("common.active_status") : t("common.inactive_status")}
                      </Badge>
                    </div>
                    <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                      <p>
                        {t("contacts.lookup.identification", {
                          value: lookupQuery.data.identification_number || t("contacts.lookup.no_identification"),
                        })}
                      </p>
                      <p>{t("contacts.lookup.email_label", { value: lookupQuery.data.email || t("common.no_email") })}</p>
                      <p>{t("contacts.lookup.phone_label", { value: lookupQuery.data.phone || t("common.no_phone") })}</p>
                      <p>{t("contacts.lookup.updated_label", { value: formatDateTime(lookupQuery.data.updated_at) })}</p>
                    </div>
                    {can("contacts.update") ? (
                      <div className="flex justify-end">
                        <Button onClick={() => setLookupEditOpen(true)} variant="outline">
                          {t("contacts.lookup.edit_button")}
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

      {contactsQuery.isLoading ? <LoadingState description={t("contacts.loading_contacts")} /> : null}
      {contactsQuery.isError ? (
        <ErrorState
          description={getTranslatedBackendErrorMessage(contactsQuery.error, {
            fallbackMessage: t("common.load_failed"),
            translateMessage: t,
          }) ?? undefined}
          onRetry={() => contactsQuery.refetch()}
        />
      ) : null}
      {contactsQuery.data?.data.length === 0 ? (
        <EmptyState
          action={
            can("contacts.create") ? (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" />
                {t("contacts.create_button")}
              </Button>
            ) : null
          }
          description={t("contacts.empty_description")}
          icon={ContactRound}
          title={t("contacts.empty_title")}
        />
      ) : null}
      {contactsQuery.data?.data.length ? (
        <ContactsTable
          data={contactsQuery.data.data}
          onServerStateChange={onStateChange}
          serverState={serverState}
          total={contactsQuery.data.total}
        />
      ) : null}

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
