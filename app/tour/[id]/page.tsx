export function generateStaticParams() {
  return [{ id: "1" }];
}

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

const TOUR = {
  title: "Phi Phi Islands Adventure Day Trip with Seaview Lunch by V. Marine Tour",
  badges: ["Excellent", "Family", "Safe", "Bike storage"],
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "Free cancellation", href: "/tours?filter=free-cancellation" },
  ],
  images: [
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=900&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&q=80",
    "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=80",
  ],
  meta: {
    duration: "7 Days",
    groupSize: "Up to 15",
    ages: "18-80",
    languages: ["English", "Thai"],
  },
  description:
    "The Phi Phi Archipelago is a must-visit dive in Phuket, and this speedboat trip lets you share this island in one day. Swim in the exotic tropical waters near the shores of Monkey Beach, and see Maya Beach, immortalized in The Beach. Boat transfers, snorkeling equipment, and Phi Phi Island pickup-and-drop are all included.",
  highlights: [
    "Beverages, drinking water, snorkeling bag are $250 person",
    "Local cuisine",
    "Hotel pickup and drop-off on an air-conditioned minivan",
    "Accommodation for a private plan",
    "Soft drinks",
    "Tour Guide",
  ],
  included: [
    "Beverages, drinking water, snorkeling bag are",
    "Local lunch",
    "Hotel pickup and drop-off on an air-conditioned",
    "Accommodation for a private plan",
    "Tour Guide",
  ],
  notIncluded: ["Tips", "Alcoholic Beverages"],
  itinerary: [
    { day: 1, title: "Resort Pick-Up" },
    { day: 2, title: "Boat Cruise" },
    {
      day: 3,
      title: "Temple & Overnight Train",
      description:
        "You are free to explore the city on your own. Our team can help you plan the best places to visit and what to do so that you have the best time. We will pick you up from your hotel at 8pm so you can rest before the overnight train.",
    },
    { day: 4, title: "Phrae Chai National Park" },
    { day: 5, title: "Travel to Next Phangan" },
    { day: 6, title: "Morning Chill & Muay Thai Lesson" },
    { day: 7, title: "Grand Boat Trip" },
  ],
  faq: [
    {
      question: "Can I get alcohol?",
      answer:
        "Phang Bay Day Cruise Snorkeling & James Bond Island in Suffers Lunch by Big Boat cancellation policy: For a full refund cancel at least 1 day before the start date of the experience. Discover and Book Phang Bay Sea Canoe & James Bond Island at Airline Lunch by Big Boat.",
    },
    { question: "Can I change the travel date?", answer: "Yes, you may change the date up to 48 hours before departure." },
    { question: "When and where does the tour start?", answer: "The tour starts at your hotel lobby at 7:30 AM." },
    { question: "Do you arrange airport transfers?", answer: "Yes, airport transfers can be arranged for an additional fee." },
  ],
  reviews: {
    overall: 5,
    total: 128,
    categories: [
      { label: "Location", score: 5.0 },
      { label: "Food", score: 4.6 },
      { label: "Amenities", score: 5.0 },
      { label: "Price", score: 4.2 },
      { label: "Comfort", score: 5.0 },
      { label: "Tour Operator", score: 5.0 },
    ],
    items: [
      {
        author: "Ali Tufan",
        date: "Apr 2023",
        text: "Great tour! It is worth every session. Really, Really fun for a few kind of photo spots. Even I have a passport but you need to collect the photos of the places.",
        images: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&q=70",
          "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=120&q=70",
        ],
      },
      {
        author: "Ali Tufan",
        date: "Apr 2023",
        text: '"Take this tour for Seaview!" Great tour! It is worth every session. Really, Really fun for a few kind of photo spots. Even I have a passport but you need to collect the photos of the places.',
        images: [
          "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=120&q=70",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&q=70",
        ],
      },
      {
        author: "Ali Tufan",
        date: "Apr 2023",
        text: '"Take this tour for Seaview!" Great tour! It is worth every session. Really, Really fun for a few kind of photo spots. Even I have a passport but you need to collect the photos of the places.',
        images: [
          "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=120&q=70",
          "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=120&q=70",
        ],
      },
    ],
  },
  related: [
    {
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=70",
      location: "Phuket, Thailand",
      title: "Complete Tour - Southern Koh Samui Day Tour Of KL",
      rating: 4.5,
      reviews: 50,
      days: 3,
      price: 425,
    },
    {
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70",
      location: "Phuket, Thailand",
      title: "Western and Turtle Deep Snorkeling Seaview Board",
      rating: 4,
      reviews: 40,
      days: 4,
      price: 279,
    },
    {
      image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&q=70",
      location: "Thailand",
      title: "Mountainside Hiking Tour & Magnificent Valley With Lunch",
      rating: 5,
      reviews: 80,
      days: 2,
      price: 680,
    },
    {
      image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=70",
      location: "Phuket, Thailand",
      title: "Extravaganza Ultimate World Day Tour With Lunch",
      rating: 4.5,
      reviews: 60,
      days: 2,
      price: 877,
    },
  ],
  booking: {
    basePrice: 1350,
    priceLabel: "Price: $1,350 / Adult $60+",
    ticketTypes: [
      { label: "Adult", subLabel: "Age 18+", price: 600 },
      { label: "Children (2-11 years)", price: 0 },
      { label: "Infants (Under 2)", price: 0 },
    ],
    addOns: [{ label: "Add whole slot tour", price: 60 }],
  },
};

export default function TourDetailPage() {
  return (
    <main className="w-full px-10 mt-20 py-6 overflow-hidden">
      <TourHeader title={TOUR.title} badges={TOUR.badges} breadcrumb={TOUR.breadcrumb} />

      <div className="mb-6">
        <TourGallery images={TOUR.images} title={TOUR.title} />
      </div>

      <div className=" flex flex-row  gap-8 items-start">
        {/* Left column */}
        <div className="w-[70%] flex flex-col gap-10">
          <TourMeta
            duration={TOUR.meta.duration}
            groupSize={TOUR.meta.groupSize}
            ages={TOUR.meta.ages}
            languages={TOUR.meta.languages}
          />
          <TourOverview
            description={TOUR.description}
            highlights={TOUR.highlights}
            included={TOUR.included}
            notIncluded={TOUR.notIncluded}
          />
          <TourItinerary days={TOUR.itinerary} tourTitle={TOUR.title} />
          <TourMap />
          <AvailabilityCalendar />
          <TourFAQ items={TOUR.faq} />
          <CustomerReviews
            overallRating={TOUR.reviews.overall}
            totalReviews={TOUR.reviews.total}
            categoryRatings={TOUR.reviews.categories}
            reviews={TOUR.reviews.items}
          />
          <LeaveReply />
          <RelatedTours tours={TOUR.related} />
        </div>

        {/* Sticky booking sidebar */}
        <div className="w-[30%]  sticky flex justify-end  items-center top-20 self-start">
          <BookingSidebar
            basePrice={TOUR.booking.basePrice}
            priceLabel={TOUR.booking.priceLabel}
            ticketTypes={TOUR.booking.ticketTypes}
            addOns={TOUR.booking.addOns}
          />
        </div>
      </div>
    </main>
  );
}
