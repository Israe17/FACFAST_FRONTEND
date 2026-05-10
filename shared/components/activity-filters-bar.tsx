"use client";

import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangeSelect } from "@/shared/components/date-range-select";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { cn } from "@/shared/lib/utils";

export const ANY_VALUE = "__any__";

export type SelectOption = {
  value: string;
  label: string;
};

export type FilterField = {
  key: string;
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
};

type ActivityFiltersBarProps = {
  from: string | undefined;
  to: string | undefined;
  onDateRangeChange: (next: {
    from: string | undefined;
    to: string | undefined;
  }) => void;
  fields: FilterField[];
  onClear: () => void;
  isDirty: boolean;
  trailing?: ReactNode;
};

export function ActivityFiltersBar({
  from,
  to,
  onDateRangeChange,
  fields,
  onClear,
  isDirty,
  trailing,
}: ActivityFiltersBarProps) {
  const { t } = useAppTranslator();
  const [collapsed, setCollapsed] = useState(false);

  const activeCount =
    (from || to ? 1 : 0) + fields.filter((field) => field.value).length;

  return (
    <section
      aria-label={t("activity.filters.section_label")}
      className="rounded-xl border border-border/70 bg-card/60 p-3"
    >
      <header className="flex items-center gap-2">
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex flex-1 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("activity.filters.section_label")}
          </p>
          {activeCount > 0 ? (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              {activeCount}
            </Badge>
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              collapsed && "-rotate-90",
            )}
          />
        </button>
        <Button
          disabled={!isDirty}
          onClick={onClear}
          size="sm"
          variant="ghost"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          {t("activity.filters.clear_label")}
        </Button>
      </header>

      {!collapsed ? (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div className="flex min-w-[16rem] flex-col gap-1">
            <Label className="text-[11px] text-muted-foreground">
              {t("activity.filters.date_range_label")}
            </Label>
            <DateRangeSelect
              from={from}
              fromLabel={t("activity.filters.from_label")}
              onChange={onDateRangeChange}
              placeholder={t("date_range.placeholder")}
              to={to}
              toLabel={t("activity.filters.to_label")}
            />
          </div>

          {fields.map((field) => (
            <SelectField
              key={field.key}
              id={`activity-filter-${field.key}`}
              label={field.label}
              placeholder={
                field.placeholder ?? t("activity.filters.placeholder_any")
              }
              options={field.options}
              value={field.value}
              onChange={field.onChange}
            />
          ))}

          {trailing}
        </div>
      ) : null}
    </section>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
};

function SelectField({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="flex min-w-[12rem] flex-col gap-1">
      <Label className="text-[11px] text-muted-foreground" htmlFor={id}>
        {label}
      </Label>
      <Select
        onValueChange={(next) =>
          onChange(next === ANY_VALUE ? undefined : next)
        }
        value={value ?? ANY_VALUE}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY_VALUE}>{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
