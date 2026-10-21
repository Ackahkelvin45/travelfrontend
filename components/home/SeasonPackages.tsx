"use client";

import Link from "next/link";
import Reveal from "../ui/Reveal";
import CardPulse from "../ghana/CardPulse";
import PackageCard from "../ghana/PackageCard";
import SectionHeading from "../ghana/SectionHeading";
import { usePackagesWithFlagship } from "@/lib/useFlagship";

/** Active Ghana packages from the API, flagship first. */
export default function SeasonPackages({ limit = 4 }: { limit?: number }) {
  const { packages, isLoading, isError } = usePackagesWithFlagship();
  return (
    <section className="w-full px-4 md:px-10 lg:px-20 py-12 md:py-16">
      <SectionHeading
        eyebrow="Active Ghana products"
        title="This Season in Ghana"
        action={
          <Link href="/experiences" className="self-start sm:self-auto border border-text-primary text-text-primary px-6 py-2.5 rounded-xl text-sm font-semibold font-montserrat hover:bg-text-primary hover:text-background transition-colors">
            View all experiences
          </Link>
        }
      />
      {isError && <p className="text-red-600 py-6">We couldn&apos;t load packages right now. Please try again shortly.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading && [1, 2, 3, 4].map((i) => <CardPulse key={i} />)}
        {packages.slice(0, limit).map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i, 5) * 70} className="h-full">
            <PackageCard pkg={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
