"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod/v4";

import { Input } from "@/components/ui/input";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { cabysSearchResultSchema } from "../schemas";
import { useCabysSearchQuery } from "../queries";

type CabysSearchResult = z.infer<typeof cabysSearchResultSchema>;

type CabysSearchInputProps = {
  value: CabysSearchResult | null;
  onChange: (result: CabysSearchResult | null) => void;
};

function CabysSearchInput({ value, onChange }: CabysSearchInputProps) {
  const { t } = useAppTranslator();
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading } = useCabysSearchQuery(debouncedSearch);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(text.trim());
    }, 300);
  }, []);

  const handleSelect = useCallback(
    (result: CabysSearchResult) => {
      onChange(result);
      setSearchText("");
      setDebouncedSearch("");
      setIsOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setSearchText("");
    setDebouncedSearch("");
  }, [onChange]);

  useEffect(() => {
    if (debouncedSearch.length >= 3) {
      setIsOpen(true);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{value.codigo}</p>
          {value.descripcion ? (
            <p className="truncate text-xs text-muted-foreground">{value.descripcion}</p>
          ) : null}
        </div>
        {value.descripcion ? (
          <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {t("inventory.cabys.tax_rate")} {value.impuesto}%
          </span>
        ) : null}
        <button
          aria-label={t("inventory.cabys.clear")}
          className="shrink-0 rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={handleClear}
          type="button"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <Input
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={() => {
          if (debouncedSearch.length >= 3) {
            setIsOpen(true);
          }
        }}
        placeholder={t("inventory.cabys.search_placeholder")}
        value={searchText}
      />
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover shadow-md">
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {t("inventory.cabys.loading")}
            </p>
          ) : searchText.length > 0 && searchText.length < 3 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {t("inventory.cabys.min_chars")}
            </p>
          ) : results && results.length > 0 ? (
            results.map((result) => (
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                key={result.codigo}
                onClick={() => handleSelect(result)}
                type="button"
              >
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {result.codigo}
                </span>
                <span className="min-w-0 flex-1 truncate">{result.descripcion}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {t("inventory.cabys.tax_rate")} {result.impuesto}%
                </span>
              </button>
            ))
          ) : debouncedSearch.length >= 3 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {t("inventory.cabys.no_results")}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export { CabysSearchInput };
export type { CabysSearchInputProps };
