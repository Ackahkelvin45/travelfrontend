"use client";

import { useRef } from "react";
import Card from "../ecommerce/Card";
import { tours } from "../../data/tours";

export default function Trending() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -310 : 310, behavior: "smooth" });
  };

  return (
    <section className="w-full px-20 py-16 bg-[#fbfbfb] mt-25">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold font-raleway text-text-primary">
          Trending
        </h2>
        <select className="border border-text-primary text-text-primary px-6 py-2.5 rounded-xl text-sm font-semibold font-montserrat transition-colors">
          <option value="all">All Categories</option>
        </select>
      </div>

      {/* Carousel */}
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 bg-white rounded-full w-12 h-12 shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tours.map((tour) => (
            <Card key={tour.id} id={tour.id} image={tour.image} location={tour.location} title={tour.title} rating={tour.rating} reviews={tour.reviews} days={tour.days} price={tour.price} />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 bg-white rounded-full w-12 h-12 shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
