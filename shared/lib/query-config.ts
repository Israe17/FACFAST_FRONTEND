/**
 * Catalog queries populate select/dropdown options in forms.
 * They change infrequently during a session, so we cache them
 * for 2 minutes to avoid unnecessary refetches when components
 * remount (e.g., opening/closing dialogs).
 *
 * @see EDITABLE_RESOURCE_DESIGN_PATTERN.md
 */
export const CATALOG_STALE_TIME = 2 * 60 * 1000;
