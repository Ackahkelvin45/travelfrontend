"use client";

import TourHeader from "@/components/tour-detail/TourHeader";
import TourGallery from "@/components/tour-detail/TourGallery";
import TourMeta from "@/components/tour-detail/TourMeta";
import TourOverview from "@/components/tour-detail/TourOverview";
import TourItinerary from "@/components/tour-detail/TourItinerary";
import TourMap from "@/components/tour-detail/TourMap";
import AvailabilityCalendar from "@/components/tour-detail/AvailabilityCalendar";
import TourFAQ from "@/components/tour-detail/TourFAQ";
import CustomerReviews from "@/components/tour-detail/CustomerReviews";
import LeaveReply from "@/components/tour-detail/LeaveReply";
import RelatedTours from "@/components/tour-detail/RelatedTours";
import BookingSidebar from "@/components/tour-detail/BookingSidebar";
import TourDetailSkeleton from "@/components/tour-detail/TourDetailSkeleton";
import { useGetPackageDetailQuery, useGetPackageReviewsQuery } from "@/lib/api/packagesApi";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=900&q=80";

function padImages(urls: string[]): [string, string, string, string] {
  const padded = [...urls];
  while (padded.length < 4) padded.push(FALLBACK_IMAGE);
  return padded.slice(0, 4) as [string, string, string, string];
}

interface Props {
  id: string;
}

export default function TourDetailClient({ id }: Props) {
  const { data: pkg, isLoading, isError } = useGetPackageDetailQuery(id);
  const { data: reviewsData } = useGetPackageReviewsQuery(id, { skip: !id });

  if (isLoading) return <TourDetailSkeleton />;

  if (isError || !pkg) {
    return (
      <main className="w-full px-10 mt-20 py-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 font-open-sans text-sm">
          Failed to load this package. Please go back and try again.
        </p>
      </main>
    );
  }

  const imageUrls = padImages(pkg.images.map((img) => img.image));
  const ticketTypes = [
    { label: "Shared/Couple", ageRange: "Group", price: parseFloat(pkg.price_shared), tier: "shared" as const },
    { label: "Private", ageRange: "Solo", price: parseFloat(pkg.price_private), tier: "private" as const },
    { label: "VIP", ageRange: "Exclusive experience", price: parseFloat(pkg.price_vip), tier: "vip" as const },
  ];

  const embedUrl =
    pkg.latitude && pkg.longitude
      ? `https://maps.google.com/maps?q=${pkg.latitude},${pkg.longitude}&z=13&output=embed`
      : undefined;

  return (
    <main className="w-full px-4 md:px-10 mt-20 py-6 overflow-hidden">
      <TourHeader
        title={pkg.title}
        badges={[pkg.category_display].filter(Boolean)}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Tours", href: "/destinations" },
          { label: pkg.destination, href: `/destinations?destination=${pkg.destination}` },
        ]}
      />

      <div className="mb-6">
        <TourGallery images={imageUrls} title={pkg.title} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left column */}
        <div className="w-full lg:w-[70%] flex flex-col gap-10">
          <TourMeta
            duration={`${pkg.duration_days} Day${pkg.duration_days !== 1 ? "s" : ""}`}
            groupSize={`Up to ${pkg.max_guests}`}
            ages="All ages"
            languages={["English"]}
          />

          <TourOverview
            description={pkg.description}
            highlights={pkg.highlights ?? []}
            included={pkg.whats_included ?? []}
            notIncluded={[]}
          />

          {pkg.itineraries.length > 0 && (
            <TourItinerary
              days={pkg.itineraries
                .slice()
                .sort((a, b) => a.day - b.day)
                .map((it) => ({
                  day: it.day,
                  title: it.title,
                  description: it.description,
                }))}
              tourTitle={pkg.title}
            />
          )}

          <TourMap embedUrl={embedUrl} />

          <AvailabilityCalendar />

          {pkg.faqs.length > 0 && (
            <TourFAQ
              items={pkg.faqs
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((faq) => ({ question: faq.question, answer: faq.answer }))}
            />
          )}

          <CustomerReviews
            overallRating={pkg.avg_rating ?? 0}
            totalReviews={pkg.review_count}
            categoryRatings={[]}
            reviews={reviewsData?.results ?? []}
          />

          <LeaveReply packageId={id} />
          <RelatedTours tours={[]} />
        </div>

        {/* Sticky booking sidebar */}
        <div className="w-full lg:w-[30%] static lg:sticky flex justify-center lg:justify-end items-center lg:top-20 self-start">
          <BookingSidebar
            packageId={pkg.id}
            basePrice={parseFloat(pkg.price_shared)}
            ticketTypes={ticketTypes}
            addOns={[]}
            availableFrom={pkg.available_from}
            availableTo={pkg.available_to}
          />
        </div>
      </div>
    </main>
  );
}
