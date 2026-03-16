import { Building2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlatformBusinessBranch } from "@/features/platform-businesses/types";

const COMPANY_LEVEL_VALUE = "__company_level__";

type BranchSelectorProps = {
  branches: PlatformBusinessBranch[];
  disabled?: boolean;
  isLoading?: boolean;
  onValueChange: (value: string) => void;
  value?: string;
};

function BranchSelector({
  branches,
  disabled,
  isLoading,
  onValueChange,
  value,
}: BranchSelectorProps) {
  return (
    <Select
      disabled={disabled || isLoading}
      onValueChange={(nextValue) =>
        onValueChange(nextValue === COMPANY_LEVEL_VALUE ? "" : nextValue)
      }
      value={value || COMPANY_LEVEL_VALUE}
    >
      <SelectTrigger>
        <div className="flex min-w-0 items-center gap-2">
          <Building2 className="size-4 text-muted-foreground" />
          <SelectValue placeholder="Operar a nivel empresa" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={COMPANY_LEVEL_VALUE}>Operar a nivel empresa</SelectItem>
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { BranchSelector };

