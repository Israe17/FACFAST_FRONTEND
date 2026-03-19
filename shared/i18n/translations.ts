import type { AppLanguage } from "./language";

const esTranslations = {
  "branches.create_error_fallback": "No fue posible crear la sucursal.",
  "branches.terminal_create_error_fallback": "No fue posible crear la terminal.",
  "branches.terminal_update_error_fallback": "No fue posible actualizar la terminal.",
  "branches.update_error_fallback": "No fue posible actualizar la sucursal.",
  "business.update_error_fallback": "No fue posible actualizar la configuracion de empresa.",
  "business.update_success": "Configuracion de empresa actualizada correctamente.",
  "common.branch_label": "Sucursal: {label}",
  "common.business_label": "Empresa: {label}",
  "common.cancel": "Cancelar",
  "common.create_success": "Creado correctamente.",
  "common.delete_success": "Eliminado correctamente.",
  "common.enter_business": "Entrar a empresa",
  "common.enterprise_level": "Nivel empresa",
  "common.load_failed": "No fue posible cargar la informacion.",
  "common.no_active_business": "Sin empresa activa",
  "common.no_branch": "Sin sucursal",
  "common.no_tenant_context": "Sin contexto tenant activo",
  "common.operation_completed": "Operacion completada.",
  "common.platform_admin_in_tenant": "Platform admin dentro del tenant",
  "common.save": "Guardar",
  "common.saving": "Guardando...",
  "common.saved_successfully": "Guardado correctamente.",
  "common.try_again": "Intenta de nuevo.",
  "common.table.first_page": "Primera pagina",
  "common.table.last_page": "Ultima pagina",
  "common.table.next_page": "Siguiente",
  "common.table.no_results": "No hay registros disponibles.",
  "common.table.page": "Pagina {page} de {totalPages}",
  "common.table.previous_page": "Anterior",
  "common.table.rows_per_page": "Filas por pagina",
  "common.table.search_placeholder": "Buscar...",
  "common.table.showing": "Mostrando {from}-{to} de {total} registros",
  "common.update_success": "Actualizado correctamente.",
  "contacts.create_error_fallback": "No fue posible crear el contacto.",
  "contacts.lookup_empty_input": "Ingresa una identificacion para buscar.",
  "contacts.lookup_error_fallback": "No fue posible ejecutar la busqueda del contacto.",
  "contacts.update_error_fallback": "No fue posible actualizar el contacto.",
  "inventory.brand_create_error_fallback": "No fue posible crear la marca.",
  "inventory.brand_update_error_fallback": "No fue posible actualizar la marca.",
  "inventory.access_denied_description":
    "No tienes permisos para ver el modulo de inventario.",
  "inventory.access_denied_title": "Acceso denegado",
  "inventory.category_create_error_fallback": "No fue posible crear la categoria.",
  "inventory.category_update_error_fallback": "No fue posible actualizar la categoria.",
  "inventory.common.actions": "Acciones",
  "inventory.common.active": "Activo",
  "inventory.common.all_variants": "Todas las variantes",
  "inventory.common.code": "Codigo",
  "inventory.common.coverage": "Cobertura",
  "inventory.common.create_entity": "Crear {entity}",
  "inventory.common.currency": "Moneda",
  "inventory.common.description": "Descripcion",
  "inventory.common.edit": "Editar",
  "inventory.common.edit_entity": "Editar {entity}",
  "inventory.common.empty_entity": "No se encontraron {entity} en el tenant actual.",
  "inventory.common.inactive": "Inactivo",
  "inventory.common.kind": "Tipo",
  "inventory.common.level": "Nivel",
  "inventory.common.loading_entity": "Cargando {entity}.",
  "inventory.common.name": "Nombre",
  "inventory.common.no_description": "Sin descripcion",
  "inventory.common.no_manual_code": "Sin codigo manual",
  "inventory.common.no_notes": "Sin notas",
  "inventory.common.notes": "Notas",
  "inventory.common.not_available": "N/D",
  "inventory.common.parent": "Padre",
  "inventory.common.root": "Raiz",
  "inventory.common.save_changes": "Guardar cambios",
  "inventory.common.status": "Estado",
  "inventory.common.symbol": "Simbolo",
  "inventory.common.type": "Tipo",
  "inventory.common.unable_to_load_entity": "No fue posible cargar {entity}.",
  "inventory.common.unknown": "Desconocido",
  "inventory.common.updated": "Actualizado",
  "inventory.common.view": "Ver",
  "inventory.entity.brand": "marca",
  "inventory.entity.brands": "marcas",
  "inventory.entity.category": "categoria",
  "inventory.entity.measurement_unit": "unidad de medida",
  "inventory.entity.measurement_units": "unidades de medida",
  "inventory.entity.price_list": "lista de precios",
  "inventory.entity.price_lists": "listas de precios",
  "inventory.entity.product": "producto",
  "inventory.entity.product_price": "precio de producto",
  "inventory.entity.product_prices": "precios de producto",
  "inventory.entity.product_category": "categoria",
  "inventory.entity.product_categories": "categorias de producto",
  "inventory.entity.products": "productos",
  "inventory.entity.variant": "variante",
  "inventory.entity.variants": "variantes",
  "inventory.entity.promotion": "promocion",
  "inventory.entity.promotions": "promociones",
  "inventory.entity.tax_profile": "perfil fiscal",
  "inventory.entity.tax_profiles": "perfiles fiscales",
  "inventory.entity.warehouse": "bodega",
  "inventory.entity.warehouses": "bodegas",
  "inventory.entity.warehouse_location": "ubicacion de bodega",
  "inventory.entity.warehouse_locations": "ubicaciones de bodega",
  "inventory.entity.warehouse_stock": "stock por bodega",
  "inventory.entity.inventory_lot": "lote",
  "inventory.entity.inventory_lots": "lotes",
  "inventory.entity.inventory_movement": "movimiento",
  "inventory.entity.inventory_movements": "movimientos de inventario",
  "inventory.entity.warranty_profile": "perfil de garantia",
  "inventory.entity.warranty_profiles": "perfiles de garantia",
  "inventory.form.active_brand": "Marca activa",
  "inventory.form.active_brand_description":
    "Las marcas inactivas se mantienen para historial, pero no deberian usarse operativamente.",
  "inventory.form.active_category": "Categoria activa",
  "inventory.form.active_category_description":
    "Las categorias inactivas se mantienen referenciadas en historial, pero no deberian usarse en productos nuevos.",
  "inventory.form.active_measurement_unit": "Unidad de medida activa",
  "inventory.form.active_measurement_unit_description":
    "Mantiene la unidad disponible para historial sin usarla en flujos nuevos de producto.",
  "inventory.form.active_price_list": "Lista de precios activa",
  "inventory.form.active_price_list_description":
    "Las listas inactivas quedan solo para historial y reporteria.",
  "inventory.form.active_product": "Producto activo",
  "inventory.form.active_product_description":
    "Los productos inactivos siguen visibles para historial y auditoria.",
  "inventory.form.active_tax_profile": "Perfil fiscal activo",
  "inventory.form.active_tax_profile_description":
    "Los perfiles inactivos se mantienen solo para historial.",
  "inventory.form.active_warranty_profile": "Perfil de garantia activo",
  "inventory.form.active_warranty_profile_description":
    "Los perfiles inactivos siguen disponibles para historial y referencias legadas.",
  "inventory.form.allow_negative_stock": "Permitir inventario negativo",
  "inventory.form.allow_negative_stock_description":
    "Usalo solo cuando la operacion permita balances negativos temporales.",
  "inventory.form.allows_exoneration": "Permite exoneracion",
  "inventory.form.allows_exoneration_description":
    "Habilita manejo de exoneracion para compradores elegibles.",
  "inventory.form.active_inventory_lot": "Lote activo",
  "inventory.form.active_inventory_lot_description":
    "Los lotes inactivos quedan visibles para historial, pero no deben seguir usandose operativamente.",
  "inventory.form.active_product_price": "Precio activo",
  "inventory.form.active_product_price_description":
    "Permite desactivar precios sin borrar historial.",
  "inventory.form.active_promotion": "Promocion activa",
  "inventory.form.active_promotion_description":
    "Las promociones inactivas se conservan para auditoria y analitica.",
  "inventory.form.active_warehouse": "Bodega activa",
  "inventory.form.active_warehouse_description":
    "Las bodegas inactivas permanecen en historial, pero no deben recibir nuevas operaciones.",
  "inventory.form.active_warehouse_location": "Ubicacion activa",
  "inventory.form.active_warehouse_location_description":
    "Mantiene la ubicacion visible para historial sin usarla en nuevas operaciones.",
  "inventory.form.barcode": "Codigo de barras",
  "inventory.form.aisle": "Pasillo",
  "inventory.form.all_warehouses": "Todas las bodegas",
  "inventory.form.adjustment_type": "Tipo de ajuste",
  "inventory.form.available_quantity": "Disponible",
  "inventory.form.bonus_quantity": "Cantidad bonificada",
  "inventory.form.branch": "Sucursal",
  "inventory.form.cabys_code": "Codigo CABYS",
  "inventory.form.coverage_notes": "Notas de cobertura",
  "inventory.form.current_quantity": "Cantidad actual",
  "inventory.form.default_price_list": "Lista de precios por defecto",
  "inventory.form.default_price_list_description":
    "El backend quitara el default anterior si esta lista pasa a ser la predeterminada.",
  "inventory.form.default_warehouse": "Bodega por defecto",
  "inventory.form.default_warehouse_description":
    "El backend desactiva la bodega default anterior dentro de la misma sucursal.",
  "inventory.form.destination_warehouse": "Bodega destino",
  "inventory.form.discount_value": "Valor de descuento",
  "inventory.form.duration_unit": "Unidad de duracion",
  "inventory.form.duration_value": "Valor de duracion",
  "inventory.form.expiration_date": "Fecha de expiracion",
  "inventory.form.has_variants": "Tiene variantes",
  "inventory.form.has_variants_description":
    "Habilita la gestion de variantes (talla, color, etc.) para este producto.",
  "inventory.form.has_warranty": "Tiene garantia",
  "inventory.form.has_warranty_description":
    "El perfil de garantia se vuelve obligatorio cuando este flag esta activo.",
  "inventory.form.header_id": "Header",
  "inventory.form.initial_quantity": "Cantidad inicial",
  "inventory.form.inventory": "Inventario",
  "inventory.form.is_dispatch_area": "Area de despacho",
  "inventory.form.is_dispatch_area_description":
    "Marca la ubicacion como util para despachos.",
  "inventory.form.is_picking_area": "Area de picking",
  "inventory.form.is_picking_area_description":
    "Marca la ubicacion como util para preparacion de pedidos.",
  "inventory.form.is_receiving_area": "Area de recepcion",
  "inventory.form.is_receiving_area_description":
    "Marca la ubicacion como util para recepcion de mercaderia.",
  "inventory.form.item_kind": "Tipo de item",
  "inventory.form.iva_rate": "Tasa de IVA",
  "inventory.form.iva_rate_code": "Codigo de tasa IVA",
  "inventory.form.kind": "Tipo",
  "inventory.form.level": "Nivel",
  "inventory.form.locations": "Ubicaciones",
  "inventory.form.lot_number": "Numero de lote",
  "inventory.form.manufacturing_date": "Fecha de fabricacion",
  "inventory.form.min_quantity": "Cantidad minima",
  "inventory.form.movement_type": "Tipo de movimiento",
  "inventory.form.no_brand": "Sin marca",
  "inventory.form.no_category": "Sin categoria",
  "inventory.form.no_inventory_lot": "Sin lote",
  "inventory.form.no_location": "Sin ubicacion",
  "inventory.form.no_parent": "Sin padre",
  "inventory.form.no_sale_unit": "Sin unidad de venta",
  "inventory.form.no_stock_unit": "Sin unidad de inventario",
  "inventory.form.no_supplier_contact": "Sin proveedor",
  "inventory.form.no_warranty_profile": "Sin perfil de garantia",
  "inventory.form.occurred_at": "Ocurrio en",
  "inventory.form.on_hand_delta": "Delta disponible",
  "inventory.form.on_hand_quantity": "Existencia",
  "inventory.form.origin_warehouse": "Bodega origen",
  "inventory.form.override_price": "Precio override",
  "inventory.form.parent_category": "Categoria padre",
  "inventory.form.position": "Posicion",
  "inventory.form.price": "Precio",
  "inventory.form.product": "Producto",
  "inventory.form.projected_quantity": "Proyectado",
  "inventory.form.promotion_type": "Tipo de promocion",
  "inventory.form.purpose": "Proposito",
  "inventory.form.quantity": "Cantidad",
  "inventory.form.rack": "Rack",
  "inventory.form.received_at": "Recibido en",
  "inventory.form.reference_id": "Referencia ID",
  "inventory.form.reference_type": "Tipo de referencia",
  "inventory.form.reserved_quantity": "Reservado",
  "inventory.form.requires_cabys": "Requiere CABYS",
  "inventory.form.requires_cabys_description":
    "Usa validacion CABYS en los flujos posteriores.",
  "inventory.form.sale_unit": "Unidad de venta",
  "inventory.form.select_adjustment_type": "Selecciona un tipo de ajuste",
  "inventory.form.select_branch": "Selecciona una sucursal",
  "inventory.form.select_duration_unit": "Selecciona una unidad de duracion",
  "inventory.form.select_destination_warehouse": "Selecciona una bodega destino",
  "inventory.form.select_item_kind": "Selecciona el tipo de item",
  "inventory.form.select_kind": "Selecciona un tipo",
  "inventory.form.select_origin_warehouse": "Selecciona una bodega origen",
  "inventory.form.select_price_list": "Selecciona una lista de precios",
  "inventory.form.select_product": "Selecciona un producto",
  "inventory.form.select_variant": "Selecciona una variante",
  "inventory.form.product_variant": "Variante",
  "inventory.form.select_promotion_type": "Selecciona un tipo de promocion",
  "inventory.form.select_tax_profile": "Selecciona un perfil fiscal",
  "inventory.form.select_tax_type": "Selecciona el tipo de impuesto",
  "inventory.form.select_type": "Selecciona un tipo",
  "inventory.form.select_warehouse": "Selecciona una bodega",
  "inventory.form.specific_tax_name": "Nombre del impuesto especifico",
  "inventory.form.specific_tax_rate": "Tasa del impuesto especifico",
  "inventory.form.stock_unit": "Unidad de inventario",
  "inventory.form.supplier_contact": "Proveedor",
  "inventory.form.tax_profile": "Perfil fiscal",
  "inventory.form.tax_type": "Tipo de impuesto",
  "inventory.form.track_expiration": "Rastrear expiracion",
  "inventory.form.track_expiration_description":
    "Las fechas de expiracion solo aplican cuando el rastreo por lotes esta activo.",
  "inventory.form.track_inventory": "Rastrear inventario",
  "inventory.form.track_inventory_description":
    "Habilita balances de stock para este producto.",
  "inventory.form.track_lots": "Rastrear lotes",
  "inventory.form.track_lots_description":
    "Es obligatorio cuando el stock se maneja por lotes.",
  "inventory.form.type": "Tipo",
  "inventory.form.unit_cost": "Costo unitario",
  "inventory.form.uses_locations": "Usa ubicaciones",
  "inventory.form.uses_locations_description":
    "Permite organizar la bodega en ubicaciones operativas.",
  "inventory.form.valid_from": "Valido desde",
  "inventory.form.valid_to": "Valido hasta",
  "inventory.form.validity": "Vigencia",
  "inventory.form.warranty_profile": "Perfil de garantia",
  "inventory.form.zone": "Zona",
  "inventory.brands.dialog_description":
    "Mantiene el catalogo de marcas usando el contrato actual de inventario del backend.",
  "inventory.brands.section_description":
    "Catalogo comercial de marcas que luego usan productos y precios.",
  "inventory.categories.dialog_description":
    "Mantiene la jerarquia de categorias de producto usada por inventario.",
  "inventory.categories.section_description":
    "Clasificacion jerarquica para productos y futura analitica de inventario.",
  "inventory.measurement_units.dialog_description":
    "Mantiene las unidades de inventario y venta usadas por entidades del modulo.",
  "inventory.measurement_units.section_description":
    "Unidades de inventario, venta y conversion disponibles para productos y precios.",
  "inventory.page_description":
    "Base operativa de inventario del tenant. Esta fase cubre catalogos, pricing, bodegas, lotes y movimientos.",
  "inventory.page_phase_badge": "Fase 3",
  "inventory.page_scope_badge": "Inventario operativo",
  "inventory.page_tenant_aware_badge": "Tenant aware",
  "inventory.page_title": "Inventario",
  "inventory.module_eyebrow": "ERP inventory",
  "inventory.module_title": "Modulo de inventory",
  "inventory.module_description":
    "Navega por catalogos, productos, pricing, bodegas y operacion sin convertir Inventory en una pagina infinita.",
  "inventory.context.business_label": "Empresa",
  "inventory.context.branch_label": "Contexto sucursal",
  "inventory.context.company_level": "Nivel empresa",
  "inventory.context.mode_label": "Modo",
  "inventory.nav.catalogs": "Catalogos",
  "inventory.nav.products": "Productos",
  "inventory.nav.pricing": "Pricing",
  "inventory.nav.warehouses": "Bodegas",
  "inventory.nav.operations": "Operacion",
  "inventory.landing.title": "Centro de inventory",
  "inventory.landing.description":
    "Inventory ahora funciona como un mini-sistema del dashboard: entra por submodulos, revisa relaciones y abre detalles por entidad.",
  "inventory.landing.primary_action": "Abrir productos",
  "inventory.landing.products_kpi_title": "Productos",
  "inventory.landing.products_kpi_description": "Catalogo maestro listo para stock y pricing.",
  "inventory.landing.catalogs_kpi_title": "Catalogos",
  "inventory.landing.catalogs_kpi_description": "Bases maestras activas para inventory.",
  "inventory.landing.pricing_kpi_title": "Pricing",
  "inventory.landing.pricing_kpi_description": "Listas comerciales y reglas promocionales.",
  "inventory.landing.warehouses_kpi_title": "Bodegas",
  "inventory.landing.warehouses_kpi_description": "Infraestructura operativa del tenant.",
  "inventory.landing.loading_modules": "Cargando resumen de submodulos de inventory.",
  "inventory.landing.records_badge": "{count} registros",
  "inventory.landing.open_module": "Entrar al submodulo",
  "inventory.landing.catalogs_description":
    "Gestiona categorias, marcas, unidades y perfiles reutilizables sin mezclarlo con la operacion.",
  "inventory.landing.products_description":
    "Administra productos, su capa default variant y sus relaciones comerciales y operativas.",
  "inventory.landing.pricing_description":
    "Separa listas de precios, precios por producto y promociones en un flujo comercial dedicado.",
  "inventory.landing.warehouses_description":
    "Mantiene bodegas, ubicaciones y vistas de detalle con stock, lotes y actividad reciente.",
  "inventory.landing.operations_description":
    "Consulta stock, lotes y movimientos con enfoque operativo y detalle por documento.",
  "inventory.catalogs.page_title": "Catalogos de inventory",
  "inventory.catalogs.page_description":
    "Mantiene los catalogos base del modulo con una vista compacta y escalable.",
  "inventory.catalogs.summary.categories": "Jerarquia de clasificacion para productos.",
  "inventory.catalogs.summary.brands": "Catalogo comercial usado por productos.",
  "inventory.catalogs.summary.units": "Unidades disponibles para stock y venta.",
  "inventory.catalogs.summary.tax_profiles": "Perfiles fiscales reutilizables.",
  "inventory.catalogs.summary.warranty_profiles": "Coberturas configuradas para postventa.",
  "inventory.catalogs.switcher.categories_description": "Jerarquia y subcategorias.",
  "inventory.catalogs.switcher.brands_description": "Catalogo comercial.",
  "inventory.catalogs.switcher.units_description": "Unidades y simbolos.",
  "inventory.catalogs.switcher.tax_profiles_description": "Reglas fiscales por item.",
  "inventory.catalogs.switcher.warranty_profiles_description": "Cobertura postventa.",
  "inventory.products.page_title": "Productos",
  "inventory.products.page_description":
    "Vista principal del catalogo de productos con acceso directo a su detalle operativo.",
  "inventory.products.summary.total": "Total del catalogo activo e historico.",
  "inventory.products.summary.active": "Productos disponibles para operacion.",
  "inventory.products.summary.inventory_enabled": "Productos que generan stock y ledger.",
  "inventory.products.summary.services": "Servicios mantenidos dentro del catalogo.",
  "inventory.pricing.page_title": "Pricing y comercial",
  "inventory.pricing.page_description":
    "Organiza listas de precios, precios por producto y promociones sin mezclarlo con stock o catalogos.",
  "inventory.pricing.summary.price_lists": "Listas comerciales configuradas.",
  "inventory.pricing.summary.active_price_lists": "Listas activas disponibles para uso.",
  "inventory.pricing.summary.promotions": "Promociones definidas en el tenant.",
  "inventory.pricing.switcher.price_lists_description": "Politicas comerciales base.",
  "inventory.pricing.switcher.product_prices_description": "Precios por producto y vigencia.",
  "inventory.pricing.switcher.promotions_description": "Promociones y campañas.",
  "inventory.warehouses.page_title": "Bodegas",
  "inventory.warehouses.page_description":
    "Gestiona la red de bodegas y entra a cada detalle para revisar ubicaciones, stock y actividad.",
  "inventory.warehouses.summary.total": "Bodegas registradas en el tenant.",
  "inventory.warehouses.summary.active": "Bodegas actualmente activas.",
  "inventory.warehouses.summary.default": "Bodegas marcadas como default.",
  "inventory.warehouses.summary.locations": "Bodegas con ubicaciones internas.",
  "inventory.operations.page_title": "Operacion de inventory",
  "inventory.operations.page_description":
    "Explora vistas operativas enfocadas en stock, lotes y movimientos del ledger.",
  "inventory.operations.cards.stock_description":
    "Lectura por bodega y variante default desde balances materializados.",
  "inventory.operations.cards.lots_description":
    "Control de lotes, cantidades actuales y vencimientos cuando aplica.",
  "inventory.operations.cards.movements_description":
    "Ledger operativo con ajustes, traslados y cancelaciones compensatorias.",
  "inventory.operations.open_view": "Abrir vista",
  "inventory.operations.page_hint":
    "Las acciones operativas importantes viven dentro de sus vistas enfocadas. Desde movimientos puedes registrar ajustes o traslados; desde stock y lotes analizas el estado actual.",
  "inventory.operations.back_to_overview": "Volver a operacion",
  "inventory.operations.stock_page_title": "Stock por bodega",
  "inventory.operations.stock_page_description":
    "Lectura enfocada de balances por bodega, producto y variante default.",
  "inventory.operations.lots_page_title": "Lotes",
  "inventory.operations.lots_page_description":
    "Consulta y administra lotes sin mezclar esta vista con movimientos o pricing.",
  "inventory.operations.movements_page_title": "Movimientos de inventory",
  "inventory.operations.movements_page_description":
    "Revisa el ledger por lineas, registra ajustes y abre el detalle por header.",
  "inventory.detail.loading_product": "Cargando detalle del producto.",
  "inventory.detail.loading_warehouse": "Cargando detalle de la bodega.",
  "inventory.detail.loading_price_list": "Cargando detalle de la lista de precios.",
  "inventory.detail.loading_movement": "Cargando detalle del movimiento.",
  "inventory.detail.product_not_found_title": "Producto no encontrado",
  "inventory.detail.product_not_found_description":
    "No fue posible resolver ese producto dentro del tenant actual.",
  "inventory.detail.warehouse_not_found_title": "Bodega no encontrada",
  "inventory.detail.warehouse_not_found_description":
    "No fue posible resolver esa bodega dentro del tenant actual.",
  "inventory.detail.price_list_not_found_title": "Lista de precios no encontrada",
  "inventory.detail.price_list_not_found_description":
    "No fue posible resolver esa lista de precios dentro del tenant actual.",
  "inventory.detail.movement_not_found_title": "Movimiento no encontrado",
  "inventory.detail.movement_not_found_description":
    "No fue posible reconstruir ese header desde el ledger visible del tenant actual.",
  "inventory.detail.back_to_products": "Volver a productos",
  "inventory.detail.back_to_warehouses": "Volver a bodegas",
  "inventory.detail.back_to_pricing": "Volver a pricing",
  "inventory.detail.back_to_movements": "Volver a movimientos",
  "inventory.detail.product_description":
    "Vista detallada del producto con precios, stock, promociones, lotes y actividad reciente.",
  "inventory.detail.warehouse_description":
    "Vista detallada de la bodega con ubicaciones, stock, lotes y movimientos recientes.",
  "inventory.detail.price_list_description":
    "Vista detallada de la lista de precios con sus precios relacionados y contexto comercial actual.",
  "inventory.detail.movement_description":
    "Documento reconstruido desde el ledger por header y lineas relacionadas.",
  "inventory.detail.summary_block_title": "Resumen",
  "inventory.detail.summary_block_description":
    "Informacion principal de la entidad dentro del contexto tenant actual.",
  "inventory.detail.created_at": "Creado",
  "inventory.detail.variant_label": "Variante",
  "inventory.detail.default_variant": "Default",
  "inventory.detail.default_variant_badge": "Default variant",
  "inventory.detail.variants_block_title": "Variantes visibles",
  "inventory.detail.variants_block_description":
    "La fase actual expone variantes a traves de stock y movimientos aunque el mantenimiento siga centrado en producto.",
  "inventory.detail.no_variants_available":
    "Todavia no hay variantes visibles en stock o movimientos para este producto.",
  "inventory.detail.product_kpi_prices": "Precios configurados para este producto.",
  "inventory.detail.product_kpi_stock": "Bodegas con stock relacionado.",
  "inventory.detail.product_kpi_lots": "Lotes asociados al producto.",
  "inventory.detail.product_kpi_promotions": "Promociones que incluyen este producto.",
  "inventory.detail.price_block_description":
    "Relacion comercial del producto con listas de precios activas o historicas.",
  "inventory.detail.stock_block_description":
    "Lectura operacional de stock por bodega y variante default.",
  "inventory.detail.promotion_block_description":
    "Promociones donde el producto aparece como item relacionado.",
  "inventory.detail.lots_block_description":
    "Lotes que ya existen para este producto dentro del tenant.",
  "inventory.detail.movements_block_description":
    "Actividad reciente del ledger para seguir trazabilidad operativa.",
  "inventory.detail.recent_movements_title": "Movimientos recientes",
  "inventory.detail.no_product_prices": "Todavia no hay precios configurados para este producto.",
  "inventory.detail.no_stock_rows": "Todavia no hay stock materializado para esta entidad.",
  "inventory.detail.no_related_promotions": "No hay promociones relacionadas actualmente.",
  "inventory.detail.no_related_lots": "No hay lotes relacionados actualmente.",
  "inventory.detail.no_recent_movements": "No hay movimientos recientes disponibles.",
  "inventory.detail.warehouse_kpi_locations": "Ubicaciones internas de esta bodega.",
  "inventory.detail.warehouse_kpi_stock": "Productos con balance en esta bodega.",
  "inventory.detail.warehouse_kpi_lots": "Lotes presentes dentro de la bodega.",
  "inventory.detail.warehouse_kpi_movements": "Lineas recientes del ledger en esta bodega.",
  "inventory.detail.locations_block_description":
    "Ubicaciones internas configuradas para esta bodega y su uso operativo.",
  "inventory.detail.branch_block_title": "Sucursal operativa",
  "inventory.detail.branch_block_description":
    "Relacion operativa actual entre la bodega y la sucursal configurada en backend.",
  "inventory.detail.single_branch_scope":
    "La bodega usa el scope de una sola sucursal en esta fase.",
  "inventory.detail.no_warehouse_locations":
    "No hay ubicaciones registradas para esta bodega.",
  "inventory.detail.price_list_kpi_prices": "Precios encontrados para esta lista.",
  "inventory.detail.price_list_kpi_active_prices": "Precios activos actualmente.",
  "inventory.detail.price_list_kpi_currency": "Moneda principal de la lista.",
  "inventory.detail.price_list_kpi_promotions": "Promociones relacionadas de forma indirecta.",
  "inventory.detail.pricing_phase_block_title": "Fase comercial actual",
  "inventory.detail.pricing_phase_block_description":
    "Aclara los limites reales del backend de pricing en esta etapa.",
  "inventory.detail.price_list_phase_note_1":
    "Los precios siguen siendo product-level, no variant-level.",
  "inventory.detail.price_list_phase_note_2":
    "No existe todavia una capa expuesta de assignments o scopes comerciales avanzados.",
  "inventory.detail.price_list_phase_note_3":
    "La relacion con promociones es indirecta y se infiere por productos que ya tienen precio en esta lista.",
  "inventory.detail.price_list_prices_block_description":
    "Productos y precios que actualmente usan esta lista comercial.",
  "inventory.detail.price_list_promotions_block_description":
    "Promociones vinculadas por productos ya presentes en esta lista.",
  "inventory.detail.no_price_list_prices":
    "No hay precios vinculados a esta lista en los productos consultados.",
  "inventory.detail.line_no": "Linea",
  "inventory.detail.total_cost": "Costo total",
  "inventory.detail.linked_line": "Linea vinculada",
  "inventory.detail.line_items": "Lineas del movimiento",
  "inventory.detail.line_items_description":
    "Cada linea refleja una mutacion del ledger y su impacto en balances.",
  "inventory.detail.no_movement_lines": "No se encontraron lineas para este movimiento.",
  "inventory.detail.registered_by": "Registrado por",
  "inventory.detail.movement_kpi_lines": "Cantidad de lineas en el header.",
  "inventory.detail.movement_kpi_quantity": "Cantidad agregada entre lineas.",
  "inventory.detail.movement_kpi_warehouses": "Bodegas involucradas en el header.",
  "inventory.detail.movement_kpi_date": "Fecha operativa del documento.",
  "inventory.detail.movement_relation_block_title": "Relacion operativa",
  "inventory.detail.movement_relation_block_description":
    "Ayuda a leer el header como documento aunque el backend liste por lineas.",
  "inventory.detail.movement_relation_note_1":
    "Las transferencias deben verse como dos lineas espejo dentro del mismo header.",
  "inventory.detail.movement_relation_note_2":
    "Las cancelaciones no editan el original; crean un movimiento compensatorio.",
  "inventory.detail.movement_relation_note_3":
    "Usa siempre el header para acciones de alto nivel, no el id individual de la linea.",
  "inventory.price_lists.dialog_description":
    "Define politicas comerciales de listas antes de asignar precios a productos.",
  "inventory.price_lists.section_description":
    "Politicas comerciales de listas que despues usan precios y promociones.",
  "inventory.product_prices.dialog_description":
    "Administra precios del producto {product} sobre las listas vigentes.",
  "inventory.product_prices.no_product_selected":
    "Selecciona un producto para consultar o registrar precios.",
  "inventory.product_prices.no_products_available":
    "No hay productos disponibles para asociar precios.",
  "inventory.product_prices.section_description":
    "Precios del producto por lista, cantidad minima y rango de vigencia.",
  "inventory.measurement_unit_create_error_fallback":
    "No fue posible crear la unidad de medida.",
  "inventory.measurement_unit_update_error_fallback":
    "No fue posible actualizar la unidad de medida.",
  "inventory.product_price_create_error_fallback":
    "No fue posible crear el precio del producto.",
  "inventory.product_price_update_error_fallback":
    "No fue posible actualizar el precio del producto.",
  "inventory.price_list_create_error_fallback": "No fue posible crear la lista de precios.",
  "inventory.price_list_update_error_fallback":
    "No fue posible actualizar la lista de precios.",
  "inventory.promotion_create_error_fallback":
    "No fue posible crear la promocion.",
  "inventory.promotion_update_error_fallback":
    "No fue posible actualizar la promocion.",
  "inventory.promotions.add_item": "Agregar item",
  "inventory.promotions.dialog_description":
    "Configura promociones y sus productos afectados usando el contrato actual del backend.",
  "inventory.promotions.item_label": "Item {index}",
  "inventory.promotions.items_count": "Items",
  "inventory.promotions.items_description":
    "Cada item debe cumplir la forma requerida por el tipo de promocion.",
  "inventory.promotions.items_title": "Items de promocion",
  "inventory.promotions.no_items":
    "Todavia no hay items en la promocion. Puedes guardar vacio si el backend lo permite, o agregar productos ahora.",
  "inventory.promotions.section_description":
    "Campanas promocionales con reglas por producto y vigencia temporal.",
  "inventory.products.dialog_description":
    "Crea o actualiza productos y servicios usando el contrato actual de inventario del backend.",
  "inventory.products.general_information_description":
    "Identidad principal del producto y referencias comerciales.",
  "inventory.products.general_information_title": "Informacion general",
  "inventory.products.inventory_no_stock": "Sin stock",
  "inventory.products.inventory_service": "Servicio",
  "inventory.products.inventory_track_lots": "Rastrea lotes",
  "inventory.products.inventory_track_lots_expiration":
    "Rastrea lotes + expiracion",
  "inventory.products.inventory_track_only": "Rastrea inventario",
  "inventory.products.no_commercial_reference": "Sin referencia comercial",
  "inventory.products.operational_behavior_description":
    "Los flags de inventario solo aplican a productos reales, no a servicios.",
  "inventory.products.operational_behavior_title": "Comportamiento operativo",
  "inventory.products.relations_description":
    "Relaciona el producto con categorias, unidades, marca y comportamiento fiscal.",
  "inventory.products.relations_title": "Relaciones y referencias",
  "inventory.products.section_description":
    "Catalogo principal de productos y servicios, enlazado con marca, categoria, unidades, impuestos y garantia.",
  "inventory.product_create_error_fallback": "No fue posible crear el producto.",
  "inventory.product_update_error_fallback": "No fue posible actualizar el producto.",
  "inventory.tax_profiles.dialog_description":
    "Define el comportamiento fiscal para productos y servicios usando el contrato actual del backend.",
  "inventory.tax_profiles.section_description":
    "Configuracion fiscal para bienes y servicios antes de activar productos.",
  "inventory.tax_profile_create_error_fallback":
    "No fue posible crear el perfil fiscal.",
  "inventory.tax_profile_update_error_fallback":
    "No fue posible actualizar el perfil fiscal.",
  "inventory.warehouses.dialog_description":
    "Administra bodegas operativas por sucursal dentro del tenant activo.",
  "inventory.warehouses.section_description":
    "Bodegas por sucursal con soporte para default operativo y ubicaciones internas.",
  "inventory.warehouse_create_error_fallback":
    "No fue posible crear la bodega.",
  "inventory.warehouse_update_error_fallback":
    "No fue posible actualizar la bodega.",
  "inventory.warehouse_locations.dialog_description":
    "Administra ubicaciones internas para la bodega {warehouse}.",
  "inventory.warehouse_locations.no_warehouses_with_locations":
    "No hay bodegas configuradas con ubicaciones activas.",
  "inventory.warehouse_locations.section_description":
    "Ubicaciones internas para picking, recepcion y despacho dentro de cada bodega.",
  "inventory.warehouse_location_create_error_fallback":
    "No fue posible crear la ubicacion de bodega.",
  "inventory.warehouse_location_update_error_fallback":
    "No fue posible actualizar la ubicacion de bodega.",
  "inventory.warehouse_stock.section_description":
    "Lectura materializada de balances por bodega, producto y variante default.",
  "inventory.inventory_lots.dialog_description":
    "Administra lotes y sus cantidades iniciales usando la logica actual del backend.",
  "inventory.inventory_lots.section_description":
    "Lotes inventariables ligados a producto, bodega, ubicacion opcional y proveedor.",
  "inventory.inventory_lot_create_error_fallback":
    "No fue posible crear el lote.",
  "inventory.inventory_lot_update_error_fallback":
    "No fue posible actualizar el lote.",
  "inventory.inventory_movements.adjustment_dialog_description":
    "Registra ajustes inmediatos sobre el ledger operativo del inventario.",
  "inventory.inventory_movements.adjustment_in_hint":
    "Usa ajuste de entrada para incrementar la existencia disponible.",
  "inventory.inventory_movements.adjustment_out_hint":
    "Usa ajuste de salida para descontar existencia disponible.",
  "inventory.inventory_movements.cancel_action": "Cancelar movimiento",
  "inventory.inventory_movements.cancel_description":
    "Se generara un movimiento compensatorio para revertir {code}.",
  "inventory.inventory_movements.cancel_title": "Cancelar movimiento posteado",
  "inventory.inventory_movements.create_adjustment": "Registrar ajuste",
  "inventory.inventory_movements.create_transfer": "Registrar traslado",
  "inventory.inventory_movements.inventory_lot_required":
    "Este producto requiere lote para registrar el ajuste.",
  "inventory.inventory_movements.new_adjustment": "Nuevo ajuste",
  "inventory.inventory_movements.new_transfer": "Nuevo traslado",
  "inventory.inventory_movements.section_description":
    "Ledger operativo de inventario con ajustes, traslados y cancelaciones compensatorias.",
  "inventory.inventory_movements.transfer_dialog_description":
    "Registra un traslado inmediato entre bodegas usando el header ledger actual.",
  "inventory.inventory_adjustment_create_error_fallback":
    "No fue posible registrar el ajuste de inventario.",
  "inventory.inventory_transfer_create_error_fallback":
    "No fue posible registrar el traslado de inventario.",
  "inventory.inventory_movement_cancel_error_fallback":
    "No fue posible cancelar el movimiento de inventario.",
  "inventory.variant_create_error_fallback":
    "No fue posible crear la variante.",
  "inventory.variant_update_error_fallback":
    "No fue posible actualizar la variante.",
  "inventory.variant_attributes_save_error_fallback":
    "No fue posible guardar los atributos de variantes.",
  "inventory.variant_generate_error_fallback":
    "No fue posible generar las variantes.",
  "inventory.variants.dialog_description":
    "Configura los detalles de la variante incluyendo SKU, codigo de barras y perfil fiscal.",
  "inventory.variants.section_title": "Variantes",
  "inventory.variants.section_description":
    "Gestiona las variantes de este producto con sus atributos individuales.",
  "inventory.variants.variant_count": "{count} variante(s)",
  "inventory.variants.no_variants":
    "Este producto no tiene variantes configuradas.",
  "inventory.variants.attributes_title": "Atributos de variantes",
  "inventory.variants.attributes_description":
    "Define atributos como talla, color, etc. para generar variantes automaticamente.",
  "inventory.variants.define_attributes": "Definir atributos",
  "inventory.variants.define_attributes_description":
    "Agrega nombres de atributos y sus valores posibles.",
  "inventory.variants.edit_attributes": "Editar atributos",
  "inventory.variants.attribute_name": "Nombre del atributo",
  "inventory.variants.attribute_name_placeholder": "ej. Color, Talla, Material",
  "inventory.variants.attribute_values": "Valores",
  "inventory.variants.add_value_placeholder": "Agregar valor y presionar Enter",
  "inventory.variants.add_attribute": "Agregar atributo",
  "inventory.variants.save_attributes": "Guardar atributos",
  "inventory.variants.generate_variants": "Generar variantes",
  "inventory.variants.generating": "Generando...",
  "inventory.variants.no_attributes_defined":
    "No se han definido atributos de variantes. Define atributos para generar variantes automaticamente.",
  "inventory.form.variant_name": "Nombre de la variante",
  "inventory.form.variant_name_placeholder": "ej. Negro - 128GB",
  "inventory.form.track_serials": "Rastrear series",
  "inventory.warranty_profiles.dialog_description":
    "Configura politicas reutilizables de garantia para productos con cobertura postventa.",
  "inventory.warranty_profiles.section_description":
    "Politicas reutilizables de garantia que los productos pueden referenciar cuando aplica cobertura.",
  "inventory.enum.adjustment_type.adjustment_in": "Entrada",
  "inventory.enum.adjustment_type.adjustment_out": "Salida",
  "inventory.enum.inventory_movement_status.cancelled": "Cancelado",
  "inventory.enum.inventory_movement_status.draft": "Borrador",
  "inventory.enum.inventory_movement_status.in_transit": "En transito",
  "inventory.enum.inventory_movement_status.partially_received": "Recibido parcial",
  "inventory.enum.inventory_movement_status.posted": "Posteado",
  "inventory.enum.inventory_movement_status.received": "Recibido",
  "inventory.enum.ledger_movement_type.manual_correction": "Correccion manual",
  "inventory.enum.ledger_movement_type.purchase_expected": "Compra esperada",
  "inventory.enum.ledger_movement_type.purchase_receipt": "Recepcion de compra",
  "inventory.enum.ledger_movement_type.release": "Liberacion",
  "inventory.enum.ledger_movement_type.reservation": "Reserva",
  "inventory.enum.ledger_movement_type.return_in": "Devolucion entrada",
  "inventory.enum.ledger_movement_type.return_out": "Devolucion salida",
  "inventory.enum.ledger_movement_type.sales_allocated": "Venta apartada",
  "inventory.enum.ledger_movement_type.sales_dispatch": "Despacho de venta",
  "inventory.enum.ledger_movement_type.stock_adjustment": "Ajuste de stock",
  "inventory.enum.ledger_movement_type.transfer": "Traslado",
  "inventory.enum.product_type.product": "Producto",
  "inventory.enum.product_type.service": "Servicio",
  "inventory.enum.price_list_kind.credit": "Credito",
  "inventory.enum.price_list_kind.retail": "Retail",
  "inventory.enum.price_list_kind.special": "Especial",
  "inventory.enum.price_list_kind.wholesale": "Mayoreo",
  "inventory.enum.promotion_type.buy_x_get_y": "Compra X lleva Y",
  "inventory.enum.promotion_type.fixed_amount": "Monto fijo",
  "inventory.enum.promotion_type.percentage": "Porcentaje",
  "inventory.enum.promotion_type.price_override": "Precio override",
  "inventory.enum.tax_profile_item_kind.goods": "Bienes",
  "inventory.enum.tax_profile_item_kind.service": "Servicio",
  "inventory.enum.tax_type.exento": "Exento",
  "inventory.enum.tax_type.iva": "IVA",
  "inventory.enum.tax_type.no_sujeto": "No sujeto",
  "inventory.enum.tax_type.specific_tax": "Impuesto especifico",
  "inventory.enum.warehouse_purpose.damaged": "Danado",
  "inventory.enum.warehouse_purpose.general_storage": "Almacen general",
  "inventory.enum.warehouse_purpose.production": "Produccion",
  "inventory.enum.warehouse_purpose.reserve": "Reserva",
  "inventory.enum.warehouse_purpose.returns": "Devoluciones",
  "inventory.enum.warehouse_purpose.saleable": "Venta",
  "inventory.enum.warehouse_purpose.transit": "Transito",
  "inventory.enum.warranty_duration_unit.days": "Dias",
  "inventory.enum.warranty_duration_unit.months": "Meses",
  "inventory.enum.warranty_duration_unit.years": "Anos",
  "inventory.warranty_profile_create_error_fallback":
    "No fue posible crear el perfil de garantia.",
  "inventory.warranty_profile_update_error_fallback":
    "No fue posible actualizar el perfil de garantia.",
  "platform.clear_tenant_error_fallback": "No fue posible salir del contexto de empresa.",
  "platform.clear_tenant_success": "Contexto tenant limpiado correctamente.",
  "platform.enter_tenant_error_fallback":
    "No fue posible entrar a la empresa seleccionada.",
  "platform.enter_tenant_success": "Ingreso al contexto de empresa completado.",
  "platform.business_onboarding_success": "Onboarding de empresa completado.",
  "platform.onboarding_error_fallback": "No fue posible completar el onboarding.",
  "roles.create_error_fallback": "No fue posible crear el rol.",
  "roles.delete_error_fallback": "No fue posible eliminar el rol.",
  "roles.permissions_update_error_fallback":
    "No fue posible actualizar los permisos del rol.",
  "roles.update_error_fallback": "No fue posible actualizar el rol.",
  "users.branches_update_error_fallback":
    "No fue posible actualizar las sucursales del usuario.",
  "users.create_error_fallback": "No fue posible crear el usuario.",
  "users.password_update_error_fallback":
    "No fue posible actualizar la contrasena del usuario.",
  "users.password_updated_success": "Contrasena actualizada correctamente.",
  "users.roles_update_error_fallback":
    "No fue posible actualizar los roles del usuario.",
  "users.status_update_error_fallback":
    "No fue posible actualizar el estado del usuario.",
  "users.update_error_fallback": "No fue posible actualizar el usuario.",
} as const;

