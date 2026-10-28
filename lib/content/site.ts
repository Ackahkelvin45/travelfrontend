/**
 * Marketing copy for the Ghana-only site (Change Request v2, Oct 2026).
 *
 * Checkout prices always come from the API; these values drive the static
 * marketing pages only. Bracketed values are placeholders the client still has
 * to supply — keep them visibly bracketed until replaced.
 */

export const FLAGSHIP_SLUG = "michael-blackson-ghana-experience";

/** Fallbacks while Settings are blank: empty, so pages hide the line rather than
 * show a placeholder (Change Request v4 §1). Staffed hours reads as a phrase. */
export const CONTACT = {
  email: "",
  phone: "",
  whatsapp: "",
  /** Digits only, international format, for wa.me links. Empty until supplied. */
  whatsappDigits: "",
  emergency: "",
  legal: "",
  staffedHours: "our staffed hours",
};

export const whatsappHref = CONTACT.whatsappDigits ? `https://wa.me/${CONTACT.whatsappDigits}` : "/about#contact";

export interface NavLink { href: string; label: string; children?: { href: string; label: string; note?: string }[] }

// Ghana Experience categories (client feedback, Oct 2026). The Michael
// Blackson Ghana Experience stays first. Table Reservations, Group Share and
// Creator Packages belong to EnqoreAccess, not this site.
export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  {
    href: "/ghana-experience-2027", label: "Ghana Experience", children: [
      { href: "/ghana-experience-2027", label: "Michael Blackson Ghana Experience", note: "6–11 January 2027 · featured" },
      { href: "/stays", label: "Airbnbs", note: "Stay in Accra, with or without the event" },
      { href: "/december-in-ghana", label: "December Tour Packages" },
      { href: "/experiences", label: "Experiences" },
    ],
  },
  { href: "/faqs", label: "FAQs" },
  { href: "/about", label: "About Us" },
];

export const TRIP = {
  name: "Michael Blackson Ghana Experience",
  dates: "Wed 6 – Mon 11 January 2027",
  shortDates: "6–11 Jan 2027",
  nights: "Crown Forest night included",
  arrival: "[ARRIVAL TIME]",
};

// Fallback copy (Change Request v4). The live site reads the package from the API.
export const PROGRAMME = [
  { date: "Wed 6 Jan", text: "Arrivals, check-in and settling in. Welcome dinner with Michael Blackson. A Jubilee House visit is possible but not confirmed.", night: "Accra" },
  { date: "Thu 7 Jan", text: "Cape Coast Castle, lunch at Lemon Beach and the Michael Blackson Academy with Michael. Transfer to Crown Forest.", night: "Crown Forest (included in Core)" },
  { date: "Fri 8 Jan", text: "Breakfast at Crown Forest, wildlife and nature activities. Return to Accra. Optional ENZO VIP night with Michael.", night: "Accra" },
  { date: "Sat 9 Jan", text: "Boti Falls group excursion. Optional waterfall massage.", night: "Accra" },
  { date: "Sun 10 Jan", text: "Accra city tour: National Museum, Kwame Nkrumah Mausoleum and Arts Centre, with lunch. Farewell dinner, included in Core.", night: "Accra" },
  { date: "Mon 11 Jan", text: "Checkout and departure. Optional airport transfer for guests in Azura accommodation.", night: "None" },
];

export const INCLUDED = [
  "Welcome dinner and farewell dinner",
  "Cape Coast Castle, Lemon Beach lunch and the Academy visit",
  "Crown Forest night on 7 January, with breakfast and nature activities",
  "Boti Falls group excursion",
  "Accra city tour with lunch",
];

export const EXCLUDED = [
  "Accra accommodation, unless added",
  "ENZO VIP, Waterfall Massage and airport transfers, unless added",
  "Drinks at Bella Afrik (self-pay)",
];

export type Faq = { topic: string; q: string; a: string };

