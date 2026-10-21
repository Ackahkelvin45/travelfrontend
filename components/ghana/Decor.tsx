import type { ReactNode } from "react";

/** Brush-stroke curve that blends a hero photo into the page background. */
export function HeroCurve({ height = 110 }: { height?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className="absolute inset-x-0 -bottom-px w-full z-1 text-background"
      style={{ height }}
    >
      <path d="M0 74 C 120 52, 230 92, 360 70 S 590 40, 720 64 S 960 98, 1090 70 S 1330 44, 1440 66" fill="none" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M0 88 C 110 70, 220 104, 350 86 C 470 70, 560 58, 700 78 C 820 95, 930 108, 1080 86 C 1210 67, 1320 62, 1440 80 L 1440 120 L 0 120 Z" fill="currentColor" />
      <path d="M30 96 C 160 84, 260 108, 400 96 M 820 104 C 900 110, 980 106, 1060 98 M 1180 90 C 1260 84, 1340 86, 1420 92" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

/** Ghana's black star with a gold outline. */
export function BlackStar({ size = 40, spin = false, className = "" }: { size?: number; spin?: boolean; className?: string }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" className={className}>
      <polygon
        className={spin ? "star-spin" : undefined}
        points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6"
        fill="#060504"
        stroke="#C9A96E"
        strokeWidth="1"
      />
    </svg>
  );
}

export function Kente({ className = "h-1.5" }: { className?: string }) {
  return <div aria-hidden="true" className={`kente ${className}`} />;
}

/** Small gold uppercase label used above section titles. */
export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`font-montserrat text-xs md:text-sm font-semibold uppercase tracking-[0.25em] ${light ? "text-[#C9A96E]" : "text-[#8A6420] dark:text-[#C9A96E]"}`}>
      {children}
    </p>
  );
}

/** Italic serif accent used inside headings, e.g. "Your <Accent>Way</Accent>". */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="font-cormorant italic font-semibold">{children}</em>;
}
