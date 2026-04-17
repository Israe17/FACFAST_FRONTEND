import type { AppLanguage } from "./language";

const esTranslations = {
  "branches.create_error_fallback": "No fue posible crear la sucursal.",
  "branches.delete_error_fallback": "No fue posible eliminar la sucursal.",
  "branches.delete_forbidden":
    "No se puede eliminar la sucursal porque tiene dependencias operativas.",
  "branches.delete_forbidden_dependencies":
    "No se puede eliminar la sucursal porque todavia tiene dependencias: {dependencies}.",
  "branches.dependency.inventory_lots": "lotes de inventario",
  "branches.dependency.inventory_movement_headers": "movimientos encabezado",
  "branches.dependency.inventory_movements": "movimientos legacy",
  "branches.dependency.warehouse_branch_links": "enlaces sucursal-bodega",
  "branches.dependency.warehouse_locations": "ubicaciones de bodega",
  "branches.dependency.warehouse_stock": "stock por bodega",
  "branches.dependency.warehouses": "bodegas",
  "branches.form.active_branch": "Sucursal activa",
  "branches.form.active_branch_description": "Las sucursales inactivas se conservan para historial sin usarse operativamente.",
  "branches.form.activity_code": "Codigo de actividad economica",
  "branches.form.address": "Direccion",
  "branches.form.branch_name": "Nombre de sucursal",
  "branches.form.branch_number": "Numero de sucursal",
  "branches.form.business_name": "Nombre comercial",
  "branches.form.canton": "Canton",
  "branches.form.cedula_juridica": "Cedula juridica",
  "branches.form.cert_path": "Ruta del certificado",
  "branches.form.city": "Ciudad",
  "branches.form.code": "Codigo",
  "branches.form.configured": "Configurado",
  "branches.form.configuration_description": "Parametros de facturacion electronica y firma digital.",
  "branches.form.configuration_title": "Configuracion",
  "branches.form.crypto_key": "Clave criptografica",
  "branches.form.district": "Distrito",
  "branches.form.email": "Correo electronico",
  "branches.form.empty": "Vacio",
  "branches.form.hacienda_password": "Contrasena Hacienda",
  "branches.form.hacienda_username": "Usuario Hacienda",
  "branches.form.identification_number": "Numero de identificacion",
  "branches.form.identification_type": "Tipo de identificacion",
  "branches.form.identity_description": "Datos de identidad y estado operativo de la sucursal.",
  "branches.form.identity_title": "Identidad de sucursal",
  "branches.form.legal_name": "Razon social",
  "branches.form.location_description": "Datos geograficos y de contacto de la sucursal.",
  "branches.form.location_title": "Ubicacion y contacto",
  "branches.form.mail_key": "Clave de correo",
  "branches.form.phone": "Telefono",
  "branches.form.provider_code": "Codigo de proveedor",
  "branches.form.province": "Provincia",
  "branches.form.secret_flags_label": "Campos sensibles",
  "branches.form.select_type": "Selecciona un tipo",
  "branches.form.signature_type": "Tipo de firma",
  "branches.terminal_form.active_terminal": "Terminal activa",
  "branches.terminal_form.active_terminal_description": "Las terminales inactivas se conservan para historial.",
  "branches.terminal_form.code": "Codigo de terminal",
  "branches.terminal_form.name": "Nombre",
  "branches.terminal_form.number": "Numero de terminal",
  "branches.terminal_form.terminal_number": "Numero de terminal",
  "branches.terminal_create_error_fallback": "No fue posible crear la terminal.",
  "branches.terminal_delete_error_fallback": "No fue posible eliminar la terminal.",
  "branches.terminal_update_error_fallback": "No fue posible actualizar la terminal.",
  "branches.update_error_fallback": "No fue posible actualizar la sucursal.",
  "business.update_error_fallback": "No fue posible actualizar la configuracion de empresa.",
  "business.update_success": "Configuracion de empresa actualizada correctamente.",
  "common.branch_label": "Sucursal: {label}",
  "common.business_label": "Empresa: {label}",
  "common.cancel": "Cancelar",
  "common.cancel_success": "Cancelado exitosamente.",
  "common.confirm_success": "Confirmado exitosamente.",
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
  "contacts.delete_error_fallback": "No fue posible eliminar el contacto.",
  "contacts.delete_forbidden":
    "No se puede eliminar el contacto porque tiene historial operativo.",
  "contacts.delete_forbidden_dependencies":
    "No se puede eliminar el contacto porque todavia tiene dependencias: {dependencies}.",
  "contacts.dependency.inventory_lots": "lotes de inventario",
  "contacts.dependency.serial_events": "eventos de serial",
  "contacts.create_error_fallback": "No fue posible crear el contacto.",
  "contacts.branch_assignment_create_error_fallback":
    "No fue posible crear el contexto comercial por sucursal del contacto.",
  "contacts.branch_assignment_update_error_fallback":
    "No fue posible actualizar el contexto comercial por sucursal del contacto.",
  "contacts.branch_assignment_delete_error_fallback":
    "No fue posible eliminar el contexto comercial por sucursal del contacto.",
  "contacts.lookup_empty_input": "Ingresa una identificacion para buscar.",
  "contacts.lookup_error_fallback": "No fue posible ejecutar la busqueda del contacto.",
  "contacts.branch_assignments.account_manager": "Account manager",
  "contacts.branch_assignments.actions": "Acciones",
  "contacts.branch_assignments.active": "Activa",
  "contacts.branch_assignments.active_description": "Mantiene esta asignacion habilitada para la sucursal.",
  "contacts.branch_assignments.add_branch_context": "Agregar contexto de sucursal",
  "contacts.branch_assignments.add_title": "Agregar contexto comercial",
  "contacts.branch_assignments.applies_to_all": "Aplica a todas las sucursales",
  "contacts.branch_assignments.assignment_count": "{count} asignacion(es)",
  "contacts.branch_assignments.branch": "Sucursal",
  "contacts.branch_assignments.branch_access_required": "Se requiere permiso branches.view para ver sucursales.",
  "contacts.branch_assignments.commercial_defaults": "Valores comerciales",
  "contacts.branch_assignments.commercial_flags": "Flags comerciales",
  "contacts.branch_assignments.confirm_deactivate_description": "La asignacion quedara inactiva para esta sucursal.",
  "contacts.branch_assignments.confirm_deactivate_title": "Desactivar asignacion",
  "contacts.branch_assignments.confirm_delete_description": "La asignacion sera eliminada permanentemente.",
  "contacts.branch_assignments.confirm_delete_title": "Eliminar asignacion",
  "contacts.branch_assignments.confirm_reactivate_description": "La asignacion volvera a estar activa para esta sucursal.",
  "contacts.branch_assignments.confirm_reactivate_title": "Reactivar asignacion",
  "contacts.branch_assignments.create_assignment": "Crear asignacion",
  "contacts.branch_assignments.create_error": "No fue posible crear la asignacion.",
  "contacts.branch_assignments.credit": "Credito",
  "contacts.branch_assignments.credit_enabled": "Credito habilitado",
  "contacts.branch_assignments.credit_enabled_description": "Permite operaciones a credito para este contacto en la sucursal.",
  "contacts.branch_assignments.credit_limit_label": "Limite de credito",
  "contacts.branch_assignments.custom_credit_limit": "Limite de credito personalizado",
  "contacts.branch_assignments.custom_price_list": "Lista de precios personalizada",
  "contacts.branch_assignments.deactivate": "Desactivar",
  "contacts.branch_assignments.default": "Por defecto",
  "contacts.branch_assignments.default_description": "Marca esta asignacion como preferida para la sucursal.",
  "contacts.branch_assignments.delete_assignment": "Eliminar asignacion",
  "contacts.branch_assignments.dialog_description": "Gestiona el contexto comercial del contacto por sucursal.",
  "contacts.branch_assignments.dialog_title": "Contexto por sucursal",
  "contacts.branch_assignments.edit_assignment": "Editar asignacion",
  "contacts.branch_assignments.edit_title": "Editar contexto comercial",
  "contacts.branch_assignments.editor_description": "Configura el alcance comercial del contacto para esta sucursal.",
  "contacts.branch_assignments.empty": "Este contacto no tiene asignaciones de sucursal configuradas.",
  "contacts.branch_assignments.empty_scoped": "No hay asignaciones visibles para la sucursal activa.",
  "contacts.branch_assignments.exclusive": "Exclusivo",
  "contacts.branch_assignments.exclusive_description": "Restringe el contacto a operar solo en esta sucursal.",
  "contacts.branch_assignments.has_branch_context": "Tiene contexto de sucursal",
  "contacts.branch_assignments.inactive": "Inactiva",
  "contacts.branch_assignments.load_error": "No fue posible cargar las asignaciones del contacto.",
  "contacts.branch_assignments.loading": "Cargando asignaciones de sucursal.",
  "contacts.branch_assignments.manager_label": "Responsable comercial",
  "contacts.branch_assignments.mode_global": "Global",
  "contacts.branch_assignments.mode_label": "Modo",
  "contacts.branch_assignments.mode_scoped": "Por sucursal",
  "contacts.branch_assignments.no_account_manager": "Sin responsable",
  "contacts.branch_assignments.no_branch_context": "Sin contexto de sucursal",
  "contacts.branch_assignments.no_code": "Sin codigo",
  "contacts.branch_assignments.no_custom_price_list": "Sin lista personalizada",
  "contacts.branch_assignments.no_notes": "Sin notas",
  "contacts.branch_assignments.no_permission": "No tienes permiso para gestionar asignaciones de sucursal.",
  "contacts.branch_assignments.not_available": "N/D",
  "contacts.branch_assignments.notes": "Notas",
  "contacts.branch_assignments.preferred": "Preferido",
  "contacts.branch_assignments.preferred_description": "Marca esta asignacion como preferida al operar con el contacto.",
  "contacts.branch_assignments.price_list_label": "Lista de precios",
  "contacts.branch_assignments.purchases": "Compras",
  "contacts.branch_assignments.purchases_enabled": "Compras habilitadas",
  "contacts.branch_assignments.purchases_enabled_description": "Permite usar este contacto como proveedor en la sucursal.",
  "contacts.branch_assignments.reactivate": "Reactivar",
  "contacts.branch_assignments.sales": "Ventas",
  "contacts.branch_assignments.sales_enabled": "Ventas habilitadas",
  "contacts.branch_assignments.sales_enabled_description": "Permite usar este contacto como cliente en la sucursal.",
  "contacts.branch_assignments.save_changes": "Guardar cambios",
  "contacts.branch_assignments.scoped_no_visible": "No hay asignaciones visibles para la sucursal activa.",
  "contacts.branch_assignments.select_branch": "Selecciona una sucursal",
  "contacts.branch_assignments.status": "Estado",
  "contacts.branch_assignments.unknown_branch": "Sucursal desconocida",
  "contacts.branch_assignments.update_error": "No fue posible actualizar la asignacion.",
  "contacts.form.active_contact": "Contacto activo",
  "contacts.form.active_contact_description": "Los registros inactivos se mantienen para historial sin usarse operativamente.",
  "contacts.form.address": "Direccion",
  "contacts.form.address_placeholder": "Direccion exacta y referencias",
  "contacts.form.canton": "Canton",
  "contacts.form.code": "Codigo",
  "contacts.form.commercial_name": "Nombre comercial",
  "contacts.form.commercial_name_placeholder": "Nombre de fantasia",
  "contacts.form.district": "Distrito",
  "contacts.form.document_number": "Numero de documento",
  "contacts.form.economic_activity_code": "Codigo de actividad economica",
  "contacts.form.email": "Correo electronico",
  "contacts.form.exoneration_description": "Campos opcionales para condiciones tributarias especiales.",
  "contacts.form.exoneration_percentage": "Porcentaje de exoneracion",
  "contacts.form.exoneration_title": "Exoneracion",
  "contacts.form.exoneration_type": "Tipo de exoneracion",
  "contacts.form.general_description": "Identidad principal y estado operativo del contacto.",
  "contacts.form.general_title": "Informacion general",
  "contacts.form.identification_description": "Identificadores fiscales y datos tributarios.",
  "contacts.form.identification_number": "Numero de identificacion",
  "contacts.form.identification_title": "Identificacion y tributo",
  "contacts.form.identification_type": "Tipo de identificacion",
  "contacts.form.institution": "Institucion",
  "contacts.form.issue_date": "Fecha de emision",
  "contacts.form.location_description": "Canales de comunicacion y datos geograficos.",
  "contacts.form.location_title": "Contacto y ubicacion",
  "contacts.form.name": "Nombre",
  "contacts.form.name_placeholder": "Nombre legal o personal",
  "contacts.form.phone": "Telefono",
  "contacts.form.province": "Provincia",
  "contacts.form.select_identification_type": "Selecciona un tipo de identificacion",
  "contacts.form.select_type": "Selecciona un tipo",
  "contacts.form.tax_condition": "Condicion tributaria",
  "contacts.form.type": "Tipo",
  "contacts.update_error_fallback": "No fue posible actualizar el contacto.",
  "contacts.eyebrow": "Contacto",
  "contacts.detail.back_to_list": "Volver a contactos",
  "contacts.detail.loading": "Cargando contacto...",
  "contacts.detail.not_found_title": "Contacto no encontrado",
  "contacts.detail.not_found_description": "No se encontro el contacto solicitado.",
  "contacts.detail.address_title": "Direccion",
  "contacts.detail.address_description": "Ubicacion de entrega del contacto.",
  "contacts.detail.no_address": "Sin direccion registrada.",
  "contacts.detail.map_title": "Ubicacion en mapa",
  "contacts.detail.map_description": "Coordenadas de entrega.",
  "contacts.detail.no_location": "Sin ubicacion configurada",
  "contacts.detail.no_location_hint": "Edita el contacto para agregar coordenadas.",
  "contacts.detail.exoneration_title": "Exoneracion fiscal",
  "contacts.detail.exoneration_description": "Informacion de exoneracion tributaria.",
  "contacts.detail.metadata_title": "Registro",
  "contacts.detail.metadata_description": "Fechas y datos del registro.",
  "contacts.detail.email_description": "Email de contacto",
  "contacts.detail.phone_description": "Numero de contacto",
  "contacts.field.identification": "Identificacion",
  "contacts.field.email": "Correo",
  "contacts.field.phone": "Telefono",
  "contacts.field.economic_activity": "Actividad economica",
  "contacts.field.address": "Direccion",
  "contacts.field.province": "Provincia",
  "contacts.field.canton": "Canton",
  "contacts.field.district": "Distrito",
  "contacts.field.exoneration_type": "Tipo de exoneracion",
  "contacts.field.exoneration_document": "Numero de documento",
  "contacts.field.exoneration_institution": "Institucion",
  "contacts.field.exoneration_date": "Fecha de emision",
  "contacts.field.exoneration_percentage": "Porcentaje",
  "contacts.field.latitude": "Latitud",
  "contacts.field.longitude": "Longitud",
  "contacts.detail.access_denied_title": "Acceso denegado",
  "contacts.detail.access_denied_description": "No tienes permiso para ver contactos.",
  "contacts.detail.active": "Activo",
  "contacts.detail.inactive": "Inactivo",
  "contacts.detail.not_available": "N/D",
  "contacts.detail.created_at": "Creado",
  "contacts.detail.updated_at": "Actualizado",
  "error.BRANCH_ACCESS_FORBIDDEN": "No tienes acceso a esta sucursal.",
  "error.BRANCH_CONFIGURATION_PERMISSION_REQUIRED":
    "No tienes permiso para editar la configuracion sensible de la sucursal.",
  "error.BRANCH_DELETE_FORBIDDEN":
    "No se puede eliminar la sucursal porque tiene dependencias operativas.",
  "error.BRANCH_MANAGE_SCOPE_FORBIDDEN":
    "No tienes alcance para administrar esta sucursal.",
  "error.BRANCH_NOT_FOUND": "Sucursal no encontrada.",
  "error.CONTACT_CODE_DUPLICATE": "Ya existe un contacto con ese codigo.",
  "error.CONTACT_DELETE_FORBIDDEN":
    "No se puede eliminar el contacto porque tiene historial operativo.",
  "error.CONTACT_IDENTIFICATION_DUPLICATE":
    "Ya existe un contacto con esa identificacion.",
  "error.CONTACT_BRANCH_ASSIGNMENT_NOT_FOUND":
    "No se encontro la asignacion comercial de sucursal para este contacto.",
  "error.CONTACT_BRANCH_ASSIGNMENT_DUPLICATE":
    "Ya existe una asignacion comercial para este contacto en esa sucursal.",
  "error.CONTACT_BRANCH_EXCLUSIVE_CONFLICT":
    "Este contacto ya tiene una asignacion exclusiva activa en otra sucursal.",
  "error.CONTACT_ACCOUNT_MANAGER_BRANCH_SCOPE_INVALID":
    "El account manager seleccionado no tiene acceso a la sucursal indicada.",
  "error.CONTACT_LOOKUP_MULTIPLE":
    "La busqueda devolvio multiples contactos para esa identificacion.",
  "error.CONTACT_NOT_FOUND": "Contacto no encontrado.",
  "error.TERMINAL_NOT_FOUND": "Terminal no encontrada.",
  "error.USER_CROSS_BUSINESS_MANAGEMENT_FORBIDDEN":
    "No puedes administrar usuarios fuera de tu negocio activo.",
  "error.USER_DELETE_FORBIDDEN":
    "No se puede eliminar el usuario porque tiene historial operativo o dependencias activas.",
  "error.USER_EMAIL_DUPLICATE": "Ya existe un usuario con ese correo.",
  "error.USER_INVALID_BRANCHES_FOR_BUSINESS":
    "Hay sucursales asignadas que no pertenecen al negocio actual.",
  "error.USER_INVALID_ROLES_FOR_BUSINESS":
    "Hay roles asignados que no pertenecen al negocio actual.",
  "error.USER_LAST_OWNER_DELETE_FORBIDDEN":
    "No se puede eliminar el ultimo owner del negocio.",
  "error.USER_NOT_FOUND": "Usuario no encontrado.",
  "error.USER_OWNER_ASSIGNMENT_FORBIDDEN":
    "No tienes permiso para asignar ownership en este contexto.",
  "error.USER_OWNER_MANAGEMENT_FORBIDDEN":
    "No tienes permiso para administrar usuarios owner.",
  "error.USER_PLATFORM_ADMIN_DELETE_FORBIDDEN":
    "No se puede eliminar un usuario platform admin.",
  "error.USER_SELF_DELETE_FORBIDDEN": "No puedes eliminar tu propio usuario.",
  "error.USER_SYSTEM_MANAGEMENT_FORBIDDEN":
    "No tienes permiso para administrar usuarios del sistema.",
  "inventory.brand_create_error_fallback": "No fue posible crear la marca.",
  "inventory.brand_update_error_fallback": "No fue posible actualizar la marca.",
  "inventory.zone_create_error_fallback": "No fue posible crear la zona.",
  "inventory.zone_update_error_fallback": "No fue posible actualizar la zona.",
  "inventory.vehicle_create_error_fallback": "No fue posible crear el vehiculo.",
  "inventory.vehicle_update_error_fallback": "No fue posible actualizar el vehiculo.",
  "inventory.route_create_error_fallback": "No fue posible crear la ruta.",
  "inventory.route_update_error_fallback": "No fue posible actualizar la ruta.",
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
  "inventory.common.deactivate": "Desactivar",
  "inventory.common.reactivate": "Reactivar",
  "inventory.common.delete": "Eliminar",
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
  "inventory.entity.product_serial": "serial",
  "inventory.entity.product_serials": "seriales",
  "inventory.entity.warranty_profile": "perfil de garantia",
  "inventory.entity.warranty_profiles": "perfiles de garantia",
  "inventory.entity.zone": "zona",
  "inventory.entity.zones": "zonas",
  "inventory.entity.vehicle": "vehiculo",
  "inventory.entity.vehicles": "vehiculos",
  "inventory.entity.route": "ruta",
  "inventory.entity.routes": "rutas",
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
  "inventory.form.plate_number": "Placa",
  "inventory.form.vehicle_type": "Tipo de vehiculo",
  "inventory.form.max_weight_kg": "Peso maximo (kg)",
  "inventory.form.max_volume_m3": "Volumen maximo (m3)",
  "inventory.form.estimated_cost": "Costo estimado",
  "inventory.form.frequency": "Frecuencia",
  "inventory.form.day_of_week": "Dia de semana",
  "inventory.form.default_vehicle": "Vehiculo por defecto",
  "inventory.form.default_driver": "Chofer por defecto",
  "inventory.form.select_zone": "Seleccionar zona",
  "inventory.form.no_zone": "Sin zona",
  "inventory.form.select_vehicle": "Seleccionar vehiculo",
  "inventory.form.no_vehicle": "Sin vehiculo",
  "inventory.form.active_zone": "Zona activa",
  "inventory.zones.detail.access_denied_title": "Acceso denegado",
  "inventory.zones.detail.access_denied_description": "No tienes permiso para ver zonas.",
  "inventory.zones.detail.loading": "Cargando zona...",
  "inventory.zones.detail.not_found_title": "Zona no encontrada",
  "inventory.zones.detail.not_found_description": "No se encontro la zona solicitada.",
  "inventory.zones.detail.back_to_list": "Volver a zonas",
  "inventory.zones.detail.global": "Global",
  "inventory.zones.detail.scoped": "Por sucursal",
  "inventory.zones.detail.province": "Provincia",
  "inventory.zones.detail.canton": "Canton",
  "inventory.zones.detail.district": "Distrito",
  "inventory.zones.detail.branches_count": "Sucursales",
  "inventory.zones.detail.branches_assigned": "Sucursales asignadas a esta zona.",
  "inventory.zones.detail.summary_title": "Resumen",
  "inventory.zones.detail.summary_description": "Informacion principal de la zona.",
  "inventory.zones.detail.scope": "Alcance",
  "inventory.zones.detail.map_title": "Ubicacion en mapa",
  "inventory.zones.detail.map_description": "Limite geografico de la zona.",
  "inventory.zones.detail.no_location": "Sin ubicacion configurada",
  "inventory.zones.detail.no_location_hint": "Edita la zona para delimitar en el mapa.",
  "inventory.zones.detail.branches_title": "Sucursales asignadas",
  "inventory.zones.detail.branches_description": "Sucursales que operan con esta zona.",
  "inventory.zones.detail.no_branches": "Sin sucursales asignadas.",
  "inventory.form.active_zone_description": "Las zonas inactivas se conservan para historial sin usarse operativamente.",
  "inventory.form.active_vehicle": "Vehiculo activo",
  "inventory.form.active_vehicle_description": "Los vehiculos inactivos se conservan para historial sin usarse operativamente.",
  "inventory.form.active_route": "Ruta activa",
  "inventory.form.active_route_description": "Las rutas inactivas se conservan para historial sin usarse operativamente.",
  "inventory.form.province": "Provincia",
  "inventory.form.canton": "Canton",
  "inventory.form.district": "Distrito",
  "inventory.brands.delete_title": "Eliminar marca",
  "inventory.brands.delete_description":
    "La marca \"{name}\" sera eliminada permanentemente. Solo es posible si ningun producto la usa actualmente.",
  "inventory.brands.dialog_description":
    "Mantiene el catalogo de marcas usando el contrato actual de inventario del backend.",
  "inventory.brands.section_description":
    "Catalogo comercial de marcas que luego usan productos y precios.",
  "inventory.zones.province": "Provincia",
  "inventory.zones.canton": "Canton",
  "inventory.zones.district": "Distrito",
  "inventory.zones.location": "Ubicacion",
  "inventory.vehicles.plate_number": "Placa",
  "inventory.vehicles.vehicle_type": "Tipo de vehiculo",
  "inventory.vehicles.max_weight_kg": "Peso maximo (kg)",
  "inventory.vehicles.max_volume_m3": "Volumen maximo (m3)",
  "inventory.vehicles.capacity": "Capacidad",
  "inventory.vehicles.notes": "Notas",
  "inventory.vehicles.notes_placeholder": "Notas adicionales sobre el vehiculo",
  "inventory.vehicles.name_placeholder": "Nombre del vehiculo",
  "inventory.vehicles.select_vehicle_type": "Selecciona un tipo",
  "inventory.vehicles.type_truck": "Camion",
  "inventory.vehicles.type_van": "Furgoneta",
  "inventory.vehicles.type_pickup": "Pickup",
  "inventory.vehicles.type_motorcycle": "Motocicleta",
  "inventory.vehicles.type_bicycle": "Bicicleta",
  "inventory.vehicles.type_car": "Automovil",
  "inventory.vehicles.type_other": "Otro",
  "inventory.routes.zone": "Zona",
  "inventory.routes.select_zone": "Seleccionar zona",
  "inventory.routes.no_zone": "Sin zona",
  "inventory.routes.default_vehicle": "Vehiculo por defecto",
  "inventory.routes.select_vehicle": "Seleccionar vehiculo",
  "inventory.routes.no_vehicle": "Sin vehiculo",
  "inventory.routes.default_driver_user_id": "ID chofer por defecto",
  "inventory.routes.estimated_cost": "Costo estimado",
  "inventory.routes.frequency": "Frecuencia",
  "inventory.routes.day_of_week": "Dia de semana",
  "inventory.zones.delete_title": "Eliminar zona",
  "inventory.zones.delete_description":
    "La zona \"{name}\" sera eliminada permanentemente.",
  "inventory.zones.dialog_description":
    "Administra las zonas geograficas de entrega y cobertura logistica.",
  "inventory.zones.section_description":
    "Zonas geograficas usadas por rutas y despachos.",
  "inventory.vehicles.delete_title": "Eliminar vehiculo",
  "inventory.vehicles.delete_description":
    "El vehiculo \"{name}\" sera eliminado permanentemente.",
  "inventory.vehicles.dialog_description":
    "Administra los vehiculos disponibles para despachos y logistica.",
  "inventory.vehicles.section_description":
    "Flota de vehiculos usados en rutas y despachos.",
  "inventory.routes.delete_title": "Eliminar ruta",
  "inventory.routes.delete_description":
    "La ruta \"{name}\" sera eliminada permanentemente.",
  "inventory.routes.dialog_description":
    "Administra las rutas de entrega y su configuracion logistica.",
  "inventory.routes.section_description":
    "Rutas de entrega con zona, vehiculo y chofer por defecto.",
  "inventory.categories.delete_title": "Eliminar categoria",
  "inventory.categories.delete_description":
    "La categoria \"{name}\" sera eliminada permanentemente. Solo es posible si no tiene subcategorias ni productos asignados.",
  "inventory.categories.dialog_description":
    "Mantiene la jerarquia de categorias de producto usada por inventario.",
  "inventory.categories.section_description":
    "Clasificacion jerarquica para productos y futura analitica de inventario.",
  "inventory.measurement_units.delete_title": "Eliminar unidad de medida",
  "inventory.measurement_units.delete_description":
    "La unidad \"{name}\" sera eliminada permanentemente. Solo es posible si ningun producto o variante la usa.",
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
  "inventory.detail.map_title": "Ubicacion en mapa",
  "inventory.detail.map_description": "Ubicacion geografica.",
  "inventory.detail.no_location": "Sin ubicacion configurada",
  "inventory.detail.no_location_hint": "Edita el registro para agregar coordenadas en el mapa.",
  "inventory.dispatch.legend": "Leyenda",
  "inventory.dispatch.legend_pending": "Pendiente",
  "inventory.dispatch.legend_in_transit": "En transito",
  "inventory.dispatch.legend_delivered": "Entregado",
  "inventory.dispatch.legend_failed": "Fallido",
  "inventory.dispatch.legend_skipped": "Omitido",
  "inventory.dispatch.legend_warehouse": "Bodega origen",
  "inventory.dispatch.legend_zone": "Zona (area)",
  "inventory.dispatch.stops_label": "parada(s)",
  "inventory.dispatch.stops_no_location": "sin ubicacion",
  "inventory.dispatch.warehouse_no_location": "bodega sin ubicacion",
  "inventory.dispatch.no_origin_warehouse": "sin bodega asignada",
  "inventory.dispatch.no_locations": "Sin ubicaciones en el mapa",
  "inventory.dispatch.no_locations_hint": "Las paradas apareceran aqui cuando tengan coordenadas",
  "inventory.dispatch.command_center": "Centro de Mando",
  "inventory.dispatch.pending_orders": "Pendientes",
  "inventory.dispatch.pending_count": "{{count}} pendiente(s)",
  "inventory.dispatch.dispatches_today": "Despachos del dia",
  "inventory.dispatch.in_route": "En ruta",
  "inventory.dispatch.completed": "Completados",
  "inventory.dispatch.no_dispatch_orders": "No hay despachos",
  "inventory.dispatch.all_statuses": "Todos los estados",
  "inventory.dispatch.edit": "Editar",
  "inventory.dispatch.no_pending_orders": "No hay ordenes pendientes de despacho",
  "inventory.dispatch.select_dispatch": "Selecciona un despacho para ver detalle",
  "inventory.dispatch.assign_to": "Asignar a...",
  "inventory.dispatch.create_dispatch_with_selected": "Crear despacho con seleccionadas",
  "inventory.dispatch.assign_selected": "Asignar {{count}} seleccionada(s)",
  "inventory.dispatch.to_existing_dispatch": "A despacho existente...",
  "inventory.dispatch.to_new_dispatch": "Crear nuevo despacho",
  "inventory.dispatch.stops_count": "{{count}} stop(s)",
  "inventory.dispatch.no_vehicle": "Sin vehiculo",
  "inventory.dispatch.no_driver": "Sin chofer",
  "inventory.dispatch.today_badge": "Hoy",
  "inventory.dispatch.overdue_badge": "Atrasada",
  "inventory.dispatch.groupable_badge": "Agrupable",
  "inventory.dispatch.reorder_stops": "Arrastrar para reordenar",
  "inventory.dispatch.add_stop": "Agregar stop",
  "inventory.dispatch.suggestion_group_zone": "Ordenes agrupables por zona",
  "inventory.dispatch.suggestion_group_detail": "{{count}} ordenes en zona {{zone}} pueden agruparse en un despacho",
  "inventory.dispatch.suggestion_select": "Seleccionar {{count}} ordenes",
  "inventory.dispatch.view_full_detail": "Ver detalle completo",
  "inventory.dispatch.dispatch_detail": "Detalle del despacho",
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
  "inventory.detail.price_list_public_contract_note":
    "La ruta oficial sigue publicando precios por producto. Si una fila trae variante, interpretala como refinamiento opcional dentro del mismo contrato publico.",
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
  "inventory.price_lists.delete_title": "Eliminar lista de precios",
  "inventory.price_lists.delete_description":
    "La lista \"{name}\" y todos sus precios asociados seran eliminados permanentemente. Esta accion no se puede deshacer.",
  "inventory.price_lists.dialog_description":
    "Define politicas comerciales de listas antes de asignar precios a productos.",
  "inventory.price_lists.section_description":
    "Politicas comerciales de listas que despues usan precios y promociones.",
  "inventory.product_prices.delete_title": "Eliminar precio",
  "inventory.product_prices.delete_description":
    "El precio seleccionado sera eliminado permanentemente.",
  "inventory.product_prices.dialog_description":
    "Administra precios del producto {product} sobre las listas vigentes.",
  "inventory.product_prices.no_product_selected":
    "Selecciona un producto para consultar o registrar precios.",
  "inventory.product_prices.no_products_available":
    "No hay productos disponibles para asociar precios.",
  "inventory.product_prices.section_description":
    "Precios del producto por lista, cantidad minima y rango de vigencia. La variante solo refina la fila cuando el backend la devuelve.",
  "inventory.product_prices.public_contract_note":
    "El contrato publico de precios sigue siendo product-level. La variante es opcional y solo refina una fila especifica cuando aplica.",
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
  "inventory.price_list_branch_assignment_create_error_fallback":
    "No fue posible crear la asignacion por sucursal de la lista de precios.",
  "inventory.price_list_branch_assignment_update_error_fallback":
    "No fue posible actualizar la asignacion por sucursal de la lista de precios.",
  "inventory.price_list_branch_assignment_delete_error_fallback":
    "No fue posible eliminar la asignacion por sucursal de la lista de precios.",
  "inventory.price_list_branch_assignments.section_title": "Sucursales",
  "inventory.price_list_branch_assignments.section_description":
    "Define en que sucursales esta habilitada esta lista global y cual queda como predeterminada.",
  "inventory.price_list_branch_assignments.active_hint":
    "Mantiene esta lista habilitada para la sucursal seleccionada.",
  "inventory.price_list_branch_assignments.default_hint":
    "El backend normaliza la lista predeterminada por sucursal.",
  "inventory.price_list_branch_assignments.create_title":
    "Agregar asignacion por sucursal",
  "inventory.price_list_branch_assignments.edit_title":
    "Editar asignacion por sucursal",
  "inventory.price_list_branch_assignments.dialog_description":
    "Habilita esta lista global en una sucursal y, si aplica, marquela como predeterminada para esa sucursal.",
  "inventory.price_list_branch_assignments.create_action":
    "Agregar asignacion",
  "inventory.price_list_branch_assignments.load_error":
    "No fue posible cargar las asignaciones por sucursal de esta lista de precios.",
  "inventory.price_list_branch_assignments.loading":
    "Cargando asignaciones por sucursal.",
  "inventory.price_list_branch_assignments.count": "{count} asignacion(es)",
  "inventory.price_list_branch_assignments.default_count":
    "{count} sucursal(es) predeterminada(s)",
  "inventory.price_list_branch_assignments.branch_access_hint":
    "Las opciones de sucursal requieren `branches.view` en la sesion actual.",
  "inventory.price_list_branch_assignments.empty":
    "Esta lista de precios sigue siendo global y todavia no tiene asignaciones explicitas por sucursal.",
  "inventory.price_list_branch_assignments.delete_title":
    "Eliminar asignacion por sucursal",
  "inventory.price_list_branch_assignments.delete_description":
    "Esto eliminara permanentemente la asignacion para {branch}.",
  "inventory.price_list_branch_assignments.reactivate_title":
    "Reactivar asignacion por sucursal",
  "inventory.price_list_branch_assignments.reactivate_description":
    "La asignacion por sucursal volvera a estar activa para {branch}.",
  "inventory.price_list_branch_assignments.deactivate_title":
    "Desactivar asignacion por sucursal",
  "inventory.price_list_branch_assignments.deactivate_description":
    "La asignacion por sucursal quedara inactiva para {branch}.",
  "inventory.promotion_create_error_fallback":
    "No fue posible crear la promocion.",
  "inventory.promotion_update_error_fallback":
    "No fue posible actualizar la promocion.",
  "inventory.promotion_branch_assignment_create_error_fallback":
    "No fue posible crear la asignacion por sucursal de la promocion.",
  "inventory.promotion_branch_assignment_update_error_fallback":
    "No fue posible actualizar la asignacion por sucursal de la promocion.",
  "inventory.promotion_branch_assignment_delete_error_fallback":
    "No fue posible eliminar la asignacion por sucursal de la promocion.",
  "inventory.promotion_branch_assignments.manage_action": "Sucursales",
  "inventory.promotion_branch_assignments.section_title": "Sucursales",
  "inventory.promotion_branch_assignments.section_description":
    "Define en que sucursales aplica la promocion global {promotion}. Esta capa solo controla alcance por sucursal; no resuelve el motor comercial final.",
  "inventory.promotion_branch_assignments.permission_hint":
    "No tienes permiso para revisar las asignaciones por sucursal de esta promocion.",
  "inventory.promotion_branch_assignments.create_title":
    "Agregar asignacion por sucursal",
  "inventory.promotion_branch_assignments.edit_title":
    "Editar asignacion por sucursal",
  "inventory.promotion_branch_assignments.dialog_description":
    "Activa o desactiva la aplicabilidad de esta promocion en una sucursal especifica.",
  "inventory.promotion_branch_assignments.create_action": "Agregar asignacion",
  "inventory.promotion_branch_assignments.load_error":
    "No fue posible cargar las asignaciones por sucursal de esta promocion.",
  "inventory.promotion_branch_assignments.loading":
    "Cargando asignaciones por sucursal.",
  "inventory.promotion_branch_assignments.count": "{count} asignacion(es)",
  "inventory.promotion_branch_assignments.active_hint":
    "Mantiene esta promocion disponible para la sucursal seleccionada.",
  "inventory.promotion_branch_assignments.branch_access_hint":
    "Las opciones de sucursal requieren `branches.view` en la sesion actual.",
  "inventory.promotion_branch_assignments.empty":
    "Esta promocion todavia no tiene asignaciones explicitas por sucursal.",
  "inventory.promotion_branch_assignments.delete_title":
    "Eliminar asignacion por sucursal",
  "inventory.promotion_branch_assignments.delete_description":
    "Esto eliminara permanentemente la asignacion de la promocion para {branch}.",
  "inventory.promotion_branch_assignments.reactivate_title":
    "Reactivar asignacion por sucursal",
  "inventory.promotion_branch_assignments.reactivate_description":
    "La asignacion por sucursal volvera a estar activa para {branch}.",
  "inventory.promotion_branch_assignments.deactivate_title":
    "Desactivar asignacion por sucursal",
  "inventory.promotion_branch_assignments.deactivate_description":
    "La asignacion por sucursal quedara inactiva para {branch}.",
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
  "inventory.promotions.delete_title": "Eliminar promocion",
  "inventory.promotions.delete_description":
    "La promocion \"{name}\" y todos sus items seran eliminados permanentemente.",
  "inventory.promotions.section_description":
    "Campanas promocionales con reglas por producto y vigencia temporal.",
  "inventory.products.deactivate_title": "Desactivar producto",
  "inventory.products.deactivate_description":
    "El producto \"{name}\" sera desactivado. No estara disponible para nuevas operaciones de inventario. Los datos historicos no seran afectados.",
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
  "inventory.warehouses.deactivate_title": "Desactivar bodega",
  "inventory.warehouses.deactivate_description":
    "La bodega \"{name}\" sera desactivada. No estara disponible para nuevas operaciones de inventario. Los datos historicos no seran afectados.",
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
  "inventory.inventory_lots.deactivate_title": "Desactivar lote",
  "inventory.inventory_lots.deactivate_description":
    "El lote \"{lot_number}\" sera desactivado. No estara disponible para nuevas operaciones. Los datos historicos no seran afectados.",
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
  "inventory.inventory_movements.managed_badge": "Auto",
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
  "inventory.movement_managed_by_document":
    "Este movimiento es gestionado automáticamente. Para revertirlo, cancela la orden de venta o despacho asociada.",
  "inventory.dispatch_order_has_delivered_stops":
    "No se puede cancelar un despacho que tiene paradas entregadas.",
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
  "inventory.variant_deactivate_error_fallback":
    "No fue posible desactivar la variante.",
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
  "inventory.variants.deactivate": "Desactivar",
  "inventory.variants.deactivate_title": "Desactivar variante",
  "inventory.variants.deactivate_description":
    "La variante \"{name}\" sera desactivada. No podra usarse en nuevas operaciones de inventario. Esta accion no elimina datos historicos.",
  "inventory.variants.deactivate_confirm": "Desactivar",
  "inventory.variants.delete_title": "Eliminar variante permanentemente",
  "inventory.variants.delete_description":
    "La variante \"{name}\" sera eliminada permanentemente. Usa esta accion solo cuando lifecycle lo permita.",
  "inventory.variants.delete_confirm": "Eliminar permanentemente",
  "inventory.variants.generate_confirm_title": "Generar variantes",
  "inventory.variants.generate_confirm_description":
    "Se crearan las nuevas combinaciones de atributos que aun no existan como variantes. Las variantes existentes no seran modificadas ni eliminadas.",
  "inventory.variants.generate_confirm_action": "Generar nuevas combinaciones",
  "inventory.variants.tracking": "Rastreo",
  "inventory.variants.flag_inventory": "Inventario",
  "inventory.variants.flag_lots": "Lotes",
  "inventory.variants.flag_serials": "Series",
  "inventory.form.variant_name": "Nombre de la variante",
  "inventory.form.variant_name_placeholder": "ej. Negro - 128GB",
  "inventory.form.track_serials": "Rastrear series",
  "inventory.warranty_profiles.dialog_description":
    "Configura politicas reutilizables de garantia para productos con cobertura postventa.",
  "inventory.warranty_profiles.delete_title": "Eliminar perfil de garantia",
  "inventory.warranty_profiles.delete_description":
    "El perfil \"{name}\" sera eliminado permanentemente. Solo es posible si ningun producto o variante lo referencia.",
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
  "inventory.enum.ledger_movement_type.dispatch_cancelled": "Despacho cancelado",
  "inventory.enum.ledger_movement_type.dispatch_return": "Devolucion por despacho",
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
  "inventory.enum.serial_status.available": "Disponible",
  "inventory.enum.serial_status.defective": "Defectuoso",
  "inventory.enum.serial_status.reserved": "Reservado",
  "inventory.enum.serial_status.returned": "Devuelto",
  "inventory.enum.serial_status.sold": "Vendido",
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
  "inventory.delete_error_fallback": "No fue posible eliminar el elemento.",
  "inventory.brand_delete_error_fallback": "No fue posible eliminar la marca.",
  "inventory.category_delete_error_fallback": "No fue posible eliminar la categoria.",
  "inventory.measurement_unit_delete_error_fallback":
    "No fue posible eliminar la unidad de medida.",
  "inventory.warranty_profile_delete_error_fallback":
    "No fue posible eliminar el perfil de garantia.",
  "inventory.price_list_delete_error_fallback": "No fue posible eliminar la lista de precios.",
  "inventory.product_price_delete_error_fallback":
    "No fue posible eliminar el precio del producto.",
  "inventory.promotion_delete_error_fallback": "No fue posible eliminar la promocion.",
  "inventory.zone_delete_error_fallback": "No fue posible eliminar la zona.",
  "inventory.vehicle_delete_error_fallback": "No fue posible eliminar el vehiculo.",
  "inventory.route_delete_error_fallback": "No fue posible eliminar la ruta.",
  "inventory.product_deactivate_error_fallback": "No fue posible desactivar el producto.",
  "inventory.warehouse_deactivate_error_fallback": "No fue posible desactivar la bodega.",
  "inventory.inventory_lot_deactivate_error_fallback": "No fue posible desactivar el lote.",
  "inventory.brand_deactivate_error_fallback": "No fue posible desactivar la marca.",
  "inventory.category_deactivate_error_fallback": "No fue posible desactivar la categoria.",
  "inventory.measurement_unit_deactivate_error_fallback": "No fue posible desactivar la unidad de medida.",
  "inventory.tax_profile_deactivate_error_fallback": "No fue posible desactivar el perfil fiscal.",
  "inventory.price_list_deactivate_error_fallback": "No fue posible desactivar la lista de precios.",
  "inventory.error.BRAND_IN_USE": "La marca esta siendo usada por uno o mas productos.",
  "inventory.error.CATEGORY_HAS_CHILDREN":
    "La categoria tiene subcategorias. Eliminalas primero.",
  "inventory.error.CATEGORY_IN_USE":
    "La categoria esta siendo usada por uno o mas productos.",
  "inventory.error.MEASUREMENT_UNIT_IN_USE":
    "La unidad de medida esta siendo usada por uno o mas productos o variantes.",
  "inventory.error.WARRANTY_PROFILE_IN_USE":
    "El perfil de garantia esta siendo usado por uno o mas productos o variantes.",
  "inventory.error.CANNOT_DELETE_DEFAULT_PRICE_LIST":
    "No es posible eliminar la lista de precios predeterminada.",
  "inventory.form.track_serials_description":
    "Permite operar unidades por serie cuando el backend lo soporta.",
  "inventory.form.origin_location": "Ubicacion origen",
  "inventory.form.destination_location": "Ubicacion destino",
  "inventory.form.serial_ids": "IDs de seriales",
  "inventory.form.serial_ids_placeholder": "Ej: 101, 102, 103",
  "inventory.form.reserved_delta": "Delta reservado",
  "inventory.form.incoming_delta": "Delta entrante",
  "inventory.form.outgoing_delta": "Delta saliente",
  "inventory.serials.section_description":
    "Consulta, registra y actualiza seriales para la variante operativa seleccionada.",
  "inventory.serials.kpi_total": "Seriales",
  "inventory.serials.kpi_total_description":
    "Total de seriales visibles con los filtros activos.",
  "inventory.serials.kpi_available_description":
    "Seriales disponibles para la variante y filtros activos.",
  "inventory.serials.kpi_reserved_description":
    "Seriales reservados actualmente para la variante seleccionada.",
  "inventory.serials.kpi_sold_description":
    "Seriales vendidos historicamente en la variante seleccionada.",
  "inventory.serials.status_filter": "Estado",
  "inventory.serials.all_statuses": "Todos los estados",
  "inventory.serials.warehouse_filter": "Bodega",
  "inventory.serials.all_warehouses": "Todas las bodegas",
  "inventory.serials.register_action": "Registrar seriales",
  "inventory.serials.inactive_variant_hint":
    "El producto o la variante operativa estan inactivos. Puedes consultar seriales existentes, pero no registrar ni actualizar estados desde esta vista.",
  "inventory.serials.register_no_stock_hint":
    "Registrar seriales no incrementa stock automaticamente. Este flujo solo crea seriales usando el contrato oficial del backend.",
  "inventory.serials.select_origin_warehouse_hint":
    "Selecciona una bodega de origen para ver los seriales disponibles.",
  "inventory.serials.no_available_serials":
    "No hay seriales disponibles en la bodega de origen para esta variante.",
  "inventory.serials.selected_count": "{count} serial(es) seleccionado(s)",
  "inventory.serials.no_serials":
    "No hay seriales para la variante seleccionada con los filtros actuales.",
  "inventory.serials.register_dialog_title": "Registrar seriales",
  "inventory.serials.register_dialog_description":
    "Agrega seriales para {variant} usando el contrato oficial confirmado.",
  "inventory.serials.serial_numbers": "Numeros de serie",
  "inventory.serials.serial_numbers_placeholder":
    "Uno por linea o separados por coma",
  "inventory.serials.register_hint":
    "Puedes pegar varios seriales. Se enviaran exactamente como serial_numbers.",
  "inventory.serials.update_status_action": "Actualizar estado",
  "inventory.serials.update_status_title": "Actualizar estado del serial",
  "inventory.serials.update_status_description":
    "Actualiza el estado operativo de {serial}.",
  "inventory.serials.received_at": "Recibido",
  "inventory.serials.sold_at": "Vendido",
  "inventory.detail.source_document": "Documento fuente",
  "inventory.detail.source_document_number": "Numero documento",
  "inventory.detail.transferred_serial_ids": "Seriales transferidos",
  "inventory.detail.legacy_reference": "Legacy",
  "inventory.product_serial_create_error_fallback":
    "No fue posible registrar los seriales.",
  "inventory.product_serial_update_error_fallback":
    "No fue posible actualizar el estado del serial.",
  "inventory.variant_delete_error_fallback":
    "No fue posible eliminar permanentemente la variante.",
  "inventory.error.PRODUCT_NOT_FOUND": "Producto no encontrado.",
  "inventory.error.PRODUCT_VARIANT_NOT_FOUND": "Variante no encontrada.",
  "inventory.error.WAREHOUSE_NOT_FOUND": "Bodega no encontrada.",
  "inventory.error.WAREHOUSE_LOCATION_NOT_FOUND": "Ubicacion no encontrada.",
  "inventory.error.INVENTORY_LOT_NOT_FOUND": "Lote no encontrado.",
  "inventory.error.SERIAL_NOT_FOUND": "Serial no encontrado.",
  "inventory.error.PRICE_LIST_NOT_FOUND": "Lista de precios no encontrada.",
  "inventory.error.PRODUCT_PRICE_NOT_FOUND": "Precio de producto no encontrado.",
  "inventory.error.PROMOTION_NOT_FOUND": "Promocion no encontrada.",
  "inventory.error.BRAND_NOT_FOUND": "Marca no encontrada.",
  "inventory.error.CATEGORY_NOT_FOUND": "Categoria no encontrada.",
  "inventory.error.MEASUREMENT_UNIT_NOT_FOUND": "Unidad de medida no encontrada.",
  "inventory.error.TAX_PROFILE_NOT_FOUND": "Perfil fiscal no encontrado.",
  "inventory.error.WARRANTY_PROFILE_NOT_FOUND": "Perfil de garantia no encontrado.",
  "inventory.error.BRANCH_NOT_FOUND": "Sucursal no encontrada.",
  "inventory.error.PRODUCT_INACTIVE": "El producto esta inactivo.",
  "inventory.error.VARIANT_INACTIVE": "La variante esta inactiva.",
  "inventory.error.WAREHOUSE_INACTIVE": "La bodega esta inactiva.",
  "inventory.error.WAREHOUSE_LOCATION_INACTIVE": "La ubicacion esta inactiva.",
  "inventory.error.INVENTORY_LOT_INACTIVE": "El lote esta inactivo.",
  "inventory.error.PRICE_LIST_INACTIVE": "La lista de precios esta inactiva.",
  "inventory.error.BRAND_INACTIVE": "La marca esta inactiva.",
  "inventory.error.CATEGORY_INACTIVE": "La categoria esta inactiva.",
  "inventory.error.MEASUREMENT_UNIT_INACTIVE": "La unidad de medida esta inactiva.",
  "inventory.error.TAX_PROFILE_INACTIVE": "El perfil fiscal esta inactivo.",
  "inventory.error.WARRANTY_PROFILE_INACTIVE": "El perfil de garantia esta inactivo.",
  "inventory.error.PRODUCT_OR_VARIANT_REQUIRED": "Debes seleccionar un producto o una variante.",
  "inventory.error.VARIANT_REQUIRED_FOR_MULTI_VARIANT_PRODUCT":
    "Debes seleccionar una variante para productos multivariante.",
  "inventory.error.VARIANT_PRODUCT_MISMATCH":
    "La variante seleccionada no pertenece al producto indicado.",
  "inventory.error.PRODUCT_DOES_NOT_SUPPORT_VARIANTS":
    "El producto no admite variantes.",
  "inventory.error.CANNOT_EDIT_DEFAULT_VARIANT_OF_SIMPLE_PRODUCT":
    "No se puede editar la variante por defecto de un producto simple.",
  "inventory.error.CANNOT_DEACTIVATE_DEFAULT_VARIANT":
    "No se puede desactivar la variante por defecto.",
  "inventory.error.CANNOT_DEACTIVATE_LAST_ACTIVE_VARIANT":
    "No se puede desactivar la ultima variante activa.",
  "inventory.error.PRODUCT_SKU_DUPLICATE": "El SKU del producto ya existe.",
  "inventory.error.PRODUCT_BARCODE_DUPLICATE": "El codigo de barras del producto ya existe.",
  "inventory.error.VARIANT_SKU_DUPLICATE": "El SKU de la variante ya existe.",
  "inventory.error.VARIANT_BARCODE_DUPLICATE":
    "El codigo de barras de la variante ya existe.",
  "inventory.error.PRODUCT_VARIANT_DELETE_FORBIDDEN":
    "La variante no puede eliminarse permanentemente en su estado actual.",
  "inventory.error.PRODUCT_INVENTORY_TRACKING_REQUIRED":
    "El producto debe rastrear inventario para esta operacion.",
  "inventory.error.VARIANT_INVENTORY_TRACKING_REQUIRED":
    "La variante debe rastrear inventario para esta operacion.",
  "inventory.error.PRODUCT_LOT_TRACKING_REQUIRED":
    "El producto debe rastrear lotes para esta operacion.",
  "inventory.error.PRODUCT_LOT_TRACKING_REQUIRES_INVENTORY":
    "Rastrear lotes en producto requiere rastrear inventario.",
  "inventory.error.PRODUCT_EXPIRATION_REQUIRES_LOTS":
    "Rastrear vencimiento en producto requiere rastrear lotes.",
  "inventory.error.VARIANT_LOT_TRACKING_REQUIRES_INVENTORY":
    "Rastrear lotes en variante requiere rastrear inventario.",
  "inventory.error.VARIANT_EXPIRATION_REQUIRES_LOTS":
    "Rastrear vencimiento en variante requiere rastrear lotes.",
  "inventory.error.VARIANT_SERIAL_TRACKING_REQUIRES_INVENTORY":
    "Rastrear seriales en variante requiere rastrear inventario.",
  "inventory.error.PRODUCT_WARRANTY_PROFILE_REQUIRED":
    "Debes seleccionar un perfil de garantia para el producto.",
  "inventory.error.PRODUCT_UNIT_CONVERSION_NOT_SUPPORTED":
    "La conversion de unidades no esta soportada en esta fase.",
  "inventory.error.PRODUCT_TAX_PROFILE_ITEM_KIND_INVALID":
    "El perfil fiscal no coincide con el tipo de item del producto.",
  "inventory.error.INVENTORY_LOT_REQUIRED": "Debes seleccionar un lote.",
  "inventory.error.INVENTORY_LOT_NUMBER_DUPLICATE": "El numero de lote ya existe.",
  "inventory.error.INVENTORY_LOT_EXPIRATION_REQUIRED":
    "La fecha de vencimiento es obligatoria para este lote.",
  "inventory.error.INVENTORY_LOT_WAREHOUSE_MISMATCH":
    "El lote no pertenece a la bodega seleccionada.",
  "inventory.error.INVENTORY_LOT_PRODUCT_MISMATCH":
    "El lote no pertenece al producto seleccionado.",
  "inventory.error.INVENTORY_LOT_VARIANT_MISMATCH":
    "El lote no pertenece a la variante seleccionada.",
  "inventory.error.INVENTORY_LOT_LOCATION_MISMATCH":
    "El lote no pertenece a la ubicacion seleccionada.",
  "inventory.error.INVENTORY_NEGATIVE_STOCK_FORBIDDEN":
    "La operacion dejaria el inventario en negativo y no esta permitido.",
  "inventory.error.INVENTORY_LOT_NEGATIVE_BALANCE_FORBIDDEN":
    "La operacion dejaria el lote con balance negativo.",
  "inventory.error.INSUFFICIENT_STOCK": "No hay stock suficiente para completar la operacion.",
  "inventory.error.TRANSFER_WAREHOUSE_DUPLICATE":
    "La bodega origen y destino deben ser distintas.",
  "inventory.error.WAREHOUSE_LOCATION_MISMATCH":
    "La ubicacion no pertenece a la bodega seleccionada.",
  "inventory.error.WAREHOUSE_NOT_ALLOWED_FOR_BRANCH":
    "La bodega no pertenece a la sucursal activa.",
  "inventory.error.TENANT_MISMATCH":
    "El recurso no pertenece al tenant operativo actual.",
  "inventory.error.INVENTORY_MOVEMENT_NOT_FOUND": "Movimiento no encontrado.",
  "inventory.error.INVENTORY_MOVEMENT_ALREADY_CANCELLED":
    "El movimiento ya fue cancelado.",
  "inventory.error.INVENTORY_MOVEMENT_POSTED_REQUIRED":
    "La accion requiere un movimiento en estado posted.",
  "inventory.error.INVENTORY_MOVEMENT_LINES_REQUIRED":
    "El movimiento debe incluir al menos una linea.",
  "inventory.error.INVENTORY_MOVEMENT_RELATION_MISSING":
    "Faltan relaciones operativas del movimiento.",
  "inventory.error.SERIAL_NUMBERS_REQUIRED":
    "Debes enviar al menos un numero de serie.",
  "inventory.error.SERIAL_NUMBER_DUPLICATE":
    "Uno o mas numeros de serie ya existen.",
  "inventory.error.VARIANT_SERIAL_TRACKING_DISABLED":
    "La variante no tiene rastreo de seriales habilitado.",
  "inventory.error.SERIALS_REQUIRED_FOR_SERIAL_TRACKED_VARIANT":
    "Debes seleccionar seriales para esta variante serializada.",
  "inventory.error.SERIAL_TRANSFER_INTEGER_QUANTITY_REQUIRED":
    "La cantidad debe ser entera cuando la variante usa seriales.",
  "inventory.error.SERIAL_TRANSFER_QUANTITY_MISMATCH":
    "La cantidad debe coincidir con la cantidad de seriales enviados.",
  "inventory.error.SERIAL_VARIANT_MISMATCH":
    "Uno o mas seriales no pertenecen a la variante seleccionada.",
  "inventory.error.SERIAL_WAREHOUSE_MISMATCH":
    "Uno o mas seriales no pertenecen a la bodega origen.",
  "inventory.error.SERIAL_STATUS_NOT_TRANSFERABLE":
    "Uno o mas seriales no estan en estado transferible.",
  "inventory.error.SERIALS_OUTSIDE_BUSINESS":
    "Uno o mas seriales no pertenecen a la empresa activa.",
  "inventory.error.PRICE_LIST_NAME_DUPLICATE":
    "Ya existe una lista de precios con ese nombre.",
  "inventory.error.BRANCH_PRICE_LIST_ASSIGNMENT_NOT_FOUND":
    "No se encontro la asignacion de esta lista de precios para la sucursal indicada.",
  "inventory.error.BRANCH_PRICE_LIST_ASSIGNMENT_DUPLICATE":
    "Esta lista de precios ya tiene una asignacion para la sucursal indicada.",
  "inventory.error.BRANCH_PRICE_LIST_DEFAULT_REQUIRES_ACTIVE_ASSIGNMENT":
    "La lista por defecto de sucursal requiere una asignacion activa.",
  "inventory.error.PRICE_VALID_RANGE_INVALID":
    "El rango de vigencia del precio no es valido.",
  "inventory.error.PROMOTION_NAME_DUPLICATE":
    "Ya existe una promocion con ese nombre.",
  "inventory.error.PROMOTION_INACTIVE": "La promocion esta inactiva.",
  "inventory.error.BRANCH_PROMOTION_ASSIGNMENT_NOT_FOUND":
    "No se encontro la asignacion de esta promocion para la sucursal indicada.",
  "inventory.error.BRANCH_PROMOTION_ASSIGNMENT_DUPLICATE":
    "Esta promocion ya tiene una asignacion para la sucursal indicada.",
  "inventory.error.PROMOTION_PRODUCT_OR_VARIANT_REQUIRED":
    "Cada item de promocion requiere producto o variante.",
  "inventory.error.PROMOTION_DUPLICATE_ITEMS":
    "No puedes repetir el mismo producto o variante en la promocion.",
  "inventory.error.PROMOTION_ITEMS_OUTSIDE_BUSINESS":
    "La promocion incluye items fuera de la empresa activa.",
  "inventory.error.PROMOTION_DISCOUNT_VALUE_REQUIRED":
    "Debes indicar el valor del descuento para esta promocion.",
  "inventory.error.PROMOTION_OVERRIDE_PRICE_REQUIRED":
    "Debes indicar el precio override para esta promocion.",
  "inventory.error.PROMOTION_BUY_X_GET_Y_FIELDS_REQUIRED":
    "Debes indicar min quantity y bonus quantity para la promocion.",
  "inventory.error.PROMOTION_DATE_RANGE_INVALID":
    "El rango de fechas de la promocion no es valido.",
  "sales.entity.sale_order": "Orden de Venta",
  "sales.entity.sale_orders": "Órdenes de Venta",
  "sales.section_description": "Gestiona las órdenes de venta.",
  "sales.dialog_description":
    "Completa los campos para la orden de venta.",
  "sales.detail_description":
    "Detalle de la orden de venta.",
  "sales.lines": "Lineas",
  "sales.no_lines": "No hay lineas en esta orden.",
  "sales.subtotal": "Subtotal",
  "sales.delivery_charges": "Cargos de entrega",
  "sales.delivery_address": "Direccion de entrega",
  "sales.delivery_location": "Ubicacion de entrega",
  "sales.use_contact_location": "Usar ubicacion del cliente",
  "sales.delivery_zone": "Zona de entrega",
  "sales.delivery_requested_date": "Fecha de entrega solicitada",
  "sales.order_date": "Fecha de orden",
  "sales.sale_mode": "Modo de venta",
  "sales.branch": "Sucursal",
  "sales.seller": "Vendedor",
  "sales.warehouse": "Bodega",
  "sales.created_by": "Creado por",
  "sales.mode_branch_direct": "Venta directa en sucursal",
  "sales.mode_seller_attributed": "Atribuida a vendedor",
  "sales.mode_seller_route": "Ruta de vendedor",
  "sales.order_create_error_fallback":
    "Error al crear la orden de venta.",
  "sales.order_update_error_fallback":
    "Error al actualizar la orden de venta.",
  "sales.order_confirm_error_fallback":
    "Error al confirmar la orden de venta.",
  "sales.order_cancel_error_fallback":
    "Error al cancelar la orden de venta.",
  "sales.order_delete_error_fallback":
    "Error al eliminar la orden de venta.",
  "sales.confirm_title": "Confirmar orden",
  "sales.confirm_description":
    "¿Confirmar la orden {{code}}? Esta acción no se puede deshacer.",
  "sales.cancel_title": "Cancelar orden",
  "sales.cancel_description": "¿Cancelar la orden {{code}}?",
  "sales.delete_title": "Eliminar orden",
  "sales.delete_description":
    "¿Eliminar la orden {{code}}? Esta acción no se puede deshacer.",
  "sales.order_date": "Fecha",
  "sales.customer": "Cliente",
  "sales.status": "Estado",
  "sales.fulfillment": "Cumplimiento",
  "sales.dispatch_status": "Despacho",
  "sales.total": "Total",
  "sales.status_draft": "Borrador",
  "sales.status_confirmed": "Confirmada",
  "sales.status_cancelled": "Cancelada",
  "sales.fulfillment_pickup": "Retiro",
  "sales.fulfillment_delivery": "Entrega",
  "sales.dispatch_not_required": "No requerido",
  "sales.dispatch_pending": "Pendiente",
  "sales.dispatch_assigned": "Asignado",
  "sales.dispatch_out_for_delivery": "En camino",
  "sales.dispatch_delivered": "Entregado",
  "sales.dispatch_partial": "Parcial",
  "sales.dispatch_failed": "Fallido",
  "sales.dispatch_cancelled": "Cancelado",
  "sales.reservation_active": "Reservado",
  "sales.reservation_consumed": "Despachado",
  "sales.reservation_released": "Liberado",
  "sales.dispatch_orders_section": "Ordenes de despacho",
  "sales.no_dispatch_orders": "Sin despacho asignado",
  "sales.cancel_line_title": "Cancelar linea",
  "sales.cancel_line_description": "Esta accion liberara la reserva de inventario para esta linea. Si el producto esta dañado, quedara marcado para ajuste manual.",
  "sales.cancel_line_reason": "Razon de cancelacion",
  "sales.cancel_line_confirm": "Cancelar linea",
  "sales.cancel_line_success": "Linea cancelada exitosamente",
  "sales.cancel_line_error_fallback": "Error al cancelar la linea",
  "sales.line_status_active": "Activa",
  "sales.line_status_cancelled": "Cancelada",
  "sales.line_already_dispatched": "Esta linea ya fue despachada. Usa la orden de despacho para gestionar devoluciones.",
  "sales.confirm_order": "Confirmar",
  "sales.cancel_order": "Cancelar",
  "sales.form.code": "Código",
  "sales.form.order_date": "Fecha de orden",
  "sales.form.sale_mode": "Modo de venta",
  "sales.form.fulfillment_mode": "Modo de cumplimiento",
  "sales.form.branch_id": "Sucursal",
  "sales.form.customer_contact_id": "Cliente",
  "sales.form.seller_user_id": "Vendedor",
  "sales.form.warehouse_id": "Bodega",
  "sales.form.delivery_address": "Dirección de entrega",
  "sales.form.delivery_province": "Provincia",
  "sales.form.delivery_canton": "Cantón",
  "sales.form.delivery_district": "Distrito",
  "sales.form.delivery_zone_id": "Zona de entrega",
  "sales.form.delivery_requested_date": "Fecha solicitada",
  "sales.form.notes": "Notas",
  "sales.form.internal_notes": "Notas internas",
  "sales.form.lines": "Líneas",
  "sales.form.add_line": "Agregar línea",
  "sales.form.remove_line": "Eliminar línea",
  "sales.form.delivery_charges": "Cargos de entrega",
  "sales.form.add_charge": "Agregar cargo",
  "sales.form.remove_charge": "Eliminar cargo",
  "sales.form.product_variant_id": "Variante de producto",
  "sales.form.quantity": "Cantidad",
  "sales.form.unit_price": "Precio unitario",
  "sales.form.discount_percent": "% Descuento",
  "sales.form.tax_amount": "Impuesto",
  "sales.form.charge_type": "Tipo de cargo",
  "sales.form.amount": "Monto",
  "sales.form.reason": "Razón",
  "sales.form.no_price_in_list": "Sin precio en lista de precios",
  "sales.form.no_branch_price_list": "La sucursal no tiene lista de precios asignada",
  "sales.form.select_serials": "Seleccionar seriales",
  "sales.form.no_serials_available": "No hay seriales disponibles",
  "sales.form.select_warehouse_for_serials": "Selecciona una bodega para ver seriales",
  "sales.form.serials_selected": "{{count}} serial(es) seleccionado(s)",
  "sales.assigned_serials": "Seriales asignados",
  "sales.order_seller_required":
    "El vendedor es requerido para el modo de venta seleccionado.",
  "sales.order_route_requires_delivery":
    "El modo ruta de vendedor requiere cumplimiento por entrega.",
  "sales.order_pickup_no_delivery_charges":
    "El modo recogida no permite cargos de entrega.",
  "sales.order_delivery_requires_warehouse":
    "La bodega es requerida para modo entrega.",
  "sales.order_delivery_requires_address":
    "La direccion de entrega es requerida para modo entrega.",
  "sales.order_warehouse_required":
    "La bodega es requerida para confirmar la orden.",
  "sales.order_not_confirmable":
    "La orden no se puede confirmar en su estado actual.",
  "sales.order_not_editable":
    "La orden no se puede editar en su estado actual.",
  "sales.order_already_cancelled": "La orden ya fue cancelada.",
  "sales.order_cannot_cancel_after_logistics":
    "La orden no puede cancelarse porque ya tiene operaciones logisticas.",
  "sales.order_delete_not_allowed":
    "La orden no puede eliminarse en su estado actual.",
  "sales.order_not_found": "La orden de venta no existe.",
  "sales.order_not_confirmed": "La orden de venta no esta confirmada.",
  "sales.line_not_found": "La linea de la orden no existe.",
  "sales.line_already_cancelled": "Esta linea ya esta cancelada.",
  "sales.order_delete_forbidden":
    "La orden no puede eliminarse porque tiene dependencias asociadas.",
  "sales.order_customer_inactive":
    "El cliente seleccionado no se encuentra activo.",
  "sales.order_customer_type_invalid":
    "El contacto seleccionado no esta habilitado como cliente.",
  "sales.order_seller_inactive":
    "El vendedor seleccionado no se encuentra activo.",
  "sales.order_seller_branch_scope_invalid":
    "El vendedor asignado no tiene alcance sobre la sucursal seleccionada.",
  "sales.order_has_no_lines":
    "La orden no tiene lineas de productos.",
  "sales.order_reservations_already_exist":
    "La orden ya tiene reservas de inventario registradas.",
  "sales.order_line_variant_required":
    "Una linea de la orden no tiene su variante de producto cargada.",
  "sales.order_reservation_required":
    "La orden requiere una reserva activa antes de despacharse.",
  "sales.order_reservation_insufficient":
    "La reserva activa no cubre la cantidad que se intenta despachar.",
  "sales.order_dispatch_requires_confirmation":
    "Solo las ordenes confirmadas pueden programarse para despacho.",
  "sales.order_dispatch_branch_mismatch":
    "La orden de venta pertenece a una sucursal distinta a la del despacho.",
  "inventory.dispatch_order_not_found":
    "La orden de despacho no existe.",
  "inventory.dispatch_order_not_readyable":
    "La orden de despacho no puede marcarse como lista en su estado actual.",
  "inventory.dispatch_order_not_editable":
    "La orden de despacho no puede editarse en su estado actual.",
  "inventory.dispatch_order_not_ready":
    "La orden de despacho no esta lista para despachar.",
  "inventory.dispatch_order_not_in_progress":
    "La orden de despacho no esta en progreso.",
  "inventory.dispatch_order_cannot_cancel":
    "La orden de despacho no puede cancelarse en su estado actual.",
  "inventory.dispatch_order_delete_not_allowed":
    "La orden de despacho no puede eliminarse en su estado actual.",
  "inventory.dispatch_order_scheduled_date_required":
    "La fecha programada es requerida.",
  "inventory.dispatch_order_vehicle_required":
    "El vehiculo es requerido.",
  "inventory.dispatch_order_vehicle_inactive":
    "El vehiculo asignado esta inactivo.",
  "inventory.dispatch_order_driver_required":
    "El chofer es requerido.",
  "inventory.dispatch_order_driver_inactive":
    "El chofer asignado esta inactivo.",
  "inventory.dispatch_order_route_inactive":
    "La ruta asignada esta inactiva.",
  "inventory.dispatch_order_stops_required":
    "Se requiere al menos una parada.",
  "inventory.dispatch_order_stops_not_updatable":
    "Las paradas no pueden actualizarse en el estado actual de la orden.",
  "inventory.dispatch_order_stops_unresolved":
    "Todas las paradas deben estar resueltas para completar la orden.",
  "inventory.brand_in_use":
    "La marca no puede eliminarse porque esta en uso.",
  "inventory.category_has_children":
    "La categoria no puede eliminarse porque tiene subcategorias.",
  "inventory.category_in_use":
    "La categoria no puede eliminarse porque esta en uso.",
  "inventory.measurement_unit_in_use":
    "La unidad de medida no puede eliminarse porque esta en uso.",
  "inventory.warranty_profile_in_use":
    "El perfil de garantia no puede eliminarse porque esta en uso.",
  "inventory.cannot_deactivate_default_variant":
    "No se puede desactivar la variante por defecto.",
  "inventory.cannot_deactivate_last_active_variant":
    "No se puede desactivar la ultima variante activa del producto.",
  "inventory.cannot_edit_default_variant_of_simple_product":
    "No se puede editar la variante por defecto de un producto simple.",
  "inventory.cannot_delete_default_price_list":
    "La lista de precios por defecto no puede eliminarse.",
  "inventory.product_does_not_support_variants":
    "Este producto no soporta variantes.",
  "inventory.product_has_non_default_variants":
    "El producto tiene variantes adicionales que deben eliminarse primero.",
  "inventory.product_or_variant_required":
    "Debe indicarse un producto o una variante.",
  "inventory.product_variant_not_found":
    "La variante del producto no existe.",
  "inventory.no_attributes_defined":
    "No hay atributos definidos para generar variantes.",
  "inventory.variant_barcode_duplicate":
    "Ya existe una variante con ese codigo de barras.",
  "inventory.variant_sku_duplicate":
    "Ya existe una variante con ese SKU.",
  "inventory.variant_product_mismatch":
    "La variante no pertenece al producto indicado.",
  "inventory.variant_required_for_multi_variant_product":
    "Debe indicarse una variante para productos con multiples variantes.",
  "inventory.variant_inventory_tracking_required":
    "La variante no soporta seguimiento de inventario.",
  "inventory.variant_lot_tracking_requires_inventory":
    "Las variantes con seguimiento por lote deben llevar inventario.",
  "inventory.variant_expiration_requires_lots":
    "Las variantes con vencimiento deben llevar lotes.",
  "inventory.inventory_lot_variant_mismatch":
    "El lote no pertenece a la variante indicada.",
  "inventory.product_serial_tracking_disabled":
    "Este producto no tiene habilitado el seguimiento por serie.",
  "inventory.serial_not_found":
    "El numero de serie no existe.",
  "inventory.serial_number_duplicate":
    "El numero de serie ya existe.",
  "inventory.serial_numbers_required":
    "Se requieren numeros de serie.",
  "inventory.serial_variant_mismatch":
    "El numero de serie no pertenece a la variante indicada.",
  "inventory.serial_warehouse_mismatch":
    "El numero de serie no pertenece a la bodega indicada.",
  "inventory.serial_status_not_transferable":
    "El numero de serie no esta en un estado transferible.",
  "inventory.serial_transfer_integer_quantity_required":
    "Las transferencias con series requieren cantidades enteras.",
  "inventory.serial_transfer_quantity_mismatch":
    "La cantidad de series no coincide con la cantidad del movimiento.",
  "inventory.serials_outside_business":
    "Uno o mas numeros de serie no pertenecen a la empresa activa.",
  "inventory.serials_required_for_serial_tracked_variant":
    "Se requieren numeros de serie para variantes con seguimiento por serie.",
  "inventory.transfer_warehouse_duplicate":
    "La bodega de origen y destino no pueden ser la misma.",
  "inventory.route_not_found":
    "La ruta no existe.",
  "inventory.route_name_duplicate":
    "Ya existe una ruta con ese nombre.",
  "inventory.vehicle_not_found":
    "El vehiculo no existe.",
  "inventory.vehicle_plate_duplicate":
    "Ya existe un vehiculo con esa placa.",
  "inventory.zone_not_found":
    "La zona no existe.",
  "inventory.zone_name_duplicate":
    "Ya existe una zona con ese nombre.",
  "inventory.driver_user_not_available_for_branch":
    "El chofer no esta disponible para la sucursal indicada.",
  "inventory.dispatch_expense_not_found":
    "El gasto del despacho no existe.",
  "inventory.dispatch_stop_not_found":
    "La parada del despacho no existe.",
  "inventory.dispatch_stop_already_resolved":
    "La parada ya fue resuelta.",
  "inventory.dispatch_stop_failure_reason_required":
    "Se requiere una razon de fallo para esta parada.",
  "inventory.dispatch_stop_invalid_transition":
    "La transicion de estado de la parada no es valida.",
  "inventory.dispatch_stop_received_by_required":
    "Se requiere indicar quien recibio la entrega.",
  "inventory.dispatch_stop_sale_order_required":
    "La parada requiere una orden de venta.",
  "inventory.dispatch_stop_status_already_set":
    "La parada ya tiene ese estado.",
  "inventory.dispatch_stop_status_not_supported":
    "El estado indicado no es valido para esta parada.",
  "inventory.dispatch_stop_delivered_lines_required":
    "Se requieren las cantidades entregadas por linea para entregas parciales.",
  "inventory.dispatch_stop_delivered_exceeds_ordered":
    "La cantidad entregada no puede ser mayor a la cantidad ordenada.",
  "inventory.sale_order_not_found":
    "La orden de venta no existe en el contexto de despacho.",
  "inventory.sale_order_already_assigned_to_dispatch":
    "La orden de venta ya esta asignada a otra orden de despacho.",
  "inventory.sale_order_already_assigned_to_active_dispatch":
    "La orden de venta ya esta asignada a una orden de despacho activa.",
  "inventory.promotion_items_required":
    "La promocion requiere al menos un item.",
  "inventory.promotion_product_or_variant_required":
    "Cada item de la promocion requiere un producto o variante.",
  "sales.order_already_assigned_or_dispatched":
    "La orden de venta ya esta asignada o despachada.",
  "sales.order_dispatch_requires_delivery":
    "Solo las ordenes con modo entrega pueden programarse para despacho.",
  "sales.order_dispatch_warehouse_mismatch":
    "La bodega de la orden de venta no coincide con la del despacho.",
  "sales.lines_required":
    "La orden requiere al menos una linea.",
  "sales.electronic_document_not_found":
    "El documento electronico no existe.",
  "sales.electronic_document_not_submittable":
    "El documento electronico no puede enviarse en su estado actual.",
  "sales.electronic_document_not_resubmittable":
    "El documento electronico no puede reenviarse.",
  "sales.electronic_document_sale_order_not_emittable":
    "La orden de venta no es elegible para emitir documento electronico.",
  "sales.order_dispatch_reset_requires_confirmed":
    "Solo las ordenes confirmadas pueden resetearse para re-despacho.",
  "sales.order_dispatch_reset_invalid_status":
    "Solo las ordenes con despacho fallido o parcial pueden resetearse.",
  "sales.order_has_active_dispatch_stops":
    "La orden de venta tiene paradas activas en una orden de despacho.",
  "sales.reset_dispatch_title": "Habilitar re-despacho",
  "sales.reset_dispatch_description": "Resetear el estado de despacho de la orden {{code}} a pendiente para permitir un nuevo intento de entrega.",
  "sales.reset_dispatch_success": "Estado de despacho reseteado correctamente.",
  "sales.reset_dispatch_error_fallback": "No fue posible resetear el estado de despacho.",
  "rbac.role_access_forbidden":
    "El usuario no tiene acceso al rol indicado.",
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
  "users.form.email": "Correo electronico",
  "users.form.max_discount": "Descuento maximo de venta (%)",
  "users.form.name": "Nombre completo",
  "users.form.name_placeholder": "Nombre del usuario",
  "users.form.password": "Contrasena",
  "users.form.password_placeholder": "Contrasena temporal",
  "users.delete_error_fallback": "No fue posible eliminar el usuario.",
  "users.password_update_error_fallback":
    "No fue posible actualizar la contrasena del usuario.",
  "users.password_updated_success": "Contrasena actualizada correctamente.",
  "users.roles_update_error_fallback":
    "No fue posible actualizar los roles del usuario.",
  "users.status_update_error_fallback":
    "No fue posible actualizar el estado del usuario.",
  "users.update_error_fallback": "No fue posible actualizar el usuario.",
  "inventory.dispatch_order_create_error_fallback":
    "Error al crear la orden de despacho.",
  "inventory.dispatch_order_update_error_fallback":
    "Error al actualizar la orden de despacho.",
  "inventory.dispatch_order_dispatch_error_fallback":
    "Error al despachar la orden.",
  "inventory.dispatch_order_complete_error_fallback":
    "Error al completar la orden de despacho.",
  "inventory.dispatch_order_cancel_error_fallback":
    "Error al cancelar la orden de despacho.",
  "inventory.dispatch_order_ready_error_fallback":
    "Error al marcar la orden como lista.",
  "inventory.dispatch_stop_status_error_fallback":
    "Error al actualizar el estado de la parada.",
  "inventory.dispatch_stop_create_error_fallback":
    "Error al agregar la parada.",
  "inventory.dispatch_stop_delete_error_fallback":
    "Error al eliminar la parada.",
  "inventory.dispatch_expense_create_error_fallback":
    "Error al agregar el gasto.",
  "inventory.dispatch_expense_delete_error_fallback":
    "Error al eliminar el gasto.",
  "inventory.entity.dispatch_order": "Orden de Despacho",
  "inventory.entity.dispatch_orders": "Órdenes de Despacho",
  "inventory.dispatch.section_description": "Gestiona las órdenes de despacho y logística.",
  "inventory.dispatch.dialog_description":
    "Completa los campos para la orden de despacho.",
  "inventory.dispatch.dispatch_type": "Tipo de despacho",
  "inventory.dispatch.status": "Estado",
  "inventory.dispatch.scheduled_date": "Fecha programada",
  "inventory.dispatch.route": "Ruta",
  "inventory.dispatch.vehicle": "Vehículo",
  "inventory.dispatch.driver": "Chofer",
  "inventory.dispatch.origin_warehouse": "Bodega de origen",
  "inventory.dispatch.stops": "Paradas",
  "inventory.dispatch.expenses": "Gastos",
  "inventory.dispatch.movements_section": "Movimientos de inventario",
  "inventory.dispatch.add_stop": "Agregar parada",
  "inventory.dispatch.add_expense": "Agregar gasto",
  "inventory.dispatch.mark_dispatched": "Despachar",
  "inventory.dispatch.mark_ready": "Marcar listo",
  "inventory.dispatch.mark_ready_confirm": "¿Marcar esta orden como lista para despacho?",
  "inventory.dispatch.mark_completed": "Completar",
  "inventory.dispatch.cancel": "Cancelar despacho",
  "inventory.dispatch.delete_confirm":
    "Esta accion eliminara permanentemente la orden de despacho",
  "inventory.dispatch_order_delete_error_fallback":
    "Error al eliminar la orden de despacho.",
  "inventory.dispatch.update_stop_status": "Actualizar estado de parada",
  "inventory.dispatch.detail_description": "Detalle de la orden de despacho.",
  "inventory.dispatch.no_stops": "No hay paradas en esta orden.",
  "inventory.dispatch.received_by": "Recibido por",
  "inventory.dispatch.received_by_placeholder": "Nombre de quien recibió",
  "inventory.dispatch.failure_reason": "Razón de fallo",
  "inventory.dispatch.failure_reason_placeholder": "Describe la razón del fallo",
  "inventory.dispatch.receipt": "Recibo",
  "inventory.dispatch.select_sale_orders": "Órdenes de venta a despachar",
  "inventory.dispatch.select_sale_orders_description": "Selecciona las órdenes de venta confirmadas con entrega pendiente.",
  "inventory.dispatch.orders_selected": "órdenes seleccionadas",
  "inventory.dispatch.no_eligible_orders": "No hay órdenes de venta elegibles. Deben estar confirmadas, con modo de entrega y despacho pendiente.",
  "inventory.dispatch.status_draft": "Borrador",
  "inventory.dispatch.status_ready": "Listo",
  "inventory.dispatch.status_dispatched": "Despachado",
  "inventory.dispatch.status_in_transit": "En tránsito",
  "inventory.dispatch.status_completed": "Completado",
  "inventory.dispatch.status_cancelled": "Cancelado",
  "inventory.dispatch.type_individual": "Individual",
  "inventory.dispatch.type_consolidated": "Consolidado",
  "inventory.dispatch.stop_pending": "Pendiente",
  "inventory.dispatch.stop_in_transit": "En tránsito",
  "inventory.dispatch.stop_delivered": "Entregado",
  "inventory.dispatch.stop_failed": "Fallido",
  "inventory.dispatch.stop_partial": "Parcial",
  "inventory.dispatch.stop_skipped": "Omitido",
  "inventory.dispatch.expense_type": "Tipo de gasto",
  "inventory.dispatch.amount": "Monto",
  "inventory.dispatch.total_expenses": "Total gastos",
  "inventory.dispatch.delivered_quantities": "Cantidades entregadas",
  "inventory.dispatch.product": "Producto",
  "inventory.dispatch.ordered": "Ordenado",
  "inventory.dispatch.delivered": "Entregado",
  "inventory.dispatch.readiness_title": "Requisitos para marcar lista",
  "inventory.dispatch.readiness_scheduled_date": "Fecha programada asignada",
  "inventory.dispatch.readiness_vehicle": "Vehiculo asignado",
  "inventory.dispatch.readiness_driver": "Chofer asignado",
  "inventory.dispatch.readiness_stops": "Al menos una parada agregada",
  "inventory.dispatch.readiness_incomplete": "Incompleta",
  "inventory.dispatch.readiness_date_conflicts": "Fecha de despacho posterior a fecha de entrega solicitada",
  "inventory.dispatch_scheduled_date_after_delivery_date":
    "La fecha programada del despacho es posterior a la fecha de entrega solicitada de una orden de venta asignada.",
  "inventory.dispatch.landing.eyebrow": "Despachos",
  "inventory.dispatch.landing.title": "Despachos y Logística",
  "inventory.dispatch.landing.description":
    "Gestiona órdenes de despacho, rutas y vehículos para la logística de entregas.",
  "inventory.dispatch.landing.orders_description":
    "Crea y gestiona órdenes de despacho individuales o consolidadas.",
  "inventory.dispatch.landing.routes_description":
    "Configura rutas de entrega con zonas, vehículos y choferes por defecto.",
  "inventory.dispatch.landing.vehicles_description":
    "Administra la flota de vehículos disponibles para despachos.",
  "inventory.dispatch.landing.zones_description":
    "Configura zonas geográficas para agrupar y organizar rutas de entrega.",
  "inventory.dispatch.landing.open_section": "Abrir",
  "inventory.branch_assignments.column_header": "Sucursales",
  "inventory.branch_assignments.global": "Global",
  "inventory.branch_assignments.branch_count": "{{count}} sucursales",
  "inventory.branch_assignments.manage_action": "Sucursales",
  "inventory.branch_assignments.dialog_title": "Asignación de sucursales - {{entity}}",
  "inventory.branch_assignments.dialog_description":
    "Configura las sucursales asignadas a {{name}}.",
  "inventory.branch_assignments.load_error":
    "Error cargando asignaciones de sucursal.",
  "inventory.branch_assignments.loading": "Cargando asignaciones...",
  "inventory.branch_assignments.is_global": "Global (todas las sucursales)",
  "inventory.branch_assignments.is_global_hint":
    "Si está activo, {{entity}} estará disponible en todas las sucursales.",
  "inventory.branch_assignments.select_branches": "Seleccionar sucursales",
  "inventory.branch_assignments.select_all": "Todas",
  "inventory.branch_assignments.deselect_all": "Ninguna",
  "inventory.branch_assignments.no_branches": "No hay sucursales activas disponibles.",
  "inventory.branch_assignments.selected_count": "{{count}} seleccionadas",
  "inventory.branch_assignments.save_action": "Guardar asignaciones",
  "inventory.branch_assignments_save_error_fallback":
    "Error guardando las asignaciones de sucursal.",
  "sales.document_emit_error_fallback":
    "Error al emitir el documento electrónico.",
  "sales.entity.electronic_document": "Documento Electrónico",
  "sales.entity.electronic_documents": "Documentos Electrónicos",
  "sales.documents.section_description":
    "Gestiona los documentos electrónicos de Hacienda.",
  "sales.documents.emit": "Emitir factura",
  "sales.documents.document_type": "Tipo de documento",
  "sales.documents.hacienda_status": "Estado Hacienda",
  "sales.documents.hacienda_pending": "Pendiente",
  "sales.documents.hacienda_submitted": "Enviado",
  "sales.documents.hacienda_accepted": "Aceptado",
  "sales.documents.hacienda_rejected": "Rechazado",
  "sales.documents.hacienda_error": "Error",
  "sales.documents.receiver": "Receptor",
  "sales.documents.document_key": "Clave",
  "sales.documents.consecutive": "Consecutivo",
  "sales.documents.type_factura_electronica": "Factura Electrónica",
  "sales.documents.type_tiquete_electronico": "Tiquete Electrónico",
  "sales.documents.type_nota_credito": "Nota de Crédito",
  "sales.documents.type_nota_debito": "Nota de Débito",
} as const;

