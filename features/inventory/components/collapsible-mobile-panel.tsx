"use client";

import { type ReactNode, useState } from "react";
import { ChevronUp } from "lucide-react";

type CollapsibleMobilePanelProps = {
  title: string;
  count?: number;
  icon: ReactNode;
  countColor?: string;
  children: ReactNode;
  maxHeight?: string;
  position?: "top" | "bottom";
  defaultOpen?: boolean;
};

function CollapsibleMobilePanel({
  title,
  count,
  icon,
  countColor = "bg-primary text-primary-foreground",
  children,
  maxHeight = "50vh",
  position = "bottom",
  defaultOpen = false,
}: CollapsibleMobilePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  const positionClasses =
    position === "bottom"
      ? "absolute bottom-0 left-0 right-0 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
      : "shrink-0 border-b";

  return (
    <div className={`z-10 flex flex-col bg-background ${positionClasses}`}>
      <button
        type="button"
        className="flex items-center justify-between px-4 py-2.5 active:bg-muted/50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold">{title}</span>
          {count !== undefined ? (
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 font-medium tabular-nums ${countColor}`}
            >
              {count}
            </span>
          ) : null}
        </div>
        <ChevronUp
          className={`size-4 text-muted-foreground transition-transform ${
            position === "bottom"
              ? open ? "rotate-180" : ""
              : open ? "" : "rotate-180"
          }`}
        />
      </button>
      {open ? (
        <div
          className="overflow-y-auto border-t"
          style={{ maxHeight }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export { CollapsibleMobilePanel };
