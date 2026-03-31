# Editable Resource Design Pattern — Frontend

## Purpose

This is the single source of truth for how the frontend must implement any form
that creates, edits, or reopens a backend resource.

It replaces and consolidates the frontend-side rules from:

- `CONVENTIONS.md` (ID handling — still valid, this document extends it)
- `FRONTEND_FORM_MODULE_PATTERN_ARCHITECTURE.md` (file organization)
- Backend `FRONTEND_FORM_OPERATIONAL_CONTRACT.md`
- Backend `FRONTEND_BACKEND_EDITABLE_RESOURCE_CONTRACT.md`

This document is the **implementable pattern** that every module must follow.

---

## The Problem This Solves

When a user opens an edit form, selects appear blank for 100-500ms because:

1. `form.reset()` sets the value to a string ID (e.g., `"4"`)
2. The select options array is still empty (catalog queries haven't resolved)
3. Radix Select cannot find a matching `<SelectItem>` for value `"4"`
4. The select trigger shows the placeholder instead of the current label
5. 100-500ms later, catalog queries resolve, options populate, label appears

This document defines the pattern that eliminates this problem for every form
in the system.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│ Section Component (e.g., sale-orders-section.tsx)    │
│                                                      │
│  1. Prefetch catalogs (always enabled)               │
│  2. Manage dialog open/close state                   │
│  3. Pass catalogs + entity to Dialog                 │
│                                                      │
│  useBranchesQuery(enabled)      ← fires on mount    │
│  useContactsQuery(enabled)      ← fires on mount    │
│  useUsersQuery(enabled)         ← fires on mount    │
│  useWarehousesQuery(enabled)    ← fires on mount    │
│                                                      │
└──────────────────┬──────────────────────────────────┘
                   │ catalogs as props
                   ▼
┌─────────────────────────────────────────────────────┐
│ Dialog Component (e.g., sale-order-dialog.tsx)       │
│                                                      │
│  1. Receive catalogs + entity as props               │
│  2. Seed current entity values into catalog arrays   │
│  3. Use useDialogForm for form state                 │
│  4. Pass seeded catalogs + form to Form              │
│                                                      │
└──────────────────┬──────────────────────────────────┘
                   │ seeded catalogs + form
                   ▼
┌─────────────────────────────────────────────────────┐
│ Form Component (e.g., sale-order-form.tsx)           │
│                                                      │
│  1. Pure UI — no data fetching                       │
│  2. Render selects with guaranteed options            │
│  3. Filter options (active, branch-scoped, etc.)     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Layer 1: Section Component

The section is the **data owner**. It prefetches all catalogs that any dialog
in the section might need.

### Pattern

```tsx
function SaleOrdersSection({ enabled = true }: Props) {
  const { can } = usePermissions();
  const canView = can("sale_orders.view");

  // ── Prefetch catalogs at section level ──
  // These fire when the section mounts, NOT when the dialog opens.
  // By the time the user clicks "Edit", data is already in cache.
  const branchesQuery = useBranchesQuery(enabled && canView);
  const contactsQuery = useContactsQuery(enabled && canView);
  const usersQuery = useUsersQuery(enabled && canView);
  const warehousesQuery = useWarehousesQuery(enabled && canView);
  const productsQuery = useProductsQuery(enabled && canView);
  const zonesQuery = useZonesQuery(enabled && canView);

  // ── Entity and dialog state ──
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Main query ──
  const ordersQuery = useSaleOrdersQuery(enabled && canView);

  return (
    <>
      {/* Table */}
      <DataTable ... />

      {/* Dialog receives catalogs as props */}
      <SaleOrderDialog
        branches={branchesQuery.data ?? []}
        contacts={contactsQuery.data ?? []}
        users={usersQuery.data ?? []}
        warehouses={warehousesQuery.data ?? []}
        products={productsQuery.data ?? []}
        zones={zonesQuery.data ?? []}
        order={selectedOrder}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedOrder(null);
        }}
      />
    </>
  );
}
```

### Rules

1. **Catalogs are prefetched at section mount**, not at dialog open
2. All catalog queries use `staleTime` (see Query Configuration below)
3. The section passes raw catalog arrays to the dialog as props
4. The section does NOT filter catalogs — the form does that

### Why this matters

When the section mounts, catalog queries fire. By the time the user clicks
"Edit" (typically 2+ seconds later), data is already in React Query cache.
The dialog renders with populated arrays from frame 0.

---

## Layer 2: Dialog Component

The dialog is the **hydration coordinator**. It receives catalogs and the
entity, seeds current values into option arrays, and wires up the form.

### Pattern

```tsx
type SaleOrderDialogProps = {
  // Catalogs from section (already loaded)
  branches: Branch[];
  contacts: Contact[];
  users: User[];
  warehouses: Warehouse[];
  products: Product[];
  zones: Zone[];
  // Entity for edit mode (null for create)
  order?: SaleOrder | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function SaleOrderDialog({
  branches,
  contacts,
  users,
  warehouses,
  products,
  zones,
  order,
  onOpenChange,
  open,
}: SaleOrderDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreateSaleOrderMutation({ showErrorToast: false });
  const updateMutation = useUpdateSaleOrderMutation(order?.id ?? "", {
    showErrorToast: false,
  });

  // ── Seed current entity selections into catalog arrays ──
  // This guarantees that in edit mode, the current value is ALWAYS
  // present in the options array, even if the full catalog hasn't
  // loaded yet (cold start) or the item has been deactivated.
  const seededBranches = useSeedEntityOption(branches, order?.branch);
  const seededContacts = useSeedEntityOption(contacts, order?.customer_contact);
  const seededUsers = useSeedEntityOption(users, order?.seller);
  const seededWarehouses = useSeedEntityOption(warehouses, order?.warehouse);
  const seededZones = useSeedEntityOption(zones, order?.delivery_zone);

  const { form, formError, handleSubmit, isPending } = useDialogForm<
    CreateSaleOrderInput,
    SaleOrder
  >({
    open,
    onOpenChange,
    schema: createSaleOrderSchema,
    defaultValues: emptySaleOrderFormValues,
    entity: order,
    mapEntityToForm: getSaleOrderFormValues,
    mutation: order ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      order
        ? "sales.order_update_error_fallback"
        : "sales.order_create_error_fallback",
    ),
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>...</DialogTitle>
        </DialogHeader>
        <SaleOrderForm
          branches={seededBranches}
          contacts={seededContacts}
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          products={products}
          users={seededUsers}
          warehouses={seededWarehouses}
          zones={seededZones}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### The `useSeedEntityOption` hook

This is a small shared utility that guarantees the current selection is always
in the options array:

```tsx
// shared/hooks/use-seed-entity-option.ts

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
 * - Deactivated items that are currently selected still appear
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
```

### Rules

1. **Dialog does NOT fire its own queries** — it receives data as props
2. **Dialog seeds current selections** from the entity's label objects
3. **Dialog uses `useDialogForm`** for form state management
4. Products with complex nested structures (variants) may skip seeding and
   rely on the catalog array directly

### Why seeding matters

| Scenario | Without seed | With seed |
|----------|-------------|-----------|
| Warm cache (normal) | Works (catalog loaded) | Works (catalog loaded) |
| Cold start (first load) | **FLASH** (empty array) | Works (entity label) |
| Deactivated item selected | **MISSING** (filtered out) | Works (injected) |

---

## Layer 3: Form Component

The form is **pure UI**. It receives a form instance and catalog arrays, and
renders fields.

### Pattern

```tsx
type SaleOrderFormProps = {
  branches: Branch[];
  contacts: Contact[];
  users: User[];
  warehouses: Warehouse[];
  products: Product[];
  zones: Zone[];
  form: UseFormReturn<CreateSaleOrderInput>;
  formError: string | null;
  isPending: boolean;
  onSubmit: (values: CreateSaleOrderInput) => Promise<void>;
  submitLabel: string;
};

function SaleOrderForm({
  branches,
  contacts,
  form,
  ...
}: SaleOrderFormProps) {
  // ── Filter options for display ──
  const activeBranches = useMemo(
    () => branches.filter((b) => b.is_active),
    [branches],
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Branch select */}
      <Controller
        control={form.control}
        name="branch_id"
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una sucursal" />
            </SelectTrigger>
            <SelectContent>
              {activeBranches.map((branch) => (
                <SelectItem key={branch.id} value={String(branch.id)}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {/* Optional select with empty option */}
      <Controller
        control={form.control}
        name="seller_user_id"
        render={({ field }) => (
          <Select
            onValueChange={(value) =>
              field.onChange(value === EMPTY_SELECT_VALUE ? undefined : value)
            }
            value={field.value ?? EMPTY_SELECT_VALUE}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_SELECT_VALUE}>Sin vendedor</SelectItem>
              {activeUsers.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </form>
  );
}
```

### Rules

1. **Form does NOT fetch data** — it receives everything as props
2. **Form filters options** (active, branch-scoped, etc.) using `useMemo`
3. **Form uses `Controller`** from react-hook-form for all selects
4. Form follows the ID conventions from `CONVENTIONS.md`

---

## Query Configuration Pattern

All catalog queries must use `staleTime` to prevent unnecessary refetches:

### Pattern

```tsx
// In queries.ts for each module:

const CATALOG_STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useBranchesQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: branchesKeys.list(),
    queryFn: listBranches,
    staleTime: CATALOG_STALE_TIME,
  });
}
```

### Classification

| Query type | staleTime | Reasoning |
|-----------|-----------|-----------|
| Catalog lists (branches, contacts, users, warehouses, products, zones, routes, vehicles, categories, brands, measurement units, tax profiles, warranty profiles, price lists) | 2 minutes | These change rarely during a session |
| Entity detail (sale order, dispatch order) | 0 (default) | Must be fresh for editing |
| Table lists (sale orders, dispatch orders) | 0 (default) | Must reflect recent changes |

### Rule

Every query hook that serves as a **catalog source for selects** must have
`staleTime: CATALOG_STALE_TIME`.

This means:
- Section mounts → query fires → data cached
- Dialog opens → query reads from cache (no network request)
- User closes dialog, opens another → still cached (within 2 minutes)

---

## Mutation Response Pattern

Mutations should use the response to update the local cache directly:

### Pattern

```tsx
export function useUpdateSaleOrderMutation(
  orderId: string,
  options: MutationFeedbackOptions = {},
) {
  const queryClient = useQueryClient();
  const { t } = useAppTranslator();

  return useMutation({
    mutationFn: (payload: UpdateSaleOrderInput) =>
      updateSaleOrder(orderId, payload),
    onSuccess: (response) => {
      // Update detail cache with fresh response (avoid refetch)
      if (response) {
        queryClient.setQueryData(salesKeys.order(orderId), response);
      }
      // Invalidate list to refresh the table
      queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
      toast.success(t("common.update_success"));
    },
    onError: (error) => {
      if (options.showErrorToast !== false) {
        presentBackendErrorToast(error, {
          fallbackMessage: t("sales.order_update_error_fallback"),
        });
      }
    },
  });
}
```

### Rule

- `setQueryData` with the mutation response for the detail key
- `invalidateQueries` for the list key (so the table refreshes)
- The backend guarantees mutation responses are detail-grade

---

## Form Values Pattern

The `form-values.ts` file maps backend response → form state.

### Pattern

```tsx
// form-values.ts

export const emptySaleOrderFormValues: CreateSaleOrderInput = {
  branch_id: "",                    // Required FK → empty string
  seller_user_id: undefined,        // Optional FK → undefined
  fulfillment_mode: "pickup",       // Enum → default value
  lines: [],                        // Collection → empty array
};

export function getSaleOrderFormValues(order: SaleOrder): CreateSaleOrderInput {
  return {
    // Required FK: use scalar ID from response
    branch_id: order.branch_id ?? "",

    // Optional FK: use scalar ID, convert to string or undefined
    seller_user_id:
      order.seller_user_id != null ? String(order.seller_user_id) : undefined,

    // Scalar fields
    code: order.code ?? "",
    notes: order.notes ?? "",

    // Owned collections
    lines: (order.lines ?? []).map((line) => ({
      product_variant_id: String(
        line.product_variant_id ?? line.product_variant?.id ?? "",
      ),
      quantity: line.quantity,
      unit_price: line.unit_price,
    })),
  };
}
```

### Rules

1. **Use scalar IDs from the response** (`order.branch_id`), not from nested
   objects (`order.branch?.id`)
2. Required FKs map to `""` when empty
3. Optional FKs map to `undefined` when null
4. All IDs are strings in form state (per `CONVENTIONS.md`)
5. The nested label objects (`order.branch`, `order.seller`) are NOT stored in
   form state — they are used only for seeding (Layer 2)

---

## Payload Builder Pattern

The `api.ts` file converts form state → backend payload.

### Pattern

```tsx
// api.ts

export async function createSaleOrder(payload: CreateSaleOrderInput) {
  const body = buildSaleOrderPayload(payload);
  const response = await apiClient.post("/sale-orders", body);
  return saleOrderSchema.parse(extractEntity(response.data));
}

function buildSaleOrderPayload(
  payload: CreateSaleOrderInput | UpdateSaleOrderInput,
) {
  return compactNullableRecord({
    branch_id: toNumberId(payload.branch_id),
    customer_contact_id: toNumberId(payload.customer_contact_id),
    seller_user_id: toNumberId(payload.seller_user_id) ?? null,
    warehouse_id: toNumberId(payload.warehouse_id) ?? null,
    delivery_zone_id: toNumberId(payload.delivery_zone_id) ?? null,
    // ... scalar fields ...
    lines: payload.lines?.map((line) => ({
      product_variant_id: toNumberId(line.product_variant_id),
      quantity: line.quantity,
      unit_price: line.unit_price,
    })),
  });
}
```

### Rules

1. Required FKs: `toNumberId(value)` — no `?? null`
2. Optional FKs: `toNumberId(value) ?? null` — explicit null to clear
3. Use `compactNullableRecord` when the entity has nullable FKs
4. Use `compactRecord` when the entity has NO nullable FKs
5. Parse the response through the Zod schema to validate + transform IDs

---

## Response Schema Pattern

Zod schemas for API responses must handle the dual ID + label structure:

### Pattern

```tsx
// schemas.ts

import { idSchema, nullableIdSchema } from "@/shared/lib/api-types";

export const saleOrderSchema = z.object({
  id: idSchema,

  // Scalar FK IDs (for form binding)
  branch_id: idSchema,
  customer_contact_id: idSchema,
  seller_user_id: nullableIdSchema.catch(null),
  warehouse_id: nullableIdSchema.catch(null),

  // Minimal label objects (for display/seeding)
  branch: z.object({ id: idSchema, name: z.string().nullable() }).optional(),
  customer_contact: z.object({ id: idSchema, name: z.string() }).optional(),
  seller: z.object({ id: idSchema, name: z.string() }).nullish(),
  warehouse: z.object({ id: idSchema, name: z.string() }).nullish(),

  // Scalar fields
  status: z.string(),
  notes: z.string().nullable(),

  // Collections
  lines: z.array(saleOrderLineSchema).optional().default([]),

  // Lifecycle
  lifecycle: z.object({
    can_edit: z.boolean(),
    can_delete: z.boolean(),
  }).optional(),

  // Timestamps
  created_at: z.string(),
  updated_at: z.string(),
});
```

### Rules

1. Scalar FK IDs use `idSchema` (NOT NULL) or `nullableIdSchema.catch(null)`
2. Label objects use `.optional()` (not always present) or `.nullish()`
   (nullable FK)
3. Label objects define only the fields needed for display
4. The schema validates both detail and mutation responses

---

## File Organization Pattern

Every module with editable forms must have:

```
features/<module>/
  api.ts              — HTTP calls + payload builders
  queries.ts          — React Query hooks + cache management
  schemas.ts          — Zod response schemas + form validation schemas
  types.ts            — TypeScript types inferred from schemas
  form-values.ts      — Empty defaults + entity → form mapper
  components/
    <entity>-form.tsx          — Pure UI form (Layer 3)
    <entity>-dialog.tsx        — Hydration coordinator (Layer 2)
    <entity>s-section.tsx      — Data owner + prefetch (Layer 1)
    <entity>s-columns.tsx      — Table column definitions
```

---

## Complete Checklist for New Editable Resources

### Backend

- [ ] Entity with proper TypeORM relations
- [ ] View contract (`contracts/<entity>.view.ts`) with scalar IDs + label types
- [ ] Serializer returning both scalar ID and minimal label for every FK
- [ ] Repository with `LIST_RELATIONS` and `DETAIL_RELATIONS`
- [ ] Detail use case loads with `DETAIL_RELATIONS`
- [ ] Create use case reloads with `DETAIL_RELATIONS` before serializing
- [ ] Update use case reloads with `DETAIL_RELATIONS` before serializing
- [ ] Update DTO accepts `null` for nullable FKs
- [ ] Lifecycle block computed from persisted state

### Frontend

- [ ] Response schema with `idSchema`/`nullableIdSchema` + optional label objects
- [ ] Form schema with string IDs
- [ ] `form-values.ts` with empty defaults and entity mapper
- [ ] Payload builder with `toNumberId()` + `compactNullableRecord`
- [ ] Query hooks with `staleTime` for catalogs
- [ ] Section component prefetches all needed catalogs
- [ ] Dialog component receives catalogs as props
- [ ] Dialog seeds current selections with `useSeedEntityOption`
- [ ] Form component is pure UI with no data fetching
- [ ] Mutation `onSuccess` uses `setQueryData` for detail cache

---

## Migration Guide for Existing Modules

For modules that already exist but don't follow this pattern:

### Step 1: Add staleTime to catalog queries

In each module's `queries.ts`, add `staleTime: 2 * 60 * 1000` to every
catalog query hook.

### Step 2: Move catalog queries from dialog to section

Move `useBranchesQuery(open)`, `useContactsQuery(open)`, etc. from the
dialog component to the section component. Change `enabled` from `open` to
`enabled && canView`. Pass data as props to the dialog.

### Step 3: Create `useSeedEntityOption` hook

Create the shared hook in `shared/hooks/use-seed-entity-option.ts`.

### Step 4: Add seeding to dialog components

In each dialog, wrap catalog arrays with `useSeedEntityOption` before
passing them to the form.

### Step 5: Update mutation onSuccess

Add `queryClient.setQueryData()` with the mutation response.

### Step 6: Verify response schemas include label objects

Ensure Zod schemas parse the nested label objects from the backend.

---

## Anti-Patterns

| Anti-pattern | Why it's wrong | Correct pattern |
|-------------|---------------|-----------------|
| Queries inside dialog with `enabled={open}` | Data loads AFTER dialog opens → flash | Queries in section, always enabled |
| `form.reset()` with IDs but no options array | Select can't find matching item | Seed from entity label objects |
| No `staleTime` on catalog queries | Refetch on every mount → flicker | `staleTime: 2 * 60 * 1000` |
| Discarding mutation response | Forces refetch after save | `setQueryData` with response |
| Using `order.branch?.id` in form-values | Fragile if relation not loaded | Use `order.branch_id` (scalar) |
| Filtering `is_active` without preserving current | Current selection disappears | `useSeedEntityOption` injects current |
