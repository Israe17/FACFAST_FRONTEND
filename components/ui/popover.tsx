"use client";

import * as React from "react";
import { Popover } from "radix-ui";

import { cn } from "@/shared/lib/utils";

function PopoverRoot(props: React.ComponentProps<typeof Popover.Root>) {
  return <Popover.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props: React.ComponentProps<typeof Popover.Trigger>) {
  return <Popover.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  align = "start",
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof Popover.Content>) {
  return (
    <Popover.Portal>
      <Popover.Content
        align={align}
        data-slot="popover-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
          className,
        )}
        {...props}
      />
    </Popover.Portal>
  );
}

export { PopoverRoot as Popover, PopoverContent, PopoverTrigger };
