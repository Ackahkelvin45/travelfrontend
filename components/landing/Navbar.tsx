"use client";

import Link from "next/link";
import logo from "../../assets/logo/logo.png";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`w-full z-50 fixed font-work-sans px-4 md:px-10 h-20 py-2 flex items-center justify-between transition-all duration-300 ${
      scrolled
        ? "bg-white/60 backdrop-blur-md border-b border-white/30 shadow-sm"
        : "bg-[#fbfbfb]"
    }`}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 flex-shrink-0">
        <Image src={logo} alt="TravelandTour Logo"  className="h-16 w-28" />
      </Link>

      {/* Search */}
      <div className="hidden md:block relative max-w-xs w-full ml-10">
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
      <div className="hidden md:flex justify-end w-full" >


      {/* Nav Links */}
      <ul className="flex items-center gap-7 list-none">
        <li>
          <Link href="/destinations" className="text-base text-text-primary hover:text-primary transition-colors">
            Explore 
          </Link>
        </li>
        
          <li>
          <Link href="/blog" className="text-base  text-text-primary hover:text-primary transition-colors">
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

      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-text-primary p-2 focus:outline-none">
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-md border-b border-gray-100 flex flex-col p-4 gap-4 md:hidden">
          <div className="relative w-full">
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
          <Link href="/destinations" onClick={() => setMenuOpen(false)} className="text-base font-semibold text-text-primary py-2 border-b border-gray-100">
            Explore
          </Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)} className="text-base font-semibold text-text-primary py-2 border-b border-gray-100">
            Blog
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="text-base font-semibold text-text-primary py-2">
            About Us
          </Link>
        </div>
      )}
      </nav>
  );
}