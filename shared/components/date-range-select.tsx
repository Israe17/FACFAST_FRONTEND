"use client";

import { useState } from "react";
import { CalendarRange, ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { cn } from "@/shared/lib/utils";

type DateRangeSelectProps = {
  fromLabel: string;
  toLabel: string;
  placeholder: string;
  from: string | undefined;
  to: string | undefined;
  onChange: (next: { from: string | undefined; to: string | undefined }) => void;
  triggerClassName?: string;
};

export function DateRangeSelect({
  fromLabel,
  toLabel,
  placeholder,
  from,
  to,
  onChange,
  triggerClassName,
}: DateRangeSelectProps) {
  const { t } = useAppTranslator();
  const [open, setOpen] = useState(false);

  const hasValue = Boolean(from || to);
  const triggerLabel = formatTriggerLabel(from, to, placeholder);

  function applyPreset(preset: "today" | "this_week" | "this_month" | "30d") {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (preset === "today") {
      start = now;
    } else if (preset === "this_week") {
      const day = now.getDay() || 7;
      start = new Date(now);
      start.setDate(now.getDate() - (day - 1));
    } else if (preset === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(now);
      start.setDate(now.getDate() - 30);
    }

    onChange({ from: toIsoDate(start), to: toIsoDate(end) });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
            !hasValue && "text-muted-foreground",
            triggerClassName,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarRange className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{triggerLabel}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {hasValue ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange({ from: undefined, to: undefined });
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onChange({ from: undefined, to: undefined });
                  }
                }}
                aria-label={t("common.clear")}
                className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden="true" />
              </span>
            ) : null}
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[20rem] space-y-3" align="start">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] text-muted-foreground" htmlFor="date-range-from">
              {fromLabel}
            </Label>
            <Input
              id="date-range-from"
              max={to || undefined}
              onChange={(event) =>
                onChange({ from: event.target.value || undefined, to })
              }
              type="date"
              value={from ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] text-muted-foreground" htmlFor="date-range-to">
              {toLabel}
            </Label>
            <Input
              id="date-range-to"
              min={from || undefined}
              onChange={(event) =>
                onChange({ from, to: event.target.value || undefined })
              }
              type="date"
              value={to ?? ""}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-border pt-2">
          <PresetButton onClick={() => applyPreset("today")}>
            {t("date_range.preset_today")}
          </PresetButton>
          <PresetButton onClick={() => applyPreset("this_week")}>
            {t("date_range.preset_this_week")}
          </PresetButton>
          <PresetButton onClick={() => applyPreset("this_month")}>
            {t("date_range.preset_this_month")}
          </PresetButton>
          <PresetButton onClick={() => applyPreset("30d")}>
            {t("date_range.preset_last_30d")}
          </PresetButton>
        </div>

        <div className="flex justify-between gap-2 border-t border-border pt-2">
          <Button
            disabled={!hasValue}
            onClick={() => onChange({ from: undefined, to: undefined })}
            size="sm"
            variant="ghost"
          >
            {t("common.clear")}
          </Button>
          <Button onClick={() => setOpen(false)} size="sm">
            {t("common.apply")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PresetButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick} size="sm" type="button" variant="outline">
      {children}
    </Button>
  );
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTriggerLabel(
  from: string | undefined,
  to: string | undefined,
  placeholder: string,
): string {
  if (!from && !to) return placeholder;
  if (from && to) return `${formatHuman(from)} → ${formatHuman(to)}`;
  if (from) return `≥ ${formatHuman(from)}`;
  return `≤ ${formatHuman(to ?? "")}`;
}

function formatHuman(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
