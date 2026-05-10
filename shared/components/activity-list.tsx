"use client";

import { useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  Search,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getBackendErrorMessage } from "@/shared/lib/backend-error-parser";
import { formatDateTime } from "@/shared/lib/utils";

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 20;

export type ActivityItem = {
  id: string;
  primary: string;
  secondary: string;
  timestamp?: string | null;
  badge?: string | null;
};

export type ActivityListProps = {
  icon: LucideIcon;
  loadingLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  items: ActivityItem[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  pageNumber: number;
  total: number;
  pageSize: PageSize;
  onPageSizeChange: (size: PageSize) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onItemSelect?: (id: string) => void;
};

export function ActivityList({
  icon: Icon,
  loadingLabel,
  emptyTitle,
  emptyDescription,
  items,
  isLoading,
  isFetching,
  isError,
  error,
  onRetry,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
  pageNumber,
  total,
  pageSize,
  onPageSizeChange,
  search,
  onSearchChange,
  onItemSelect,
}: ActivityListProps) {
  const { t } = useAppTranslator();
  const topRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <LoadingState description={loadingLabel} />;
  }

  if (isError) {
    return (
      <ErrorState
        description={getBackendErrorMessage(error, t("common.load_failed"))}
        onRetry={onRetry}
      />
    );
  }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[12rem]">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label={t("activity.search_placeholder")}
          className="h-8 pl-8 pr-7"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("activity.search_placeholder")}
          value={search}
        />
        {search ? (
          <button
            type="button"
            aria-label={t("common.clear")}
            onClick={() => onSearchChange("")}
            className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <PageSizeSelect value={pageSize} onChange={onPageSizeChange} />
      <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {isFetching ? (
          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        ) : null}
        {t("activity.total_records", {
          count: formatTotal(total, items.length, hasNextPage),
        })}
      </span>
    </div>
  );

  if (!items.length && !isFetching) {
    return (
      <div className="space-y-2">
        {toolbar}
        <EmptyState
          icon={ClipboardList}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={topRef} />
      {toolbar}
      <ul className="space-y-1.5">
        {items.map((item) => {
          const interactive = Boolean(onItemSelect);
          const content = (
            <>
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 space-y-0.5 text-left">
                <p className="truncate text-sm font-medium">{item.primary}</p>
                {item.secondary ? (
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.secondary}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {item.badge ? (
                  <Badge variant="outline" className="capitalize">
                    {item.badge}
                  </Badge>
                ) : null}
                {item.timestamp ? (
                  <span className="text-[10px] text-muted-foreground">
                    {formatDateTime(item.timestamp)}
                  </span>
                ) : null}
              </div>
            </>
          );
          return (
            <li key={item.id}>
              {interactive ? (
                <button
                  type="button"
                  onClick={() => onItemSelect?.(item.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2 text-left transition-colors hover:border-border hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  {content}
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between pt-1">
        <Button
          disabled={!hasPrevPage || isFetching}
          onClick={() => {
            onPrevPage();
            topRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          size="sm"
          variant="ghost"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          {t("activity.prev_page")}
        </Button>
        <span className="text-[11px] text-muted-foreground">
          {t("activity.page_number", { page: String(pageNumber) })}
        </span>
        <Button
          disabled={!hasNextPage || isFetching}
          onClick={() => {
            onNextPage();
            topRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          size="sm"
          variant="ghost"
        >
          {t("activity.next_page")}
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function PageSizeSelect({
  value,
  onChange,
}: {
  value: PageSize;
  onChange: (size: PageSize) => void;
}) {
  const { t } = useAppTranslator();
  return (
    <div className="flex items-center gap-2">
      <Label className="text-[11px] text-muted-foreground">
        {t("activity.page_size_label")}
      </Label>
      <Select
        onValueChange={(v) => onChange(Number(v) as PageSize)}
        value={String(value)}
      >
        <SelectTrigger className="h-8 w-[5rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function formatTotal(total: number, loaded: number, hasMore: boolean): string {
  // When the backend returns a positive total, trust it as the authoritative
  // filtered count. Otherwise (older backend that doesn't yet emit `total`),
  // fall back to showing how many we've actually loaded so the operator still
  // gets a useful number instead of a misleading "0".
  if (total > 0) return String(total);
  if (loaded === 0) return "0";
  return hasMore ? `${loaded}+` : String(loaded);
}
