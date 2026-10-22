"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import accraNight from "../../assets/images/services/osu.png";
import crownForest from "../../assets/images/hero.png";
import Reveal from "../ui/Reveal";
import { BlackStar, Eyebrow } from "../ghana/Decor";
import { useFlagshipFacts } from "@/lib/useFlagship";

/** Split-screen auth layout: Accra photo panel (desktop) + form column. */
export default function AuthShell({ eyebrow, heading, children }: { eyebrow: string; heading: ReactNode; children: ReactNode }) {
  const facts = useFlagshipFacts();
  return (
    <main className="w-full pt-20 min-h-screen flex bg-background">
      <div className="hidden lg:flex relative flex-[1.1] overflow-hidden">
        <Image src={accraNight} alt="Accra skyline at night" fill priority sizes="55vw" className="object-cover hero-zoom" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-2 flex flex-col justify-center gap-5 p-14 xl:p-20 text-white max-w-2xl">
          <Reveal><BlackStar size={40} /></Reveal>
          <Reveal delay={100}><Eyebrow light>{eyebrow}</Eyebrow></Reveal>
          <Reveal delay={200}>
            <h2 className="font-raleway font-bold text-4xl xl:text-5xl leading-tight">{heading}</h2>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-white/85 leading-relaxed max-w-md">See your booking, pay your balance, finish your travel details and add upgrades.</p>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-2 flex items-center gap-4 max-w-md rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4">
              <Image src={crownForest} alt="" className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex flex-col">
                <span className="font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#E9D3A3]">January 2027</span>
                <span className="font-raleway font-bold">{facts.name}</span>
                <span className="text-sm text-white/80">{facts.shortDates}{facts.corePrice ? ` · from ${facts.corePrice}` : ""}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12 md:px-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
