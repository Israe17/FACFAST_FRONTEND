import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Select } from "radix-ui";

import { cn } from "@/shared/lib/utils";

function SelectRoot(props: React.ComponentProps<typeof Select.Root>) {
  return <Select.Root data-slot="select" {...props} />;
}

function SelectGroup(props: React.ComponentProps<typeof Select.Group>) {
  return <Select.Group data-slot="select-group" {...props} />;
}

function SelectValue(props: React.ComponentProps<typeof Select.Value>) {
  return <Select.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Select.Trigger>) {
  return (
    <Select.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <Select.Icon asChild>
        <ChevronDown className="size-4 text-muted-foreground" />
      </Select.Icon>
    </Select.Trigger>
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof Select.ScrollUpButton>) {
  return (
    <Select.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronUp className="size-4" />
    </Select.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof Select.ScrollDownButton>) {
  return (
    <Select.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronDown className="size-4" />
    </Select.ScrollDownButton>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof Select.Content>) {
  return (
    <Select.Portal>
      <Select.Content
        data-slot="select-content"
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <Select.Viewport
          className={cn(
            "p-1.5",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </Select.Viewport>
        <SelectScrollDownButton />
      </Select.Content>
    </Select.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof Select.Label>) {
  return (
    <Select.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof Select.Item>) {
  return (
    <Select.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg py-2 pr-8 pl-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <Select.ItemIndicator>
          <Check className="size-4" />
        </Select.ItemIndicator>
      </span>
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Select.Separator>) {
  return <Select.Separator className={cn("mx-1 my-1 h-px bg-border", className)} {...props} />;
}

export {
  SelectRoot as Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
