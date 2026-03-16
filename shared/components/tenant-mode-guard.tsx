"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { APP_ROUTES } from "@/shared/lib/routes";

type TenantModeGuardProps = {
  children: ReactNode;
};

function TenantModeGuard({ children }: TenantModeGuardProps) {
  const router = useRouter();
  const { isPlatformMode } = usePlatformMode();

  useEffect(() => {
    if (!isPlatformMode) {
      return;
    }

    router.replace(APP_ROUTES.superadminEnterContext);
  }, [isPlatformMode, router]);

  if (isPlatformMode) {
    return null;
  }

  return <>{children}</>;
}

export { TenantModeGuard };
