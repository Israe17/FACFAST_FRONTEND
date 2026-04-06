"use client";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";

import { useUserEffectivePermissionsQuery } from "../queries";

type EffectiveUserPermissionsDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  userId: string;
  userName: string;
};

function EffectiveUserPermissionsDialog({
  onOpenChange,
  open,
  userId,
  userName,
}: EffectiveUserPermissionsDialogProps) {
  const permissionsQuery = useUserEffectivePermissionsQuery(userId, open);
  const groupedPermissions =
    permissionsQuery.data?.reduce<Record<string, string[]>>((groups, permission) => {
      const group = permission.split(".")[0] ?? "general";
      groups[group] ??= [];
      groups[group].push(permission);
      return groups;
    }, {}) ?? {};

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>Effective permissions</DrawerTitle>
          <DrawerDescription>
            Permissions currently resolved for {userName}.
          </DrawerDescription>
        </DrawerHeader>

        {permissionsQuery.isLoading ? (
          <LoadingState description="Loading effective permissions." />
        ) : null}
        {permissionsQuery.isError ? (
          <ErrorState
            description="Unable to load effective permissions."
            onRetry={() => permissionsQuery.refetch()}
          />
        ) : null}
        {permissionsQuery.data?.length === 0 ? (
          <EmptyState
            description="This user does not currently resolve any effective permissions."
            title="No permissions"
          />
        ) : null}
        {permissionsQuery.data?.length ? (
          <div className="max-h-[26rem] space-y-4 pr-1">
            {Object.entries(groupedPermissions)
              .sort(([left], [right]) => left.localeCompare(right))
              .map(([group, permissions]) => (
                <section key={group} className="space-y-2 rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {group}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((permission) => (
                      <Badge key={permission} variant="outline">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

export { EffectiveUserPermissionsDialog };
