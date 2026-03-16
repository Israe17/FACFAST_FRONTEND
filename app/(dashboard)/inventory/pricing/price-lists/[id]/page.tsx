import { InventoryPriceListDetail } from "@/features/inventory/components/inventory-price-list-detail";

type InventoryPriceListDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InventoryPriceListDetailPage({
  params,
}: InventoryPriceListDetailPageProps) {
  const { id } = await params;

  return <InventoryPriceListDetail priceListId={id} />;
}
