export const inventoryKeys = {
  all: ["inventory"] as const,
  brands: () => [...inventoryKeys.all, "brands"] as const,
  branchPriceListsRoot: () => [...inventoryKeys.all, "branch-price-lists"] as const,
  branchPriceLists: (branchId: string) =>
    [...inventoryKeys.branchPriceListsRoot(), branchId] as const,
  branchPromotionsRoot: () => [...inventoryKeys.all, "branch-promotions"] as const,
  branchPromotions: (branchId: string) =>
    [...inventoryKeys.branchPromotionsRoot(), branchId] as const,
  inventoryLot: (lotId: string) => [...inventoryKeys.inventoryLots(), lotId] as const,
  inventoryLots: () => [...inventoryKeys.all, "inventory-lots"] as const,
  inventoryMovement: (movementId: string) =>
    [...inventoryKeys.inventoryMovements(), movementId] as const,
  inventoryMovements: () => [...inventoryKeys.all, "inventory-movements"] as const,
  measurementUnits: () => [...inventoryKeys.all, "measurement-units"] as const,
  priceLists: () => [...inventoryKeys.all, "price-lists"] as const,
  priceListBranchesRoot: () => [...inventoryKeys.all, "price-list-branches"] as const,
  priceListBranches: (priceListId: string) =>
    [...inventoryKeys.priceListBranchesRoot(), priceListId] as const,
  priceList: (priceListId: string) =>
    [...inventoryKeys.priceLists(), priceListId] as const,
  promotion: (promotionId: string) =>
    [...inventoryKeys.promotions(), promotionId] as const,
  promotionBranchesRoot: () => [...inventoryKeys.all, "promotion-branches"] as const,
  promotionBranches: (promotionId: string) =>
    [...inventoryKeys.promotionBranchesRoot(), promotionId] as const,
  productCategories: () => [...inventoryKeys.all, "product-categories"] as const,
  productCategoryTree: () =>
    [...inventoryKeys.all, "product-categories", "tree"] as const,
  product: (productId: string) =>
    [...inventoryKeys.products(), productId] as const,
  productPrices: (productId: string) =>
    [...inventoryKeys.all, "product-prices", productId] as const,
  productSerials: (productId: string, variantId: string) =>
    [...inventoryKeys.all, "product-serials", productId, variantId] as const,
  products: () => [...inventoryKeys.all, "products"] as const,
  promotions: () => [...inventoryKeys.all, "promotions"] as const,
  taxProfiles: () => [...inventoryKeys.all, "tax-profiles"] as const,
  warehouses: () => [...inventoryKeys.all, "warehouses"] as const,
  warehouseLocations: (warehouseId: string) =>
    [...inventoryKeys.all, "warehouse-locations", warehouseId] as const,
  warehouseLocation: (warehouseLocationId: string) =>
    [...inventoryKeys.all, "warehouse-location", warehouseLocationId] as const,
  warehouse: (warehouseId: string) =>
    [...inventoryKeys.warehouses(), warehouseId] as const,
  warehouseStock: () => [...inventoryKeys.all, "warehouse-stock"] as const,
  warehouseStockByWarehouse: (warehouseId: string) =>
    [...inventoryKeys.all, "warehouse-stock", warehouseId] as const,
  productVariants: (productId: string) =>
    [...inventoryKeys.all, "product-variants", productId] as const,
  variantAttributes: (productId: string) =>
    [...inventoryKeys.all, "variant-attributes", productId] as const,
  warrantyProfiles: () => [...inventoryKeys.all, "warranty-profiles"] as const,
  zones: () => [...inventoryKeys.all, "zones"] as const,
  zone: (id: string) => [...inventoryKeys.all, "zones", id] as const,
  zoneBranches: (zoneId: string) =>
    [...inventoryKeys.zones(), zoneId, "branches"] as const,
  vehicles: () => [...inventoryKeys.all, "vehicles"] as const,
  vehicleBranches: (vehicleId: string) =>
    [...inventoryKeys.vehicles(), vehicleId, "branches"] as const,
  routes: () => [...inventoryKeys.all, "routes"] as const,
  routeBranches: (routeId: string) =>
    [...inventoryKeys.routes(), routeId, "branches"] as const,
  dispatchOrders: () => [...inventoryKeys.all, "dispatch-orders"] as const,
  cabysSearch: (q: string) =>
    [...inventoryKeys.all, "cabys-search", q] as const,
  dispatchOrder: (id: string) =>
    [...inventoryKeys.dispatchOrders(), id] as const,
};
