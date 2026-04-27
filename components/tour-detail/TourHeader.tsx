interface TourHeaderProps {
  title: string;
  badges: string[];
  breadcrumb: { label: string; href: string }[];
}

export default function TourHeader({ title, badges, breadcrumb }: TourHeaderProps) {
  return (
    <div className="mb-4">
      <nav className="flex items-center gap-2 text-xs text-gray-400 font-open-sans mb-3">
        {breadcrumb.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span>{">"}</span>}
            <a href={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </a>
          </span>
        ))}
      </nav>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold font-raleway text-text-primary leading-snug">
          {title}
        </h1>
        <div className="flex items-center gap-3 shrink-0 mt-1">
          <button className="flex items-center gap-1.5 text-sm text-gray-500 font-open-sans hover:text-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 font-open-sans hover:text-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Wishlist
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {badges.map((badge) => (
          <span
            key={badge}
            className="px-3 py-1 bg-orange-50 text-primary text-xs font-semibold font-open-sans rounded-full border border-orange-200"
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
