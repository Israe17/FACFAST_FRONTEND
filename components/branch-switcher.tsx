"use client";

import { Building2 } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { formatBranchLabel } from "@/shared/lib/utils";

function BranchSwitcher() {
  const { isPlatformMode } = usePlatformMode();
  const {
    activeBranchId,
    availableBranchIds,
    canSwitchBranchContext,
    hasBranches,
    isBusinessLevelContext,
    isLockedTenantContext,
    setActiveBranchId,
  } = useActiveBranch();

  if (isPlatformMode) {
    return null;
  }

  if (isLockedTenantContext) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground">
        <Building2 className="size-4" />
        {isBusinessLevelContext
          ? "Contexto activo: nivel empresa"
          : `Sucursal fija: ${formatBranchLabel(activeBranchId ?? "")}`}
      </div>
    );
  }

  if (!hasBranches) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground">
        <Building2 className="size-4" />
        Sin sucursales
      </div>
    );
  }

  return (
    <div className="min-w-44">
      <Select
        disabled={!canSwitchBranchContext || availableBranchIds.length < 2}
        onValueChange={setActiveBranchId}
        value={activeBranchId ?? ""}
      >
        <SelectTrigger>
          <div className="flex min-w-0 items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <SelectValue placeholder="Selecciona sucursal" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableBranchIds.map((branchId) => (
            <SelectItem key={branchId} value={branchId}>
              {formatBranchLabel(branchId)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { BranchSwitcher };
