# Inventory Frontend Alignment With Final Backend Contract

## 1. Resumen ejecutivo

Se alineo el frontend del modulo de inventory con el contrato operativo final confirmado entre backend y frontend, priorizando movimientos, ajustes, transferencias, lotes, serializacion operativa por `ProductVariant`, lifecycle, precios/promociones, invalidaciones y manejo de errores.

El frontend ahora consume movimientos por `MovementHeader + lines[]`, trata `ProductVariant` como unidad operativa real para stock/lotes/transferencias, filtra entidades inactivas en selects operativos y usa `lifecycle` como fuente oficial para acciones visibles clave.

## 2. Que estaba desalineado

- Los movimientos se modelaban como filas flatten legacy en lugar de headers oficiales con `lines[]`.
- Ajustes y transferencias seguian permitiendo depender visualmente de `product_id` sin empujar primero `product_variant_id`.
- Lotes y transferencias no exigian correctamente `inventory_lot_id` y `serial_ids` segun tracking real.
- `Product` no reflejaba completamente `track_serials` ni `variants[]` shallow.
- Varias tablas seguian mostrando acciones por `is_active` en vez de `lifecycle`.
- Varias tablas seguian mostrando delete aunque el contrato lo prohíbe o lo condiciona por lifecycle.
- Los selects operativos ofrecian entidades inactivas.
- Los errores de negocio seguian dependiendo demasiado del `message` del backend.

## 3. Que se corrigio

- Schemas y tipos de inventory fueron actualizados para reflejar los shapes oficiales actuales.
- El API layer de movimientos fue migrado a `GET /inventory-movements`, `GET /inventory-movements/:id`, `POST /adjust`, `POST /transfer` y `POST /:id/cancel`.
- Formularios de ajuste, transferencia y lotes ahora prefieren `product_variant_id` y validan lotes/seriales segun tracking real.
- `Product` y `ProductVariant` exponen correctamente flags operativos como `track_inventory`, `track_lots`, `track_expiration`, `track_serials`, `allow_negative_stock`, `is_active` y `lifecycle`.
- Variantes ahora distinguen correctamente entre desactivacion y hard delete permanente segun `lifecycle.can_delete`.
- Las tablas de productos, variantes, bodegas, lotes, listas de precios, marcas, categorias, unidades, warranty profiles, product prices y promociones quedaron alineadas con `lifecycle`.
- Se unifico el mapeo de errores de negocio por `code` o `messageKey`.
- Se ajustaron invalidaciones finas en React Query para evitar refresh ciego.

## 4. Como quedo Product vs ProductVariant

- `Product` queda como maestro comercial.
- `ProductVariant` queda como unidad operativa real para stock, lotes, transferencias y tracking operativo.
- En producto simple, la UI resuelve y usa automaticamente la default variant real cuando la operacion lo necesita.
- La UI no obliga a gestionar variantes manualmente cuando el producto no tiene variantes.
- La default variant de producto simple no se expone como flujo editable operativo independiente.
- En productos multivariante, los formularios operativos exigen variante cuando el contrato lo requiere.

## 5. Como quedaron lotes y seriales

### Lotes

- `InventoryLot` ahora refleja `current_quantity` como source of truth operativa.
- Creacion de lote recomienda `product_variant_id` y mantiene `product_id` solo como compatibilidad.
- Si el producto o variante requiere lotes, ajuste y transferencia obligan `inventory_lot_id`.
- `expiration_date` queda obligatoria cuando aplica la regla de tracking de expiracion desde backend.
- `DELETE lot` se trata como desactivacion, no como hard delete.

### Seriales

- El frontend ya usa `track_serials` en `Product` y `ProductVariant`.
- Se agrego una UI dedicada en el detalle de producto para listar, registrar y actualizar estado de seriales usando exclusivamente:
  - `GET /products/:id/variants/:variantId/serials`
  - `POST /products/:id/variants/:variantId/serials`
  - `PATCH /product-serials/:id`
- Las transferencias ahora validan `serial_ids` exactamente cuando la variante serializada lo exige.
- Si la operacion usa seriales:
  - `quantity` debe ser entero
  - `serial_ids` es obligatorio
  - `serial_ids.length` debe coincidir con `quantity`
- Registrar seriales no incrementa stock automaticamente y la UI lo deja explicito.
- No se agregaron flujos no confirmados como serial history dedicado, serial lookup dedicado o ajustes manuales serial-aware por unidad.

## 6. Como quedo lifecycle

- `lifecycle` fue agregado a las entidades maestras y operativas relevantes en schemas/tipos.
- Productos muestran desactivar solo cuando `lifecycle.can_deactivate` y reactivar cuando `lifecycle.can_reactivate`.
- Variantes muestran:
  - delete permanente via `DELETE /products/:id/variants/:variantId/permanent` solo cuando `lifecycle.can_delete`
  - deactivate via `DELETE /products/:id/variants/:variantId` cuando `lifecycle.can_delete = false` y `lifecycle.can_deactivate = true`
  - reactivate via `PATCH is_active = true` cuando `lifecycle.can_reactivate = true`