export type FrontendTranslationKey = keyof typeof esTranslations;

type TranslationDictionary = Record<FrontendTranslationKey, string>;

export const translations: Record<AppLanguage, TranslationDictionary> = {
  en: {
    "branches.create_error_fallback": "Unable to create the branch.",
    "branches.delete_error_fallback": "Unable to delete the branch.",
    "branches.delete_forbidden":
      "This branch cannot be deleted because it still has operational dependencies.",
    "branches.delete_forbidden_dependencies":
      "This branch cannot be deleted because it still has dependencies: {dependencies}.",
    "branches.dependency.inventory_lots": "inventory lots",
    "branches.dependency.inventory_movement_headers": "movement headers",
    "branches.dependency.inventory_movements": "legacy movements",
    "branches.dependency.warehouse_branch_links": "warehouse branch links",
    "branches.dependency.warehouse_locations": "warehouse locations",
    "branches.dependency.warehouse_stock": "warehouse stock",
    "branches.dependency.warehouses": "warehouses",
    "branches.form.active_branch": "Active branch",
    "branches.form.active_branch_description": "Inactive branches are kept for history without operational use.",
    "branches.form.activity_code": "Economic activity code",
    "branches.form.address": "Address",
    "branches.form.branch_name": "Branch name",
    "branches.form.branch_number": "Branch number",
    "branches.form.business_name": "Business name",
    "branches.form.canton": "Canton",
    "branches.form.cedula_juridica": "Legal ID",
    "branches.form.cert_path": "Certificate path",
    "branches.form.city": "City",
    "branches.form.code": "Code",
    "branches.form.configured": "Configured",
    "branches.form.configuration_description": "Electronic invoicing and digital signature parameters.",
    "branches.form.configuration_title": "Configuration",
    "branches.form.crypto_key": "Cryptographic key",
    "branches.form.district": "District",
    "branches.form.email": "Email",
    "branches.form.empty": "Empty",
    "branches.form.hacienda_password": "Hacienda password",
    "branches.form.hacienda_username": "Hacienda username",
    "branches.form.identification_number": "Identification number",
    "branches.form.identification_type": "Identification type",
    "branches.form.identity_description": "Identity and operational status of the branch.",
    "branches.form.identity_title": "Branch identity",
    "branches.form.legal_name": "Legal name",
    "branches.form.location_description": "Geographic and contact data for the branch.",
    "branches.form.location_title": "Location and contact",
    "branches.form.mail_key": "Mail key",
    "branches.form.phone": "Phone",
    "branches.form.provider_code": "Provider code",
    "branches.form.province": "Province",
    "branches.form.secret_flags_label": "Sensitive fields",
    "branches.form.select_type": "Select a type",
    "branches.form.signature_type": "Signature type",
    "branches.terminal_form.active_terminal": "Active terminal",
    "branches.terminal_form.active_terminal_description": "Inactive terminals are kept for history.",
    "branches.terminal_form.code": "Terminal code",
    "branches.terminal_form.name": "Name",
    "branches.terminal_form.number": "Terminal number",
    "branches.terminal_form.terminal_number": "Terminal number",
    "branches.terminal_create_error_fallback": "Unable to create the terminal.",
    "branches.terminal_delete_error_fallback": "Unable to delete the terminal.",
    "branches.terminal_update_error_fallback": "Unable to update the terminal.",
    "branches.update_error_fallback": "Unable to update the branch.",
    "business.update_error_fallback": "Unable to update business settings.",
    "business.update_success": "Business settings updated successfully.",
    "common.branch_label": "Branch: {label}",
    "common.business_label": "Business: {label}",
    "common.cancel": "Cancel",
    "common.cancel_success": "Cancelled successfully.",
    "common.confirm_success": "Confirmed successfully.",
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
    "contacts.delete_error_fallback": "Unable to delete the contact.",
    "contacts.delete_forbidden":
      "This contact cannot be deleted because it still has operational history.",
    "contacts.delete_forbidden_dependencies":
      "This contact cannot be deleted because it still has dependencies: {dependencies}.",
    "contacts.dependency.inventory_lots": "inventory lots",
    "contacts.dependency.serial_events": "serial events",
    "contacts.create_error_fallback": "Unable to create the contact.",
    "contacts.branch_assignment_create_error_fallback":
      "Unable to create the contact branch commercial context.",
    "contacts.branch_assignment_update_error_fallback":
      "Unable to update the contact branch commercial context.",
    "contacts.branch_assignment_delete_error_fallback":
      "Unable to delete the contact branch commercial context.",
    "contacts.lookup_empty_input": "Enter an identification to search.",
    "contacts.lookup_error_fallback": "Unable to execute the contact lookup.",
    "contacts.branch_assignments.account_manager": "Account manager",
    "contacts.branch_assignments.actions": "Actions",
    "contacts.branch_assignments.active": "Active",
    "contacts.branch_assignments.active_description": "Keeps this assignment enabled for the branch.",
    "contacts.branch_assignments.add_branch_context": "Add branch context",
    "contacts.branch_assignments.add_title": "Add commercial context",
    "contacts.branch_assignments.applies_to_all": "Applies to all branches",
    "contacts.branch_assignments.assignment_count": "{count} assignment(s)",
    "contacts.branch_assignments.branch": "Branch",
    "contacts.branch_assignments.branch_access_required": "branches.view permission is required to see branches.",
    "contacts.branch_assignments.commercial_defaults": "Commercial defaults",
    "contacts.branch_assignments.commercial_flags": "Commercial flags",
    "contacts.branch_assignments.confirm_deactivate_description": "The assignment will become inactive for this branch.",
    "contacts.branch_assignments.confirm_deactivate_title": "Deactivate assignment",
    "contacts.branch_assignments.confirm_delete_description": "The assignment will be permanently deleted.",
    "contacts.branch_assignments.confirm_delete_title": "Delete assignment",
    "contacts.branch_assignments.confirm_reactivate_description": "The assignment will become active again for this branch.",
    "contacts.branch_assignments.confirm_reactivate_title": "Reactivate assignment",
    "contacts.branch_assignments.create_assignment": "Create assignment",
    "contacts.branch_assignments.create_error": "Unable to create the assignment.",
    "contacts.branch_assignments.credit": "Credit",
    "contacts.branch_assignments.credit_enabled": "Credit enabled",
    "contacts.branch_assignments.credit_enabled_description": "Allows credit operations for this contact in the branch.",
    "contacts.branch_assignments.credit_limit_label": "Credit limit",
    "contacts.branch_assignments.custom_credit_limit": "Custom credit limit",
    "contacts.branch_assignments.custom_price_list": "Custom price list",
    "contacts.branch_assignments.deactivate": "Deactivate",
    "contacts.branch_assignments.default": "Default",
    "contacts.branch_assignments.default_description": "Marks this assignment as preferred for the branch.",
    "contacts.branch_assignments.delete_assignment": "Delete assignment",
    "contacts.branch_assignments.dialog_description": "Manage the contact's commercial context per branch.",
    "contacts.branch_assignments.dialog_title": "Branch context",
    "contacts.branch_assignments.edit_assignment": "Edit assignment",
    "contacts.branch_assignments.edit_title": "Edit commercial context",
    "contacts.branch_assignments.editor_description": "Configure the contact's commercial scope for this branch.",
    "contacts.branch_assignments.empty": "This contact has no branch assignments configured.",
    "contacts.branch_assignments.empty_scoped": "No assignments visible for the active branch.",
    "contacts.branch_assignments.exclusive": "Exclusive",
    "contacts.branch_assignments.exclusive_description": "Restricts the contact to operate only in this branch.",
    "contacts.branch_assignments.has_branch_context": "Has branch context",
    "contacts.branch_assignments.inactive": "Inactive",
    "contacts.branch_assignments.load_error": "Unable to load contact assignments.",
    "contacts.branch_assignments.loading": "Loading branch assignments.",
    "contacts.branch_assignments.manager_label": "Account manager",
    "contacts.branch_assignments.mode_global": "Global",
    "contacts.branch_assignments.mode_label": "Mode",
    "contacts.branch_assignments.mode_scoped": "Per branch",
    "contacts.branch_assignments.no_account_manager": "No manager",
    "contacts.branch_assignments.no_branch_context": "No branch context",
    "contacts.branch_assignments.no_code": "No code",
    "contacts.branch_assignments.no_custom_price_list": "No custom list",
    "contacts.branch_assignments.no_notes": "No notes",
    "contacts.branch_assignments.no_permission": "You don't have permission to manage branch assignments.",
    "contacts.branch_assignments.not_available": "N/A",
    "contacts.branch_assignments.notes": "Notes",
    "contacts.branch_assignments.preferred": "Preferred",
    "contacts.branch_assignments.preferred_description": "Marks this assignment as preferred when operating with the contact.",
    "contacts.branch_assignments.price_list_label": "Price list",
    "contacts.branch_assignments.purchases": "Purchases",
    "contacts.branch_assignments.purchases_enabled": "Purchases enabled",
    "contacts.branch_assignments.purchases_enabled_description": "Allows using this contact as a supplier in the branch.",
    "contacts.branch_assignments.reactivate": "Reactivate",
    "contacts.branch_assignments.sales": "Sales",
    "contacts.branch_assignments.sales_enabled": "Sales enabled",
    "contacts.branch_assignments.sales_enabled_description": "Allows using this contact as a customer in the branch.",
    "contacts.branch_assignments.save_changes": "Save changes",
    "contacts.branch_assignments.scoped_no_visible": "No assignments visible for the active branch.",
    "contacts.branch_assignments.select_branch": "Select a branch",
    "contacts.branch_assignments.status": "Status",
    "contacts.branch_assignments.unknown_branch": "Unknown branch",
    "contacts.branch_assignments.update_error": "Unable to update the assignment.",
    "contacts.form.active_contact": "Active contact",
    "contacts.form.active_contact_description": "Inactive records are kept for history without operational use.",
    "contacts.form.address": "Address",
    "contacts.form.address_placeholder": "Exact address and references",
    "contacts.form.canton": "Canton",
    "contacts.form.code": "Code",
    "contacts.form.commercial_name": "Commercial name",
    "contacts.form.commercial_name_placeholder": "Trading name",
    "contacts.form.district": "District",
    "contacts.form.document_number": "Document number",
    "contacts.form.economic_activity_code": "Economic activity code",
    "contacts.form.email": "Email",
    "contacts.form.exoneration_description": "Optional fields for special tax conditions.",
    "contacts.form.exoneration_percentage": "Exoneration percentage",
    "contacts.form.exoneration_title": "Exoneration",
    "contacts.form.exoneration_type": "Exoneration type",
    "contacts.form.general_description": "Main contact identity and operational state.",
    "contacts.form.general_title": "General information",
    "contacts.form.identification_description": "Fiscal identifiers and taxpayer metadata.",
    "contacts.form.identification_number": "Identification number",
    "contacts.form.identification_title": "Identification and tax",
    "contacts.form.identification_type": "Identification type",
    "contacts.form.institution": "Institution",
    "contacts.form.issue_date": "Issue date",
    "contacts.form.location_description": "Communication channels and geographic data.",
    "contacts.form.location_title": "Contact and location",
    "contacts.form.name": "Name",
    "contacts.form.name_placeholder": "Legal or personal name",
    "contacts.form.phone": "Phone",
    "contacts.form.province": "Province",
    "contacts.form.select_identification_type": "Select an identification type",
    "contacts.form.select_type": "Select a type",
    "contacts.form.tax_condition": "Tax condition",
    "contacts.form.type": "Type",
    "contacts.update_error_fallback": "Unable to update the contact.",
    "contacts.eyebrow": "Contact",
    "contacts.detail.back_to_list": "Back to contacts",
    "contacts.detail.loading": "Loading contact...",
    "contacts.detail.not_found_title": "Contact not found",
    "contacts.detail.not_found_description": "The requested contact was not found.",
    "contacts.detail.address_title": "Address",
    "contacts.detail.address_description": "Contact delivery location.",
    "contacts.detail.no_address": "No address registered.",
    "contacts.detail.map_title": "Map location",
    "contacts.detail.map_description": "Delivery coordinates.",
    "contacts.detail.no_location": "No location configured",
    "contacts.detail.no_location_hint": "Edit the contact to add coordinates.",
    "contacts.detail.exoneration_title": "Tax exoneration",
    "contacts.detail.exoneration_description": "Tax exoneration information.",
    "contacts.detail.metadata_title": "Record",
    "contacts.detail.metadata_description": "Record dates and data.",
    "contacts.detail.email_description": "Contact email",
    "contacts.detail.phone_description": "Contact number",
    "contacts.field.identification": "Identification",
    "contacts.field.email": "Email",
    "contacts.field.phone": "Phone",
    "contacts.field.economic_activity": "Economic activity",
    "contacts.field.address": "Address",
    "contacts.field.province": "Province",
    "contacts.field.canton": "Canton",
    "contacts.field.district": "District",
    "contacts.field.exoneration_type": "Exoneration type",
    "contacts.field.exoneration_document": "Document number",
    "contacts.field.exoneration_institution": "Institution",
    "contacts.field.exoneration_date": "Issue date",
    "contacts.field.exoneration_percentage": "Percentage",
    "contacts.field.latitude": "Latitude",
    "contacts.field.longitude": "Longitude",
    "contacts.detail.access_denied_title": "Access denied",
    "contacts.detail.access_denied_description": "You don't have permission to view contacts.",
    "contacts.detail.active": "Active",
    "contacts.detail.inactive": "Inactive",
    "contacts.detail.not_available": "N/A",
    "contacts.detail.created_at": "Created",
    "contacts.detail.updated_at": "Updated",
    "error.BRANCH_ACCESS_FORBIDDEN": "You do not have access to this branch.",
    "error.BRANCH_CONFIGURATION_PERMISSION_REQUIRED":
      "You do not have permission to edit the sensitive branch configuration.",
    "error.BRANCH_DELETE_FORBIDDEN":
      "This branch cannot be deleted because it still has operational dependencies.",
    "error.BRANCH_MANAGE_SCOPE_FORBIDDEN":
      "You do not have scope to manage this branch.",
    "error.BRANCH_NOT_FOUND": "Branch not found.",
    "error.CONTACT_CODE_DUPLICATE": "A contact with that code already exists.",
    "error.CONTACT_DELETE_FORBIDDEN":
      "This contact cannot be deleted because it still has operational history.",
    "error.CONTACT_IDENTIFICATION_DUPLICATE":
      "A contact with that identification already exists.",
    "error.CONTACT_BRANCH_ASSIGNMENT_NOT_FOUND":
      "The branch commercial assignment for this contact was not found.",
    "error.CONTACT_BRANCH_ASSIGNMENT_DUPLICATE":
      "A branch commercial assignment for this contact already exists in that branch.",
    "error.CONTACT_BRANCH_EXCLUSIVE_CONFLICT":
      "This contact already has another active exclusive branch assignment.",
    "error.CONTACT_ACCOUNT_MANAGER_BRANCH_SCOPE_INVALID":
      "The selected account manager does not have access to the target branch.",
    "error.CONTACT_LOOKUP_MULTIPLE":
      "The lookup returned multiple contacts for that identification.",
    "error.CONTACT_NOT_FOUND": "Contact not found.",
    "error.TERMINAL_NOT_FOUND": "Terminal not found.",
    "error.USER_CROSS_BUSINESS_MANAGEMENT_FORBIDDEN":
      "You cannot manage users outside your active business.",
    "error.USER_DELETE_FORBIDDEN":
      "This user cannot be deleted because it still has operational history or active dependencies.",
    "error.USER_EMAIL_DUPLICATE": "A user with that email already exists.",
    "error.USER_INVALID_BRANCHES_FOR_BUSINESS":
      "Some assigned branches do not belong to the current business.",
    "error.USER_INVALID_ROLES_FOR_BUSINESS":
      "Some assigned roles do not belong to the current business.",
    "error.USER_LAST_OWNER_DELETE_FORBIDDEN":
      "The last owner of the business cannot be deleted.",
    "error.USER_NOT_FOUND": "User not found.",
    "error.USER_OWNER_ASSIGNMENT_FORBIDDEN":
      "You do not have permission to assign ownership in this context.",
    "error.USER_OWNER_MANAGEMENT_FORBIDDEN":
      "You do not have permission to manage owner users.",
    "error.USER_PLATFORM_ADMIN_DELETE_FORBIDDEN":
      "Platform admin users cannot be deleted.",
    "error.USER_SELF_DELETE_FORBIDDEN": "You cannot delete your own user.",
    "error.USER_SYSTEM_MANAGEMENT_FORBIDDEN":
      "You do not have permission to manage system users.",
    "inventory.brand_create_error_fallback": "Unable to create the brand.",
    "inventory.brand_update_error_fallback": "Unable to update the brand.",
    "inventory.zone_create_error_fallback": "Unable to create the zone.",
    "inventory.zone_update_error_fallback": "Unable to update the zone.",
    "inventory.vehicle_create_error_fallback": "Unable to create the vehicle.",
    "inventory.vehicle_update_error_fallback": "Unable to update the vehicle.",
    "inventory.route_create_error_fallback": "Unable to create the route.",
    "inventory.route_update_error_fallback": "Unable to update the route.",
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
    "inventory.common.deactivate": "Deactivate",
    "inventory.common.reactivate": "Reactivate",
    "inventory.common.delete": "Delete",
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
    "inventory.entity.product_serial": "serial",
    "inventory.entity.product_serials": "serials",
    "inventory.entity.warranty_profile": "warranty profile",
    "inventory.entity.warranty_profiles": "warranty profiles",
    "inventory.entity.zone": "zone",
    "inventory.entity.zones": "zones",
    "inventory.entity.vehicle": "vehicle",
    "inventory.entity.vehicles": "vehicles",
    "inventory.entity.route": "route",
    "inventory.entity.routes": "routes",
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
    "inventory.form.plate_number": "Plate number",
    "inventory.form.vehicle_type": "Vehicle type",
    "inventory.form.max_weight_kg": "Max weight (kg)",
    "inventory.form.max_volume_m3": "Max volume (m3)",
    "inventory.form.estimated_cost": "Estimated cost",
    "inventory.form.frequency": "Frequency",
    "inventory.form.day_of_week": "Day of week",
    "inventory.form.default_vehicle": "Default vehicle",
    "inventory.form.default_driver": "Default driver",
    "inventory.form.select_zone": "Select zone",
    "inventory.form.no_zone": "No zone",
    "inventory.form.select_vehicle": "Select vehicle",
    "inventory.form.no_vehicle": "No vehicle",
    "inventory.form.active_zone": "Active zone",
    "inventory.zones.detail.access_denied_title": "Access denied",
    "inventory.zones.detail.access_denied_description": "You don't have permission to view zones.",
    "inventory.zones.detail.loading": "Loading zone...",
    "inventory.zones.detail.not_found_title": "Zone not found",
    "inventory.zones.detail.not_found_description": "The requested zone was not found.",
    "inventory.zones.detail.back_to_list": "Back to zones",
    "inventory.zones.detail.global": "Global",
    "inventory.zones.detail.scoped": "Per branch",
    "inventory.zones.detail.province": "Province",
    "inventory.zones.detail.canton": "Canton",
    "inventory.zones.detail.district": "District",
    "inventory.zones.detail.branches_count": "Branches",
    "inventory.zones.detail.branches_assigned": "Branches assigned to this zone.",
    "inventory.zones.detail.summary_title": "Summary",
    "inventory.zones.detail.summary_description": "Main zone information.",
    "inventory.zones.detail.scope": "Scope",
    "inventory.zones.detail.map_title": "Map location",
    "inventory.zones.detail.map_description": "Geographic boundary of the zone.",
    "inventory.zones.detail.no_location": "No location configured",
    "inventory.zones.detail.no_location_hint": "Edit the zone to set the map boundary.",
    "inventory.zones.detail.branches_title": "Assigned branches",
    "inventory.zones.detail.branches_description": "Branches operating with this zone.",
    "inventory.zones.detail.no_branches": "No branches assigned.",
    "inventory.form.active_zone_description": "Inactive zones are kept for history without being used operationally.",
    "inventory.form.active_vehicle": "Active vehicle",
    "inventory.form.active_vehicle_description": "Inactive vehicles are kept for history without being used operationally.",
    "inventory.form.active_route": "Active route",
    "inventory.form.active_route_description": "Inactive routes are kept for history without being used operationally.",
    "inventory.form.province": "Province",
    "inventory.form.canton": "Canton",
    "inventory.form.district": "District",
    "inventory.brands.delete_title": "Delete brand",
    "inventory.brands.delete_description":
      "The brand \"{name}\" will be permanently deleted. This is only possible if no product currently uses it.",
    "inventory.brands.dialog_description":
      "Maintain the brand catalog using the current backend inventory contract.",
    "inventory.brands.section_description":
      "Commercial brand catalog used later by products and pricing.",
    "inventory.zones.province": "Province",
    "inventory.zones.canton": "Canton",
    "inventory.zones.district": "District",
    "inventory.zones.location": "Location",
    "inventory.vehicles.plate_number": "Plate number",
    "inventory.vehicles.vehicle_type": "Vehicle type",
    "inventory.vehicles.max_weight_kg": "Max weight (kg)",
    "inventory.vehicles.max_volume_m3": "Max volume (m3)",
    "inventory.vehicles.capacity": "Capacity",
    "inventory.vehicles.notes": "Notes",
    "inventory.vehicles.notes_placeholder": "Additional notes about the vehicle",
    "inventory.vehicles.name_placeholder": "Vehicle name",
    "inventory.vehicles.select_vehicle_type": "Select a type",
    "inventory.vehicles.type_truck": "Truck",
    "inventory.vehicles.type_van": "Van",
    "inventory.vehicles.type_pickup": "Pickup",
    "inventory.vehicles.type_motorcycle": "Motorcycle",
    "inventory.vehicles.type_bicycle": "Bicycle",
    "inventory.vehicles.type_car": "Car",
    "inventory.vehicles.type_other": "Other",
    "inventory.routes.zone": "Zone",
    "inventory.routes.select_zone": "Select zone",
    "inventory.routes.no_zone": "No zone",
    "inventory.routes.default_vehicle": "Default vehicle",
    "inventory.routes.select_vehicle": "Select vehicle",
    "inventory.routes.no_vehicle": "No vehicle",
    "inventory.routes.default_driver_user_id": "Default driver user ID",
    "inventory.routes.estimated_cost": "Estimated cost",
    "inventory.routes.frequency": "Frequency",
    "inventory.routes.day_of_week": "Day of week",
    "inventory.zones.delete_title": "Delete zone",
    "inventory.zones.delete_description":
      "The zone \"{name}\" will be permanently deleted.",
    "inventory.zones.dialog_description":
      "Manage geographic delivery zones and logistics coverage areas.",
    "inventory.zones.section_description":
      "Geographic zones used by routes and dispatch orders.",
    "inventory.vehicles.delete_title": "Delete vehicle",
    "inventory.vehicles.delete_description":
      "The vehicle \"{name}\" will be permanently deleted.",
    "inventory.vehicles.dialog_description":
      "Manage vehicles available for dispatch and logistics.",
    "inventory.vehicles.section_description":
      "Fleet of vehicles used in routes and dispatch orders.",
    "inventory.routes.delete_title": "Delete route",
    "inventory.routes.delete_description":
      "The route \"{name}\" will be permanently deleted.",
    "inventory.routes.dialog_description":
      "Manage delivery routes and their logistics configuration.",
    "inventory.routes.section_description":
      "Delivery routes with default zone, vehicle, and driver.",
    "inventory.categories.delete_title": "Delete category",
    "inventory.categories.delete_description":
      "The category \"{name}\" will be permanently deleted. This is only possible if it has no subcategories and no products assigned.",
    "inventory.categories.dialog_description":
      "Maintain the product category hierarchy used by inventory.",
    "inventory.categories.section_description":
      "Hierarchical classification for products and future inventory analytics.",
    "inventory.measurement_units.delete_title": "Delete measurement unit",
    "inventory.measurement_units.delete_description":
      "The unit \"{name}\" will be permanently deleted. This is only possible if no product or variant uses it.",
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
    "inventory.detail.map_title": "Map location",
    "inventory.detail.map_description": "Geographic location.",
    "inventory.detail.no_location": "No location configured",
    "inventory.detail.no_location_hint": "Edit the record to add map coordinates.",
    "inventory.dispatch.legend": "Legend",
    "inventory.dispatch.legend_pending": "Pending",
    "inventory.dispatch.legend_in_transit": "In transit",
    "inventory.dispatch.legend_delivered": "Delivered",
    "inventory.dispatch.legend_failed": "Failed",
    "inventory.dispatch.legend_skipped": "Skipped",
    "inventory.dispatch.legend_warehouse": "Origin warehouse",
    "inventory.dispatch.legend_zone": "Zone (area)",
    "inventory.dispatch.stops_label": "stop(s)",
    "inventory.dispatch.stops_no_location": "no location",
    "inventory.dispatch.warehouse_no_location": "warehouse has no location",
    "inventory.dispatch.no_origin_warehouse": "no origin warehouse",
    "inventory.dispatch.no_locations": "No locations on the map",
    "inventory.dispatch.no_locations_hint": "Stops will appear here when they have coordinates",
    "inventory.dispatch.command_center": "Command Center",
    "inventory.dispatch.pending_orders": "Pending",
    "inventory.dispatch.pending_count": "{{count}} pending",
    "inventory.dispatch.dispatches_today": "Dispatches today",
    "inventory.dispatch.in_route": "In route",
    "inventory.dispatch.completed": "Completed",
    "inventory.dispatch.no_dispatch_orders": "No dispatches",
    "inventory.dispatch.all_statuses": "All statuses",
    "inventory.dispatch.edit": "Edit",
    "inventory.dispatch.no_pending_orders": "No pending dispatch orders",
    "inventory.dispatch.select_dispatch": "Select a dispatch to view details",
    "inventory.dispatch.assign_to": "Assign to...",
    "inventory.dispatch.create_dispatch_with_selected": "Create dispatch with selected",
    "inventory.dispatch.assign_selected": "Assign {{count}} selected",
    "inventory.dispatch.to_existing_dispatch": "To existing dispatch...",
    "inventory.dispatch.to_new_dispatch": "Create new dispatch",
    "inventory.dispatch.stops_count": "{{count}} stop(s)",
    "inventory.dispatch.no_vehicle": "No vehicle",
    "inventory.dispatch.no_driver": "No driver",
    "inventory.dispatch.today_badge": "Today",
    "inventory.dispatch.overdue_badge": "Overdue",
    "inventory.dispatch.groupable_badge": "Groupable",
    "inventory.dispatch.reorder_stops": "Drag to reorder",
    "inventory.dispatch.add_stop": "Add stop",
    "inventory.dispatch.suggestion_group_zone": "Orders groupable by zone",
    "inventory.dispatch.suggestion_group_detail": "{{count}} orders in zone {{zone}} can be grouped into a dispatch",
    "inventory.dispatch.suggestion_select": "Select {{count}} orders",
    "inventory.dispatch.view_full_detail": "View full detail",
    "inventory.dispatch.dispatch_detail": "Dispatch detail",
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
    "inventory.detail.price_list_public_contract_note":
      "The official route still exposes prices at product level. If a row includes a variant, treat it as an optional refinement inside the same public contract.",
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
    "inventory.price_lists.delete_title": "Delete price list",
    "inventory.price_lists.delete_description":
      "The price list \"{name}\" and all its associated prices will be permanently deleted. This action cannot be undone.",
    "inventory.price_lists.dialog_description":
      "Define commercial price list policies before assigning prices to products.",
    "inventory.price_lists.section_description":
      "Commercial price list policies used later by product prices and promotions.",
    "inventory.product_prices.delete_title": "Delete price",
    "inventory.product_prices.delete_description":
      "The selected price will be permanently deleted.",
    "inventory.product_prices.dialog_description":
      "Manage prices for product {product} across the available price lists.",
    "inventory.product_prices.no_product_selected":
      "Select a product to review or register prices.",
    "inventory.product_prices.no_products_available":
      "No products are available to attach prices yet.",
    "inventory.product_prices.section_description":
      "Product prices per list, minimum quantity and validity range. A variant only refines the row when the backend returns it.",
    "inventory.product_prices.public_contract_note":
      "The public pricing contract remains product-level. A variant is optional and only refines a specific row when applicable.",
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
    "inventory.price_list_branch_assignment_create_error_fallback":
      "Unable to create the price list branch assignment.",
    "inventory.price_list_branch_assignment_update_error_fallback":
      "Unable to update the price list branch assignment.",
    "inventory.price_list_branch_assignment_delete_error_fallback":
      "Unable to delete the price list branch assignment.",
    "inventory.price_list_branch_assignments.section_title": "Branches",
    "inventory.price_list_branch_assignments.section_description":
      "Define which branches can use this global list and which one keeps it as default.",
    "inventory.price_list_branch_assignments.active_hint":
      "Keeps this price list enabled for the selected branch.",
    "inventory.price_list_branch_assignments.default_hint":
      "The backend normalizes the default list per branch.",
    "inventory.price_list_branch_assignments.create_title":
      "Add branch assignment",
    "inventory.price_list_branch_assignments.edit_title":
      "Edit branch assignment",
    "inventory.price_list_branch_assignments.dialog_description":
      "Enable this global list for a branch and optionally mark it as that branch default.",
    "inventory.price_list_branch_assignments.create_action":
      "Add assignment",
    "inventory.price_list_branch_assignments.load_error":
      "Unable to load branch assignments for this price list.",
    "inventory.price_list_branch_assignments.loading":
      "Loading branch assignments.",
    "inventory.price_list_branch_assignments.count": "{count} assignment(s)",
    "inventory.price_list_branch_assignments.default_count":
      "{count} default branch(es)",
    "inventory.price_list_branch_assignments.branch_access_hint":
      "Branch options require `branches.view` in the current session.",
    "inventory.price_list_branch_assignments.empty":
      "This price list is still global and has no explicit branch assignments yet.",
    "inventory.price_list_branch_assignments.delete_title":
      "Delete branch assignment",
    "inventory.price_list_branch_assignments.delete_description":
      "This will permanently remove the branch assignment for {branch}.",
    "inventory.price_list_branch_assignments.reactivate_title":
      "Reactivate branch assignment",
    "inventory.price_list_branch_assignments.reactivate_description":
      "This branch assignment will become active again for {branch}.",
    "inventory.price_list_branch_assignments.deactivate_title":
      "Deactivate branch assignment",
    "inventory.price_list_branch_assignments.deactivate_description":
      "This branch assignment will become inactive for {branch}.",
    "inventory.promotion_create_error_fallback":
      "Unable to create the promotion.",
    "inventory.promotion_update_error_fallback":
      "Unable to update the promotion.",
    "inventory.promotion_branch_assignment_create_error_fallback":
      "Unable to create the promotion branch assignment.",
    "inventory.promotion_branch_assignment_update_error_fallback":
      "Unable to update the promotion branch assignment.",
    "inventory.promotion_branch_assignment_delete_error_fallback":
      "Unable to delete the promotion branch assignment.",
    "inventory.promotion_branch_assignments.manage_action": "Branches",
    "inventory.promotion_branch_assignments.section_title": "Branches",
    "inventory.promotion_branch_assignments.section_description":
      "Define where the global promotion {promotion} applies. This layer only scopes branch applicability; it does not resolve the final commercial engine.",
    "inventory.promotion_branch_assignments.permission_hint":
      "You do not have permission to review branch assignments for this promotion.",
    "inventory.promotion_branch_assignments.create_title":
      "Add branch assignment",
    "inventory.promotion_branch_assignments.edit_title":
      "Edit branch assignment",
    "inventory.promotion_branch_assignments.dialog_description":
      "Activate or deactivate the applicability of this promotion in a specific branch.",
    "inventory.promotion_branch_assignments.create_action":
      "Add assignment",
    "inventory.promotion_branch_assignments.load_error":
      "Unable to load branch assignments for this promotion.",
    "inventory.promotion_branch_assignments.loading":
      "Loading branch assignments.",
    "inventory.promotion_branch_assignments.count": "{count} assignment(s)",
    "inventory.promotion_branch_assignments.active_hint":
      "Keeps this promotion available for the selected branch.",
    "inventory.promotion_branch_assignments.branch_access_hint":
      "Branch options require `branches.view` in the current session.",
    "inventory.promotion_branch_assignments.empty":
      "This promotion does not have explicit branch assignments yet.",
    "inventory.promotion_branch_assignments.delete_title":
      "Delete branch assignment",
    "inventory.promotion_branch_assignments.delete_description":
      "This will permanently remove the promotion branch assignment for {branch}.",
    "inventory.promotion_branch_assignments.reactivate_title":
      "Reactivate branch assignment",
    "inventory.promotion_branch_assignments.reactivate_description":
      "This branch assignment will become active again for {branch}.",
    "inventory.promotion_branch_assignments.deactivate_title":
      "Deactivate branch assignment",
    "inventory.promotion_branch_assignments.deactivate_description":
      "This branch assignment will become inactive for {branch}.",
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
    "inventory.promotions.delete_title": "Delete promotion",
    "inventory.promotions.delete_description":
      "The promotion \"{name}\" and all its items will be permanently deleted.",
    "inventory.promotions.section_description":
      "Promotional campaigns with product rules and validity windows.",
    "inventory.products.deactivate_title": "Deactivate product",
    "inventory.products.deactivate_description":
      "The product \"{name}\" will be deactivated. It will not be available for new inventory operations. Historical data will not be affected.",
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
    "inventory.warehouses.deactivate_title": "Deactivate warehouse",
    "inventory.warehouses.deactivate_description":
      "The warehouse \"{name}\" will be deactivated. It will not be available for new inventory operations. Historical data will not be affected.",
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
    "inventory.inventory_lots.deactivate_title": "Deactivate lot",
    "inventory.inventory_lots.deactivate_description":
      "The lot \"{lot_number}\" will be deactivated. It will not be available for new operations. Historical data will not be affected.",
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
    "inventory.inventory_movements.managed_badge": "Auto",
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
    "inventory.movement_managed_by_document":
      "This movement is automatically managed. To reverse it, cancel the associated sale or dispatch order.",
    "inventory.dispatch_order_has_delivered_stops":
      "Cannot cancel a dispatch order that has delivered stops.",
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
    "inventory.variant_deactivate_error_fallback":
      "Unable to deactivate the variant.",
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
    "inventory.variants.deactivate": "Deactivate",
    "inventory.variants.deactivate_title": "Deactivate variant",
    "inventory.variants.deactivate_description":
      "The variant \"{name}\" will be deactivated. It will not be available for new inventory operations. Historical data will not be affected.",
    "inventory.variants.deactivate_confirm": "Deactivate",
    "inventory.variants.delete_title": "Permanently delete variant",
    "inventory.variants.delete_description":
      "The variant \"{name}\" will be permanently deleted. Use this action only when lifecycle explicitly allows it.",
    "inventory.variants.delete_confirm": "Delete permanently",
    "inventory.variants.generate_confirm_title": "Generate variants",
    "inventory.variants.generate_confirm_description":
      "New attribute combinations that do not yet exist as variants will be created. Existing variants will not be modified or removed.",
    "inventory.variants.generate_confirm_action": "Generate new combinations",
    "inventory.variants.tracking": "Tracking",
    "inventory.variants.flag_inventory": "Inventory",
    "inventory.variants.flag_lots": "Lots",
    "inventory.variants.flag_serials": "Serials",
    "inventory.form.variant_name": "Variant name",
    "inventory.form.variant_name_placeholder": "e.g. Black - 128GB",
    "inventory.form.track_serials": "Track serials",
    "inventory.warranty_profiles.delete_title": "Delete warranty profile",
    "inventory.warranty_profiles.delete_description":
      "The profile \"{name}\" will be permanently deleted. This is only possible if no product or variant references it.",
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
    "inventory.enum.ledger_movement_type.dispatch_cancelled": "Dispatch cancelled",
    "inventory.enum.ledger_movement_type.dispatch_return": "Dispatch return",
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
    "inventory.enum.serial_status.available": "Available",
    "inventory.enum.serial_status.defective": "Defective",
    "inventory.enum.serial_status.reserved": "Reserved",
    "inventory.enum.serial_status.returned": "Returned",
    "inventory.enum.serial_status.sold": "Sold",
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
    "inventory.delete_error_fallback": "Unable to delete the item.",
    "inventory.brand_delete_error_fallback": "Unable to delete the brand.",
    "inventory.category_delete_error_fallback": "Unable to delete the category.",
    "inventory.measurement_unit_delete_error_fallback":
      "Unable to delete the measurement unit.",
    "inventory.warranty_profile_delete_error_fallback":
      "Unable to delete the warranty profile.",
    "inventory.price_list_delete_error_fallback": "Unable to delete the price list.",
    "inventory.product_price_delete_error_fallback": "Unable to delete the product price.",
    "inventory.promotion_delete_error_fallback": "Unable to delete the promotion.",
    "inventory.zone_delete_error_fallback": "Unable to delete the zone.",
    "inventory.vehicle_delete_error_fallback": "Unable to delete the vehicle.",
    "inventory.route_delete_error_fallback": "Unable to delete the route.",
    "inventory.product_deactivate_error_fallback": "Unable to deactivate the product.",
    "inventory.warehouse_deactivate_error_fallback": "Unable to deactivate the warehouse.",
    "inventory.inventory_lot_deactivate_error_fallback":
      "Unable to deactivate the inventory lot.",
    "inventory.brand_deactivate_error_fallback": "Unable to deactivate the brand.",
    "inventory.category_deactivate_error_fallback": "Unable to deactivate the category.",
    "inventory.measurement_unit_deactivate_error_fallback":
      "Unable to deactivate the measurement unit.",
    "inventory.tax_profile_deactivate_error_fallback":
      "Unable to deactivate the tax profile.",
    "inventory.price_list_deactivate_error_fallback":
      "Unable to deactivate the price list.",
    "inventory.error.BRAND_IN_USE": "The brand is being used by one or more products.",
    "inventory.error.CATEGORY_HAS_CHILDREN":
      "The category has subcategories. Delete them first.",
    "inventory.error.CATEGORY_IN_USE":
      "The category is being used by one or more products.",
    "inventory.error.MEASUREMENT_UNIT_IN_USE":
      "The measurement unit is being used by one or more products or variants.",
    "inventory.error.WARRANTY_PROFILE_IN_USE":
      "The warranty profile is being used by one or more products or variants.",
    "inventory.error.CANNOT_DELETE_DEFAULT_PRICE_LIST":
      "The default price list cannot be deleted.",
    "inventory.form.track_serials_description":
      "Allows unit-by-unit serial operations when supported by the backend.",
    "inventory.form.origin_location": "Origin location",
    "inventory.form.destination_location": "Destination location",
    "inventory.form.serial_ids": "Serial IDs",
    "inventory.form.serial_ids_placeholder": "Example: 101, 102, 103",
    "inventory.form.reserved_delta": "Reserved delta",
    "inventory.form.incoming_delta": "Incoming delta",
    "inventory.form.outgoing_delta": "Outgoing delta",
    "inventory.serials.section_description":
      "Review, register and update serials for the selected operational variant.",
    "inventory.serials.kpi_total": "Serials",
    "inventory.serials.kpi_total_description":
      "Total serials visible with the active filters.",
    "inventory.serials.kpi_available_description":
      "Available serials for the selected variant and active filters.",
    "inventory.serials.kpi_reserved_description":
      "Serials currently reserved for the selected variant.",
    "inventory.serials.kpi_sold_description":
      "Serials already sold for the selected variant.",
    "inventory.serials.status_filter": "Status",
    "inventory.serials.all_statuses": "All statuses",
    "inventory.serials.warehouse_filter": "Warehouse",
    "inventory.serials.all_warehouses": "All warehouses",
    "inventory.serials.register_action": "Register serials",
    "inventory.serials.inactive_variant_hint":
      "The product or operational variant is inactive. You can review existing serials, but you cannot register or update statuses from this view.",
    "inventory.serials.register_no_stock_hint":
      "Registering serials does not increase stock automatically. This flow only creates serials using the official backend contract.",
    "inventory.serials.select_origin_warehouse_hint":
      "Select an origin warehouse to see available serials.",
    "inventory.serials.no_available_serials":
      "No available serials in the origin warehouse for this variant.",
    "inventory.serials.selected_count": "{count} serial(s) selected",
    "inventory.serials.no_serials":
      "There are no serials for the selected variant with the current filters.",
    "inventory.serials.register_dialog_title": "Register serials",
    "inventory.serials.register_dialog_description":
      "Add serials for {variant} using the confirmed official contract.",
    "inventory.serials.serial_numbers": "Serial numbers",
    "inventory.serials.serial_numbers_placeholder":
      "One per line or separated by commas",
    "inventory.serials.register_hint":
      "You can paste multiple serials. They will be sent exactly as serial_numbers.",
    "inventory.serials.update_status_action": "Update status",
    "inventory.serials.update_status_title": "Update serial status",
    "inventory.serials.update_status_description":
      "Update the operational status of {serial}.",
    "inventory.serials.received_at": "Received",
    "inventory.serials.sold_at": "Sold",
    "inventory.detail.source_document": "Source document",
    "inventory.detail.source_document_number": "Document number",
    "inventory.detail.transferred_serial_ids": "Transferred serials",
    "inventory.detail.legacy_reference": "Legacy",
    "inventory.product_serial_create_error_fallback":
      "Unable to register the serials.",
    "inventory.product_serial_update_error_fallback":
      "Unable to update the serial status.",
    "inventory.variant_delete_error_fallback":
      "Unable to permanently delete the variant.",
    "inventory.error.PRODUCT_NOT_FOUND": "Product not found.",
    "inventory.error.PRODUCT_VARIANT_NOT_FOUND": "Product variant not found.",
    "inventory.error.WAREHOUSE_NOT_FOUND": "Warehouse not found.",
    "inventory.error.WAREHOUSE_LOCATION_NOT_FOUND": "Warehouse location not found.",
    "inventory.error.INVENTORY_LOT_NOT_FOUND": "Inventory lot not found.",
    "inventory.error.SERIAL_NOT_FOUND": "Serial not found.",
    "inventory.error.PRICE_LIST_NOT_FOUND": "Price list not found.",
    "inventory.error.PRODUCT_PRICE_NOT_FOUND": "Product price not found.",
    "inventory.error.PROMOTION_NOT_FOUND": "Promotion not found.",
    "inventory.error.BRAND_NOT_FOUND": "Brand not found.",
    "inventory.error.CATEGORY_NOT_FOUND": "Category not found.",
    "inventory.error.MEASUREMENT_UNIT_NOT_FOUND": "Measurement unit not found.",
    "inventory.error.TAX_PROFILE_NOT_FOUND": "Tax profile not found.",
    "inventory.error.WARRANTY_PROFILE_NOT_FOUND": "Warranty profile not found.",
    "inventory.error.BRANCH_NOT_FOUND": "Branch not found.",
    "inventory.error.PRODUCT_INACTIVE": "The product is inactive.",
    "inventory.error.VARIANT_INACTIVE": "The variant is inactive.",
    "inventory.error.WAREHOUSE_INACTIVE": "The warehouse is inactive.",
    "inventory.error.WAREHOUSE_LOCATION_INACTIVE":
      "The warehouse location is inactive.",
    "inventory.error.INVENTORY_LOT_INACTIVE": "The inventory lot is inactive.",
    "inventory.error.PRICE_LIST_INACTIVE": "The price list is inactive.",
    "inventory.error.BRAND_INACTIVE": "The brand is inactive.",
    "inventory.error.CATEGORY_INACTIVE": "The category is inactive.",
    "inventory.error.MEASUREMENT_UNIT_INACTIVE":
      "The measurement unit is inactive.",
    "inventory.error.TAX_PROFILE_INACTIVE": "The tax profile is inactive.",
    "inventory.error.WARRANTY_PROFILE_INACTIVE":
      "The warranty profile is inactive.",
    "inventory.error.PRODUCT_OR_VARIANT_REQUIRED":
      "You must select a product or a variant.",
    "inventory.error.VARIANT_REQUIRED_FOR_MULTI_VARIANT_PRODUCT":
      "A variant is required for multi-variant products.",
    "inventory.error.VARIANT_PRODUCT_MISMATCH":
      "The selected variant does not belong to the selected product.",
    "inventory.error.PRODUCT_DOES_NOT_SUPPORT_VARIANTS":
      "The selected product does not support variants.",
    "inventory.error.CANNOT_EDIT_DEFAULT_VARIANT_OF_SIMPLE_PRODUCT":
      "The default variant of a simple product cannot be edited.",
    "inventory.error.CANNOT_DEACTIVATE_DEFAULT_VARIANT":
      "The default variant cannot be deactivated.",
    "inventory.error.CANNOT_DEACTIVATE_LAST_ACTIVE_VARIANT":
      "The last active variant cannot be deactivated.",
    "inventory.error.PRODUCT_SKU_DUPLICATE": "The product SKU already exists.",
    "inventory.error.PRODUCT_BARCODE_DUPLICATE":
      "The product barcode already exists.",
    "inventory.error.VARIANT_SKU_DUPLICATE": "The variant SKU already exists.",
    "inventory.error.VARIANT_BARCODE_DUPLICATE":
      "The variant barcode already exists.",
    "inventory.error.PRODUCT_VARIANT_DELETE_FORBIDDEN":
      "The variant cannot be permanently deleted in its current state.",
    "inventory.error.PRODUCT_INVENTORY_TRACKING_REQUIRED":
      "The product must track inventory for this operation.",
    "inventory.error.VARIANT_INVENTORY_TRACKING_REQUIRED":
      "The variant must track inventory for this operation.",
    "inventory.error.PRODUCT_LOT_TRACKING_REQUIRED":
      "The product must track lots for this operation.",
    "inventory.error.PRODUCT_LOT_TRACKING_REQUIRES_INVENTORY":
      "Product lot tracking requires inventory tracking.",
    "inventory.error.PRODUCT_EXPIRATION_REQUIRES_LOTS":
      "Product expiration tracking requires lot tracking.",
    "inventory.error.VARIANT_LOT_TRACKING_REQUIRES_INVENTORY":
      "Variant lot tracking requires inventory tracking.",
    "inventory.error.VARIANT_EXPIRATION_REQUIRES_LOTS":
      "Variant expiration tracking requires lot tracking.",
    "inventory.error.VARIANT_SERIAL_TRACKING_REQUIRES_INVENTORY":
      "Variant serial tracking requires inventory tracking.",
    "inventory.error.PRODUCT_WARRANTY_PROFILE_REQUIRED":
      "A warranty profile is required for the product.",
    "inventory.error.PRODUCT_UNIT_CONVERSION_NOT_SUPPORTED":
      "Unit conversion is not supported in this phase.",
    "inventory.error.PRODUCT_TAX_PROFILE_ITEM_KIND_INVALID":
      "The tax profile does not match the product item kind.",
    "inventory.error.INVENTORY_LOT_REQUIRED": "An inventory lot is required.",
    "inventory.error.INVENTORY_LOT_NUMBER_DUPLICATE":
      "The inventory lot number already exists.",
    "inventory.error.INVENTORY_LOT_EXPIRATION_REQUIRED":
      "Expiration date is required for this lot.",
    "inventory.error.INVENTORY_LOT_WAREHOUSE_MISMATCH":
      "The inventory lot does not belong to the selected warehouse.",
    "inventory.error.INVENTORY_LOT_PRODUCT_MISMATCH":
      "The inventory lot does not belong to the selected product.",
    "inventory.error.INVENTORY_LOT_VARIANT_MISMATCH":
      "The inventory lot does not belong to the selected variant.",
    "inventory.error.INVENTORY_LOT_LOCATION_MISMATCH":
      "The inventory lot does not belong to the selected location.",
    "inventory.error.INVENTORY_NEGATIVE_STOCK_FORBIDDEN":
      "The operation would leave inventory negative and that is not allowed.",
    "inventory.error.INVENTORY_LOT_NEGATIVE_BALANCE_FORBIDDEN":
      "The operation would leave the lot with a negative balance.",
    "inventory.error.INSUFFICIENT_STOCK":
      "There is not enough stock to complete the operation.",
    "inventory.error.TRANSFER_WAREHOUSE_DUPLICATE":
      "Origin and destination warehouses must be different.",
    "inventory.error.WAREHOUSE_LOCATION_MISMATCH":
      "The location does not belong to the selected warehouse.",
    "inventory.error.WAREHOUSE_NOT_ALLOWED_FOR_BRANCH":
      "The warehouse does not belong to the active branch.",
    "inventory.error.TENANT_MISMATCH":
      "The resource does not belong to the current operational tenant.",
    "inventory.error.INVENTORY_MOVEMENT_NOT_FOUND": "Inventory movement not found.",
    "inventory.error.INVENTORY_MOVEMENT_ALREADY_CANCELLED":
      "The inventory movement has already been cancelled.",
    "inventory.error.INVENTORY_MOVEMENT_POSTED_REQUIRED":
      "This action requires a movement in posted status.",
    "inventory.error.INVENTORY_MOVEMENT_LINES_REQUIRED":
      "The movement must include at least one line.",
    "inventory.error.INVENTORY_MOVEMENT_RELATION_MISSING":
      "The movement is missing required operational relations.",
    "inventory.error.SERIAL_NUMBERS_REQUIRED":
      "You must send at least one serial number.",
    "inventory.error.SERIAL_NUMBER_DUPLICATE":
      "One or more serial numbers already exist.",
    "inventory.error.VARIANT_SERIAL_TRACKING_DISABLED":
      "Serial tracking is disabled for the selected variant.",
    "inventory.error.SERIALS_REQUIRED_FOR_SERIAL_TRACKED_VARIANT":
      "Serials are required for this serial-tracked variant.",
    "inventory.error.SERIAL_TRANSFER_INTEGER_QUANTITY_REQUIRED":
      "Quantity must be an integer when the variant uses serials.",
    "inventory.error.SERIAL_TRANSFER_QUANTITY_MISMATCH":
      "Quantity must match the amount of serials sent.",
    "inventory.error.SERIAL_VARIANT_MISMATCH":
      "One or more serials do not belong to the selected variant.",
    "inventory.error.SERIAL_WAREHOUSE_MISMATCH":
      "One or more serials do not belong to the origin warehouse.",
    "inventory.error.SERIAL_STATUS_NOT_TRANSFERABLE":
      "One or more serials are not in a transferable status.",
    "inventory.error.SERIALS_OUTSIDE_BUSINESS":
      "One or more serials do not belong to the active business.",
    "inventory.error.PRICE_LIST_NAME_DUPLICATE":
      "A price list with that name already exists.",
    "inventory.error.BRANCH_PRICE_LIST_ASSIGNMENT_NOT_FOUND":
      "This price list branch assignment was not found.",
    "inventory.error.BRANCH_PRICE_LIST_ASSIGNMENT_DUPLICATE":
      "This price list already has an assignment for the target branch.",
    "inventory.error.BRANCH_PRICE_LIST_DEFAULT_REQUIRES_ACTIVE_ASSIGNMENT":
      "A branch default price list requires an active assignment.",
    "inventory.error.PRICE_VALID_RANGE_INVALID":
      "The price validity range is invalid.",
    "inventory.error.PROMOTION_NAME_DUPLICATE":
      "A promotion with that name already exists.",
    "inventory.error.PROMOTION_INACTIVE":
      "The promotion is inactive.",
    "inventory.error.BRANCH_PROMOTION_ASSIGNMENT_NOT_FOUND":
      "This promotion branch assignment was not found.",
    "inventory.error.BRANCH_PROMOTION_ASSIGNMENT_DUPLICATE":
      "This promotion already has an assignment for the target branch.",
    "inventory.error.PROMOTION_PRODUCT_OR_VARIANT_REQUIRED":
      "Each promotion item requires a product or a variant.",
    "inventory.error.PROMOTION_DUPLICATE_ITEMS":
      "You cannot repeat the same product or variant in the promotion.",
    "inventory.error.PROMOTION_ITEMS_OUTSIDE_BUSINESS":
      "The promotion includes items outside the active business.",
    "inventory.error.PROMOTION_DISCOUNT_VALUE_REQUIRED":
      "Discount value is required for this promotion.",
    "inventory.error.PROMOTION_OVERRIDE_PRICE_REQUIRED":
      "Override price is required for this promotion.",
    "inventory.error.PROMOTION_BUY_X_GET_Y_FIELDS_REQUIRED":
      "Min quantity and bonus quantity are required for this promotion.",
    "inventory.error.PROMOTION_DATE_RANGE_INVALID":
      "The promotion date range is invalid.",
    "sales.entity.sale_order": "Sale Order",
    "sales.entity.sale_orders": "Sale Orders",
    "sales.section_description": "Manage sale orders.",
    "sales.dialog_description":
      "Fill in the fields for the sale order.",
    "sales.detail_description":
      "Sale order detail.",
    "sales.lines": "Lines",
    "sales.no_lines": "No lines in this order.",
    "sales.subtotal": "Subtotal",
    "sales.delivery_charges": "Delivery charges",
    "sales.delivery_address": "Delivery address",
    "sales.delivery_location": "Delivery location",
    "sales.use_contact_location": "Use customer location",
    "sales.delivery_zone": "Delivery zone",
    "sales.delivery_requested_date": "Requested delivery date",
    "sales.order_date": "Order date",
    "sales.sale_mode": "Sale mode",
    "sales.branch": "Branch",
    "sales.seller": "Seller",
    "sales.warehouse": "Warehouse",
    "sales.created_by": "Created by",
    "sales.mode_branch_direct": "Branch direct sale",
    "sales.mode_seller_attributed": "Seller attributed",
    "sales.mode_seller_route": "Seller route",
    "sales.order_create_error_fallback":
      "Error creating the sale order.",
    "sales.order_update_error_fallback":
      "Error updating the sale order.",
    "sales.order_confirm_error_fallback":
      "Error confirming the sale order.",
    "sales.order_cancel_error_fallback":
      "Error cancelling the sale order.",
    "sales.order_delete_error_fallback":
      "Error deleting the sale order.",
    "sales.confirm_title": "Confirm order",
    "sales.confirm_description":
      "Confirm order {{code}}? This action cannot be undone.",
    "sales.cancel_title": "Cancel order",
    "sales.cancel_description": "Cancel order {{code}}?",
    "sales.delete_title": "Delete order",
    "sales.delete_description":
      "Delete order {{code}}? This action cannot be undone.",
    "sales.order_date": "Date",
    "sales.customer": "Customer",
    "sales.status": "Status",
    "sales.fulfillment": "Fulfillment",
    "sales.dispatch_status": "Dispatch",
    "sales.total": "Total",
    "sales.status_draft": "Draft",
    "sales.status_confirmed": "Confirmed",
    "sales.status_cancelled": "Cancelled",
    "sales.fulfillment_pickup": "Pickup",
    "sales.fulfillment_delivery": "Delivery",
    "sales.dispatch_not_required": "Not required",
    "sales.dispatch_pending": "Pending",
    "sales.dispatch_assigned": "Assigned",
    "sales.dispatch_out_for_delivery": "Out for delivery",
    "sales.dispatch_delivered": "Delivered",
    "sales.dispatch_partial": "Partial",
    "sales.dispatch_failed": "Failed",
    "sales.dispatch_cancelled": "Cancelled",
    "sales.reservation_active": "Reserved",
    "sales.reservation_consumed": "Dispatched",
    "sales.reservation_released": "Released",
    "sales.dispatch_orders_section": "Dispatch orders",
    "sales.no_dispatch_orders": "No dispatch assigned",
    "sales.cancel_line_title": "Cancel line",
    "sales.cancel_line_description": "This will release the inventory reservation for this line. If the product is damaged, it will be flagged for manual adjustment.",
    "sales.cancel_line_reason": "Cancellation reason",
    "sales.cancel_line_confirm": "Cancel line",
    "sales.cancel_line_success": "Line cancelled successfully",
    "sales.cancel_line_error_fallback": "Error cancelling line",
    "sales.line_status_active": "Active",
    "sales.line_status_cancelled": "Cancelled",
    "sales.line_already_dispatched": "This line has already been dispatched. Use the dispatch order to handle returns.",
    "sales.confirm_order": "Confirm",
    "sales.cancel_order": "Cancel",
    "sales.form.code": "Code",
    "sales.form.order_date": "Order date",
    "sales.form.sale_mode": "Sale mode",
    "sales.form.fulfillment_mode": "Fulfillment mode",
    "sales.form.branch_id": "Branch",
    "sales.form.customer_contact_id": "Customer",
    "sales.form.seller_user_id": "Seller",
    "sales.form.warehouse_id": "Warehouse",
    "sales.form.delivery_address": "Delivery address",
    "sales.form.delivery_province": "Province",
    "sales.form.delivery_canton": "Canton",
    "sales.form.delivery_district": "District",
    "sales.form.delivery_zone_id": "Delivery zone",
    "sales.form.delivery_requested_date": "Requested date",
    "sales.form.notes": "Notes",
    "sales.form.internal_notes": "Internal notes",
    "sales.form.lines": "Lines",
    "sales.form.add_line": "Add line",
    "sales.form.remove_line": "Remove line",
    "sales.form.delivery_charges": "Delivery charges",
    "sales.form.add_charge": "Add charge",
    "sales.form.remove_charge": "Remove charge",
    "sales.form.product_variant_id": "Product variant",
    "sales.form.quantity": "Quantity",
    "sales.form.unit_price": "Unit price",
    "sales.form.discount_percent": "% Discount",
    "sales.form.tax_amount": "Tax",
    "sales.form.charge_type": "Charge type",
    "sales.form.amount": "Amount",
    "sales.form.reason": "Reason",
    "sales.form.no_price_in_list": "No price in price list",
    "sales.form.no_branch_price_list": "Branch has no assigned price list",
    "sales.form.select_serials": "Select serials",
    "sales.form.no_serials_available": "No serials available",
    "sales.form.select_warehouse_for_serials": "Select a warehouse to see serials",
    "sales.form.serials_selected": "{{count}} serial(s) selected",
    "sales.assigned_serials": "Assigned serials",
    "sales.order_seller_required":
      "A seller is required for the selected sale mode.",
    "sales.order_route_requires_delivery":
      "Seller route mode requires delivery fulfillment.",
    "sales.order_pickup_no_delivery_charges":
      "Pickup mode does not allow delivery charges.",
    "sales.order_delivery_requires_warehouse":
      "A warehouse is required for delivery fulfillment.",
    "sales.order_delivery_requires_address":
      "A delivery address is required for delivery fulfillment.",
    "sales.order_warehouse_required":
      "A warehouse is required to confirm the order.",
    "sales.order_not_confirmable":
      "The order cannot be confirmed in its current state.",
    "sales.order_not_editable":
      "The order cannot be edited in its current state.",
    "sales.order_already_cancelled": "The order has already been cancelled.",
    "sales.order_cannot_cancel_after_logistics":
      "The order cannot be cancelled because it already has logistics operations.",
    "sales.order_delete_not_allowed":
      "The order cannot be deleted in its current state.",
    "sales.order_not_found": "The sale order does not exist.",
    "sales.order_not_confirmed": "The sale order is not confirmed.",
    "sales.line_not_found": "The order line does not exist.",
    "sales.line_already_cancelled": "This line is already cancelled.",
    "sales.order_delete_forbidden":
      "The order cannot be deleted because it has associated dependencies.",
    "sales.order_customer_inactive":
      "The selected customer is not active.",
    "sales.order_customer_type_invalid":
      "The selected contact is not enabled as a customer.",
    "sales.order_seller_inactive":
      "The selected seller is not active.",
    "sales.order_seller_branch_scope_invalid":
      "The assigned seller does not have access to the selected branch.",
    "sales.order_has_no_lines":
      "The order has no product lines.",
    "sales.order_reservations_already_exist":
      "The sale order already has inventory reservations registered.",
    "sales.order_line_variant_required":
      "A sale order line is missing its loaded product variant.",
    "sales.order_reservation_required":
      "The sale order requires an active reservation before it can be dispatched.",
    "sales.order_reservation_insufficient":
      "The active reservation does not cover the quantity being dispatched.",
    "sales.order_dispatch_requires_confirmation":
      "Only confirmed sale orders can be scheduled for dispatch.",
    "sales.order_dispatch_branch_mismatch":
      "The sale order belongs to a different branch than the dispatch order.",
    "inventory.dispatch_order_not_found":
      "The dispatch order does not exist.",
    "inventory.dispatch_order_not_readyable":
      "The dispatch order cannot be marked as ready in its current state.",
    "inventory.dispatch_order_not_editable":
      "The dispatch order cannot be edited in its current state.",
    "inventory.dispatch_order_not_ready":
      "The dispatch order is not ready for dispatch.",
    "inventory.dispatch_order_not_in_progress":
      "The dispatch order is not in progress.",
    "inventory.dispatch_order_cannot_cancel":
      "The dispatch order cannot be cancelled in its current state.",
    "inventory.dispatch_order_delete_not_allowed":
      "The dispatch order cannot be deleted in its current state.",
    "inventory.dispatch_order_scheduled_date_required":
      "A scheduled date is required.",
    "inventory.dispatch_order_vehicle_required":
      "A vehicle is required.",
    "inventory.dispatch_order_vehicle_inactive":
      "The assigned vehicle is inactive.",
    "inventory.dispatch_order_driver_required":
      "A driver is required.",
    "inventory.dispatch_order_driver_inactive":
      "The assigned driver is inactive.",
    "inventory.dispatch_order_route_inactive":
      "The assigned route is inactive.",
    "inventory.dispatch_order_stops_required":
      "At least one stop is required.",
    "inventory.dispatch_order_stops_not_updatable":
      "Stops cannot be updated in the current order state.",
    "inventory.dispatch_order_stops_unresolved":
      "All stops must be resolved to complete the order.",
    "inventory.dispatch.readiness_title": "Requirements to mark as ready",
    "inventory.dispatch.readiness_scheduled_date": "Scheduled date assigned",
    "inventory.dispatch.readiness_vehicle": "Vehicle assigned",
    "inventory.dispatch.readiness_driver": "Driver assigned",
    "inventory.dispatch.readiness_stops": "At least one stop added",
    "inventory.dispatch.readiness_incomplete": "Incomplete",
    "inventory.dispatch.readiness_date_conflicts": "Dispatch date is after requested delivery date",
    "inventory.dispatch_scheduled_date_after_delivery_date":
      "The dispatch scheduled date is after the requested delivery date of an assigned sale order.",
    "inventory.brand_in_use":
      "The brand cannot be deleted because it is in use.",
    "inventory.category_has_children":
      "The category cannot be deleted because it has subcategories.",
    "inventory.category_in_use":
      "The category cannot be deleted because it is in use.",
    "inventory.measurement_unit_in_use":
      "The measurement unit cannot be deleted because it is in use.",
    "inventory.warranty_profile_in_use":
      "The warranty profile cannot be deleted because it is in use.",
    "inventory.cannot_deactivate_default_variant":
      "The default variant cannot be deactivated.",
    "inventory.cannot_deactivate_last_active_variant":
      "The last active variant of the product cannot be deactivated.",
    "inventory.cannot_edit_default_variant_of_simple_product":
      "The default variant of a simple product cannot be edited.",
    "inventory.cannot_delete_default_price_list":
      "The default price list cannot be deleted.",
    "inventory.product_does_not_support_variants":
      "This product does not support variants.",
    "inventory.product_has_non_default_variants":
      "The product has additional variants that must be deleted first.",
    "inventory.product_or_variant_required":
      "A product or variant must be specified.",
    "inventory.product_variant_not_found":
      "The product variant does not exist.",
    "inventory.no_attributes_defined":
      "No attributes are defined for generating variants.",
    "inventory.variant_barcode_duplicate":
      "A variant with that barcode already exists.",
    "inventory.variant_sku_duplicate":
      "A variant with that SKU already exists.",
    "inventory.variant_product_mismatch":
      "The variant does not belong to the specified product.",
    "inventory.variant_required_for_multi_variant_product":
      "A variant must be specified for multi-variant products.",
    "inventory.variant_inventory_tracking_required":
      "The variant does not support inventory tracking.",
    "inventory.variant_lot_tracking_requires_inventory":
      "Variants with lot tracking must also track inventory.",
    "inventory.variant_expiration_requires_lots":
      "Variants with expiration tracking must also track lots.",
    "inventory.inventory_lot_variant_mismatch":
      "The lot does not belong to the specified variant.",
    "inventory.product_serial_tracking_disabled":
      "This product does not have serial tracking enabled.",
    "inventory.serial_not_found":
      "The serial number does not exist.",
    "inventory.serial_number_duplicate":
      "The serial number already exists.",
    "inventory.serial_numbers_required":
      "Serial numbers are required.",
    "inventory.serial_variant_mismatch":
      "The serial number does not belong to the specified variant.",
    "inventory.serial_warehouse_mismatch":
      "The serial number does not belong to the specified warehouse.",
    "inventory.serial_status_not_transferable":
      "The serial number is not in a transferable status.",
    "inventory.serial_transfer_integer_quantity_required":
      "Serial transfers require integer quantities.",
    "inventory.serial_transfer_quantity_mismatch":
      "The number of serials does not match the movement quantity.",
    "inventory.serials_outside_business":
      "One or more serial numbers do not belong to the active business.",
    "inventory.serials_required_for_serial_tracked_variant":
      "Serial numbers are required for serial-tracked variants.",
    "inventory.transfer_warehouse_duplicate":
      "The origin and destination warehouses cannot be the same.",
    "inventory.route_not_found":
      "The route does not exist.",
    "inventory.route_name_duplicate":
      "A route with that name already exists.",
    "inventory.vehicle_not_found":
      "The vehicle does not exist.",
    "inventory.vehicle_plate_duplicate":
      "A vehicle with that plate number already exists.",
    "inventory.zone_not_found":
      "The zone does not exist.",
    "inventory.zone_name_duplicate":
      "A zone with that name already exists.",
    "inventory.driver_user_not_available_for_branch":
      "The driver is not available for the specified branch.",
    "inventory.dispatch_expense_not_found":
      "The dispatch expense does not exist.",
    "inventory.dispatch_stop_not_found":
      "The dispatch stop does not exist.",
    "inventory.dispatch_stop_already_resolved":
      "The stop has already been resolved.",
    "inventory.dispatch_stop_failure_reason_required":
      "A failure reason is required for this stop.",
    "inventory.dispatch_stop_invalid_transition":
      "The stop status transition is not valid.",
    "inventory.dispatch_stop_received_by_required":
      "The name of the person who received the delivery is required.",
    "inventory.dispatch_stop_sale_order_required":
      "The stop requires a sale order.",
    "inventory.dispatch_stop_status_already_set":
      "The stop already has that status.",
    "inventory.dispatch_stop_status_not_supported":
      "The specified status is not valid for this stop.",
    "inventory.sale_order_not_found":
      "The sale order does not exist in the dispatch context.",
    "inventory.sale_order_already_assigned_to_dispatch":
      "The sale order is already assigned to another dispatch order.",
    "inventory.sale_order_already_assigned_to_active_dispatch":
      "The sale order is already assigned to an active dispatch order.",
    "inventory.promotion_items_required":
      "The promotion requires at least one item.",
    "inventory.promotion_product_or_variant_required":
      "Each promotion item requires a product or variant.",
    "sales.order_already_assigned_or_dispatched":
      "The sale order is already assigned or dispatched.",
    "sales.order_dispatch_requires_delivery":
      "Only orders with delivery fulfillment can be scheduled for dispatch.",
    "sales.order_dispatch_warehouse_mismatch":
      "The sale order warehouse does not match the dispatch warehouse.",
    "sales.lines_required":
      "The order requires at least one line.",
    "sales.electronic_document_not_found":
      "The electronic document does not exist.",
    "sales.electronic_document_not_submittable":
      "The electronic document cannot be submitted in its current state.",
    "sales.electronic_document_not_resubmittable":
      "The electronic document cannot be resubmitted.",
    "sales.electronic_document_sale_order_not_emittable":
      "The sale order is not eligible for electronic document emission.",
    "sales.order_dispatch_reset_requires_confirmed":
      "Only confirmed orders can be reset for re-dispatch.",
    "sales.order_dispatch_reset_invalid_status":
      "Only orders with failed or partial dispatch can be reset.",
    "sales.order_has_active_dispatch_stops":
      "The sale order has active stops in a dispatch order.",
    "sales.reset_dispatch_title": "Enable re-dispatch",
    "sales.reset_dispatch_description": "Reset the dispatch status of order {{code}} to pending to allow a new delivery attempt.",
    "sales.reset_dispatch_success": "Dispatch status reset successfully.",
    "sales.reset_dispatch_error_fallback": "Unable to reset the dispatch status.",
    "inventory.dispatch_stop_delivered_lines_required":
      "Per-line delivered quantities are required for partial deliveries.",
    "inventory.dispatch_stop_delivered_exceeds_ordered":
      "The delivered quantity cannot exceed the ordered quantity.",
    "rbac.role_access_forbidden":
      "The user does not have access to the specified role.",
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
    "users.delete_error_fallback": "Unable to delete the user.",
    "users.form.email": "Email address",
    "users.form.max_discount": "Max sale discount (%)",
    "users.form.name": "Full name",
    "users.form.name_placeholder": "User name",
    "users.form.password": "Password",
    "users.form.password_placeholder": "Temporary password",
    "users.password_update_error_fallback":
      "Unable to update the user password.",
    "users.password_updated_success": "Password updated successfully.",
    "users.roles_update_error_fallback": "Unable to update user roles.",
    "users.status_update_error_fallback": "Unable to update the user status.",
    "users.update_error_fallback": "Unable to update the user.",
    "inventory.dispatch_order_create_error_fallback":
      "Error creating the dispatch order.",
    "inventory.dispatch_order_update_error_fallback":
      "Error updating the dispatch order.",
    "inventory.dispatch_order_dispatch_error_fallback":
      "Error dispatching the order.",
    "inventory.dispatch_order_complete_error_fallback":
      "Error completing the dispatch order.",
    "inventory.dispatch_order_cancel_error_fallback":
      "Error cancelling the dispatch order.",
    "inventory.dispatch_order_ready_error_fallback":
      "Error marking the order as ready.",
    "inventory.dispatch_stop_status_error_fallback":
      "Error updating the stop status.",
    "inventory.dispatch_stop_create_error_fallback":
      "Error adding the stop.",
    "inventory.dispatch_stop_delete_error_fallback":
      "Error removing the stop.",
    "inventory.dispatch_expense_create_error_fallback":
      "Error adding the expense.",
    "inventory.dispatch_expense_delete_error_fallback":
      "Error removing the expense.",
    "inventory.entity.dispatch_order": "Dispatch Order",
    "inventory.entity.dispatch_orders": "Dispatch Orders",
    "inventory.dispatch.section_description": "Manage dispatch orders and logistics.",
    "inventory.dispatch.dialog_description":
      "Fill in the fields for the dispatch order.",
    "inventory.dispatch.dispatch_type": "Dispatch type",
    "inventory.dispatch.status": "Status",
    "inventory.dispatch.scheduled_date": "Scheduled date",
    "inventory.dispatch.route": "Route",
    "inventory.dispatch.vehicle": "Vehicle",
    "inventory.dispatch.driver": "Driver",
    "inventory.dispatch.origin_warehouse": "Origin warehouse",
    "inventory.dispatch.stops": "Stops",
    "inventory.dispatch.expenses": "Expenses",
    "inventory.dispatch.movements_section": "Inventory movements",
    "inventory.dispatch.add_stop": "Add stop",
    "inventory.dispatch.add_expense": "Add expense",
    "inventory.dispatch.mark_dispatched": "Dispatch",
    "inventory.dispatch.mark_ready": "Mark ready",
    "inventory.dispatch.mark_ready_confirm": "Mark this order as ready for dispatch?",
    "inventory.dispatch.mark_completed": "Complete",
    "inventory.dispatch.cancel": "Cancel dispatch",
    "inventory.dispatch.delete_confirm":
      "This action will permanently delete the dispatch order",
    "inventory.dispatch_order_delete_error_fallback":
      "Error deleting the dispatch order.",
    "inventory.dispatch.update_stop_status": "Update stop status",
    "inventory.dispatch.detail_description": "Dispatch order detail.",
    "inventory.dispatch.no_stops": "No stops in this order.",
    "inventory.dispatch.received_by": "Received by",
    "inventory.dispatch.received_by_placeholder": "Name of the person who received",
    "inventory.dispatch.failure_reason": "Failure reason",
    "inventory.dispatch.failure_reason_placeholder": "Describe the reason for failure",
    "inventory.dispatch.receipt": "Receipt",
    "inventory.dispatch.select_sale_orders": "Sale orders to dispatch",
    "inventory.dispatch.select_sale_orders_description": "Select confirmed sale orders with pending delivery.",
    "inventory.dispatch.orders_selected": "orders selected",
    "inventory.dispatch.no_eligible_orders": "No eligible sale orders. They must be confirmed, with delivery mode and pending dispatch.",
    "inventory.dispatch.status_draft": "Draft",
    "inventory.dispatch.status_ready": "Ready",
    "inventory.dispatch.status_dispatched": "Dispatched",
    "inventory.dispatch.status_in_transit": "In transit",
    "inventory.dispatch.status_completed": "Completed",
    "inventory.dispatch.status_cancelled": "Cancelled",
    "inventory.dispatch.type_individual": "Individual",
    "inventory.dispatch.type_consolidated": "Consolidated",
    "inventory.dispatch.stop_pending": "Pending",
    "inventory.dispatch.stop_in_transit": "In transit",
    "inventory.dispatch.stop_delivered": "Delivered",
    "inventory.dispatch.stop_failed": "Failed",
    "inventory.dispatch.stop_partial": "Partial",
    "inventory.dispatch.stop_skipped": "Skipped",
    "inventory.dispatch.expense_type": "Expense type",
    "inventory.dispatch.amount": "Amount",
    "inventory.dispatch.total_expenses": "Total expenses",
    "inventory.dispatch.delivered_quantities": "Delivered quantities",
    "inventory.dispatch.product": "Product",
    "inventory.dispatch.ordered": "Ordered",
    "inventory.dispatch.delivered": "Delivered",
    "inventory.dispatch.landing.eyebrow": "Dispatch",
    "inventory.dispatch.landing.title": "Dispatch & Logistics",
    "inventory.dispatch.landing.description":
      "Manage dispatch orders, routes and vehicles for delivery logistics.",
    "inventory.dispatch.landing.orders_description":
      "Create and manage individual or consolidated dispatch orders.",
    "inventory.dispatch.landing.routes_description":
      "Configure delivery routes with zones, default vehicles and drivers.",
    "inventory.dispatch.landing.vehicles_description":
      "Manage the vehicle fleet available for dispatches.",
    "inventory.dispatch.landing.zones_description":
      "Configure geographic zones to group and organize delivery routes.",
    "inventory.dispatch.landing.open_section": "Open",
    "inventory.branch_assignments.column_header": "Branches",
    "inventory.branch_assignments.global": "Global",
    "inventory.branch_assignments.branch_count": "{{count}} branches",
    "inventory.branch_assignments.manage_action": "Branches",
    "inventory.branch_assignments.dialog_title": "Branch assignments - {{entity}}",
    "inventory.branch_assignments.dialog_description":
      "Configure the branches assigned to {{name}}.",
    "inventory.branch_assignments.load_error":
      "Error loading branch assignments.",
    "inventory.branch_assignments.loading": "Loading assignments...",
    "inventory.branch_assignments.is_global": "Global (all branches)",
    "inventory.branch_assignments.is_global_hint":
      "If enabled, {{entity}} will be available in all branches.",
    "inventory.branch_assignments.select_branches": "Select branches",
    "inventory.branch_assignments.select_all": "All",
    "inventory.branch_assignments.deselect_all": "None",
    "inventory.branch_assignments.no_branches": "No active branches available.",
    "inventory.branch_assignments.selected_count": "{{count}} selected",
    "inventory.branch_assignments.save_action": "Save assignments",
    "inventory.branch_assignments_save_error_fallback":
      "Error saving branch assignments.",
    "sales.document_emit_error_fallback":
      "Error emitting the electronic document.",
    "sales.entity.electronic_document": "Electronic Document",
    "sales.entity.electronic_documents": "Electronic Documents",
    "sales.documents.section_description":
      "Manage Hacienda electronic documents.",
    "sales.documents.emit": "Emit invoice",
    "sales.documents.document_type": "Document type",
    "sales.documents.hacienda_status": "Hacienda status",
    "sales.documents.hacienda_pending": "Pending",
    "sales.documents.hacienda_submitted": "Submitted",
    "sales.documents.hacienda_accepted": "Accepted",
    "sales.documents.hacienda_rejected": "Rejected",
    "sales.documents.hacienda_error": "Error",
    "sales.documents.receiver": "Receiver",
    "sales.documents.document_key": "Key",
    "sales.documents.consecutive": "Consecutive",
    "sales.documents.type_factura_electronica": "Electronic Invoice",
    "sales.documents.type_tiquete_electronico": "Electronic Ticket",
    "sales.documents.type_nota_credito": "Credit Note",
    "sales.documents.type_nota_debito": "Debit Note",
  },
  es: esTranslations,
};
