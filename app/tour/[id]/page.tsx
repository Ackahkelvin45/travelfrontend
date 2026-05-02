import TourDetailClient from "@/components/tour-detail/TourDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TourDetailPage({ params }: Props) {
  const { id } = await params;
  return <TourDetailClient id={id} />;
}
