"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  ChevronDown,
  Mail,
  MapPin,
  Monitor,
  Pencil,
  Phone,
  Plus,
  Power,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Waypoints,
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
import { EmptyState } from "@/shared/components/empty-state";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { cn } from "@/shared/lib/utils";
import { formatDateTime } from "@/shared/lib/utils";
import { buildEntityInitials, pickEntityColor } from "@/shared/lib/entity-visuals";

import type { Branch } from "../types";
import {
  useDeleteBranchMutation,
  useUpdateBranchMutation,
} from "../queries";
import { CreateTerminalDialog } from "./create-terminal-dialog";
import { EditBranchDialog } from "./edit-branch-dialog";
import { TerminalsTable } from "./terminals-table";

type BranchDetailPanelProps = {
  branch: Branch;
};

type DialogKey = "edit" | "deactivate" | "reactivate" | "delete" | "create_terminal";

export function BranchDetailPanel({ branch }: BranchDetailPanelProps) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const {
    activeBranchId,
    availableBranchIds,
    canSwitchBranchContext,
    setActiveBranchId,
  } = useActiveBranch();
  const [activeTab, setActiveTab] = useState<string>("info");
  const [activeDialog, setActiveDialog] = useState<DialogKey | null>(null);
  const updateBranchMutation = useUpdateBranchMutation(branch.id);
  const deleteBranchMutation = useDeleteBranchMutation(branch.id);

  useEffect(() => {
    setActiveTab("info");
  }, [branch.id]);

  const seed = branch.code ?? String(branch.id);
  const color = pickEntityColor(seed, branch.name);
  const initials = buildEntityInitials(branch.name);
  const isActiveContext = branch.id === activeBranchId;
  const canUseAsContext =
    canSwitchBranchContext &&
    availableBranchIds.includes(branch.id) &&
    !isActiveContext;
  const terminalCount = branch.terminals.length;

  async function handleConfirm() {
    try {
      if (activeDialog === "delete") {
        await deleteBranchMutation.mutateAsync();
      } else if (activeDialog === "deactivate") {
        await updateBranchMutation.mutateAsync({ is_active: false });
      } else if (activeDialog === "reactivate") {
        await updateBranchMutation.mutateAsync({ is_active: true });
      }
      setActiveDialog(null);
    } catch {}
  }

  const confirmCopy =
    activeDialog === "delete"
      ? {
          confirmLabel: t("branches.actions.delete"),
          description: t("branches.delete_dialog_description"),
          title: t("branches.delete_dialog_title"),
        }
      : activeDialog === "deactivate"
        ? {
            confirmLabel: t("branches.actions.deactivate"),
            description: t("branches.deactivate_dialog_description", {
              name: branch.name,
            }),
            title: t("branches.deactivate_dialog_title"),
          }
        : activeDialog === "reactivate"
          ? {
              confirmLabel: t("branches.actions.reactivate"),
              description: t("branches.reactivate_dialog_description", {
                name: branch.name,
              }),
              title: t("branches.reactivate_dialog_title"),
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
            className="flex size-12 items-center justify-center rounded-xl bg-white/20 text-sm font-semibold text-white backdrop-blur"
            aria-hidden="true"
          >
            {initials || <Building2 className="size-5" aria-hidden="true" />}
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold leading-tight sm:text-xl">
                {branch.name}
              </h2>
              <Badge className="bg-white/20 px-1.5 py-0 text-[11px] text-white hover:bg-white/30">
                {branch.is_active
                  ? t("common.active_status")
                  : t("common.inactive_status")}
              </Badge>
              {isActiveContext ? (
                <Badge className="bg-white/15 px-1.5 py-0 text-[11px] text-white hover:bg-white/25">
                  {t("branches.detail.active_context_badge")}
                </Badge>
              ) : null}
              {branch.code ? (
                <Badge className="bg-white/15 px-1.5 py-0 text-[11px] font-mono text-white hover:bg-white/25">
                  {branch.code}
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-white/85">
              {branch.address ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" aria-hidden="true" />
                  <span className="truncate">{branch.address}</span>
                </span>
              ) : null}
              {branch.phone ? (
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3" aria-hidden="true" />
                  {branch.phone}
                </span>
              ) : null}
              {branch.email ? (
                <span className="inline-flex items-center gap-1">
                  <Mail className="size-3" aria-hidden="true" />
                  <span className="truncate">{branch.email}</span>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Monitor className="size-3" aria-hidden="true" />
                {t("branches.detail.terminals_count", {
                  count: String(terminalCount),
                })}
              </span>
            </div>
            {branch.updated_at ? (
              <p className="text-[11px] text-white/75">
                {t("branches.detail.updated_at", {
                  value: formatDateTime(branch.updated_at),
                })}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canUseAsContext ? (
              <Button
                onClick={() => setActiveBranchId(branch.id)}
                size="sm"
                variant="secondary"
              >
                <Waypoints className="size-4" aria-hidden="true" />
                {t("branches.use_as_context_button")}
              </Button>
            ) : null}
            <BranchActionsMenu
              canEdit={can("branches.update")}
              canDelete={can("branches.delete")}
              isActive={branch.is_active}
              onSelect={(dialog) => setActiveDialog(dialog)}
            />
          </div>
        </div>
      </section>

      {!branch.is_active && can("branches.update") ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <Power className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="flex-1 space-y-2">
            <p className="font-medium">
              {t("branches.detail.inactive_warning_title")}
            </p>
            <p>{t("branches.detail.inactive_warning_description")}</p>
            <Button
              onClick={() => setActiveDialog("reactivate")}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {t("branches.actions.reactivate")}
            </Button>
          </div>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">
            {t("branches.detail.tabs.info")}
          </TabsTrigger>
          <TabsTrigger value="terminals">
            {t("branches.detail.tabs.terminals", {
              count: String(terminalCount),
            })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-3">
          <BranchInfoTab branch={branch} />
        </TabsContent>

        <TabsContent value="terminals" className="space-y-3">
          <div className="flex items-center justify-end">
            {can("branches.create_terminal") ? (
              <Button
                onClick={() => setActiveDialog("create_terminal")}
                size="sm"
                variant="outline"
              >
                <Plus className="size-4" aria-hidden="true" />
                {t("branches.create_terminal_button")}
              </Button>
            ) : null}
          </div>
          {terminalCount > 0 ? (
            <TerminalsTable branchId={branch.id} data={branch.terminals} />
          ) : (
            <EmptyState
              action={
                can("branches.create_terminal") ? (
                  <Button onClick={() => setActiveDialog("create_terminal")}>
                    <Plus className="size-4" aria-hidden="true" />
                    {t("branches.create_terminal_button")}
                  </Button>
                ) : null
              }
              description={t("branches.no_terminals_description")}
              icon={Monitor}
              title={t("branches.no_terminals_title")}
            />
          )}
        </TabsContent>
      </Tabs>

      <EditBranchDialog
        branch={branch}
        onOpenChange={(open) => setActiveDialog(open ? "edit" : null)}
        open={activeDialog === "edit"}
      />
      <CreateTerminalDialog
        branchId={branch.id}
        branchName={branch.name}
        onOpenChange={(open) => setActiveDialog(open ? "create_terminal" : null)}
        open={activeDialog === "create_terminal"}
      />
      {confirmCopy ? (
        <ConfirmDialog
          confirmLabel={confirmCopy.confirmLabel}
          description={confirmCopy.description}
          onConfirm={handleConfirm}
          onOpenChange={(open) => {
            if (!open) setActiveDialog(null);
          }}
          open={
            activeDialog === "delete" ||
            activeDialog === "deactivate" ||
            activeDialog === "reactivate"
          }
          title={confirmCopy.title}
        />
      ) : null}
    </div>
  );
}

function BranchInfoTab({ branch }: { branch: Branch }) {
  const { t } = useAppTranslator();

  const locationParts = [
    branch.address,
    branch.district,
    branch.canton,
    branch.province,
    branch.city,
  ].filter(Boolean);

  const identification = branch.identification_number
    ? branch.identification_type
      ? `${branch.identification_type} · ${branch.identification_number}`
      : branch.identification_number
    : null;

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <InfoField label={t("branches.detail.fields.legal_name")} value={branch.legal_name} />
      <InfoField label={t("branches.detail.fields.business_name")} value={branch.business_name} />
      <InfoField label={t("branches.detail.fields.branch_number")} value={branch.branch_number} mono />
      <InfoField label={t("branches.detail.fields.code")} value={branch.code} mono />
      <InfoField label={t("branches.detail.fields.identification")} value={identification} />
      <InfoField label={t("branches.detail.fields.cedula_juridica")} value={branch.cedula_juridica} mono />
      <InfoField label={t("branches.detail.fields.activity_code")} value={branch.activity_code} mono />
      <InfoField label={t("branches.detail.fields.provider_code")} value={branch.provider_code} mono />
      <InfoField label={t("branches.detail.fields.phone")} value={branch.phone} />
      <InfoField label={t("branches.detail.fields.email")} value={branch.email} />
      <InfoField
        className="sm:col-span-2"
        label={t("branches.detail.fields.location")}
        value={locationParts.length ? locationParts.join(" · ") : null}
      />
      <InfoField
        label={t("branches.detail.fields.coordinates")}
        value={
          branch.latitude != null && branch.longitude != null
            ? `${branch.latitude.toFixed(5)}, ${branch.longitude.toFixed(5)}`
            : null
        }
        mono
      />
      <InfoField
        label={t("branches.detail.fields.signature_type")}
        value={branch.signature_type}
      />

      <div className="space-y-1 sm:col-span-2">
        <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {t("branches.detail.fields.hacienda_config")}
        </dt>
        <dd className="flex flex-wrap gap-2">
          <ConfigBadge
            active={branch.has_crypto_key}
            label={t("branches.detail.config.crypto_key")}
          />
          <ConfigBadge
            active={branch.has_hacienda_password}
            label={t("branches.detail.config.hacienda_password")}
          />
          <ConfigBadge
            active={branch.has_mail_key}
            label={t("branches.detail.config.mail_key")}
          />
        </dd>
      </div>
    </dl>
  );
}

function InfoField({
  label,
  value,
  className,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  className?: string;
  mono?: boolean;
}) {
  const { t } = useAppTranslator();
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "text-sm",
          mono && "font-mono",
          !value && "text-muted-foreground/70",
        )}
      >
        {value ?? t("common.not_set")}
      </dd>
    </div>
  );
}

function ConfigBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <Badge
      className={cn(
        "px-1.5 py-0 text-[11px]",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-100 text-zinc-700",
      )}
      variant="outline"
    >
      <ShieldCheck className="size-3" aria-hidden="true" />
      {label}
    </Badge>
  );
}

