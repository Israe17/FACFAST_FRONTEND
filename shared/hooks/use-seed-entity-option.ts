import { useMemo } from "react";

type Identifiable = { id: number | string };

/**
 * Ensures the current entity selection is present in the options array.
 *
 * In edit mode, the backend detail response includes a minimal label object
 * for each FK (e.g., `branch: {id: 4, name: "Central"}`). This hook injects
 * that object into the catalog array if it's not already there.
 *
 * This guarantees that:
 * - The select can always find a matching option for the current value
 * - The label renders from frame 0, without waiting for the catalog query
 * - Deactivated items that are currently selected still appear in the list
 *
 * @see EDITABLE_RESOURCE_DESIGN_PATTERN.md
 */
export function useSeedEntityOption<T extends Identifiable>(
  catalog: T[],
  currentSelection: T | null | undefined,
): T[] {
  return useMemo(() => {
    if (!currentSelection) return catalog;
    const exists = catalog.some(
      (item) => String(item.id) === String(currentSelection.id),
    );
    if (exists) return catalog;
    return [currentSelection, ...catalog];
  }, [catalog, currentSelection]);
}

/**
 * Same as useSeedEntityOption but for multiple current selections.
 *
 * Useful when a form has multiple items that reference the same catalog
 * (e.g., order lines referencing product variants).
 */
export function useSeedEntityOptions<T extends Identifiable>(
  catalog: T[],
  currentSelections: (T | null | undefined)[],
): T[] {
  return useMemo(() => {
    const validSelections = currentSelections.filter(
      (s): s is T => s != null,
    );
    if (validSelections.length === 0) return catalog;

    const catalogIds = new Set(catalog.map((item) => String(item.id)));
    const missing = validSelections.filter(
      (s) => !catalogIds.has(String(s.id)),
    );
    if (missing.length === 0) return catalog;

    return [...missing, ...catalog];
  }, [catalog, currentSelections]);
}
