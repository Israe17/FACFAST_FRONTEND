import { InventoryWarehouseDetail } from "@/features/inventory/components/inventory-warehouse-detail";

type InventoryWarehouseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InventoryWarehouseDetailPage({
  params,
}: InventoryWarehouseDetailPageProps) {
  const { id } = await params;

  return <InventoryWarehouseDetail warehouseId={id} />;
}
