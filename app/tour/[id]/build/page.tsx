import BuildTrip from "@/components/booking/BuildTrip";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BuildTripPage({ params }: Props) {
  const { id } = await params;
  return <BuildTrip id={id} />;
}
