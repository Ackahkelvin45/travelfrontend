/**
 * Marketing copy for the Ghana-only site (Change Request v2, Oct 2026).
 *
 * Checkout prices always come from the API; these values drive the static
 * marketing pages only. Bracketed values are placeholders the client still has
 * to supply — keep them visibly bracketed until replaced.
 */

export const FLAGSHIP_SLUG = "michael-blackson-ghana-experience";

export const CONTACT = {
  email: "[BUSINESS EMAIL]",
  phone: "[PHONE NUMBER]",
  whatsapp: "[WHATSAPP NUMBER]",
  /** Digits only, international format, for wa.me links. Empty until supplied. */
  whatsappDigits: "",
  emergency: "[EMERGENCY CONTACT]",
  legal: "[LEGAL BUSINESS NAME AND ADDRESS]",
  staffedHours: "[STAFFED HOURS]",
};

export const whatsappHref = CONTACT.whatsappDigits ? `https://wa.me/${CONTACT.whatsappDigits}` : "/about#contact";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/december-in-ghana", label: "December in Ghana" },
  { href: "/ghana-experience-2027", label: "Ghana Experience 2027" },
  { href: "/stays", label: "Stays" },
  { href: "/faqs", label: "FAQs" },
  { href: "/about", label: "About Us" },
];

export const TRIP = {
  name: "Michael Blackson Ghana Experience",
  dates: "Wed 6 – Mon 11 January 2027",
  shortDates: "6–11 Jan 2027",
  nights: "4 Accra nights + 1 Crown Forest night",
  corePrice: 899,
  arrival: "[ARRIVAL TIME]",
};

export const PROGRAMME = [
  { date: "Wed 6 Jan", text: "Press and Jubilee House. Arrival briefing and welcome.", night: "Accra" },
  { date: "Thu 7 Jan", text: "Cape Coast Castle, Academy, Lemon Beach and Crown Forest.", night: "Crown Forest (included)" },
  { date: "Fri 8 Jan", text: "Crown Forest activities and breakfast. Return to Accra. ENZO VIP evening.", night: "Accra" },
  { date: "Sat 9 Jan", text: "Oboadaka Waterfalls, Aburi and Peduase. Optional massage.", night: "Accra" },
  { date: "Sun 10 Jan", text: "Leisure day. Optional Le Tandem farewell dinner. Bella Afrik access.", night: "Accra" },
  { date: "Mon 11 Jan", text: "Final checkout and departure.", night: "None" },
];

export const INCLUDED = [
  "Crown Forest night, activities and breakfast",
  "Press, Jubilee House and Cape Coast programme",
  "Aburi, Peduase and Oboadaka Waterfalls",
  "Bella Afrik access (drinks are self-pay)",
];

export const EXCLUDED = [
  "Accra accommodation, unless added",
  "ENZO VIP, Waterfall Massage and farewell dinner, unless added",
  "Airbnb meals",
  "Flights, visas, transfers, gratuities and taxes [TO CONFIRM]",
];

export type Stay = {
  key: string;
  tier: "Airbnb" | "Hotel";
  name: string;
  guests: string;
  price: number;
  note: string;
  status: "live" | "tbc";
};

export const STAYS: Stay[] = [
  { key: "b1", tier: "Airbnb", name: "One Bedroom Airbnb", guests: "Up to 2 guests", price: 220, note: "Meals not included", status: "live" },
  { key: "b2", tier: "Airbnb", name: "Two Bedroom Airbnb", guests: "Up to 4 guests", price: 340, note: "Meals not included", status: "live" },
  { key: "fp", tier: "Hotel", name: "Four Points Standard Room", guests: "1 guest, private room", price: 330, note: "Breakfast [TO CONFIRM]", status: "live" },
  { key: "fpc", tier: "Hotel", name: "Four Points Couple Room", guests: "2 guests sharing", price: 380, note: "Proposed rate, awaiting confirmation", status: "tbc" },
];

export const EXPERIENCES = [
  { name: "ENZO VIP", when: "Fri 8 Jan", price: 220 },
  { name: "Waterfall Massage", when: "Sat 9 Jan", price: 100 },
  { name: "Farewell Dinner at Le Tandem", when: "Sun 10 Jan · optional", price: 100 },
];

export const SAVINGS = [
  { pct: "3%", label: "Core + Airbnb" },
  { pct: "5%", label: "Core + Four Points" },
  { pct: "5%", label: "A guest's full set of experiences" },
];

export type Faq = { topic: string; q: string; a: string };

export const FAQS: Faq[] = [
  { topic: "Trip", q: "What are the trip dates?", a: "Wednesday 6 to Monday 11 January 2027. That is five nights: four in Accra and one at Crown Forest. Monday is checkout and departure." },
  { topic: "Trip", q: "What does the $899 Core ticket include?", a: "Crown Forest accommodation, activities and breakfast, plus the core programme: press and Jubilee House, Cape Coast, Aburi, Peduase, Oboadaka Waterfalls and Bella Afrik access. Drinks at Bella Afrik are self-pay. The farewell dinner is optional." },
  { topic: "Trip", q: "When should I arrive?", a: "Arrive by [ARRIVAL TIME] on Wednesday 6 January to attend the press event and Jubilee House. Tuesday arrivals need an extra night, booked separately." },
  { topic: "Stays", q: "Do I have to book accommodation with you?", a: "No. You can arrange your own. If you add Airbnb or Four Points, every guest in the room needs a Core ticket." },
  { topic: "Stays", q: "How is accommodation priced?", a: "Per unit or room, per night, for four Accra nights. A one bedroom Airbnb sleeps up to 2 and a two bedroom up to 4. The unit is charged once, however many guests share it." },
  { topic: "Stays", q: "Are meals included at the Airbnb?", a: "No. Airbnb meals are not included. Breakfast at Crown Forest is included in Core. Four Points breakfast is [TO BE CONFIRMED]." },
  { topic: "Prices", q: "What discounts are available?", a: "3% on Core plus Airbnb, 5% on Core plus Four Points, and 5% on a guest's full set of experiences. Each discount applies once per item, and there are no coupon codes." },
  { topic: "Prices", q: "Can my partner and I choose different experiences?", a: "Yes. Experiences are chosen per guest. A couple can add one for both or pick separately." },
  { topic: "Payments", q: "How do deposits and payments work?", a: "[DEPOSIT AND INSTALMENT RULES TO BE CONFIRMED]. You always see the amount due today and the remaining balance before you pay, and we remind you before the balance is due." },
  { topic: "Payments", q: "What if my payment fails?", a: "Nothing is booked until payment is verified, and you won't be charged twice. You can retry straight away from the payment page or your booking link." },
  { topic: "Payments", q: "What is the cancellation policy?", a: "See our refund policy. [APPROVED CANCELLATION AND REFUND TERMS]" },
  { topic: "Travel", q: "Do you need my passport?", a: "Only if a confirmed supplier or activity requires it. We'll ask through a secure upload, never by email or chat." },
  { topic: "Travel", q: "Are flights, visas or airport transfers included?", a: "Not unless stated. Flights, visas, transfers, gratuities and taxes are [TO BE CONFIRMED]." },
];
