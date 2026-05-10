"use client";

import { ChevronRight, FileText, Mail } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { Contact } from "../types";
import { buildContactInitials, pickContactColor } from "../contact-visuals";
import { ContactTypeBadge } from "./contact-type-badge";

type ContactListCardProps = {
  contact: Contact;
  selected: boolean;
  onSelect: (contact: Contact) => void;
};

export function ContactListCard({
  contact,
  selected,
  onSelect,
}: ContactListCardProps) {
  const seed = contact.code ?? contact.identification_number ?? String(contact.id);
  const color = pickContactColor(seed, contact.name);
  const initials = buildContactInitials(contact.name);
  const isActive = contact.is_active ?? true;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(contact)}
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
            isActive ? "bg-emerald-500" : "bg-zinc-400",
          )}
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium">{contact.name}</p>
          <ContactTypeBadge type={contact.type} />
        </div>
        {contact.identification_number || contact.email ? (
          <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            {contact.identification_number ? (
              <span className="inline-flex items-center gap-1">
                <FileText className="size-3" aria-hidden="true" />
                <span className="truncate font-mono">
                  {contact.identification_number}
                </span>
              </span>
            ) : null}
            {contact.email ? (
              <span className="inline-flex min-w-0 items-center gap-1">
                <Mail className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{contact.email}</span>
              </span>
            ) : null}
          </p>
        ) : null}
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
