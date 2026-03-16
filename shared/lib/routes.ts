import {
  Boxes,
  BriefcaseBusiness,
  Building2,
  ContactRound,
  LayoutDashboard,
  Layers3,
  PlusSquare,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export const APP_ROUTES = {
  dashboard: "/",
  login: "/login",
  onboarding: "/onboarding",
  business: "/business",
  businessSettingsLegacy: "/business-settings",
  superadminRoot: "/superadmin",
  superadminEnterContext: "/superadmin/enter-context",
  superadminBusinesses: "/superadmin/businesses",
  superadminBusinessNew: "/superadmin/businesses/new",
  users: "/users",
  roles: "/roles",
  branches: "/branches",
  contacts: "/contacts",
  inventory: "/inventory",
  inventoryCatalogs: "/inventory/catalogs",
  inventoryProducts: "/inventory/products",
  inventoryPricing: "/inventory/pricing",
  inventoryWarehouses: "/inventory/warehouses",
  inventoryOperations: "/inventory/operations",
  inventoryOperationsStock: "/inventory/operations/stock",
  inventoryOperationsLots: "/inventory/operations/lots",
  inventoryOperationsMovements: "/inventory/operations/movements",
} as const;

export function getSuperadminBusinessDetailRoute(businessId: string) {
  return `${APP_ROUTES.superadminBusinesses}/${businessId}`;
}

export function getInventoryProductRoute(productId: string) {
  return `${APP_ROUTES.inventoryProducts}/${productId}`;
}

export function getInventoryPriceListRoute(priceListId: string) {
  return `${APP_ROUTES.inventoryPricing}/price-lists/${priceListId}`;
}

export function getInventoryWarehouseRoute(warehouseId: string) {
  return `${APP_ROUTES.inventoryWarehouses}/${warehouseId}`;
}

export function getInventoryMovementRoute(headerId: string) {
  return `${APP_ROUTES.inventoryOperationsMovements}/${headerId}`;
}

export type SidebarItem = {
  description: string;
  href: string;
  icon: LucideIcon;
  requiredAllPermissions?: string[];
  requiredAnyPermissions?: string[];
  title: string;
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Dashboard",
    href: APP_ROUTES.dashboard,
    icon: LayoutDashboard,
    description: "Vista general del negocio.",
  },
  {
    title: "Empresa",
    href: APP_ROUTES.business,
    icon: BriefcaseBusiness,
    description: "Configuracion del tenant actual.",
    requiredAnyPermissions: ["businesses.view"],
  },
  {
    title: "Usuarios",
    href: APP_ROUTES.users,
    icon: Users,
    description: "Gestion administrativa de usuarios.",
    requiredAnyPermissions: ["users.view"],
  },
  {
    title: "Roles",
    href: APP_ROUTES.roles,
    icon: ShieldCheck,
    description: "Permisos y estructura RBAC.",
    requiredAnyPermissions: ["roles.view"],
  },
  {
    title: "Sucursales",
    href: APP_ROUTES.branches,
    icon: Building2,
    description: "Configuracion multi-sucursal.",
    requiredAnyPermissions: ["branches.view"],
  },
  {
    title: "Contactos",
    href: APP_ROUTES.contacts,
    icon: ContactRound,
    description: "Clientes y proveedores.",
    requiredAnyPermissions: ["contacts.view"],
  },
  {
    title: "Inventario",
    href: APP_ROUTES.inventory,
    icon: Boxes,
    description: "Catalogos y operacion inventory.",
    requiredAnyPermissions: [
      "brands.view",
      "measurement_units.view",
      "categories.view",
      "tax_profiles.view",
      "warranty_profiles.view",
      "products.view",
      "price_lists.view",
      "product_prices.view",
      "promotions.view",
      "warehouses.view",
      "warehouse_locations.view",
      "warehouse_stock.view",
      "inventory_lots.view",
      "inventory_movements.view",
    ],
  },
];

export const PLATFORM_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Enter Context",
    href: APP_ROUTES.superadminEnterContext,
    icon: BriefcaseBusiness,
    description: "Selecciona empresa y sucursal para operar dentro del tenant.",
  },
  {
    title: "Businesses",
    href: APP_ROUTES.superadminBusinesses,
    icon: Layers3,
    description: "Vista global de tenants de la plataforma.",
  },
  {
    title: "New Business",
    href: APP_ROUTES.superadminBusinessNew,
    icon: PlusSquare,
    description: "Onboarding transaccional de una nueva empresa.",
  },
];
