"use client";

import TourHeader from "@/components/tour-detail/TourHeader";
import TourGallery from "@/components/tour-detail/TourGallery";
import TourMeta from "@/components/tour-detail/TourMeta";
import TourOverview, { TourInclusions } from "@/components/tour-detail/TourOverview";
import TourItinerary from "@/components/tour-detail/TourItinerary";
import TourMap from "@/components/tour-detail/TourMap";
import TourFAQ from "@/components/tour-detail/TourFAQ";
import CustomerReviews from "@/components/tour-detail/CustomerReviews";
import LeaveReply from "@/components/tour-detail/LeaveReply";
import RelatedTours from "@/components/tour-detail/RelatedTours";
import BookingSidebar from "@/components/tour-detail/BookingSidebar";
import OptionBookingPanel from "@/components/tour-detail/OptionBookingPanel";
import CommercialSections from "@/components/tour-detail/CommercialSections";
import MobileBookingBar from "@/components/tour-detail/MobileBookingBar";
import TourDetailSkeleton from "@/components/tour-detail/TourDetailSkeleton";
import { AccordionItem } from "@/components/ui/Accordion";
import Reveal from "@/components/ui/Reveal";
import { MegaphoneIcon } from "@/components/ui/icons";
import { fmtMoney, fmtDate, fmtDateRange } from "@/lib/format";
import {
  useGetPackageDetailQuery,
  useGetPackagePricingQuery,
  useGetPackageReviewsQuery,
  useGetTripUpdatesQuery,
} from "@/lib/api/packagesApi";

interface Props {
  id: string;
}

/**
 * Tour detail page. Hierarchy:
 *   hero gallery → title + key metadata → quick facts →
 *   about → rooms & pricing → itinerary → inclusions → good-to-know
 *   accordions → updates → map → FAQ → reviews
 * with a sticky booking card on desktop and a fixed bottom CTA bar on
 * mobile (where the card itself is hidden for option-based tours).
 */
export default function TourDetailClient({ id }: Props) {
  const { data: pkg, isLoading, isError } = useGetPackageDetailQuery(id);
  const { data: reviewsData } = useGetPackageReviewsQuery(id, { skip: !id });
  const { data: matrix } = useGetPackagePricingQuery(id, { skip: !id });
  const { data: tripUpdates = [] } = useGetTripUpdatesQuery(id, { skip: !id });

  if (isLoading) return <TourDetailSkeleton />;

  if (isError || !pkg) {
    return (
      <main className="w-full px-10 mt-20 py-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-700 dark:text-gray-300 font-open-sans text-sm">
          Failed to load this package. Please go back and try again.
        </p>
      </main>
    );
  }

  const imageUrls = pkg.images.map((img) => img.image);
  const datesLabel =
    pkg.available_from && pkg.available_to
      ? fmtDateRange(pkg.available_from, pkg.available_to)
      : undefined;
  const durationLabel = `${pkg.duration_days} day${pkg.duration_days !== 1 ? "s" : ""}`;

  // Legacy (non-option) packages price per tier.
  const ticketTypes = pkg.has_options
    ? []
    : [
        { label: "Shared/Couple", ageRange: "Group", price: parseFloat(pkg.price_shared), tier: "shared" as const },
        { label: "Private", ageRange: "Solo", price: parseFloat(pkg.price_private), tier: "private" as const },
        { label: "VIP", ageRange: "Exclusive experience", price: parseFloat(pkg.price_vip), tier: "vip" as const },
      ];

  const embedUrl =
    pkg.latitude && pkg.longitude
      ? `https://maps.google.com/maps?q=${pkg.latitude},${pkg.longitude}&z=13&output=embed`
      : undefined;

  const fromPrice = pkg.has_options
    ? (pkg.from_price ?? null)
    : (pkg.price_shared ?? pkg.from_price ?? null);

  return (
    <main className={`content-in w-full px-4 md:px-10 mt-20 py-6 overflow-hidden ${pkg.has_options ? "pb-28 lg:pb-6" : ""}`}>
      <div className="max-w-[1360px] mx-auto">
        <TourHeader
          title={pkg.title}
          category={pkg.category_display}
          destination={pkg.destination}
          durationLabel={durationLabel}
          datesLabel={datesLabel}
          rating={pkg.avg_rating}
          reviewCount={pkg.review_count}
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "Tours", href: "/destinations" },
            ...(pkg.destination
              ? [{ label: pkg.destination, href: `/destinations?destination=${pkg.destination}` }]
              : []),
          ]}
        />

        <TourGallery images={imageUrls} title={pkg.title} />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 xl:gap-16 lg:items-start">
          {/* ── Main content ── */}
          <div className="flex flex-col gap-8 pb-8">
            <TourMeta
              duration={durationLabel}
              groupSize={`Up to ${pkg.max_guests}`}
              dates={datesLabel}
              destination={pkg.destination}
            />

            <TourOverview description={pkg.description} highlights={pkg.highlights ?? []} />

            {pkg.has_options && (
              <Reveal>
                <CommercialSections packageId={pkg.id} refundTiers={pkg.refund_tiers ?? []} />
              </Reveal>
            )}

            <TourItinerary
              days={pkg.itineraries
                .slice()
                .sort((a, b) => a.day - b.day)
                .map((it) => ({ day: it.day, title: it.title, description: it.description }))}
              tourTitle={pkg.title}
            />

            <Reveal>
              <TourInclusions included={pkg.whats_included ?? []} notIncluded={pkg.whats_excluded ?? []} />
            </Reveal>

            {tripUpdates.length > 0 && (
              <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold font-raleway text-text-primary mb-4">Trip updates</h2>
                <div className="flex flex-col gap-2.5">
                  {tripUpdates.map((update, i) => (
                    <AccordionItem
                      key={update.id}
                      title={update.title}
                      subtitle={fmtDate(update.published_at)}
                      icon={<MegaphoneIcon size={17} />}
                      defaultOpen={i === 0}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{update.body}</p>
                    </AccordionItem>
                  ))}
                </div>
              </section>
            )}

            <TourMap embedUrl={embedUrl} />

            {pkg.faqs.length > 0 && (
              <Reveal>
                <TourFAQ
                  items={pkg.faqs
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((faq) => ({ question: faq.question, answer: faq.answer }))}
                />
              </Reveal>
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

          {/* ── Booking column ──
              Option-based tours: desktop-only sticky card (mobile uses the
              bottom bar). Legacy tours keep the interactive ticket card in
              flow on mobile. */}
          <aside
            className={`${pkg.has_options ? "hidden lg:block" : "mt-8 lg:mt-0"} lg:sticky lg:top-24`}
          >
            {pkg.has_options ? (
              <Reveal variant="scale" delay={120}>
                <OptionBookingPanel packageId={pkg.id} />
              </Reveal>
            ) : (
              <BookingSidebar
                packageId={pkg.id}
                basePrice={parseFloat(pkg.price_shared)}
                ticketTypes={ticketTypes}
                addOns={[]}
                availableFrom={pkg.available_from}
                availableTo={pkg.available_to}
                currency={pkg.currency}
              />
            )}
          </aside>
        </div>
      </div>

      {/* Mobile: price + CTA always within thumb reach (option-based tours) */}
      {pkg.has_options && (
        <MobileBookingBar
          priceLabel={fromPrice ? fmtMoney(fromPrice, pkg.currency) : null}
          bookHref={`/book?package=${pkg.id}`}
          deadline={pkg.early_bird_active ? pkg.early_bird_deadline : null}
          serverNow={matrix?.server_now ?? null}
        />
      )}
    </main>
  );
}
