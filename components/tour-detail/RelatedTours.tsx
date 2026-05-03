import Card from "@/components/ecommerce/Card";

interface RelatedTour {
 image: string;
 location: string;
 title: string;
 rating: number;
 reviews: number;
 days: number;
 price: number;
 currency?: string;
}

interface RelatedToursProps {
 tours: RelatedTour[];
}

export default function RelatedTours({ tours }: RelatedToursProps) {
 if (tours.length === 0) return null;
 return (
 <section className="py-8">
 <h2 className="text-xl font-bold font-raleway text-text-primary mb-5">You might also like...</h2>
 <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
 {tours.map((tour, i) => (
 <Card key={i} {...tour} currency={tour.currency ?? "USD"} />
 ))}
 </div>
 </section>
 );
}