- La default variant de un producto simple no se expone como variante editable o eliminable independiente.
- Bodegas y lotes nunca muestran delete, solo acciones compatibles con lifecycle.
- Listas de precios:
  - si son default, no muestran delete
  - si no son default, delete depende de `lifecycle.can_delete`
  - desactivar/reactivar depende de `lifecycle`
- Brand, Category, MeasurementUnit, WarrantyProfile, ProductPrice y Promotion solo muestran delete cuando `lifecycle.can_delete`.
- TaxProfile y WarehouseLocation no muestran delete.

## 7. Como quedo movements

- El listado oficial usa `MovementHeader` paginado.
- El detalle oficial usa `GET /inventory-movements/:id`.
- La UI de movimientos renderiza por header y no por line flatten.
- El detalle renderiza:
  - `status`
  - `movement_type`
  - `occurred_at`
  - `branch`
  - `performed_by`
  - `source_document_*`
  - `transferred_serial_ids`
  - `legacy_movement_ids` solo como dato secundario
  - `lines[]` con warehouse, location, lot, product, variant y deltas
- Cancelacion usa siempre `movement.id` oficial.

## 8. Que endpoints oficiales usa ahora el frontend

- `GET /products`
- `GET /products/:id`
- `GET /products/:id/variants`
- `PATCH /products/:id`
- `PATCH /products/:id/variants/:variantId`
- `DELETE /products/:id`
- `DELETE /products/:id/variants/:variantId`
- `DELETE /products/:id/variants/:variantId/permanent`
- `GET /products/:id/variants/:variantId/serials`
- `POST /products/:id/variants/:variantId/serials`
- `PATCH /product-serials/:id`
- `GET /inventory-lots`
- `POST /inventory-lots`
- `PATCH /inventory-lots/:id`
- `DELETE /inventory-lots/:id`
- `GET /inventory-movements`
- `GET /inventory-movements/:id`
- `POST /inventory-movements/adjust`
- `POST /inventory-movements/transfer`
- `POST /inventory-movements/:id/cancel`
- `GET /warehouse-stock`
- `GET /warehouse-stock/:warehouseId/products`
- `GET /products/:id/prices`
- `POST /products/:id/prices`
- `PATCH /product-prices/:id`
- `GET /promotions`
- `POST /promotions`
- `PATCH /promotions/:id`

## 9. Que contratos legacy dejo de usar o relego

- El flatten legacy de movimientos dejo de ser el contrato principal.
- `legacy_movement_ids` y `legacy_movements` quedaron relegados a dato secundario visual, no a modelado principal.
- `product_id` sigue siendo aceptado en lotes, ajustes y transferencias solo como compatibilidad; el frontend nuevo prioriza `product_variant_id`.
- `min_stock/max_stock` no se usan como source of truth operativa de stock.

## 10. Que queries y mutations se ajustaron

- `useInventoryMovementsPaginatedQuery`
- `useInventoryMovementQuery`
- `useCreateInventoryAdjustmentMutation`
- `useCreateInventoryTransferMutation`
- `useCancelInventoryMovementMutation`
- `useCreateInventoryLotMutation`
- `useUpdateInventoryLotMutation`
- `useCreateProductMutation`
- `useUpdateProductMutation`
- `useProductSerialsQuery`
- `useCreateProductVariantMutation`
- `useUpdateProductVariantMutation`
- `useCreateProductSerialsMutation`
- `useUpdateProductSerialStatusMutation`
- `useGenerateVariantsMutation`
- `useDeactivateProductMutation`
- `useReactivateProductMutation`
- `useDeactivateProductVariantMutation`
- `useDeleteProductVariantPermanentMutation`
- `useReactivateProductVariantMutation`
- `useDeactivateWarehouseMutation`
- `useReactivateWarehouseMutation`
- `useDeactivateInventoryLotMutation`
- `useReactivateInventoryLotMutation`
- `useSetPriceListActiveMutation`

## 11. Que invalidaciones se configuraron

- Productos: invalidacion de lista, detalle, variantes, precios y vistas de stock/lotes relacionadas.
- Variantes: invalidacion de producto, variantes, warehouse stock, inventory lots, product prices y promotions.
- Lotes: invalidacion de lista, detalle, stock y movimientos.
- Lotes con `initial_quantity > 0`: refetch explicito de movimientos.
- Movimientos: invalidacion de lista, detalle, stock y lots; transfer invalida seriales de variante cuando aplica `serial_ids`.
- Seriales: invalidacion de `product-serials(productId, variantId)` despues de registrar o actualizar estado.
- Price lists: invalidacion de lista y detalle.
- Product prices: invalidacion de `product-prices(productId)`.
- Promotions: invalidacion de `promotions` y `promotion(id)` cuando aplica.
- Warehouses y locations: invalidacion de `warehouses`, `warehouse(id)`, `warehouse-locations(warehouseId)` y `warehouse-stock(warehouseId)` cuando aplica.

