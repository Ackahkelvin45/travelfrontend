import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import Reveal from "../ui/Reveal";
import { Eyebrow, HeroCurve } from "./Decor";

interface PageHeroProps {
  image: StaticImageData;
  alt: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  /** Tailwind min-height class for the photo block. */
  heightClass?: string;
  overlay?: number;
  objectPosition?: string;
}

/** Photo hero with a dark scrim, staggered entrance and the curved bottom edge. */
export default function PageHero({
  image, alt, eyebrow, title, subtitle, children,
  heightClass = "min-h-[380px] md:min-h-[440px]", overlay = 0.45, objectPosition = "center",
}: PageHeroProps) {
  return (
    <section className="w-full px-4 md:px-10 pt-24 md:pt-28">
      <div className={`relative overflow-hidden rounded-t-xl ${heightClass}`}>
        <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover hero-zoom" style={{ objectPosition }} />
        <div className="absolute inset-0" style={{ background: `rgba(6,5,4,${overlay})` }} />
        <HeroCurve />
        <div className={`relative z-2 flex flex-col items-center justify-center text-center text-white px-4 pt-12 pb-28 ${heightClass}`}>
          {eyebrow && <Reveal className="mb-3"><Eyebrow light>{eyebrow}</Eyebrow></Reveal>}
          <Reveal delay={120}>
            <h1 className="font-raleway font-bold text-4xl md:text-5xl lg:text-6xl leading-tight max-w-4xl">{title}</h1>
          </Reveal>
          {subtitle && (
            <Reveal delay={240}>
              <p className="mt-4 font-open-sans text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">{subtitle}</p>
            </Reveal>
          )}
          {children && <Reveal delay={360} className="mt-6 w-full flex justify-center">{children}</Reveal>}
        </div>
      </div>
    </section>
  );
}
