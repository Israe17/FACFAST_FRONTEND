"use client";

import { useEffect, useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ActionButton } from "@/shared/components/action-button";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { LoadingState } from "@/shared/components/loading-state";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { getTranslatedBackendErrorMessage } from "@/shared/lib/error-presentation";
import { useAvailablePermissionsQuery } from "@/features/roles/queries";
import type { PermissionDefinition } from "@/features/roles/types";

import { useAssignUserPermissionsMutation } from "../queries";
import type { User } from "../types";

type AssignUserDirectPermissionsDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: User;
};

/**
 * Lets an operator grant ANY catalog permission directly to the user, scoped
 * to permissions the user doesn't already have (via role or another direct
 * grant). The auth.* slice is owned by the user form, so we exclude it here
 * to keep the two surfaces non-overlapping. On submit we merge the new
 * selections with the user's existing direct grants (including the auth.*
 * slice) and PUT the union — the endpoint is REPLACE, so the merge prevents
 * stomping on grants we don't manage from this dialog.
 */
function AssignUserDirectPermissionsDialog({
  onOpenChange,
  open,
  user,
}: AssignUserDirectPermissionsDialogProps) {
  const { t } = useAppTranslator();
  const permissionsQuery = useAvailablePermissionsQuery(open);
  const assignPermissionsMutation = useAssignUserPermissionsMutation(user.id, {
    showErrorToast: false,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setSearch("");
    }
  }, [open]);

  // Permissions the user already has via ANY path (role or direct). We hide
  // these from the picker because granting them is a no-op — the effective
  // set wouldn't change.
  const alreadyHeldKeys = useMemo(
    () => new Set(user.effective_permissions ?? []),
    [user.effective_permissions],
  );

  const grantable = useMemo<PermissionDefinition[]>(() => {
    const data = permissionsQuery.data ?? [];
    const lowered = search.trim().toLowerCase();
    return data
      .filter((permission) => !permission.key.startsWith("auth."))
      .filter((permission) => !alreadyHeldKeys.has(permission.key))
      .filter((permission) => {
        if (!lowered) return true;
        return (
          permission.key.toLowerCase().includes(lowered) ||
          (permission.description?.toLowerCase().includes(lowered) ?? false) ||
          (permission.module?.toLowerCase().includes(lowered) ?? false)
        );
      });
  }, [alreadyHeldKeys, permissionsQuery.data, search]);

  const grouped = useMemo(() => {
    const groups = new Map<string, PermissionDefinition[]>();
    for (const permission of grantable) {
      const key = permission.module ?? permission.key.split(".")[0] ?? "general";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(permission);
    }
    return Array.from(groups.entries()).sort(([left], [right]) =>
      left.localeCompare(right),
    );
  }, [grantable]);

  function togglePermission(id: number) {
    const idAsString = String(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idAsString)) next.delete(idAsString);
      else next.add(idAsString);
      return next;
    });
  }

  async function handleSubmit() {
    const existingDirectIds = (user.direct_permission_ids ?? []).map(String);
    const merged = [...new Set([...existingDirectIds, ...selectedIds])];

    try {
      await assignPermissionsMutation.mutateAsync({
        permission_ids: merged,
      });
      onOpenChange(false);
    } catch {
      // The mutation surfaces the error via toast (showErrorToast: false here
      // is intentional, but the mutation's onError fallback still runs).
      // No-op: state stays open so the operator can retry.
    }
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent size="md">
        <SheetHeader>
          <SheetTitle>
            {t("users.direct_permissions.assign_title")}
          </SheetTitle>
          <SheetDescription>
            {t("users.direct_permissions.assign_description", {
              name: user.name,
            })}
          </SheetDescription>
        </SheetHeader>

        <SheetBody>
          {permissionsQuery.isLoading ? (
            <LoadingState description={t("users.loading_permissions")} />
          ) : null}
          {permissionsQuery.isError ? (
            <ErrorState
              description={
                getTranslatedBackendErrorMessage(permissionsQuery.error, {
                  fallbackMessage: t("users.load_permissions_error"),
                  translateMessage: t,
                }) ?? undefined
              }
              onRetry={() => permissionsQuery.refetch()}
            />
          ) : null}
          {permissionsQuery.data && grantable.length === 0 && !search ? (
            <EmptyState
              title={t("users.direct_permissions.empty_title")}
              description={t("users.direct_permissions.empty_description")}
            />
          ) : null}
          {permissionsQuery.data ? (
            <div className="space-y-3">
              <Input
                aria-label={t("users.direct_permissions.search_label")}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("users.direct_permissions.search_placeholder")}
                value={search}
              />

              <div className="max-h-[60vh] space-y-3 overflow-y-auto rounded-xl border border-border p-3">
                {grouped.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("users.direct_permissions.search_empty")}
                  </p>
                ) : null}
                {grouped.map(([module, permissions]) => (
                  <section key={module} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {module}
                    </h3>
                    <ul className="space-y-1">
                      {permissions.map((permission) => {
                        const idAsString = String(permission.id);
                        const checked = selectedIds.has(idAsString);
                        return (
                          <li key={permission.id}>
                            <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted/40">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() =>
                                  togglePermission(permission.id)
                                }
                              />
                              <span className="space-y-0.5">
                                <span className="block font-medium">
                                  {permission.key}
                                </span>
                                {permission.description ? (
                                  <span className="block text-xs text-muted-foreground">
                                    {permission.description}
                                  </span>
                                ) : null}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2">
                <ActionButton
                  disabled={selectedIds.size === 0}
                  isLoading={assignPermissionsMutation.isPending}
                  loadingText={t("common.updating")}
                  onClick={handleSubmit}
                  type="button"
                >
                  {t("users.direct_permissions.submit", {
                    count: String(selectedIds.size),
                  })}
                </ActionButton>
              </div>
            </div>
          ) : null}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export { AssignUserDirectPermissionsDialog };
