"use client";

import Link from "next/link";
import {
  Building2,
  Clock,
  FileText,
  Globe2,
  Hash,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useBranchesQuery } from "@/features/branches/queries";
import type { Business } from "@/features/businesses/types";
import { useUsersQuery } from "@/features/users/queries";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { cn } from "@/shared/lib/utils";
import { formatDateTime } from "@/shared/lib/utils";

type BusinessSummaryTabProps = {
  business: Business;
  enabled: boolean;
};

export function BusinessSummaryTab({ business, enabled }: BusinessSummaryTabProps) {
  const { t } = useAppTranslator();
  const { can } = usePermissions();
  const canViewBranches = can("branches.view");
  const canViewUsers = can("users.view");

  const branchesQuery = useBranchesQuery(enabled && canViewBranches);
  const usersQuery = useUsersQuery(enabled && canViewUsers);

  const branchesValue = canViewBranches
    ? branchesQuery.data
      ? String(branchesQuery.data.length)
      : branchesQuery.isLoading
        ? "…"
        : "—"
    : "—";
  const usersValue = canViewUsers
    ? usersQuery.data
      ? String(usersQuery.data.length)
      : usersQuery.isLoading
        ? "…"
        : "—"
    : "—";

  const localeValue = [business.currency_code, business.language]
    .filter(Boolean)
    .join(" · ") || "—";
  const identificationValue = [
    business.identification_type,
    business.identification_number,
  ]
    .filter(Boolean)
    .join(" · ") || "—";

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <SummaryChip
        icon={Building2}
        label={t("business.summary.branches")}
        value={branchesValue}
        href={canViewBranches ? "/branches" : undefined}
      />
      <SummaryChip
        icon={Users}
        label={t("business.summary.users")}
        value={usersValue}
        href={canViewUsers ? "/users" : undefined}
      />
      <SummaryChip
        icon={Clock}
        label={t("business.summary.last_updated")}
        value={
          business.updated_at ? formatDateTime(business.updated_at) : "—"
        }
      />
      <SummaryChip
        icon={Globe2}
        label={t("business.summary.locale")}
        value={localeValue}
      />
      <SummaryChip
        icon={Hash}
        label={t("business.summary.code")}
        value={business.code ?? "—"}
        mono
      />
      <SummaryChip
        icon={FileText}
        label={t("business.summary.identification")}
        value={identificationValue}
        mono
      />
    </div>
  );
}

type SummaryChipProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
};

function SummaryChip({ icon: Icon, label, value, href, mono }: SummaryChipProps) {
  const body = (
    <div className="flex h-full items-start gap-3 rounded-xl border border-border/70 bg-background px-3 py-3 transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "truncate text-base font-semibold leading-tight",
            mono && "font-mono text-sm",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block">
        {body}
      </Link>
    );
  }
  return <div className="group">{body}</div>;
}
