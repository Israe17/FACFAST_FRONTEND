import { ZoneDetail } from "@/features/inventory/components/zone-detail";

type ZoneDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ZoneDetailPage({ params }: ZoneDetailPageProps) {
  const { id } = await params;
  return <ZoneDetail zoneId={id} />;
}
