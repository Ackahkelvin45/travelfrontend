"use client";

import Link from "next/link";
import logo from "../../assets/logo/logo.png";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`w-full z-50 fixed font-work-sans px-10 h-20 py-2 flex items-center gap-8 transition-all duration-300 ${
      scrolled
        ? "bg-white/60 backdrop-blur-md border-b border-white/30 shadow-sm"
        : "bg-[#fbfbfb]"
    }`}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 flex-shrink-0">
        <Image src={logo} alt="TravelandTour Logo"  className="h-16 w-28" />
      </Link>

      {/* Search */}
      <div className="relative max-w-xs w-full ml-10">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search destinations or activities"
          className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-500 placeholder-gray-300 outline-none focus:border-primary focus:bg-white transition-colors"
        />
      </div>

      {/* Spacer */}
      <div className="flex justify-end    w-full" >


      {/* Nav Links */}
      <ul className="flex items-center gap-7 list-none">
        <li>
          <Link href="/destinations" className="text-base text-text-primary hover:text-primary transition-colors">
            Destinations
          </Link>
        </li>
        <li>
          <Link href="/activities" className="text-base   text-text-primary hover:text-primary transition-colors">
            Experiences
          </Link>
        </li>
          <li>
          <Link href="/contact" className="text-base  text-text-primary hover:text-primary transition-colors">
            Blog
          </Link>
        </li>
        <li>
          <Link href="/about" className="text-base   text-text-primary hover:text-primary transition-colors">
            About Us
          </Link>
        </li>
        
      </ul>

   

   
      </div>
      </nav>
  );
}