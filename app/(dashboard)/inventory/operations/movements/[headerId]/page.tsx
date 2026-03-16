import { InventoryMovementDetail } from "@/features/inventory/components/inventory-movement-detail";

type InventoryMovementDetailPageProps = {
  params: Promise<{ headerId: string }>;
};

export default async function InventoryMovementDetailPage({
  params,
}: InventoryMovementDetailPageProps) {
  const { headerId } = await params;

  return <InventoryMovementDetail headerId={headerId} />;
}
