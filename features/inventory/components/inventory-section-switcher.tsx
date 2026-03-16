"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

type InventorySectionSwitcherItem = {
  description?: string;
  id: string;
  label: string;
};

type InventorySectionSwitcherProps = {
  activeId: string;
  items: InventorySectionSwitcherItem[];
  onChange: (id: string) => void;
};

function InventorySectionSwitcher({
  activeId,
  items,
  onChange,
}: InventorySectionSwitcherProps) {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <Button
            key={item.id}
            className={cn(
              "h-auto min-h-20 flex-col items-start justify-start gap-1 rounded-2xl px-4 py-3 text-left",
              isActive && "border-primary/40 bg-primary/8 text-foreground hover:bg-primary/10",
            )}
            onClick={() => onChange(item.id)}
            type="button"
            variant="outline"
          >
            <span className="font-medium">{item.label}</span>
            {item.description ? (
              <span className="text-wrap text-xs text-muted-foreground">{item.description}</span>
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}

export { InventorySectionSwitcher };
