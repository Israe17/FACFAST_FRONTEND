import * as React from "react";
import { Avatar } from "radix-ui";

import { cn } from "@/shared/lib/utils";

function AppAvatar({ className, ...props }: React.ComponentProps<typeof Avatar.Root>) {
  return (
    <Avatar.Root
      data-slot="avatar"
      className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof Avatar.Image>) {
  return (
    <Avatar.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof Avatar.Fallback>) {
  return (
    <Avatar.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary",
        className,
      )}
      {...props}
    />
  );
}

export { AppAvatar as Avatar, AvatarFallback, AvatarImage };