export const FAQS: Faq[] = [
  { topic: "Trip", q: "What are the trip dates?", a: "Wednesday 6 to Monday 11 January 2027. Thursday 7 January is the Crown Forest night, included in Core. Monday is checkout and departure." },
  { topic: "Trip", q: "What does the Core ticket include?", a: "The welcome and farewell dinners, Cape Coast Castle, Lemon Beach lunch, the Academy visit, the Crown Forest night with breakfast and activities, the Boti Falls excursion and the Accra city tour with lunch. Drinks at Bella Afrik are self-pay." },
  { topic: "Trip", q: "Will Michael Blackson be there the whole time?", a: "Michael's planned appearances are the Wednesday welcome dinner, the Thursday Academy visit and the Friday ENZO VIP night. Timings are subject to final confirmation, and a Jubilee House visit is possible but not confirmed." },
  { topic: "Stays", q: "Do I have to book accommodation with you?", a: "No. You can arrange your own. If you add an Airbnb or a Four Points room, every guest in it needs their own Core ticket." },
  { topic: "Stays", q: "How is accommodation priced?", a: "Per unit, for a fixed package. Airbnb is five nights, 6 to 11 January, and stays yours on the Crown Forest night for your luggage. Four Points is four paid nights, 6 and 8 to 10 January. A one-bedroom Airbnb sleeps up to 2 and a two-bedroom up to 4, and the unit is charged once however many guests share it." },
  { topic: "Stays", q: "Can I book just an Airbnb, without the event?", a: "Yes. Stay-only Airbnbs are for 20 to 31 January, eleven nights, at the same nightly rate. They don't include a Core ticket or event experiences, and you can add an airport transfer." },
  { topic: "Stays", q: "Is breakfast included?", a: "Breakfast at Crown Forest on 7 January is included in Core. Four Points breakfast is still being confirmed with the hotel." },
  { topic: "Prices", q: "Are there any discounts?", a: "Yes. Groups of 4 to 9 get 5% off the total price and groups of 10 or more get 7%. Bookings linked to the same lead count as one group, and the discount is shown before you pay. A booking keeps the discount it was paid at: if your group grows later, the new booking gets the higher rate and earlier ones stay as they are." },
  { topic: "Prices", q: "Can my partner and I choose different experiences?", a: "Yes. Experiences are chosen per guest. ENZO VIP is for guests aged 18 and over." },
  { topic: "Prices", q: "Do you offer airport transfers?", a: "Yes, for guests staying in Azura accommodation: $100 per guest for an arrival pickup or $200 per guest for pickup and drop-off." },
  { topic: "Payments", q: "How do deposits and payments work?", a: "Core tickets, experiences and transfers are paid in full when you book. For accommodation you can pay at least 50% to secure the room and the rest in instalments. Everything must be paid before the first activity on 6 January, and we remind you 30, 14 and 7 days before." },
  { topic: "Payments", q: "Can each member of our group pay separately?", a: "Yes. One organiser can pay for everyone, or each guest can pay their own share under the same group booking." },
  { topic: "Payments", q: "What happens if a balance isn't paid?", a: "Every guest's share must be paid before the first activity on 6 January. Guests with an unpaid balance at the start can't receive a badge or join activities, and unpaid bookings are forfeited under the booking terms. We never cancel early just because one instalment was missed." },
  { topic: "Payments", q: "What if my payment fails?", a: "Nothing is booked until payment is verified, and you won't be charged twice. You can retry straight away from the payment page or your booking link." },
  { topic: "Payments", q: "What is the cancellation policy?", a: "Refunds of eligible payments depend on notice: 90% at 60 days or more, 60% at 30 to 59 days, 40% at 14 to 29 days and none under 14 days. See our refund policy for the full terms." },
  { topic: "Travel", q: "Do you need my passport?", a: "Only when a confirmed supplier or legal requirement needs it." },
]
