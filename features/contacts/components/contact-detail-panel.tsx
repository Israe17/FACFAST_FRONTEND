"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  ChevronDown,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { LoadingState } from "@/shared/components/loading-state";
import { MapView } from "@/shared/components/map-view";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { cn } from "@/shared/lib/utils";
import { formatDateTime } from "@/shared/lib/utils";

import {
  useContactBranchContextQuery,
  useDeleteContactMutation,
  useUpdateContactMutation,
} from "../queries";
import type { Contact } from "../types";
import { buildContactInitials, pickContactColor } from "../contact-visuals";
import { ContactBranchAssignmentsDialog } from "./contact-branch-assignments-dialog";
import { ContactTypeBadge } from "./contact-type-badge";
import { EditContactDialog } from "./edit-contact-dialog";

type ContactDetailPanelProps = {
  contact: Contact;
};

type ActionDialog = "edit" | "branches" | "deactivate" | "reactivate" | "delete";

export function ContactDetailPanel({ contact }: ContactDetailPanelProps) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const [activeTab, setActiveTab] = useState<string>("information");
  const [activeDialog, setActiveDialog] = useState<ActionDialog | null>(null);
  const updateContactMutation = useUpdateContactMutation(contact.id);
  const deleteContactMutation = useDeleteContactMutation(contact.id);

  useEffect(() => {
    setActiveTab("information");
  }, [contact.id]);

  const seed = contact.code ?? contact.identification_number ?? String(contact.id);
  const color = pickContactColor(seed, contact.name);
  const initials = buildContactInitials(contact.name);
  const isActive = contact.is_active ?? true;

  const canUpdate = can("contacts.update");
  const canDelete = can("contacts.delete");
  const canManageBranches = can("contacts.view_branch_assignments");

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

  return (
    <div className="space-y-3">
      <section
        className={cn(
          "relative overflow-hidden rounded-xl bg-gradient-to-br p-3 shadow-sm sm:p-4",
          color.hero,
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="flex size-12 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white backdrop-blur"
            aria-hidden="true"
          >
            {initials}
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold leading-tight sm:text-xl">
                {contact.name}
              </h2>
              <Badge className="bg-white/20 px-1.5 py-0 text-[11px] text-white hover:bg-white/30">
                {isActive
                  ? t("contacts.detail.active")
                  : t("contacts.detail.inactive")}
              </Badge>
              <ContactTypeBadge type={contact.type} />
              {contact.code ? (
                <span className="font-mono text-[11px] text-white/80">
                  {contact.code}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-white/85">
              {contact.email ? (
                <span className="inline-flex items-center gap-1">
                  <Mail className="size-3" aria-hidden="true" />
                  <span className="truncate">{contact.email}</span>
                </span>
              ) : null}
              {contact.phone ? (
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3" aria-hidden="true" />
                  {contact.phone}
                </span>
              ) : null}
              {contact.identification_number ? (
                <span className="inline-flex items-center gap-1">
                  <FileText className="size-3" aria-hidden="true" />
                  <span className="font-mono">{contact.identification_number}</span>
                </span>
              ) : null}
            </div>
            {contact.commercial_name ? (
              <p className="text-[11px] text-white/75">
                {contact.commercial_name}
              </p>
            ) : null}
          </div>

          <ContactActionsMenu
            canEdit={canUpdate}
            canToggleStatus={canUpdate}
            canDelete={canDelete}
            canManageBranches={canManageBranches}
            isActive={isActive}
            onSelect={(dialog) => setActiveDialog(dialog)}
          />
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="information">
            {t("contacts.tabs.information")}
          </TabsTrigger>
          {canManageBranches ? (
            <TabsTrigger value="branches">
              {t("contacts.tabs.branches")}
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="map">{t("contacts.tabs.map")}</TabsTrigger>
        </TabsList>

        <TabsContent value="information" className="space-y-3">
          <ContactInformationTab contact={contact} />
        </TabsContent>

        {canManageBranches ? (
          <TabsContent value="branches" className="space-y-3">
            <ContactBranchesTab
              contact={contact}
              enabled={activeTab === "branches"}
              onManageClick={() => setActiveDialog("branches")}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="map" className="space-y-3">
          <ContactMapTab contact={contact} />
        </TabsContent>
      </Tabs>

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
            if (!open) setActiveDialog(null);
          }}
          open={
            activeDialog === "delete" ||
            activeDialog === "deactivate" ||
            activeDialog === "reactivate"
          }
          title={dialogCopy.title}
        />
      ) : null}
    </div>
  );
}

function ContactActionsMenu({
  canEdit,
  canToggleStatus,
  canDelete,
  canManageBranches,
  isActive,
  onSelect,
}: {
  canEdit: boolean;
  canToggleStatus: boolean;
  canDelete: boolean;
  canManageBranches: boolean;
  isActive: boolean;
  onSelect: (dialog: ActionDialog) => void;
}) {
  const { t } = useAppTranslator();
  const hasAny = canEdit || canToggleStatus || canDelete || canManageBranches;
  if (!hasAny) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary">
          {t("contacts.actions.menu_label")}
          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit ? (
          <DropdownMenuItem onSelect={() => onSelect("edit")}>
            <Pencil className="size-4" aria-hidden="true" />
            {t("contacts.actions.edit")}
          </DropdownMenuItem>
        ) : null}
        {canManageBranches ? (
          <DropdownMenuItem onSelect={() => onSelect("branches")}>
            <Building2 className="size-4" aria-hidden="true" />
            {t("contacts.actions.branch_context")}
          </DropdownMenuItem>
        ) : null}
        {canToggleStatus ? (
          <DropdownMenuItem
            onSelect={() => onSelect(isActive ? "deactivate" : "reactivate")}
          >
            {isActive ? (
              <Power className="size-4" aria-hidden="true" />
            ) : (
              <RotateCcw className="size-4" aria-hidden="true" />
            )}
            {isActive
              ? t("contacts.actions.deactivate")
              : t("contacts.actions.reactivate")}
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive data-[highlighted]:bg-destructive/10"
              onSelect={() => onSelect("delete")}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t("contacts.actions.delete")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ContactInformationTab({ contact }: { contact: Contact }) {
  const { t } = useAppTranslator();
  const hasAddress =
    contact.address || contact.province || contact.canton || contact.district;
  const hasExoneration =
    contact.exoneration_type || contact.exoneration_document_number;

  return (
    <>
      <section className="rounded-xl border border-border/70 bg-background p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("contacts.detail.metadata_title")}
        </h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailRow
            label={t("contacts.field.identification")}
            value={contact.identification_number}
            hint={contact.identification_type}
          />
          <DetailRow
            label={t("contacts.field.email")}
            value={contact.email}
          />
          <DetailRow
            label={t("contacts.field.phone")}
            value={contact.phone}
          />
          <DetailRow
            label={t("contacts.field.economic_activity")}
            value={contact.economic_activity_code}
            hint={contact.tax_condition}
          />
          <DetailRow
            label={t("contacts.detail.created_at")}
            value={
              contact.created_at ? formatDateTime(contact.created_at) : null
            }
          />
          <DetailRow
            label={t("contacts.detail.updated_at")}
            value={
              contact.updated_at ? formatDateTime(contact.updated_at) : null
            }
          />
        </dl>
      </section>

      <section className="rounded-xl border border-border/70 bg-background p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("contacts.detail.address_title")}
        </h3>
        {hasAddress ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {contact.address ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">
                  {t("contacts.field.address")}
                </dt>
                <dd className="text-sm font-medium">{contact.address}</dd>
              </div>
            ) : null}
            <DetailRow
              label={t("contacts.field.province")}
              value={contact.province}
            />
            <DetailRow
              label={t("contacts.field.canton")}
              value={contact.canton}
            />
            <DetailRow
              label={t("contacts.field.district")}
              value={contact.district}
            />
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("contacts.detail.no_address")}
          </p>
        )}
      </section>

      {hasExoneration ? (
        <section className="rounded-xl border border-border/70 bg-background p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("contacts.detail.exoneration_title")}
          </h3>
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <DetailRow
              label={t("contacts.field.exoneration_type")}
              value={contact.exoneration_type}
            />
            <DetailRow
              label={t("contacts.field.exoneration_document")}
              value={contact.exoneration_document_number}
            />
            <DetailRow
              label={t("contacts.field.exoneration_institution")}
              value={contact.exoneration_institution}
            />
            <DetailRow
              label={t("contacts.field.exoneration_date")}
              value={contact.exoneration_issue_date}
            />
            <DetailRow
              label={t("contacts.field.exoneration_percentage")}
              value={
                contact.exoneration_percentage != null
                  ? `${contact.exoneration_percentage}%`
                  : null
              }
            />
          </dl>
        </section>
      ) : null}
    </>
  );
}

function ContactBranchesTab({
  contact,
  enabled,
  onManageClick,
}: {
  contact: Contact;
  enabled: boolean;
  onManageClick: () => void;
}) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const branchContextQuery = useContactBranchContextQuery(contact.id, enabled);

  if (branchContextQuery.isLoading) {
    return <LoadingState description={t("contacts.detail.loading")} />;
  }

  const context = branchContextQuery.data;
  const assignments = context?.assignments ?? [];
  const isGlobal = context?.mode !== "scoped";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isGlobal
            ? t("contacts.branch_assignments.global_mode_hint")
            : t("contacts.branch_assignments.scoped_mode_hint", {
                count: String(assignments.length),
              })}
        </p>
        {can("contacts.update") ? (
          <Button onClick={onManageClick} size="sm" variant="outline">
            <Building2 className="size-4" aria-hidden="true" />
            {t("contacts.actions.branch_context")}
          </Button>
        ) : null}
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          {isGlobal
            ? t("contacts.branch_assignments.global_empty_description")
            : t("contacts.branch_assignments.scoped_empty_description")}
        </div>
      ) : (
        <ul className="space-y-2">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="rounded-xl border border-border/70 bg-background p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{assignment.branch.name}</p>
                {assignment.is_default ? (
                  <Badge variant="secondary" className="text-[10px]">
                    {t("contacts.branch_assignments.default_short")}
                  </Badge>
                ) : null}
                {assignment.is_preferred ? (
                  <Badge variant="secondary" className="text-[10px]">
                    {t("contacts.branch_assignments.preferred_short")}
                  </Badge>
                ) : null}
                {assignment.is_exclusive ? (
                  <Badge variant="secondary" className="text-[10px]">
                    {t("contacts.branch_assignments.exclusive_short")}
                  </Badge>
                ) : null}
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-auto text-[10px]",
                    assignment.is_active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 bg-zinc-100 text-zinc-700",
                  )}
                >
                  {assignment.is_active
                    ? t("contacts.branch_assignments.active")
                    : t("contacts.branch_assignments.inactive")}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                {assignment.sales_enabled ? (
                  <span>{t("contacts.branch_assignments.sales_enabled")}</span>
                ) : null}
                {assignment.purchases_enabled ? (
                  <span>
                    {t("contacts.branch_assignments.purchases_enabled")}
                  </span>
                ) : null}
                {assignment.credit_enabled ? (
                  <span>{t("contacts.branch_assignments.credit_enabled")}</span>
                ) : null}
                {assignment.account_manager ? (
                  <span>
                    {t("contacts.branch_assignments.account_manager")}:{" "}
                    {assignment.account_manager.name}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ContactMapTab({ contact }: { contact: Contact }) {
  const { t } = useAppTranslator();
  const lat = contact.delivery_latitude;
  const lng = contact.delivery_longitude;

  if (lat == null || lng == null) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/10 py-12 text-muted-foreground">
        <MapPin className="mb-2 size-8" aria-hidden="true" />
        <p className="text-sm font-medium">
          {t("contacts.detail.no_location")}
        </p>
        <p className="mt-1 text-xs">{t("contacts.detail.no_location_hint")}</p>
      </div>
    );
  }

  return (
    <div className="relative z-0 h-72 overflow-hidden rounded-xl border border-border/70">
      <MapView
        markers={[
          {
            id: `contact-${contact.id}`,
            lat,
            lng,
            color: "#3b82f6",
            popup: `<strong>${contact.name}</strong>`,
          },
        ]}
        center={[lat, lng]}
        zoom={14}
        className="h-full rounded-none"
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number | null | undefined;
  hint?: string | null;
}) {
  const { t } = useAppTranslator();
  const display =
    value == null || value === ""
      ? t("contacts.detail.not_available")
      : String(value);
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{display}</dd>
      {hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
