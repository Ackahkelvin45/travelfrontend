"use client";

import { useState } from "react";

const testimonials = [
  {
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    headline: "Excellent Service!",
    review:
      "I had an amazing experience with Azuratravels. The service was top-notch, and the team was incredibly attentive. Every detail was perfectly curated — I highly recommend them!",
    name: "Amara Johnson",
    role: "Traveler",
  },
  {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    headline: "Truly Unforgettable!",
    review:
      "From the safari at dawn to the rooftop dinner in Lagos, every moment felt intentional and luxurious. Azuratravels doesn't just plan trips — they craft memories.",
    name: "David Mensah",
    role: "Business Traveler",
  },
  {
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80",
    headline: "Beyond Expectations!",
    review:
      "The cultural immersion tour in Marrakech was a life-changing experience. The local guides, the food, the hospitality — everything exceeded what I could have imagined.",
    name: "Nadia Osei",
    role: "Lifestyle Blogger",
  },
  {
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    headline: "World-Class Luxury!",
    review:
      "Our corporate retreat in Cape Town was flawlessly organised. The team handled every detail — accommodation, transport, activities — with total professionalism.",
    name: "James Adeyemi",
    role: "CEO, Tech Startup",
  },
  {
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    headline: "A Dream Come True!",
    review:
      "I've always wanted to reconnect with my African roots. Azuratravels made that journey so personal and meaningful. The Zanzibar retreat was pure magic.",
    name: "Kezia Williams",
    role: "Diaspora Traveler",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const t = testimonials[active];

  return (
    <section className="w-full px-20 py-20 bg-[#fbfbfb] mt-25 flex flex-col items-center">
      {/* Title */}
      <h2 className="text-3xl font-bold font-raleway text-text-primary mb-14">
        Customer Reviews
      </h2>

      {/* Avatar with quote badge */}
      <div className="relative w-24 h-24 mb-8">
        <img
          src={t.image}
          alt={t.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
        />
        <div className="absolute -top-2 -left-2 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
          </svg>
        </div>
      </div>

      {/* Headline */}
      <p className="text-primary font-semibold font-montserrat text-lg mb-4">
        {t.headline}
      </p>

      {/* Review text */}
      <p className="text-text-primary font-open-sans text-sm text-center max-w-2xl leading-relaxed mb-6">
        {t.review}
      </p>

      {/* Name & role */}
      <p className="font-bold font-raleway text-text-primary">{t.name}</p>
      <p className="text-gray-400 font-open-sans text-sm mt-1">{t.role}</p>

      {/* Dots */}
      <div className="flex items-center gap-2 mt-10">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${
              i === active
                ? "w-6 h-2 bg-text-primary"
                : "w-3 h-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
