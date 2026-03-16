import { Building2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlatformBusiness } from "@/features/platform-businesses/types";

function getBusinessLabel(business: PlatformBusiness) {
  if (business.name && business.code) {
    return `${business.name} (${business.code})`;
  }

  return business.name ?? business.code ?? business.id ?? "Empresa";
}

type BusinessSelectorProps = {
  businesses: PlatformBusiness[];
  disabled?: boolean;
  isLoading?: boolean;
  onValueChange: (value: string) => void;
  value: string;
};

function BusinessSelector({
  businesses,
  disabled,
  isLoading,
  onValueChange,
  value,
}: BusinessSelectorProps) {
  return (
    <Select disabled={disabled || isLoading} onValueChange={onValueChange} value={value ?? ""}>
      <SelectTrigger>
        <div className="flex min-w-0 items-center gap-2">
          <Building2 className="size-4 text-muted-foreground" />
          <SelectValue placeholder={isLoading ? "Cargando empresas..." : "Selecciona una empresa"} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {businesses.map((business) => (
          <SelectItem key={business.id} value={business.id ?? ""}>
            {getBusinessLabel(business)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { BusinessSelector, getBusinessLabel };
