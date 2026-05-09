"use client";

import * as React from "react";
import { Switch } from "radix-ui";

import { cn } from "@/shared/lib/utils";

function AppSwitch({
  className,
  ...props
}: React.ComponentProps<typeof Switch.Root>) {
  return (
    <Switch.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <Switch.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-background shadow ring-0 transition-transform data-[state=checked]:translate-x-[18px]"
      />
    </Switch.Root>
  );
}

export { AppSwitch as Switch };
