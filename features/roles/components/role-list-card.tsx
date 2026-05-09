"use client";

import { ChevronRight, Lock, Users } from "lucide-react";

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
  const color = pickRoleColor(role.role_key, role.name);
  const initials = buildRoleInitials(role.name);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(role)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/70 bg-background hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          color.bubble,
        )}
        aria-hidden="true"
      >
        {initials}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium">{role.name}</p>
          {role.is_system ? (
            <Lock className="size-3 text-muted-foreground" aria-hidden="true" />
          ) : null}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="truncate font-mono">{role.role_key}</span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Users className="size-3" aria-hidden="true" />
            {userCount}
          </span>
        </div>
      </div>

      <ChevronRight
        className={cn(
          "size-3.5 shrink-0 text-muted-foreground transition-transform",
          selected && "translate-x-0.5 text-primary",
        )}
        aria-hidden="true"
      />
    </button>
  );
}