export type FrontendTranslationKey = keyof typeof esTranslations;

type TranslationDictionary = Record<FrontendTranslationKey, string>;

export const translations: Record<AppLanguage, TranslationDictionary> = {
  en: {
    "branches.create_error_fallback": "Unable to create the branch.",
    "branches.terminal_create_error_fallback": "Unable to create the terminal.",
    "branches.terminal_update_error_fallback": "Unable to update the terminal.",
    "branches.update_error_fallback": "Unable to update the branch.",
    "business.update_error_fallback": "Unable to update business settings.",
    "business.update_success": "Business settings updated successfully.",
    "common.branch_label": "Branch: {label}",
    "common.business_label": "Business: {label}",
    "common.cancel": "Cancel",
    "common.create_success": "Created successfully.",
    "common.delete_success": "Deleted successfully.",
    "common.enter_business": "Enter business",
    "common.enterprise_level": "Enterprise level",
    "common.load_failed": "Unable to load the information.",
    "common.no_active_business": "No active business",
    "common.no_branch": "No branch",
    "common.no_tenant_context": "No active tenant context",
    "common.operation_completed": "Operation completed.",
    "common.platform_admin_in_tenant": "Platform admin in tenant",
    "common.save": "Save",
    "common.saving": "Saving...",
    "common.saved_successfully": "Saved successfully.",
    "common.try_again": "Please try again.",
    "common.table.first_page": "First page",
    "common.table.last_page": "Last page",
    "common.table.next_page": "Next",
    "common.table.no_results": "No results found.",
    "common.table.page": "Page {page} of {totalPages}",
    "common.table.previous_page": "Previous",
    "common.table.rows_per_page": "Rows per page",
    "common.table.search_placeholder": "Search...",
    "common.table.showing": "Showing {from}-{to} of {total} records",
    "common.update_success": "Updated successfully.",
    "contacts.create_error_fallback": "Unable to create the contact.",
    "contacts.lookup_empty_input": "Enter an identification to search.",
    "contacts.lookup_error_fallback": "Unable to execute the contact lookup.",
    "contacts.update_error_fallback": "Unable to update the contact.",
    "inventory.brand_create_error_fallback": "Unable to create the brand.",
    "inventory.brand_update_error_fallback": "Unable to update the brand.",
    "inventory.access_denied_description":
      "You do not have permission to view the inventory module.",
    "inventory.access_denied_title": "Access denied",
    "inventory.category_create_error_fallback": "Unable to create the category.",
    "inventory.category_update_error_fallback": "Unable to update the category.",
    "inventory.common.actions": "Actions",
    "inventory.common.active": "Active",
    "inventory.common.all_variants": "All variants",
    "inventory.common.code": "Code",
    "inventory.common.coverage": "Coverage",
    "inventory.common.create_entity": "Create {entity}",
    "inventory.common.currency": "Currency",
    "inventory.common.description": "Description",
    "inventory.common.edit": "Edit",
    "inventory.common.edit_entity": "Edit {entity}",
    "inventory.common.empty_entity": "No {entity} found in the current tenant.",
    "inventory.common.inactive": "Inactive",
    "inventory.common.kind": "Kind",
    "inventory.common.level": "Level",
    "inventory.common.loading_entity": "Loading {entity}.",
    "inventory.common.name": "Name",
    "inventory.common.no_description": "No description",
    "inventory.common.no_manual_code": "No manual code",
    "inventory.common.no_notes": "No notes",
    "inventory.common.notes": "Notes",
    "inventory.common.not_available": "N/A",
    "inventory.common.parent": "Parent",
    "inventory.common.root": "Root",
    "inventory.common.save_changes": "Save changes",
    "inventory.common.status": "Status",
    "inventory.common.symbol": "Symbol",
    "inventory.common.type": "Type",
    "inventory.common.unable_to_load_entity": "Unable to load {entity}.",
    "inventory.common.unknown": "Unknown",
    "inventory.common.updated": "Updated",
    "inventory.common.view": "View",
    "inventory.entity.brand": "brand",
    "inventory.entity.brands": "brands",
    "inventory.entity.category": "category",
    "inventory.entity.measurement_unit": "measurement unit",
    "inventory.entity.measurement_units": "measurement units",
    "inventory.entity.price_list": "price list",
    "inventory.entity.price_lists": "price lists",
    "inventory.entity.product": "product",
    "inventory.entity.product_price": "product price",
    "inventory.entity.product_prices": "product prices",
    "inventory.entity.product_category": "category",
    "inventory.entity.product_categories": "product categories",
    "inventory.entity.products": "products",
    "inventory.entity.variant": "variant",
    "inventory.entity.variants": "variants",
    "inventory.entity.promotion": "promotion",
    "inventory.entity.promotions": "promotions",
    "inventory.entity.tax_profile": "tax profile",
    "inventory.entity.tax_profiles": "tax profiles",
    "inventory.entity.warehouse": "warehouse",
    "inventory.entity.warehouses": "warehouses",
    "inventory.entity.warehouse_location": "warehouse location",
    "inventory.entity.warehouse_locations": "warehouse locations",
    "inventory.entity.warehouse_stock": "warehouse stock",
    "inventory.entity.inventory_lot": "inventory lot",
    "inventory.entity.inventory_lots": "inventory lots",
    "inventory.entity.inventory_movement": "inventory movement",
    "inventory.entity.inventory_movements": "inventory movements",
    "inventory.entity.warranty_profile": "warranty profile",
    "inventory.entity.warranty_profiles": "warranty profiles",
    "inventory.form.active_brand": "Active brand",
    "inventory.form.active_brand_description":
      "Inactive brands remain available for history, but should not be used operationally.",
    "inventory.form.active_category": "Active category",
    "inventory.form.active_category_description":
      "Inactive categories remain referenced historically, but should not be used in new products.",
    "inventory.form.active_measurement_unit": "Active measurement unit",
    "inventory.form.active_measurement_unit_description":
      "Keep the unit available for history without using it in new product flows.",
    "inventory.form.active_price_list": "Active price list",
    "inventory.form.active_price_list_description":
      "Inactive price lists remain available for history and reporting only.",
    "inventory.form.active_product": "Active product",
    "inventory.form.active_product_description":
      "Inactive products remain visible for history and audit.",
    "inventory.form.active_tax_profile": "Active tax profile",
    "inventory.form.active_tax_profile_description":
      "Inactive profiles remain for history only.",
    "inventory.form.active_warranty_profile": "Active warranty profile",
    "inventory.form.active_warranty_profile_description":
      "Inactive profiles stay available for history and legacy references.",
    "inventory.form.allow_negative_stock": "Allow negative stock",
    "inventory.form.allow_negative_stock_description":
      "Only use this when operations allow temporary negative balances.",
    "inventory.form.allows_exoneration": "Allows exoneration",
    "inventory.form.allows_exoneration_description":
      "Enable exoneration handling for eligible buyers.",
    "inventory.form.active_inventory_lot": "Active lot",
    "inventory.form.active_inventory_lot_description":
      "Inactive lots remain available for history, but should not be used in new operations.",
    "inventory.form.active_product_price": "Active price",
    "inventory.form.active_product_price_description":
      "Allows prices to be disabled without removing history.",
    "inventory.form.active_promotion": "Active promotion",
    "inventory.form.active_promotion_description":
      "Inactive promotions remain available for audit and analytics.",
    "inventory.form.active_warehouse": "Active warehouse",
    "inventory.form.active_warehouse_description":
      "Inactive warehouses remain for history, but should not receive new operations.",
    "inventory.form.active_warehouse_location": "Active location",
    "inventory.form.active_warehouse_location_description":
      "Keep the location visible for history without using it for new operations.",
    "inventory.form.barcode": "Barcode",
    "inventory.form.aisle": "Aisle",
    "inventory.form.all_warehouses": "All warehouses",
    "inventory.form.adjustment_type": "Adjustment type",
    "inventory.form.available_quantity": "Available",
    "inventory.form.bonus_quantity": "Bonus quantity",
    "inventory.form.branch": "Branch",
    "inventory.form.cabys_code": "CABYS code",
    "inventory.form.coverage_notes": "Coverage notes",
    "inventory.form.current_quantity": "Current quantity",
    "inventory.form.default_price_list": "Default price list",
    "inventory.form.default_price_list_description":
      "Backend will unset the previous default if this list becomes the default.",
    "inventory.form.default_warehouse": "Default warehouse",
    "inventory.form.default_warehouse_description":
      "Backend unsets the previous default warehouse inside the same branch.",
    "inventory.form.destination_warehouse": "Destination warehouse",
    "inventory.form.discount_value": "Discount value",
    "inventory.form.duration_unit": "Duration unit",
    "inventory.form.duration_value": "Duration value",
    "inventory.form.expiration_date": "Expiration date",
    "inventory.form.has_variants": "Has variants",
    "inventory.form.has_variants_description":
      "Enable variant management (size, color, etc.) for this product.",
    "inventory.form.has_warranty": "Has warranty",
    "inventory.form.has_warranty_description":
      "Warranty profile becomes required when this flag is enabled.",
    "inventory.form.header_id": "Header",
    "inventory.form.initial_quantity": "Initial quantity",
    "inventory.form.inventory": "Inventory",
    "inventory.form.is_dispatch_area": "Dispatch area",
    "inventory.form.is_dispatch_area_description":
      "Mark the location as valid for dispatch operations.",
    "inventory.form.is_picking_area": "Picking area",
    "inventory.form.is_picking_area_description":
      "Mark the location as valid for order picking.",
    "inventory.form.is_receiving_area": "Receiving area",
    "inventory.form.is_receiving_area_description":
      "Mark the location as valid for receiving goods.",
    "inventory.form.item_kind": "Item kind",
    "inventory.form.iva_rate": "IVA rate",
    "inventory.form.iva_rate_code": "IVA rate code",
    "inventory.form.kind": "Kind",
    "inventory.form.level": "Level",
    "inventory.form.locations": "Locations",
    "inventory.form.lot_number": "Lot number",
    "inventory.form.manufacturing_date": "Manufacturing date",
    "inventory.form.min_quantity": "Minimum quantity",
    "inventory.form.movement_type": "Movement type",
    "inventory.form.no_brand": "No brand",
    "inventory.form.no_category": "No category",
    "inventory.form.no_inventory_lot": "No lot",
    "inventory.form.no_location": "No location",
    "inventory.form.no_parent": "No parent",
    "inventory.form.no_sale_unit": "No sale unit",
    "inventory.form.no_stock_unit": "No stock unit",
    "inventory.form.no_supplier_contact": "No supplier",
    "inventory.form.no_warranty_profile": "No warranty profile",
    "inventory.form.occurred_at": "Occurred at",
    "inventory.form.on_hand_delta": "On-hand delta",
    "inventory.form.on_hand_quantity": "On hand",
    "inventory.form.origin_warehouse": "Origin warehouse",
    "inventory.form.override_price": "Override price",
    "inventory.form.parent_category": "Parent category",
    "inventory.form.position": "Position",
    "inventory.form.price": "Price",
    "inventory.form.product": "Product",
    "inventory.form.projected_quantity": "Projected",
    "inventory.form.promotion_type": "Promotion type",
    "inventory.form.purpose": "Purpose",
    "inventory.form.quantity": "Quantity",
    "inventory.form.rack": "Rack",
    "inventory.form.received_at": "Received at",
    "inventory.form.reference_id": "Reference ID",
    "inventory.form.reference_type": "Reference type",
    "inventory.form.reserved_quantity": "Reserved",
    "inventory.form.requires_cabys": "Requires CABYS",
    "inventory.form.requires_cabys_description":
      "Use CABYS validation in downstream flows.",
    "inventory.form.sale_unit": "Sale unit",
    "inventory.form.select_adjustment_type": "Select an adjustment type",
    "inventory.form.select_branch": "Select a branch",
    "inventory.form.select_duration_unit": "Select duration unit",
    "inventory.form.select_destination_warehouse": "Select a destination warehouse",
    "inventory.form.select_item_kind": "Select item kind",
    "inventory.form.select_kind": "Select a kind",
    "inventory.form.select_origin_warehouse": "Select an origin warehouse",
    "inventory.form.select_price_list": "Select a price list",
    "inventory.form.select_product": "Select a product",
    "inventory.form.select_variant": "Select a variant",
    "inventory.form.product_variant": "Variant",
    "inventory.form.select_promotion_type": "Select a promotion type",
    "inventory.form.select_tax_profile": "Select a tax profile",
    "inventory.form.select_tax_type": "Select tax type",
    "inventory.form.select_type": "Select a type",
    "inventory.form.select_warehouse": "Select a warehouse",
    "inventory.form.specific_tax_name": "Specific tax name",
    "inventory.form.specific_tax_rate": "Specific tax rate",
    "inventory.form.stock_unit": "Stock unit",
    "inventory.form.supplier_contact": "Supplier",
    "inventory.form.tax_profile": "Tax profile",
    "inventory.form.tax_type": "Tax type",
    "inventory.form.track_expiration": "Track expiration",
    "inventory.form.track_expiration_description":
      "Expiration dates are only available when lot tracking is enabled.",
    "inventory.form.track_inventory": "Track inventory",
    "inventory.form.track_inventory_description":
      "Enable stock balances for this product.",
    "inventory.form.track_lots": "Track lots",
    "inventory.form.track_lots_description":
      "Required when stock is lot-managed.",
    "inventory.form.type": "Type",
    "inventory.form.unit_cost": "Unit cost",
    "inventory.form.uses_locations": "Uses locations",
    "inventory.form.uses_locations_description":
      "Allow the warehouse to be organized into operational locations.",
    "inventory.form.valid_from": "Valid from",
    "inventory.form.valid_to": "Valid to",
    "inventory.form.validity": "Validity",
    "inventory.form.warranty_profile": "Warranty profile",
    "inventory.form.zone": "Zone",
    "inventory.brands.dialog_description":
      "Maintain the brand catalog using the current backend inventory contract.",
    "inventory.brands.section_description":
      "Commercial brand catalog used later by products and pricing.",
    "inventory.categories.dialog_description":
      "Maintain the product category hierarchy used by inventory.",
    "inventory.categories.section_description":
      "Hierarchical classification for products and future inventory analytics.",
    "inventory.measurement_units.dialog_description":
      "Maintain the stock and sale units used by inventory entities.",
    "inventory.measurement_units.section_description":
      "Stock, sale and conversion units available for products and pricing.",
    "inventory.page_description":
      "Tenant inventory operational foundation. This phase covers catalogs, pricing, warehouses, lots and movements.",
    "inventory.page_phase_badge": "Phase 3",
    "inventory.page_scope_badge": "Operational inventory",
    "inventory.page_tenant_aware_badge": "Tenant aware",
    "inventory.page_title": "Inventory",
    "inventory.module_eyebrow": "ERP inventory",
    "inventory.module_title": "Inventory module",
    "inventory.module_description":
      "Navigate catalogs, products, pricing, warehouses and operations without turning Inventory into an endless page.",
    "inventory.context.business_label": "Business",
    "inventory.context.branch_label": "Branch context",
    "inventory.context.company_level": "Company level",
    "inventory.context.mode_label": "Mode",
    "inventory.nav.catalogs": "Catalogs",
    "inventory.nav.products": "Products",
    "inventory.nav.pricing": "Pricing",
    "inventory.nav.warehouses": "Warehouses",
    "inventory.nav.operations": "Operations",
    "inventory.landing.title": "Inventory hub",
    "inventory.landing.description":
      "Inventory now works like a mini-system inside the dashboard: enter by submodule, review relationships and open entity details.",
    "inventory.landing.primary_action": "Open products",
    "inventory.landing.products_kpi_title": "Products",
    "inventory.landing.products_kpi_description": "Master catalog ready for stock and pricing.",
    "inventory.landing.catalogs_kpi_title": "Catalogs",
    "inventory.landing.catalogs_kpi_description": "Active master data for inventory.",
    "inventory.landing.pricing_kpi_title": "Pricing",
    "inventory.landing.pricing_kpi_description": "Commercial lists and promotion rules.",
    "inventory.landing.warehouses_kpi_title": "Warehouses",
    "inventory.landing.warehouses_kpi_description": "Operational infrastructure for the tenant.",
    "inventory.landing.loading_modules": "Loading inventory module overview.",
    "inventory.landing.records_badge": "{count} records",
    "inventory.landing.open_module": "Open submodule",
    "inventory.landing.catalogs_description":
      "Manage categories, brands, units and reusable profiles without mixing them with operations.",
    "inventory.landing.products_description":
      "Manage products, their default variant layer and their commercial and operational relationships.",
    "inventory.landing.pricing_description":
      "Separate price lists, product prices and promotions into a dedicated commercial flow.",
    "inventory.landing.warehouses_description":
      "Maintain warehouses, locations and detail views with stock, lots and recent activity.",
    "inventory.landing.operations_description":
      "Inspect stock, lots and movements with an operational focus and document detail.",
    "inventory.catalogs.page_title": "Inventory catalogs",
    "inventory.catalogs.page_description":
      "Maintain the module's base catalogs through a compact and scalable view.",
    "inventory.catalogs.summary.categories": "Classification hierarchy for products.",
    "inventory.catalogs.summary.brands": "Commercial catalog used by products.",
    "inventory.catalogs.summary.units": "Units available for stock and sales.",
    "inventory.catalogs.summary.tax_profiles": "Reusable tax profiles.",
    "inventory.catalogs.summary.warranty_profiles": "Configured after-sale coverage.",
    "inventory.catalogs.switcher.categories_description": "Hierarchy and subcategories.",
    "inventory.catalogs.switcher.brands_description": "Commercial catalog.",
    "inventory.catalogs.switcher.units_description": "Units and symbols.",
    "inventory.catalogs.switcher.tax_profiles_description": "Item fiscal rules.",
    "inventory.catalogs.switcher.warranty_profiles_description": "After-sale coverage.",
    "inventory.products.page_title": "Products",
    "inventory.products.page_description":
      "Main product catalog view with direct access to operational detail.",
    "inventory.products.summary.total": "Full active and historical catalog size.",
    "inventory.products.summary.active": "Products available for operations.",
    "inventory.products.summary.inventory_enabled": "Products that generate stock and ledger activity.",
    "inventory.products.summary.services": "Services maintained inside the catalog.",
    "inventory.pricing.page_title": "Pricing and commercial",
    "inventory.pricing.page_description":
      "Organize price lists, product prices and promotions without mixing them with stock or catalogs.",
    "inventory.pricing.summary.price_lists": "Configured commercial price lists.",
    "inventory.pricing.summary.active_price_lists": "Active lists available for use.",
    "inventory.pricing.summary.promotions": "Promotions defined for the tenant.",
    "inventory.pricing.switcher.price_lists_description": "Base commercial policies.",
    "inventory.pricing.switcher.product_prices_description": "Product prices and validity.",
    "inventory.pricing.switcher.promotions_description": "Promotions and campaigns.",
    "inventory.warehouses.page_title": "Warehouses",
    "inventory.warehouses.page_description":
      "Manage the warehouse network and enter each detail view to review locations, stock and activity.",
    "inventory.warehouses.summary.total": "Warehouses registered for the tenant.",
    "inventory.warehouses.summary.active": "Warehouses currently active.",
    "inventory.warehouses.summary.default": "Warehouses marked as default.",
    "inventory.warehouses.summary.locations": "Warehouses using internal locations.",
    "inventory.operations.page_title": "Inventory operations",
    "inventory.operations.page_description":
      "Explore operational views focused on stock, lots and ledger movements.",
    "inventory.operations.cards.stock_description":
      "Warehouse and default variant reading from materialized balances.",
    "inventory.operations.cards.lots_description":
      "Lot control, current quantities and expirations when applicable.",
    "inventory.operations.cards.movements_description":
      "Operational ledger with adjustments, transfers and compensating cancellations.",
    "inventory.operations.open_view": "Open view",
    "inventory.operations.page_hint":
      "Important operational actions live inside their focused views. From movements you can register adjustments or transfers; from stock and lots you analyze the current state.",
    "inventory.operations.back_to_overview": "Back to operations",
    "inventory.operations.stock_page_title": "Warehouse stock",
    "inventory.operations.stock_page_description":
      "Focused reading of balances by warehouse, product and default variant.",
    "inventory.operations.lots_page_title": "Lots",
    "inventory.operations.lots_page_description":
      "Review and manage lots without mixing this view with movements or pricing.",
    "inventory.operations.movements_page_title": "Inventory movements",
    "inventory.operations.movements_page_description":
      "Inspect the ledger by line, register adjustments and open header detail.",
    "inventory.detail.loading_product": "Loading product detail.",
    "inventory.detail.loading_warehouse": "Loading warehouse detail.",
    "inventory.detail.loading_price_list": "Loading price list detail.",
    "inventory.detail.loading_movement": "Loading movement detail.",
    "inventory.detail.product_not_found_title": "Product not found",
    "inventory.detail.product_not_found_description":
      "Unable to resolve that product inside the current tenant.",
    "inventory.detail.warehouse_not_found_title": "Warehouse not found",
    "inventory.detail.warehouse_not_found_description":
      "Unable to resolve that warehouse inside the current tenant.",
    "inventory.detail.price_list_not_found_title": "Price list not found",
    "inventory.detail.price_list_not_found_description":
      "Unable to resolve that price list inside the current tenant.",
    "inventory.detail.movement_not_found_title": "Movement not found",
    "inventory.detail.movement_not_found_description":
      "Unable to rebuild that header from the visible tenant ledger.",
    "inventory.detail.back_to_products": "Back to products",
    "inventory.detail.back_to_warehouses": "Back to warehouses",
    "inventory.detail.back_to_pricing": "Back to pricing",
    "inventory.detail.back_to_movements": "Back to movements",
    "inventory.detail.product_description":
      "Detailed product view with prices, stock, promotions, lots and recent activity.",
    "inventory.detail.warehouse_description":
      "Detailed warehouse view with locations, stock, lots and recent movements.",
    "inventory.detail.price_list_description":
      "Detailed price list view with related prices and current commercial context.",
    "inventory.detail.movement_description":
      "Document reconstructed from the ledger through the header and its lines.",
    "inventory.detail.summary_block_title": "Summary",
    "inventory.detail.summary_block_description":
      "Main entity information within the current tenant context.",
    "inventory.detail.created_at": "Created",
    "inventory.detail.variant_label": "Variant",
    "inventory.detail.default_variant": "Default",
    "inventory.detail.default_variant_badge": "Default variant",
    "inventory.detail.variants_block_title": "Visible variants",
    "inventory.detail.variants_block_description":
      "The current phase exposes variants through stock and movements even though maintenance stays product-centered.",
    "inventory.detail.no_variants_available":
      "There are no visible variants yet in stock or movements for this product.",
    "inventory.detail.product_kpi_prices": "Prices configured for this product.",
    "inventory.detail.product_kpi_stock": "Warehouses with related stock.",
    "inventory.detail.product_kpi_lots": "Lots associated with the product.",
    "inventory.detail.product_kpi_promotions": "Promotions that include this product.",
    "inventory.detail.price_block_description":
      "Commercial relationship between the product and active or historical price lists.",
    "inventory.detail.stock_block_description":
      "Operational stock reading by warehouse and default variant.",
    "inventory.detail.promotion_block_description":
      "Promotions where the product is included as a related item.",
    "inventory.detail.lots_block_description":
      "Lots that already exist for this product inside the tenant.",
    "inventory.detail.movements_block_description":
      "Recent ledger activity for operational traceability.",
    "inventory.detail.recent_movements_title": "Recent movements",
    "inventory.detail.no_product_prices": "There are no prices configured for this product yet.",
    "inventory.detail.no_stock_rows": "There is no materialized stock for this entity yet.",
    "inventory.detail.no_related_promotions": "There are no related promotions right now.",
    "inventory.detail.no_related_lots": "There are no related lots right now.",
    "inventory.detail.no_recent_movements": "There are no recent movements available.",
    "inventory.detail.warehouse_kpi_locations": "Internal locations in this warehouse.",
    "inventory.detail.warehouse_kpi_stock": "Products with a balance in this warehouse.",
    "inventory.detail.warehouse_kpi_lots": "Lots currently inside the warehouse.",
    "inventory.detail.warehouse_kpi_movements": "Recent ledger lines inside this warehouse.",
    "inventory.detail.locations_block_description":
      "Internal locations configured for this warehouse and their operational use.",
    "inventory.detail.branch_block_title": "Operational branch",
    "inventory.detail.branch_block_description":
      "Current operational relationship between the warehouse and the backend-configured branch.",
    "inventory.detail.single_branch_scope":
      "This phase uses a single-branch operational scope for the warehouse.",
    "inventory.detail.no_warehouse_locations":
      "No locations have been registered for this warehouse.",
    "inventory.detail.price_list_kpi_prices": "Prices found for this list.",
    "inventory.detail.price_list_kpi_active_prices": "Currently active prices.",
    "inventory.detail.price_list_kpi_currency": "Primary currency for the list.",
    "inventory.detail.price_list_kpi_promotions": "Indirectly related promotions.",
    "inventory.detail.pricing_phase_block_title": "Current pricing phase",
    "inventory.detail.pricing_phase_block_description":
      "Clarifies the real pricing backend limits in this stage.",
    "inventory.detail.price_list_phase_note_1":
      "Prices are still product-level, not variant-level.",
    "inventory.detail.price_list_phase_note_2":
      "There is no exposed layer yet for assignments or advanced commercial scopes.",
    "inventory.detail.price_list_phase_note_3":
      "The promotion relationship is indirect and inferred from products that already have prices in this list.",
    "inventory.detail.price_list_prices_block_description":
      "Products and prices currently using this commercial list.",
    "inventory.detail.price_list_promotions_block_description":
      "Promotions linked through products already present in this list.",
    "inventory.detail.no_price_list_prices":
      "No prices are linked to this list in the queried products.",
    "inventory.detail.line_no": "Line",
    "inventory.detail.total_cost": "Total cost",
    "inventory.detail.linked_line": "Linked line",
    "inventory.detail.line_items": "Movement lines",
    "inventory.detail.line_items_description":
      "Each line represents a ledger mutation and its impact on balances.",
    "inventory.detail.no_movement_lines": "No lines were found for this movement.",
    "inventory.detail.registered_by": "Registered by",
    "inventory.detail.movement_kpi_lines": "Line count inside the header.",
    "inventory.detail.movement_kpi_quantity": "Aggregate quantity across lines.",
    "inventory.detail.movement_kpi_warehouses": "Warehouses involved in the header.",
    "inventory.detail.movement_kpi_date": "Operational document date.",
    "inventory.detail.movement_relation_block_title": "Operational relationship",
    "inventory.detail.movement_relation_block_description":
      "Helps read the header as a document even though backend lists by line.",
    "inventory.detail.movement_relation_note_1":
      "Transfers should be read as two mirrored lines inside the same header.",
    "inventory.detail.movement_relation_note_2":
      "Cancellations never edit the original; they create a compensating movement.",
    "inventory.detail.movement_relation_note_3":
      "Always use the header for high-level actions, not the individual line id.",
    "inventory.price_lists.dialog_description":
      "Define commercial price list policies before assigning prices to products.",
    "inventory.price_lists.section_description":
      "Commercial price list policies used later by product prices and promotions.",
    "inventory.product_prices.dialog_description":
      "Manage prices for product {product} across the available price lists.",
    "inventory.product_prices.no_product_selected":
      "Select a product to review or register prices.",
    "inventory.product_prices.no_products_available":
      "No products are available to attach prices yet.",
    "inventory.product_prices.section_description":
      "Product prices per list, minimum quantity and validity range.",
    "inventory.measurement_unit_create_error_fallback":
      "Unable to create the measurement unit.",
    "inventory.measurement_unit_update_error_fallback":
      "Unable to update the measurement unit.",
    "inventory.product_price_create_error_fallback":
      "Unable to create the product price.",
    "inventory.product_price_update_error_fallback":
      "Unable to update the product price.",
    "inventory.price_list_create_error_fallback":
      "Unable to create the price list.",
    "inventory.price_list_update_error_fallback":
      "Unable to update the price list.",
    "inventory.promotion_create_error_fallback":
      "Unable to create the promotion.",
    "inventory.promotion_update_error_fallback":
      "Unable to update the promotion.",
    "inventory.promotions.add_item": "Add item",
    "inventory.promotions.dialog_description":
      "Configure promotions and affected products using the current backend contract.",
    "inventory.promotions.item_label": "Item {index}",
    "inventory.promotions.items_count": "Items",
    "inventory.promotions.items_description":
      "Each item must satisfy the shape required by the promotion type.",
    "inventory.promotions.items_title": "Promotion items",
    "inventory.promotions.no_items":
      "There are no promotion items yet. You can keep it empty if backend rules allow it, or add products now.",
    "inventory.promotions.section_description":
      "Promotional campaigns with product rules and validity windows.",
    "inventory.products.dialog_description":
      "Create or update products and services using the current backend inventory contract.",
    "inventory.products.general_information_description":
      "Core product identity and commercial references.",
    "inventory.products.general_information_title": "General information",
    "inventory.products.inventory_no_stock": "No stock",
    "inventory.products.inventory_service": "Service",
    "inventory.products.inventory_track_lots": "Track lots",
    "inventory.products.inventory_track_lots_expiration":
      "Track lots + expiration",
    "inventory.products.inventory_track_only": "Track inventory",
    "inventory.products.no_commercial_reference": "No commercial reference",
    "inventory.products.operational_behavior_description":
      "Inventory flags are only available for real products, not services.",
    "inventory.products.operational_behavior_title": "Operational behavior",
    "inventory.products.relations_description":
      "Link the product with categories, units, brand and tax behavior.",
    "inventory.products.relations_title": "Relations and references",
    "inventory.products.section_description":
      "Core product and service catalog already linked to brand, category, units, taxes and warranty.",
    "inventory.product_create_error_fallback": "Unable to create the product.",
    "inventory.product_update_error_fallback": "Unable to update the product.",
    "inventory.tax_profiles.dialog_description":
      "Define fiscal behavior for products and services using the current backend contract.",
    "inventory.tax_profiles.section_description":
      "Fiscal configuration for goods and services before products go live.",
    "inventory.tax_profile_create_error_fallback":
      "Unable to create the tax profile.",
    "inventory.tax_profile_update_error_fallback":
      "Unable to update the tax profile.",
    "inventory.warehouses.dialog_description":
      "Manage operational warehouses per branch within the active tenant.",
    "inventory.warehouses.section_description":
      "Branch warehouses with support for default behavior and internal locations.",
    "inventory.warehouse_create_error_fallback":
      "Unable to create the warehouse.",
    "inventory.warehouse_update_error_fallback":
      "Unable to update the warehouse.",
    "inventory.warehouse_locations.dialog_description":
      "Manage internal locations for warehouse {warehouse}.",
    "inventory.warehouse_locations.no_warehouses_with_locations":
      "No warehouses are currently configured to use locations.",
    "inventory.warehouse_locations.section_description":
      "Internal picking, receiving and dispatch locations inside each warehouse.",
    "inventory.warehouse_location_create_error_fallback":
      "Unable to create the warehouse location.",
    "inventory.warehouse_location_update_error_fallback":
      "Unable to update the warehouse location.",
    "inventory.warehouse_stock.section_description":
      "Materialized warehouse balances by warehouse, product and default variant.",
    "inventory.inventory_lots.dialog_description":
      "Manage inventory lots and their initial quantities using the current backend logic.",
    "inventory.inventory_lots.section_description":
      "Inventory lots linked to product, warehouse, optional location and supplier.",
    "inventory.inventory_lot_create_error_fallback":
      "Unable to create the inventory lot.",
    "inventory.inventory_lot_update_error_fallback":
      "Unable to update the inventory lot.",
    "inventory.inventory_movements.adjustment_dialog_description":
      "Register immediate ledger adjustments against operational inventory.",
    "inventory.inventory_movements.adjustment_in_hint":
      "Use inbound adjustment to increase the available balance.",
    "inventory.inventory_movements.adjustment_out_hint":
      "Use outbound adjustment to decrease the available balance.",
    "inventory.inventory_movements.cancel_action": "Cancel movement",
    "inventory.inventory_movements.cancel_description":
      "A compensating movement will be created to reverse {code}.",
    "inventory.inventory_movements.cancel_title": "Cancel posted movement",
    "inventory.inventory_movements.create_adjustment": "Register adjustment",
    "inventory.inventory_movements.create_transfer": "Register transfer",
    "inventory.inventory_movements.inventory_lot_required":
      "This product requires a lot before the adjustment can be posted.",
    "inventory.inventory_movements.new_adjustment": "New adjustment",
    "inventory.inventory_movements.new_transfer": "New transfer",
    "inventory.inventory_movements.section_description":
      "Operational inventory ledger with adjustments, transfers and compensating cancellations.",
    "inventory.inventory_movements.transfer_dialog_description":
      "Register an immediate transfer between warehouses using the current ledger header flow.",
    "inventory.inventory_adjustment_create_error_fallback":
      "Unable to register the inventory adjustment.",
    "inventory.inventory_transfer_create_error_fallback":
      "Unable to register the inventory transfer.",
    "inventory.inventory_movement_cancel_error_fallback":
      "Unable to cancel the inventory movement.",
    "inventory.variant_create_error_fallback":
      "Unable to create the variant.",
    "inventory.variant_update_error_fallback":
      "Unable to update the variant.",
    "inventory.variant_attributes_save_error_fallback":
      "Unable to save variant attributes.",
    "inventory.variant_generate_error_fallback":
      "Unable to generate variants.",
    "inventory.variants.dialog_description":
      "Configure variant details including SKU, barcode and tax profile.",
    "inventory.variants.section_title": "Variants",
    "inventory.variants.section_description":
      "Manage this product's variants with their individual attributes.",
    "inventory.variants.variant_count": "{count} variant(s)",
    "inventory.variants.no_variants":
      "This product has no configured variants.",
    "inventory.variants.attributes_title": "Variant attributes",
    "inventory.variants.attributes_description":
      "Define attributes like size, color, etc. to auto-generate variants.",
    "inventory.variants.define_attributes": "Define attributes",
    "inventory.variants.define_attributes_description":
      "Add attribute names and their possible values.",
    "inventory.variants.edit_attributes": "Edit attributes",
    "inventory.variants.attribute_name": "Attribute name",
    "inventory.variants.attribute_name_placeholder": "e.g. Color, Size, Material",
    "inventory.variants.attribute_values": "Values",
    "inventory.variants.add_value_placeholder": "Add value and press Enter",
    "inventory.variants.add_attribute": "Add attribute",
    "inventory.variants.save_attributes": "Save attributes",
    "inventory.variants.generate_variants": "Generate variants",
    "inventory.variants.generating": "Generating...",
    "inventory.variants.no_attributes_defined":
      "No variant attributes defined. Define attributes to auto-generate variants.",
    "inventory.form.variant_name": "Variant name",
    "inventory.form.variant_name_placeholder": "e.g. Black - 128GB",
    "inventory.form.track_serials": "Track serials",
    "inventory.warranty_profiles.dialog_description":
      "Configure reusable warranty policies for products with post-sale coverage.",
    "inventory.warranty_profiles.section_description":
      "Reusable warranty policies that products can reference when coverage applies.",
    "inventory.enum.adjustment_type.adjustment_in": "Inbound",
    "inventory.enum.adjustment_type.adjustment_out": "Outbound",
    "inventory.enum.inventory_movement_status.cancelled": "Cancelled",
    "inventory.enum.inventory_movement_status.draft": "Draft",
    "inventory.enum.inventory_movement_status.in_transit": "In transit",
    "inventory.enum.inventory_movement_status.partially_received": "Partially received",
    "inventory.enum.inventory_movement_status.posted": "Posted",
    "inventory.enum.inventory_movement_status.received": "Received",
    "inventory.enum.ledger_movement_type.manual_correction": "Manual correction",
    "inventory.enum.ledger_movement_type.purchase_expected": "Purchase expected",
    "inventory.enum.ledger_movement_type.purchase_receipt": "Purchase receipt",
    "inventory.enum.ledger_movement_type.release": "Release",
    "inventory.enum.ledger_movement_type.reservation": "Reservation",
    "inventory.enum.ledger_movement_type.return_in": "Return in",
    "inventory.enum.ledger_movement_type.return_out": "Return out",
    "inventory.enum.ledger_movement_type.sales_allocated": "Sales allocated",
    "inventory.enum.ledger_movement_type.sales_dispatch": "Sales dispatch",
    "inventory.enum.ledger_movement_type.stock_adjustment": "Stock adjustment",
    "inventory.enum.ledger_movement_type.transfer": "Transfer",
    "inventory.enum.product_type.product": "Product",
    "inventory.enum.product_type.service": "Service",
    "inventory.enum.price_list_kind.credit": "Credit",
    "inventory.enum.price_list_kind.retail": "Retail",
    "inventory.enum.price_list_kind.special": "Special",
    "inventory.enum.price_list_kind.wholesale": "Wholesale",
    "inventory.enum.promotion_type.buy_x_get_y": "Buy X get Y",
    "inventory.enum.promotion_type.fixed_amount": "Fixed amount",
    "inventory.enum.promotion_type.percentage": "Percentage",
    "inventory.enum.promotion_type.price_override": "Price override",
    "inventory.enum.tax_profile_item_kind.goods": "Goods",
    "inventory.enum.tax_profile_item_kind.service": "Service",
    "inventory.enum.tax_type.exento": "Exempt",
    "inventory.enum.tax_type.iva": "IVA",
    "inventory.enum.tax_type.no_sujeto": "Not subject",
    "inventory.enum.tax_type.specific_tax": "Specific tax",
    "inventory.enum.warehouse_purpose.damaged": "Damaged",
    "inventory.enum.warehouse_purpose.general_storage": "General storage",
    "inventory.enum.warehouse_purpose.production": "Production",
    "inventory.enum.warehouse_purpose.reserve": "Reserve",
    "inventory.enum.warehouse_purpose.returns": "Returns",
    "inventory.enum.warehouse_purpose.saleable": "Saleable",
    "inventory.enum.warehouse_purpose.transit": "Transit",
    "inventory.enum.warranty_duration_unit.days": "Days",
    "inventory.enum.warranty_duration_unit.months": "Months",
    "inventory.enum.warranty_duration_unit.years": "Years",
    "inventory.warranty_profile_create_error_fallback":
      "Unable to create the warranty profile.",
    "inventory.warranty_profile_update_error_fallback":
      "Unable to update the warranty profile.",
    "platform.clear_tenant_error_fallback":
      "Unable to leave the business context.",
    "platform.clear_tenant_success": "Tenant context cleared successfully.",
    "platform.enter_tenant_error_fallback":
      "Unable to enter the selected business.",
    "platform.enter_tenant_success": "Entered business context successfully.",
    "platform.business_onboarding_success": "Business onboarding completed successfully.",
    "platform.onboarding_error_fallback": "Unable to complete onboarding.",
    "roles.create_error_fallback": "Unable to create the role.",
    "roles.delete_error_fallback": "Unable to delete the role.",
    "roles.permissions_update_error_fallback":
      "Unable to update role permissions.",
    "roles.update_error_fallback": "Unable to update the role.",
    "users.branches_update_error_fallback":
      "Unable to update user branches.",
    "users.create_error_fallback": "Unable to create the user.",
    "users.password_update_error_fallback":
      "Unable to update the user password.",
    "users.password_updated_success": "Password updated successfully.",
    "users.roles_update_error_fallback": "Unable to update user roles.",
    "users.status_update_error_fallback": "Unable to update the user status.",
    "users.update_error_fallback": "Unable to update the user.",
  },
  es: esTranslations,
};
