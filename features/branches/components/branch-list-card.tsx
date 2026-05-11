"use client";

import { Building2, ChevronRight, Monitor } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { buildEntityInitials, pickEntityColor } from "@/shared/lib/entity-visuals";

import type { Branch } from "../types";

type BranchListCardProps = {
  branch: Branch;
  selected: boolean;
  onSelect: (branch: Branch) => void;
};

export function BranchListCard({ branch, selected, onSelect }: BranchListCardProps) {
  const seed = branch.code ?? String(branch.id);
  const color = pickEntityColor(seed, branch.name);
  const initials = buildEntityInitials(branch.name);
  const statusDot = branch.is_active ? "bg-emerald-500" : "bg-zinc-400";
  const terminalCount = branch.terminals.length;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(branch)}
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
            "flex size-9 items-center justify-center rounded-lg text-xs font-semibold",
            color.bubble,
          )}
          aria-hidden="true"
        >
          {initials || <Building2 className="size-4" aria-hidden="true" />}
        </span>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background",
            statusDot,
          )}
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{branch.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {branch.code ?? branch.address ?? branch.id}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Monitor className="size-3" aria-hidden="true" />
            {terminalCount}
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
