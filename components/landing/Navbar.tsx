"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "../../assets/logo/logo.png";
import logoDark from "../../assets/logo/logodark.png";
import AccountMenu from "../ui/AccountMenu";
import { NAV_LINKS } from "@/lib/content/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Checkout has its own focused header (canvas: CheckoutDetails / CheckoutPayment).
  if (pathname.startsWith("/checkout")) return null;

  return (
    <nav
      aria-label="Main"
      className={`w-full z-50 fixed font-work-sans px-4 md:px-10 h-20 flex items-center justify-between gap-6 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm"
          : "bg-background"
      }`}
    >
      <Link href="/" className="flex items-center shrink-0" aria-label="Azura Travels home">
        <Image src={logo} alt="Azura Travels" className="h-16 w-28 object-contain dark:hidden" priority />
        <Image src={logoDark} alt="Azura Travels" className="h-16 w-28 object-contain hidden dark:block" priority />
      </Link>

      <ul className="hidden lg:flex items-center gap-6 xl:gap-7 list-none">
        {NAV_LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={isActive(pathname, l.href) ? "page" : undefined}
              className={`relative text-[15px] whitespace-nowrap transition-colors hover:text-primary after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:bg-primary after:transition-all ${
                isActive(pathname, l.href) ? "text-primary font-medium after:w-full" : "text-text-primary after:w-0 hover:after:w-full"
              }`}
            >
              {l.label}
            </Link>
          </li>
        ))}
        <li><AccountMenu /></li>
        <li>
          <Link href="/ghana-experience-2027" className="bg-primary text-white font-montserrat font-semibold text-sm px-5 py-3 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all whitespace-nowrap">
            Book Now
          </Link>
        </li>
      </ul>

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        className="lg:hidden text-text-primary w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700"
      >
        {menuOpen ? (
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        ) : (
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        )}
      </button>

      <div aria-hidden="true" className="kente absolute inset-x-0 bottom-0 h-1" />

      {menuOpen && (
        <div className="content-in absolute top-20 left-0 w-full bg-white dark:bg-gray-900 shadow-md border-b border-gray-100 dark:border-gray-800 flex flex-col px-4 pb-5 lg:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`text-base font-semibold py-3.5 border-b border-gray-100 dark:border-gray-800 ${isActive(pathname, l.href) ? "text-primary" : "text-text-primary"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-base font-semibold text-text-primary py-3.5 border-b border-gray-100 dark:border-gray-800">
            My Bookings
          </Link>
          <Link href="/ghana-experience-2027" onClick={() => setMenuOpen(false)} className="mt-4 text-center bg-primary text-white font-montserrat font-semibold py-3.5 rounded-xl">
            Book Now
          </Link>
        </div>
      )}
    </nav>
  );
}
