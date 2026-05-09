"use client";

import { Filter, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

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
  onFromChange: (value: string | undefined) => void;
  onToChange: (value: string | undefined) => void;
  fields: FilterField[];
  onClear: () => void;
  isDirty: boolean;
  trailing?: ReactNode;
};

export function ActivityFiltersBar({
  from,
  to,
  onFromChange,
  onToChange,
  fields,
  onClear,
  isDirty,
  trailing,
}: ActivityFiltersBarProps) {
  const { t } = useAppTranslator();

  return (
    <section
      aria-label={t("users.activity.filters.section_label")}
      className="rounded-xl border border-border/70 bg-card/60 p-3"
    >
      <header className="mb-2 flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("users.activity.filters.section_label")}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Button
            disabled={!isDirty}
            onClick={onClear}
            size="sm"
            variant="ghost"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {t("users.activity.filters.clear_label")}
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-end gap-2">
        <DateField
          id="activity-filter-from"
          label={t("users.activity.filters.from_label")}
          value={from ?? ""}
          onChange={(value) => onFromChange(value || undefined)}
        />
        <DateField
          id="activity-filter-to"
          label={t("users.activity.filters.to_label")}
          value={to ?? ""}
          onChange={(value) => onToChange(value || undefined)}
        />

        {fields.map((field) => (
          <SelectField
            key={field.key}
            id={`activity-filter-${field.key}`}
            label={field.label}
            placeholder={
              field.placeholder ?? t("users.activity.filters.placeholder_any")
            }
            options={field.options}
            value={field.value}
            onChange={field.onChange}
          />
        ))}

        {trailing}
      </div>
    </section>
  );
}

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function DateField({ id, label, value, onChange }: DateFieldProps) {
  return (
    <div className="flex min-w-[10rem] flex-col gap-1">
      <Label className="text-[11px] text-muted-foreground" htmlFor={id}>
        {label}
      </Label>
      <Input
        id={id}
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </div>
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
