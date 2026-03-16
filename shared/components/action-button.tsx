import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

type ActionButtonProps = React.ComponentProps<typeof Button> & {
  icon?: LucideIcon;
  isLoading?: boolean;
  loadingText?: string;
};

function ActionButton({
  children,
  className,
  disabled,
  icon: Icon,
  isLoading,
  loadingText,
  ...props
}: ActionButtonProps) {
  return (
    <Button className={cn(className)} disabled={disabled || isLoading} {...props}>
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" /> : null}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}

export { ActionButton };
