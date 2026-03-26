# Frontend Conventions

## ID Handling Architecture

### Response Schemas (Zod)

All FK ID fields in response schemas MUST use the canonical ID types from `@/shared/lib/api-types`:

| DB Column | Zod Schema | Notes |
|-----------|-----------|-------|
| `NOT NULL` FK | `idSchema` | No `.catch()` — must fail if backend sends unexpected data |
| `nullable: true` FK | `nullableIdSchema.catch(null)` | `.catch(null)` for temporary compat with responses that omit the field |

Never use `z.number()`, `z.union([z.number(), z.string()])`, or `z.union([z.number(), z.null()])` for FK IDs.

```typescript
// Correct
import { idSchema, nullableIdSchema } from "@/shared/lib/api-types";

export const orderSchema = z.object({
  branch_id: idSchema,                    // NOT NULL in DB
  warehouse_id: nullableIdSchema.catch(null), // nullable in DB
});
```

### Form State

All IDs in form state are `string | undefined`. Never `number`.

```typescript
// Form schema for optional FK
makeOptionalIdSchema("Selecciona una zona.")

// Form schema for required FK
z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : String(v)),
  z.string().regex(positiveIntegerPattern, "Selecciona una sucursal."),
)
```

### Select Components

`value` prop is always a string.

```typescript
// Required select
<Select
  onValueChange={(value) => field.onChange(value)}
  value={field.value}
>

// Optional select (nullable FK)
const EMPTY_SELECT_VALUE = "__none__";

<Select
  onValueChange={(value) =>
    field.onChange(value === EMPTY_SELECT_VALUE ? undefined : value)
  }
  value={field.value ?? EMPTY_SELECT_VALUE}
>
  <SelectContent>
    <SelectItem value={EMPTY_SELECT_VALUE}>Ninguno</SelectItem>
    {items.map((item) => (
      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

Never convert to `Number()` in `onValueChange`. Never use `String(field.value)` in the `value` prop — the form state is already a string.

### Payload Builders (API layer)

Convert string IDs to numbers for the backend using `toNumberId()` / `toOptionalNumberId()`.

For entities with nullable FK columns, use `compactNullableRecord` (preserves `null`, strips only `undefined` and `""`).

```typescript
function buildOrderPayload(payload: CreateOrderInput | UpdateOrderInput) {
  return compactNullableRecord({
    branch_id: toNumberId(payload.branch_id),           // NOT NULL — no ?? null
    warehouse_id: toNumberId(payload.warehouse_id) ?? null,  // nullable — explicit null
    seller_user_id: toNumberId(payload.seller_user_id) ?? null,
  });
}
```

For entities with NO nullable FK columns, `compactRecord` is fine.

### Form Values Mappers (response → form state)

Convert response IDs (already strings via `idSchema`) to form strings. For nullable IDs, use the `!= null` guard:

```typescript
export function getOrderFormValues(order: Order): CreateOrderInput {
  return {
    branch_id: order.branch_id ?? "",              // required FK
    warehouse_id: order.warehouse_id != null ? String(order.warehouse_id) : undefined, // nullable FK
  };
}
```

## Checklist for New Forms

1. **Response schema** — FK required → `idSchema`. FK nullable → `nullableIdSchema.catch(null)`.
2. **Form schema** — Required FK → `z.preprocess(... String(v), z.string().regex(positiveIntegerPattern, ...))`. Optional FK → `makeOptionalIdSchema(...)`.
3. **Empty form values** — Required FK: `""`. Optional FK: `undefined`.
4. **Form values mapper** — Required FK: `entity.field ?? ""`. Optional FK: `entity.field != null ? String(entity.field) : undefined`.
5. **Payload builder** — `toNumberId()` for required. `toNumberId() ?? null` for nullable. Use `compactNullableRecord` when nullable FKs exist.
6. **Select component** — Required: `value={field.value}`. Optional: `value={field.value ?? EMPTY_SELECT_VALUE}`. Never `Number()` in onChange.