type ActionDialog = "edit" | "deactivate" | "reactivate" | "delete";

function BranchActionsMenu({
  canEdit,
  canDelete,
  isActive,
  onSelect,
}: {
  canEdit: boolean;
  canDelete: boolean;
  isActive: boolean;
  onSelect: (dialog: ActionDialog) => void;
}) {
  const { t } = useAppTranslator();
  const hasAny = canEdit || canDelete;
  if (!hasAny) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary">
          {t("branches.actions.menu_label")}
          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit ? (
          <>
            <DropdownMenuItem onSelect={() => onSelect("edit")}>
              <Pencil className="size-4" aria-hidden="true" />
              {t("branches.actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                onSelect(isActive ? "deactivate" : "reactivate")
              }
            >
              {isActive ? (
                <>
                  <Power className="size-4" aria-hidden="true" />
                  {t("branches.actions.deactivate")}
                </>
              ) : (
                <>
                  <RotateCcw className="size-4" aria-hidden="true" />
                  {t("branches.actions.reactivate")}
                </>
              )}
            </DropdownMenuItem>
          </>
        ) : null}
        {canDelete ? (
          <>
            {canEdit ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive data-[highlighted]:bg-destructive/10"
              onSelect={() => onSelect("delete")}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t("branches.actions.delete")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
