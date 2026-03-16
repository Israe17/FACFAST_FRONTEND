"use client";

import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TableAction = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
};

type TableRowActionsProps = {
  actions: TableAction[];
};

export function TableRowActions({ actions }: TableRowActionsProps) {
  if (!actions.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="outline">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            className={action.variant === "destructive" ? "text-destructive" : undefined}
            onClick={action.onClick}
          >
            <action.icon className="size-4" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type { TableAction };
