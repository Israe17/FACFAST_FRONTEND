"use client";

import { Undo2 } from "lucide-react";

import { ActionButton } from "@/shared/components/action-button";

import { useClearTenantContextMutation } from "../queries";

type ClearTenantContextButtonProps = {
  className?: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
};

function ClearTenantContextButton({
  className,
  label = "Salir de empresa",
  variant = "outline",
}: ClearTenantContextButtonProps) {
  const clearContextMutation = useClearTenantContextMutation();

  return (
    <ActionButton
      className={className}
      icon={Undo2}
      isLoading={clearContextMutation.isPending}
      loadingText="Saliendo"
      onClick={() => clearContextMutation.mutate()}
      type="button"
      variant={variant}
    >
      {label}
    </ActionButton>
  );
}

export { ClearTenantContextButton };

