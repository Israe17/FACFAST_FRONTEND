"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useActiveBranch } from "@/shared/hooks/use-active-branch";
import { useActiveBusiness } from "@/shared/hooks/use-active-business";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { usePlatformMode } from "@/shared/hooks/use-platform-mode";
import { useLogout, useSession } from "@/shared/hooks/use-session";
import { filterItemsByPermissions } from "@/shared/lib/permissions";
import { PLATFORM_SIDEBAR_ITEMS, SIDEBAR_ITEMS } from "@/shared/lib/routes";
import { formatBranchLabel, getInitials } from "@/shared/lib/utils";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { hasTenantContextAccess, permissions } = usePermissions();
  const { activeBusinessId, activeBusinessName } = useActiveBusiness();
  const { activeBranchId, isBusinessLevelContext } = useActiveBranch();
  const { isPlatformAdmin, isPlatformMode, isTenantContextMode, isTenantMode, mode } =
    usePlatformMode();
  const { user } = useSession();
  const logoutMutation = useLogout();

  const tenantItems = hasTenantContextAccess
    ? SIDEBAR_ITEMS
    : filterItemsByPermissions(SIDEBAR_ITEMS, permissions);
  const showPlatformSection = isPlatformAdmin && isPlatformMode;
  const showTenantSection = isTenantMode || isTenantContextMode;
  const activeBusinessLabel = activeBusinessName ?? activeBusinessId ?? "Sin empresa";
  const activeBranchLabel = isBusinessLevelContext
    ? "Nivel empresa"
    : activeBranchId
      ? formatBranchLabel(activeBranchId)
      : "Sin sucursal";

  function closeOnNavigate() {
    setOpenMobile(false);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="FACFAST">
              <Link href="/dashboard" onClick={closeOnNavigate}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-xs font-bold">FF</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">FACFAST</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">Admin Shell</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {showTenantSection ? (
          <SidebarGroup>
            <SidebarGroupLabel>
              Tenant
              {isTenantContextMode ? (
                <Badge className="ml-auto" variant="outline">
                  tenant_context
                </Badge>
              ) : null}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {tenantItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActivePath(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href} onClick={closeOnNavigate}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}

        {showPlatformSection ? (
          <SidebarGroup>
            <SidebarGroupLabel>
              Platform
              <Badge className="ml-auto" variant="outline">
                platform
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {PLATFORM_SIDEBAR_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActivePath(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href} onClick={closeOnNavigate}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  tooltip={user?.name ?? "Usuario"}
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name ?? "Sin sesión"}</span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      {user?.email ?? "No disponible"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name ?? "Sin sesión"}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email ?? "No disponible"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="space-y-1 px-2 py-1.5">
                  <p className="text-xs text-muted-foreground">Contexto</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      mode = {mode ?? "unknown"}
                    </Badge>
                    {showTenantSection ? (
                      <>
                        <Badge variant="secondary" className="text-xs">
                          {activeBusinessLabel}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {activeBranchLabel}
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Sin tenant activo
                      </Badge>
                    )}
                    {isTenantContextMode ? (
                      <Badge variant="secondary" className="text-xs">
                        Platform admin en tenant
                      </Badge>
                    ) : null}
                    {(user?.roles ?? []).map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
                  disabled={logoutMutation.isPending}
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="size-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export { AppSidebar };
