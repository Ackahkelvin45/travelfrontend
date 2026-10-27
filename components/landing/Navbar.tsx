"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "../../assets/logo/logo.png";
import logoDark from "../../assets/logo/logodark.png";
import AccountMenu from "../ui/AccountMenu";
import { NAV_LINKS, type NavLink } from "@/lib/content/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

const inSection = (pathname: string, l: NavLink) =>
  isActive(pathname, l.href) || !!l.children?.some((c) => isActive(pathname, c.href));

const underline = (on: boolean) =>
  `relative text-[15px] whitespace-nowrap transition-colors hover:text-primary after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:bg-primary after:transition-all ${
    on ? "text-primary font-medium after:w-full" : "text-text-primary after:w-0 hover:after:w-full"
  }`;

/** Desktop dropdown: opens on hover or keyboard focus, and on click for touch. */
function NavMenu({ link, pathname }: { link: NavLink; pathname: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="relative group" onMouseLeave={() => setOpen(false)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((v) => !v)}
        className={`${underline(inSection(pathname, link))} inline-flex items-center gap-1`}>
        {link.label}
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <div className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 ${open ? "block" : "hidden"} group-hover:block`}>
        <ul className="w-80 rounded-2xl bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-2 list-none">
          {link.children!.map((c) => (
            <li key={c.label}>
              <Link href={c.href} onClick={() => setOpen(false)} aria-current={pathname === c.href ? "page" : undefined}
                className="flex flex-col gap-0.5 rounded-xl px-4 py-3 hover:bg-primary/5 focus-visible:bg-primary/5">
                <span className={`text-sm font-semibold ${pathname === c.href ? "text-primary" : "text-text-primary"}`}>{c.label}</span>
                {c.note && <span className="text-xs text-gray-600 dark:text-gray-400">{c.note}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
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
        {NAV_LINKS.map((l) => l.children ? <NavMenu key={l.label} link={l} pathname={pathname} /> : (
          <li key={l.href}>
            <Link href={l.href} aria-current={isActive(pathname, l.href) ? "page" : undefined} className={underline(isActive(pathname, l.href))}>
              {l.label}
            </Link>
          </li>
        ))}
        <li><AccountMenu /></li>
        <li>
          <Link href="/ghana-experience-2027/build" className="bg-primary text-white font-montserrat font-semibold text-sm px-5 py-3 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all whitespace-nowrap">
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


      {menuOpen && (
        <div className="content-in absolute top-20 left-0 w-full bg-white dark:bg-gray-900 shadow-md border-b border-gray-100 dark:border-gray-800 flex flex-col px-4 pb-5 lg:hidden">
          {NAV_LINKS.map((l) => l.children ? (
            <div key={l.label} className="py-3.5 border-b border-gray-100 dark:border-gray-800 flex flex-col">
              <span className={`text-base font-semibold ${inSection(pathname, l) ? "text-primary" : "text-text-primary"}`}>{l.label}</span>
              {l.children.map((c) => (
                <Link key={c.label} href={c.href} onClick={() => setMenuOpen(false)}
                  className={`pl-4 pt-3 text-[15px] ${pathname === c.href ? "text-primary font-semibold" : "text-gray-700 dark:text-gray-300"}`}>
                  {c.label}
                </Link>
              ))}
            </div>
          ) : (
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
          <Link href="/ghana-experience-2027/build" onClick={() => setMenuOpen(false)} className="mt-4 text-center bg-primary text-white font-montserrat font-semibold py-3.5 rounded-xl">
            Book Now
          </Link>
        </div>
      )}
    </nav>
  );
}
