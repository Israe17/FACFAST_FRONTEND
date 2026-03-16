import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type * as React from "react";

import { AdminShell } from "@/components/admin-shell";
import { getServerSession } from "@/features/auth/api";
import { sessionQueryKey } from "@/features/auth/queries";
import { isPlatformMode } from "@/features/auth/utils";
import { createQueryClient } from "@/shared/lib/query-client";
import { APP_ROUTES } from "@/shared/lib/routes";

type PlatformLayoutProps = {
  children: React.ReactNode;
};

export default async function PlatformLayout({ children }: PlatformLayoutProps) {
  const cookieStore = await cookies();
  const session = await getServerSession(cookieStore.toString());

  if (!session) {
    redirect(APP_ROUTES.login);
  }

  if (!session.is_platform_admin) {
    redirect(APP_ROUTES.dashboard);
  }

  if (!isPlatformMode(session)) {
    redirect(APP_ROUTES.dashboard);
  }

  const queryClient = createQueryClient();
  queryClient.setQueryData(sessionQueryKey, session);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminShell>{children}</AdminShell>
    </HydrationBoundary>
  );
}
