import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type * as React from "react";

import { AdminShell } from "@/components/admin-shell";
import { getServerSession } from "@/features/auth/api";
import { sessionQueryKey } from "@/features/auth/queries";
import { hasTenantOperationalAccess } from "@/features/auth/utils";
import { TenantModeGuard } from "@/shared/components/tenant-mode-guard";
import { createQueryClient } from "@/shared/lib/query-client";
import { APP_ROUTES } from "@/shared/lib/routes";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const session = await getServerSession(cookieStore.toString());

  if (!session) {
    redirect(APP_ROUTES.login);
  }

  if (!hasTenantOperationalAccess(session)) {
    redirect(APP_ROUTES.superadminEnterContext);
  }

  const queryClient = createQueryClient();
  queryClient.setQueryData(sessionQueryKey, session);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminShell>
        <TenantModeGuard>{children}</TenantModeGuard>
      </AdminShell>
    </HydrationBoundary>
  );
}
