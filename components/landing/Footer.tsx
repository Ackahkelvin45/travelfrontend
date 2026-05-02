import Link from "next/link";
import footerBg from "../../assets/images/bgfooter.png";
import logofull from "../../assets/logo/logofull.png";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="w-full font-open-sans bg-cover bg-center mt-12 md:mt-25 bg-no-repeat"
      style={{ backgroundImage: `url(${footerBg.src})` }}
    >
      {/* Top bar */}
      <div className="px-4 md:px-10 lg:px-20 py-10 md:py-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <Image src={logofull} alt="Azura Travels" className="w-48 h-auto" />
   
        <div className="flex gap-4 h-full items-end justify-center md:justify-end mt-4 md:mt-30">
          <span className="text-text-primary font-semibold font-montserrat text-sm">
            Follow Us
          </span>
          {/* Instagram */}
          <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-primary transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
          </a>
          {/* Facebook */}
          <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-primary transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          {/* Twitter / X */}
          <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-primary transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* LinkedIn */}
          <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-primary transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>
      </div>
      <hr className="border-gray-200 mx-4 md:mx-10 lg:mx-20" />

      {/* Main footer */}
      <div className="px-4 md:px-10 lg:px-20 py-10 md:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10 lg:gap-12">
        {/* Contact */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold font-raleway text-text-primary">Contact</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            14 Adeola Odeku Street,<br />
            Accra,<br />
            Ghana.
          </p>

          <p>
            +233 24 123 4567<br />
            +233 20 987 6543
          </p>
          <a href="mailto:hello@azuratravels.com" className="text-gray-500 text-sm hover:text-primary transition-colors">
            hello@azuratravels.com
          </a>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold font-raleway text-text-primary mb-1">Company</h3>
          {["About Us", "Reviews", "Contact Us", "Travel Guides"].map((item) => (
            <Link key={item} href="#" className="text-gray-500 text-sm hover:text-primary transition-colors">
              {item}
            </Link>
          ))}
        </div>

        {/* Support */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold font-raleway text-text-primary mb-1">Support</h3>
          {["Get in Touch", "Help Center"].map((item) => (
            <Link key={item} href="#" className="text-gray-500 text-sm hover:text-primary transition-colors">
              {item}
            </Link>
          ))}
        </div>

        {/* Newsletter + Mobile Apps */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold font-raleway text-text-primary">Newsletter</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Subscribe to the free newsletter and stay up to date
          </p>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden pr-1 bg-white">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 text-sm text-gray-500 placeholder-gray-300 outline-none bg-transparent"
            />
            <button className="bg-primary text-white text-sm font-semibold font-montserrat px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shrink-0">
              Send
            </button>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <hr className="border-gray-200 mx-4 md:mx-10 lg:mx-20" />
      <div className="px-4 md:px-10 lg:px-20 py-6 md:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-400 text-xs font-open-sans">
          © {new Date().getFullYear()} Azuratravels. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="#" className="text-gray-400 text-xs hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-gray-400 text-xs hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
