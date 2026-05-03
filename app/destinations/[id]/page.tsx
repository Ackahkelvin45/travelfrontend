import DestinationDetailClient from "@/components/destinations/DestinationDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DestinationDetailPage({ params }: Props) {
  const { id } = await params;
  return <DestinationDetailClient id={id} />;
}