## 12. Que errores de negocio se mapearon

Se agrego soporte por `code/messageKey` para los codigos oficiales confirmados en:

- lookup y estado
- entidades inactivas
- producto y variante
- reglas de inventario
- lotes y stock
- transfer y ledger
- seriales
- pricing y promociones

El frontend ya no depende del `message` traducido del backend como fuente principal.

## 13. Archivos modificados

- `features/inventory/schemas.ts`
- `features/inventory/types.ts`
- `features/inventory/api.ts`
- `features/inventory/queries.ts`
- `features/inventory/form-values.ts`
- `features/inventory/components/inventory-adjustment-form.tsx`
- `features/inventory/components/inventory-transfer-form.tsx`
- `features/inventory/components/inventory-lot-form.tsx`
- `features/inventory/components/inventory-movements-section.tsx`
- `features/inventory/components/inventory-movements-columns.tsx`
- `features/inventory/components/inventory-movement-detail.tsx`
- `features/inventory/components/inventory-product-detail.tsx`
- `features/inventory/components/inventory-warehouse-detail.tsx`
- `features/inventory/components/product-form.tsx`
- `features/inventory/components/product-variant-form.tsx`
- `features/inventory/components/product-variants-section.tsx`
- `features/inventory/components/product-serials-section.tsx`
- `features/inventory/components/variant-picker.tsx`
- `features/inventory/components/price-lists-columns.tsx`
- `features/inventory/components/products-columns.tsx`
- `features/inventory/components/warehouses-columns.tsx`
- `features/inventory/components/inventory-lots-columns.tsx`
- `features/inventory/components/brands-columns.tsx`
- `features/inventory/components/measurement-units-columns.tsx`
- `features/inventory/components/product-categories-columns.tsx`
- `features/inventory/components/warranty-profiles-columns.tsx`
- `features/inventory/components/product-prices-columns.tsx`
- `features/inventory/components/promotions-columns.tsx`
- `features/inventory/components/product-price-form.tsx`
- `features/inventory/components/product-prices-section.tsx`
- `features/inventory/components/promotion-form.tsx`
- `features/inventory/components/promotions-section.tsx`
- `features/inventory/components/warehouse-stock-section.tsx`
- `features/inventory/components/inventory-price-list-detail.tsx`
- `features/inventory/components/warehouse-locations-section.tsx`
- `shared/lib/error-presentation.ts`
- `shared/lib/form-error-mapper.ts`
- `shared/hooks/use-backend-form-errors.ts`
- `shared/i18n/translations.ts`

## 14. Edge cases

- Producto simple con default variant: la UI la resuelve automaticamente para operaciones de stock.
- Producto multivariante: la UI obliga a variante donde la operacion lo requiere.
- Variante con `lifecycle.can_delete = true`: la UI ofrece hard delete permanente y no desactivacion.
- Variante serializada: transferencia obliga seriales y cantidad entera.
- Lote requerido: ajuste y transferencia obligan `inventory_lot_id`.
- Entidades inactivas siguen visibles en detalles e historicos, pero ya no aparecen como opcion operativa por defecto.
- Las listas maestras no se filtran globalmente por activas; el filtrado se aplica solo en selects operativos.

## 15. Flujos que siguen dependiendo de fase 2

- Serial history y serial lookup dedicados, porque no se expusieron como flujo publico confirmado en esta fase.
- Ajustes manuales serial-aware por unidad.
- Reservas, releases, incoming y outgoing operativos publicos.
- Pricing 100% variant-centric fuera del contrato oficial actual de `/products/:id/prices`.
- Endpoint dedicado de dependencias profundas/lifecycle extendido.

## Estado final

### Quedo 100% alineado en esta fase

- Movements oficiales
- Ajustes y transferencias sobre contrato oficial
- ProductVariant como unidad operativa en stock/lotes/transferencias
- Hard delete permanente de variante cuando lifecycle lo permite
- Lotes operativos
- Seriales listados, registrados y actualizados por contrato oficial confirmado
- Filtros operativos por `is_active`
- Manejo de errores por `code/messageKey`
- Invalidacion y refetch fino en inventory
- Lifecycle visible en las acciones principales ya soportadas por la UI actual

### Sigue dependiendo de fase 2

- Serial history y serial lookup dedicados
- Flujos serial-aware fuera de transferencias y cambio de estado
- Exposicion UI adicional para flujos no publicados aun por backend
