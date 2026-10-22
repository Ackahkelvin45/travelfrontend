import type { ReactNode } from "react";

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
