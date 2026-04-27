import type { StaticImageData } from "next/image";
import image1 from "../assets/images/trending/1.png";
import image2 from "../assets/images/trending/2.png";
import image3 from "../assets/images/trending/3.png";

export interface Tour {
  id: string;
  image: string | StaticImageData;
  badge?: string;
  badgeVariant?: "discount" | "featured";
  location: string;
  title: string;
  rating: number;
  reviews: number;
  days: number;
  price: number;
  description: string;
  tags: string[];
  duration: string;
  originalPrice?: number;
}

export const tours: Tour[] = [
  {
    id: "serengeti-safari",
    image: image1,
    badge: "20% Off",
    badgeVariant: "discount",
    location: "Serengeti, Tanzania",
    title: "Serengeti Safari — Private Game Drive at Dawn",
    rating: 4.8,
    reviews: 243,
    days: 4,
    price: 189.25,
    description: "Witness the great migration up close on an exclusive private game drive at sunrise through the Serengeti plains.",
    tags: ["Best Price Guarantee", "Free Cancellation"],
    duration: "4 Days 3 Nights",
    originalPrice: 250,
  },
  {
    id: "cape-town-escape",
    image: "https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=600&q=80",
    badgeVariant: "discount",
    location: "Cape Town, South Africa",
    title: "Cape Town Luxury City & Wine Lands Escape",
    rating: 4.8,
    reviews: 243,
    days: 5,
    price: 225,
    description: "Explore Cape Town's iconic landmarks, sample world-class wines in Stellenbosch, and unwind on pristine Atlantic beaches.",
    tags: ["Free Cancellation"],
    duration: "5 Days 4 Nights",
    originalPrice: 310,
  },
  {
    id: "marrakech-cultural",
    image: image2,
    badge: "FEATURED",
    badgeVariant: "featured",
    location: "Marrakech, Morocco",
    title: "Marrakech Cultural Immersion & Medina Walking Tour",
    rating: 4.8,
    reviews: 243,
    days: 3,
    price: 943,
    description: "Wander through the vibrant souks, visit ancient palaces, and savour authentic Moroccan cuisine in the heart of the Medina.",
    tags: ["Best Price Guarantee", "Free Cancellation"],
    duration: "3 Days 2 Nights",
    originalPrice: 1200,
  },
  {
    id: "zanzibar-retreat",
    image: image3,
    badgeVariant: "discount",
    location: "Zanzibar, Tanzania",
    title: "Zanzibar All-Inclusive Beach & Spice Island Retreat",
    rating: 4.8,
    reviews: 243,
    days: 6,
    price: 771,
    description: "Relax on turquoise-fringed beaches, tour aromatic spice plantations, and dive pristine coral reefs on this island paradise.",
    tags: ["Best Price Guarantee"],
    duration: "6 Days 5 Nights",
    originalPrice: 950,
  },
  {
    id: "lagos-nightlife",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
    badgeVariant: "discount",
    location: "Lagos, Nigeria",
    title: "Lagos VIP Nightlife & Culinary Experience Weekend",
    rating: 4.8,
    reviews: 243,
    days: 3,
    price: 420,
    description: "Discover Lagos's electric nightlife, taste street food at Victoria Island, and cruise the lagoon at sunset.",
    tags: ["Free Cancellation"],
    duration: "3 Days 2 Nights",
    originalPrice: 520,
  },
  {
    id: "nairobi-boutique",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
    badgeVariant: "discount",
    location: "Nairobi, Kenya",
    title: "Nairobi Luxury Boutique Stay & Nairobi National Park",
    rating: 4.8,
    reviews: 243,
    days: 4,
    price: 610,
    description: "Stay in a boutique hotel steps from the savannah, spot lions and giraffes in Nairobi National Park, and visit the Karen Blixen Museum.",
    tags: ["Best Price Guarantee", "Free Cancellation"],
    duration: "4 Days 3 Nights",
    originalPrice: 780,
  },
];
