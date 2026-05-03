import Link from "next/link";
import Image from "next/image";
import africa from "../../assets/images/africa.png";
import Ghana from "../../assets/images/ghana.png";
const STATS = [
  { value: "500+", label: "Tours Curated" },
  { value: "32", label: "Destinations" },
  { value: "12K+", label: "Happy Travellers" },
  { value: "8", label: "Years of Excellence" },
];

const VALUES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Cultural Authenticity",
    description: "Every journey is grounded in genuine African heritage — we go beyond surface-level tourism to create experiences that are truly meaningful.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Luxury Standards",
    description: "From boutique lodges to private safaris, every touchpoint is curated to deliver world-class quality that exceeds expectations.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Diaspora Connection",
    description: "We are uniquely positioned to help the global African diaspora reconnect with their roots through meaningful, immersive homecoming experiences.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "People First",
    description: "Our expert local guides, concierge team, and partner communities are at the heart of everything — human connection is our greatest offering.",
  },
];


export default function AboutPage() {
  return (
    <div className="w-full bg-[#fbfbfb] min-h-screen">

      {/* ── Hero ── */}
      <div className="relative w-full h-[500px] md:h-[700px] mt-20">
        <Image
          src={Ghana}
          alt="About Azuratravels"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90" />

        {/* Breadcrumb */}
        <nav className="absolute top-8 left-4 md:left-10 flex items-center gap-1.5 text-xs text-white/70 font-open-sans">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>{">"}</span>
          <span className="text-white">About Us</span>
        </nav>

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e] font-montserrat mb-3">
            Our Story
          </p>
          <h1 className="text-4xl md:text-5xl font-bold font-raleway text-white leading-tight max-w-3xl">
            We Don't Just Show You Africa.<br />
            <em className="font-cormorant italic font-normal">We Help You Feel It.</em>
          </h1>
          <p className="mt-5 text-sm font-bold font-open-sans text-white/80 max-w-xl leading-relaxed">
            Azuratravels was built on a simple belief — that Africa's beauty, culture, and spirit
            deserve to be experienced in full, not sampled from a distance.
          </p>
        </div>
      </div>

      

      {/* ── Our Story ── */}
      <div className="w-full px-4 md:px-10 lg:px-20 mt-24 md:mt-52">
        <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className="flex-1 flex flex-col gap-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary font-montserrat">
              Who We Are
            </p>
            <h2 className="text-3xl font-bold font-raleway text-text-primary leading-snug">
              Born in Africa, Curated for the World
            </h2>
            <p className="text-sm font-open-sans text-gray-700 leading-relaxed">
              Azuratravels was founded in Accra, Ghana, with a vision that was both personal and ambitious —
              to redefine how Africa is experienced by travellers from around the world. We saw a gap between
              what luxury travel looked like globally and what Africa truly had to offer: depth, vibrancy, and
              an unmatched sense of living heritage.
            </p>
            <p className="text-sm font-open-sans text-gray-700 leading-relaxed">
              Today, we operate across 32 destinations, crafting journeys that span safaris at dawn,
              rooftop dinners in Lagos, spice market walks in Zanzibar, and homecoming trips for the
              African diaspora that leave travellers forever changed. Every detail is intentional.
              Every experience is earned.
            </p>
            <p className="text-sm font-open-sans text-gray-700 leading-relaxed">
              We are not a mass-market travel agency. We are curators, storytellers, and connectors —
              dedicated to the belief that travel, done right, is one of the most transformative
              things a person can do.
            </p>
            <div className="flex gap-3 mt-2">
              <Link
                href="/destinations"
                className="px-6 py-3 bg-primary text-white text-sm font-semibold font-montserrat rounded-xl hover:opacity-90 transition-opacity"
              >
                Explore Tours
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 border border-primary text-primary text-sm font-semibold font-montserrat rounded-xl hover:bg-primary hover:text-white transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="w-full lg:w-[45%] shrink-0">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1612278675615-7b093b07772d?w=800&q=85"
                alt="Our story"
                className="w-full h-[420px] object-cover rounded-2xl shadow-md"
              />
              {/* Floating accent card */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-lg px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold font-raleway text-text-primary">32 Destinations</p>
                  <p className="text-xs font-open-sans text-gray-700">Across the African continent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mission & Vision ── */}
      <div className="w-full px-4 md:px-10 lg:px-20 mt-24 md:mt-52">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl" />
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21.17" y1="8" x2="12" y2="8" />
                <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
                <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-raleway text-text-primary">Our Mission</h3>
            <p className="text-sm font-open-sans text-gray-700 leading-relaxed">
              To provide structured, high-quality, and culturally authentic travel experiences that
              celebrate Africa's rich tapestry of culture, lifestyle, and heritage — making them
              accessible to a global audience who are hungry for something real.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-primary rounded-2xl p-8 flex flex-col gap-4 relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-raleway text-white">Our Vision</h3>
            <p className="text-sm font-open-sans text-white/85 leading-relaxed">
              To become the leading gateway for premium African travel experiences — a brand
              synonymous with luxury, cultural depth, and uncompromising quality across every
              corner of the continent, celebrated by the diaspora and the world alike.
            </p>
          </div>
        </div>
      </div>

      {/* ── Core Values ── */}
      <div className="w-full px-4 md:px-10 lg:px-20 mt-24 md:mt-52">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary font-montserrat mb-2">
            What Drives Us
          </p>
          <h2 className="text-3xl font-bold font-raleway text-text-primary">Our Core Values</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                {v.icon}
              </div>
              <h4 className="text-base font-bold font-raleway text-text-primary">{v.title}</h4>
              <p className="text-sm font-open-sans text-gray-500 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Why Africa ── */}
      <div className="w-full px-4 md:px-10 lg:px-20 mt-24 md:mt-52">
        <div
          className="relative w-full rounded-2xl overflow-hidden h-96 flex items-center"
          style={{
              backgroundImage: `url(${africa.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="relative px-6 md:px-14 flex flex-col gap-4 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e] font-montserrat">
              Our Promise
            </p>
            <h2 className="text-3xl font-bold font-raleway text-white leading-snug">
              Africa is Not a Destination.<br />
              <em className="font-cormorant italic font-normal">It's a Transformation.</em>
            </h2>
            <p className="text-sm font-open-sans text-white/80 leading-relaxed">
              Every traveller who journeys with Azuratravels leaves with something they didn't expect —
              a story, a connection, or a part of themselves they didn't know was missing.
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="w-full px-4 md:px-10 lg:px-20 mt-20 mb-24">
        <div className="bg-primary rounded-2xl px-6 md:px-14 py-16 md:py-[120px] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-0">
          <div className="flex flex-col gap-3 max-w-xl">
            <h2 className="text-2xl font-bold font-raleway text-white">
              Ready to Experience Africa with Us?
            </h2>
            <p className="text-sm font-open-sans text-white/85 leading-relaxed">
              Browse our curated tours, speak with one of our travel experts, or let us design
              your bespoke African journey from the ground up.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/destinations"
              className="px-7 py-3 bg-white text-primary text-sm font-semibold font-montserrat rounded-xl hover:bg-gray-50 transition-colors"
            >
              Browse Tours
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3 border border-white/50 text-white text-sm font-semibold font-montserrat rounded-xl hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
