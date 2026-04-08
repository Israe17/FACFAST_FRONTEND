# CLAUDE.md - Project conventions for FACFAST_FRONTEND

## Sheet (dialog) width

The `SheetContent` component uses a `size` prop to control width, NOT className.

Available sizes:
- `sm` (default) → `max-w-lg` (512px)
- `md` → `max-w-2xl` (672px)
- `lg` → `max-w-4xl` (896px)

Example: `<SheetContent size="md">`

Never use `className="sm:max-w-..."` to resize sheets — it will be overridden by the component's built-in size classes.
