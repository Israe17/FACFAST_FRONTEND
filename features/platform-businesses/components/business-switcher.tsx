"use client";

import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlatformBusinessesQuery } from "@/features/platform-businesses/queries";
import { APP_ROUTES } from "@/shared/lib/routes";

function getBusinessLabel(name?: string | null, code?: string | null) {
  if (name && code) {
    return `${name} (${code})`;
  }

  return name || code || "Business";
}

function BusinessSwitcher() {
  const router = useRouter();
  const businessesQuery = usePlatformBusinessesQuery(true);
  const businesses = businessesQuery.data ?? [];

  if (businessesQuery.isLoading) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground">
        <Building2 className="size-4" />
        Loading businesses
      </div>
    );
  }

  if (!businesses.length) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground">
        <Building2 className="size-4" />
        No businesses
      </div>
    );
  }

  return (
    <div className="min-w-56">
      <Select
        onValueChange={(businessId) => {
          router.push(`${APP_ROUTES.superadminEnterContext}?businessId=${businessId}`);
        }}
      >
        <SelectTrigger>
          <div className="flex min-w-0 items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <SelectValue placeholder="Entrar a empresa" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {businesses.map((business) => (
            <SelectItem key={business.id} value={business.id ?? ""}>
              {getBusinessLabel(business.name, business.code)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { BusinessSwitcher };
