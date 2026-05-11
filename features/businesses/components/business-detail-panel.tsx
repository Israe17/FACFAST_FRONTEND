"use client";

import { useState } from "react";
import {
  ChevronDown,
  Globe,
  Mail,
  Phone,
  Power,
  RotateCcw,
} from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

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
import {
  buildEntityInitials,
  pickEntityColor,
} from "@/shared/lib/entity-visuals";
import {
  BusinessContactFields,
  BusinessIdentityFields,
  BusinessLocationFields,
  BusinessOperationalFields,
} from "@/features/businesses/components/business-section-fields";
import { BusinessSummaryTab } from "@/features/businesses/components/business-summary-tab";
import type {
  Business,
  UpdateCurrentBusinessInput,
} from "@/features/businesses/types";
import { ActionButton } from "@/shared/components/action-button";
import { DetailBlock } from "@/shared/components/detail-block";
import { FormErrorBanner } from "@/shared/components/form-error-banner";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { cn } from "@/shared/lib/utils";

type BusinessDetailPanelProps = {
  business: Business;
  canUpdate: boolean;
  form: UseFormReturn<UpdateCurrentBusinessInput>;
  formError?: string | null;
  isPending?: boolean;
  isToggling?: boolean;
  onSubmit: (values: UpdateCurrentBusinessInput) => Promise<void> | void;
  onToggleActive: () => void | Promise<void>;
  onResetChanges: () => void;
};

export function BusinessDetailPanel({
  business,
  canUpdate,
  form,
  formError,
  isPending,
  isToggling,
  onSubmit,
  onToggleActive,
  onResetChanges,
}: BusinessDetailPanelProps) {
  const { t } = useAppTranslator();
  const [activeTab, setActiveTab] = useState("summary");

  const businessName = business.name ?? "";
  const seed =
    business.code ?? business.identification_number ?? String(business.id ?? "");
  const color = pickEntityColor(seed, businessName);
  const initials = buildEntityInitials(businessName);
  const isActive = business.is_active ?? true;
  const isDirty = form.formState.isDirty;

  const localeChip = [business.currency_code, business.language]
    .filter(Boolean)
    .join(" · ");
  const identificationChip = [
    business.identification_type,
    business.identification_number,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
      <section
        className={cn(
          "relative overflow-hidden rounded-xl bg-gradient-to-br p-3 shadow-sm sm:p-4",
          color.hero,
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 text-sm font-semibold text-white backdrop-blur"
            aria-hidden="true"
          >
            {business.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logo_url}
                alt={t("business.detail.no_logo_alt", { name: businessName })}
                className="size-full object-cover"
              />
            ) : (
              initials
            )}
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold leading-tight sm:text-xl">
                {businessName || "—"}
              </h2>
              <Badge
                className={cn(
                  "px-1.5 py-0 text-[11px]",
                  isActive
                    ? "bg-emerald-400/30 text-white hover:bg-emerald-400/40"
                    : "bg-white/15 text-white/85 hover:bg-white/25",
                )}
              >
                {isActive
                  ? t("business.field.is_active")
                  : t("contacts.detail.inactive")}
              </Badge>
              {business.code ? (
                <span className="font-mono text-[11px] text-white/80">
                  {business.code}
                </span>
              ) : null}
              {identificationChip ? (
                <Badge className="bg-white/15 px-1.5 py-0 text-[11px] text-white hover:bg-white/25">
                  {identificationChip}
                </Badge>
              ) : null}
              {localeChip ? (
                <Badge className="bg-white/15 px-1.5 py-0 text-[11px] text-white hover:bg-white/25">
                  {localeChip}
                </Badge>
              ) : null}
            </div>
            {business.email || business.phone || business.website ? (
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-white/85">
                {business.email ? (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3" aria-hidden="true" />
                    <span className="truncate">{business.email}</span>
                  </span>
                ) : null}
                {business.phone ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3" aria-hidden="true" />
                    {business.phone}
                  </span>
                ) : null}
                {business.website ? (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="size-3" aria-hidden="true" />
                    <span className="truncate">{business.website}</span>
                  </span>
                ) : null}
              </div>
            ) : null}
            {business.legal_name ? (
              <p className="text-[11px] text-white/75">{business.legal_name}</p>
            ) : null}
          </div>

          {canUpdate ? (
            <BusinessActionsMenu
              isActive={isActive}
              isToggling={Boolean(isToggling)}
              isDirty={isDirty}
              onToggleActive={onToggleActive}
              onResetChanges={onResetChanges}
            />
          ) : null}
        </div>
      </section>

      <FormErrorBanner message={formError} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">
            {t("business.detail.tabs.summary")}
          </TabsTrigger>
          <TabsTrigger value="identity">
            {t("business.detail.tabs.identity")}
          </TabsTrigger>
          <TabsTrigger value="operational">
            {t("business.detail.tabs.operational")}
          </TabsTrigger>
          <TabsTrigger value="contact">
            {t("business.detail.tabs.contact")}
          </TabsTrigger>
          <TabsTrigger value="location">
            {t("business.detail.tabs.location")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-3">
          <BusinessSummaryTab
            business={business}
            enabled={activeTab === "summary"}
          />
        </TabsContent>

        <TabsContent value="identity" className="space-y-3">
          <DetailBlock
            title={t("business.identity.title")}
            description={t("business.identity.description")}
          >
            <BusinessIdentityFields disabled={!canUpdate} form={form} />
          </DetailBlock>
        </TabsContent>

        <TabsContent value="operational" className="space-y-3">
          <DetailBlock
            title={t("business.operational.title")}
            description={t("business.operational.description")}
          >
            <BusinessOperationalFields disabled={!canUpdate} form={form} />
          </DetailBlock>
        </TabsContent>

        <TabsContent value="contact" className="space-y-3">
          <DetailBlock
            title={t("business.contact.title")}
            description={t("business.contact.description")}
          >
            <BusinessContactFields disabled={!canUpdate} form={form} />
          </DetailBlock>
        </TabsContent>

        <TabsContent value="location" className="space-y-3">
          <DetailBlock
            title={t("business.location.title")}
            description={t("business.location.description")}
          >
            <BusinessLocationFields disabled={!canUpdate} form={form} />
          </DetailBlock>
        </TabsContent>
      </Tabs>

      {canUpdate && activeTab !== "summary" ? (
        <div className="flex justify-end">
          <ActionButton
            isLoading={isPending}
            loadingText={t("business.actions.saving")}
            type="submit"
          >
            {t("business.actions.save")}
          </ActionButton>
        </div>
      ) : null}
    </form>
  );
}

function BusinessActionsMenu({
  isActive,
  isToggling,
  isDirty,
  onToggleActive,
  onResetChanges,
}: {
  isActive: boolean;
  isToggling: boolean;
  isDirty: boolean;
  onToggleActive: () => void | Promise<void>;
  onResetChanges: () => void;
}) {
  const { t } = useAppTranslator();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary">
          {t("business.actions.menu_label")}
          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={isToggling}
          onSelect={() => {
            void onToggleActive();
          }}
        >
          {isActive ? (
            <Power className="size-4" aria-hidden="true" />
          ) : (
            <RotateCcw className="size-4" aria-hidden="true" />
          )}
          {isActive
            ? t("business.actions.deactivate")
            : t("business.actions.activate")}
        </DropdownMenuItem>
        {isDirty ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onResetChanges()}>
              <RotateCcw className="size-4" aria-hidden="true" />
              {t("business.actions.reset_changes")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
