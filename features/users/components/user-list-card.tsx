"use client";

import { ChevronRight, ShieldCheck, Waypoints } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { User } from "../types";
import { buildEntityInitials, pickEntityColor } from "@/shared/lib/entity-visuals";

type UserListCardProps = {
  user: User;
  selected: boolean;
  onSelect: (user: User) => void;
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  inactive: "bg-zinc-400",
  suspended: "bg-amber-500",
  deleted: "bg-rose-500",
};

export function UserListCard({ user, selected, onSelect }: UserListCardProps) {
  const seed = user.code ?? user.email ?? String(user.id);
  const color = pickEntityColor(seed, user.name);
  const initials = buildEntityInitials(user.name);
  const status = user.status ?? "inactive";
  const dot = STATUS_DOT[status] ?? STATUS_DOT.inactive;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(user)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/70 bg-background hover:bg-muted/40",
      )}
    >
      <span className="relative shrink-0">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full text-xs font-semibold",
            color.bubble,
          )}
          aria-hidden="true"
        >
          {initials}
        </span>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background",
            dot,
          )}
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="size-3" aria-hidden="true" />
            {user.roles.length}
          </span>
          <span className="inline-flex items-center gap-1">
            <Waypoints className="size-3" aria-hidden="true" />
            {user.branch_ids.length}
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
