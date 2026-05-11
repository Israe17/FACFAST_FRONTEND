"use client";

import { useEffect, useMemo, useState } from "react";
import { ContactRound, PieChart, Plus, Search, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBranchesQuery } from "@/features/branches/queries";
import { ContactDetailPanel } from "@/features/contacts/components/contact-detail-panel";
import { ContactListCard } from "@/features/contacts/components/contact-list-card";
import { CreateContactDialog } from "@/features/contacts/components/create-contact-dialog";
import { contactTypeOptions } from "@/features/contacts/constants";
import { useContactsQuery } from "@/features/contacts/queries";
import { usePriceListsQuery } from "@/features/inventory/queries";
import { useUsersQuery } from "@/features/users/queries";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";

const ALL_TYPES = "all";

type StatChipProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
};

function StatChip({ icon: Icon, label, value, hint }: StatChipProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold leading-tight">{value}</p>
        {hint ? (
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const { isTenantContextMode, isTenantMode } = usePlatformMode();
  const canRunTenantQueries = isTenantMode || isTenantContextMode;
  const canViewContacts = can("contacts.view");

  const contactsQuery = useContactsQuery(canViewContacts && canRunTenantQueries);
  // Prefetch catalogs used inside detail panel dialogs.
  useBranchesQuery(can("branches.view") && canRunTenantQueries);
  usePriceListsQuery(canViewContacts && canRunTenantQueries);
  useUsersQuery(can("users.view") && canRunTenantQueries);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const contacts = contactsQuery.data ?? [];

  const filteredContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return contacts.filter((contact) => {
      if (typeFilter !== ALL_TYPES) {
        const contactType = contact.type ?? "";
        if (contactType !== typeFilter) return false;
      }
      if (!term) return true;
      const haystack =
        `${contact.name} ${contact.email ?? ""} ${contact.identification_number ?? ""} ${contact.code ?? ""} ${contact.commercial_name ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [contacts, searchTerm, typeFilter]);

  useEffect(() => {
    if (!filteredContacts.length) {
      if (selectedContactId !== null) {
        setSelectedContactId(null);
      }
      return;
    }
    if (
      !selectedContactId ||
      !filteredContacts.some(
        (contact) => String(contact.id) === selectedContactId,
      )
    ) {
      setSelectedContactId(String(filteredContacts[0].id));
    }
  }, [filteredContacts, selectedContactId]);

  if (!canViewContacts) {
    return (
      <ErrorState
        description={t("contacts.page_access_denied")}
        title={t("common.access_denied_title")}
      />
    );
  }

  const selectedContact =
    filteredContacts.find((c) => String(c.id) === selectedContactId) ?? null;
  const totalContacts = contacts.length;
  const activeContacts = contacts.filter(
    (contact) => contact.is_active !== false,
  ).length;
  const customerCount = contacts.filter(
    (c) => c.type === "customer" || c.type === "both",
  ).length;
  const supplierCount = contacts.filter(
    (c) => c.type === "supplier" || c.type === "both",
  ).length;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("contacts.page_eyebrow")}
          </p>
          <h1 className="text-xl font-semibold sm:text-2xl">
            {t("contacts.page_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("contacts.page_description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <StatChip
              icon={ContactRound}
              label={t("contacts.kpi.total_title")}
              value={totalContacts}
              hint={t("contacts.kpi.active_hint", {
                count: String(activeContacts),
              })}
            />
            <StatChip
              icon={Users}
              label={t("contacts.kpi.types_title")}
              value={`${customerCount} / ${supplierCount}`}
              hint={t("contacts.kpi.types_hint")}
            />
            <StatChip
              icon={PieChart}
              label={t("contacts.kpi.filtered_title")}
              value={filteredContacts.length}
            />
          </div>

          {can("contacts.create") ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" />
              {t("contacts.create_button")}
            </Button>
          ) : null}
        </div>
      </header>

      {contactsQuery.isLoading ? (
        <LoadingState description={t("contacts.loading_contacts")} />
      ) : null}
      {contactsQuery.isError ? (
        <ErrorState
          description={
            getTranslatedBackendErrorMessage(contactsQuery.error, {
              fallbackMessage: t("common.load_failed"),
              translateMessage: t,
            }) ?? undefined
          }
          onRetry={() => contactsQuery.refetch()}
        />
      ) : null}
      {!contactsQuery.isLoading &&
      !contactsQuery.isError &&
      contacts.length === 0 ? (
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

      {contacts.length ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <aside className="flex min-w-0 flex-col gap-3 lg:max-h-[calc(100vh-12rem)] lg:overflow-hidden">
            <div className="space-y-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  className="pl-8"
                  placeholder={t("contacts.search_placeholder")}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("contacts.type_filter.placeholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_TYPES}>
                    {t("contacts.type_filter.all")}
                  </SelectItem>
                  {contactTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {t("contacts.filter_results", {
                  count: String(filteredContacts.length),
                  total: String(contacts.length),
                })}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {filteredContacts.length ? (
                <ul className="space-y-1.5">
                  {filteredContacts.map((contact) => (
                    <li key={contact.id}>
                      <ContactListCard
                        contact={contact}
                        selected={String(contact.id) === selectedContactId}
                        onSelect={(next) =>
                          setSelectedContactId(String(next.id))
                        }
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={ContactRound}
                  title={t("contacts.filter_empty_title")}
                  description={t("contacts.filter_empty_description")}
                />
              )}
            </div>
          </aside>

          <div className="min-w-0">
            {selectedContact ? (
              <ContactDetailPanel
                key={selectedContact.id}
                contact={selectedContact}
              />
            ) : (
              <EmptyState
                icon={ContactRound}
                title={t("contacts.select_contact_title")}
                description={t("contacts.select_contact_description")}
              />
            )}
          </div>
        </div>
      ) : null}

      <CreateContactDialog
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
      />
    </>
  );
}
