"use client";

import { ChevronRight, Lock, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { cn } from "@/shared/lib/utils";

import { buildRoleInitials, pickRoleColor } from "../role-visuals";
import type { Role } from "../types";

type RoleListCardProps = {
  role: Role;
  selected: boolean;
  userCount: number;
  onSelect: (role: Role) => void;
};

export function RoleListCard({ role, selected, userCount, onSelect }: RoleListCardProps) {
  const { t } = useAppTranslator();
  const color = pickRoleColor(role.role_key, role.name);
  const initials = buildRoleInitials(role.name);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(role)}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/70 bg-background hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          color.bubble,
        )}
        aria-hidden="true"
      >
        {initials}
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{role.name}</p>
          {role.is_system ? (
            <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="font-mono text-[11px]">
            {role.role_key}
          </Badge>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" aria-hidden="true" />
            {t("roles.user_count", { count: String(userCount) })}
          </span>
        </div>
      </div>

      <ChevronRight
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform",
          selected && "translate-x-0.5 text-primary",
        )}
        aria-hidden="true"
      />
    </button>
  );
}
