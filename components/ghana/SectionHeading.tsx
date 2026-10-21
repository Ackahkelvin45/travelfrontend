import type { ReactNode } from "react";
import Reveal from "../ui/Reveal";
import { Eyebrow } from "./Decor";

/** Eyebrow + title (+ optional intro and right-aligned action) for a page section. */
export default function SectionHeading({
  eyebrow, title, intro, action,
}: { eyebrow?: ReactNode; title: ReactNode; intro?: ReactNode; action?: ReactNode }) {
  return (
    <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
      <div className="flex flex-col gap-2 max-w-2xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="font-raleway font-bold text-2xl md:text-3xl text-text-primary">{title}</h2>
        {intro && <p className="font-open-sans text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{intro}</p>}
      </div>
      {action}
    </Reveal>
  );
}
