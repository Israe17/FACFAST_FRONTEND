# CLAUDE.md - Project conventions for FACFAST_FRONTEND

## Sheet (dialog) width

The `SheetContent` component uses a `size` prop to control width, NOT className.

Available sizes:
- `sm` (default) → `max-w-lg` (512px)
- `md` → `max-w-2xl` (672px)
- `lg` → `max-w-4xl` (896px)

Example: `<SheetContent size="md">`

Never use `className="sm:max-w-..."` to resize sheets — it will be overridden by the component's built-in size classes.

## Leaflet map z-index

Leaflet internally uses high z-index values (400+ for tiles, 1000+ for controls). To prevent maps from overlapping Sheet/Dialog overlays:

- Wrap the map container with `className="relative z-0"` — this creates a stacking context that contains Leaflet's z-index within.
- For search dropdowns above the map, use `className="relative z-10"`.
- NEVER use `z-index: 0 !important` on `.leaflet-container` or `.leaflet-pane` — this breaks tile rendering.
- NEVER use inline `style={{ zIndex }}` — always use Tailwind classes (`z-0`, `z-10`).

## Detail pages

- Use `DetailBlock` from `@/shared/components/detail-block` for section cards (white background with title/description).
- Use `InventoryEntityHeader` only for inventory module pages. Other modules use `PageHeader` from shared.
- All user-facing strings must use `t()` from `useAppTranslator` — never hardcode Spanish text.
- Translation keys follow module namespace: `inventory.*`, `contacts.*`, etc.
