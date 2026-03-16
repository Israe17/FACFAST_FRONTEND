import { InventoryProductDetail } from "@/features/inventory/components/inventory-product-detail";

type InventoryProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InventoryProductDetailPage({
  params,
}: InventoryProductDetailPageProps) {
  const { id } = await params;

  return <InventoryProductDetail productId={id} />;
}
