"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type * as React from "react";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "@/shared/hooks/use-session";
import { APP_ROUTES } from "@/shared/lib/routes";

type AdminShellProps = {
  children: React.ReactNode;
};

function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const { isAuthenticated } = useSession();

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    router.replace(APP_ROUTES.login);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { AdminShell };
