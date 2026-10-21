import type { Metadata } from "next";
import accraNight from "../../assets/images/services/osu.png";
import PageHero from "@/components/ghana/PageHero";
import ExperiencesListing from "@/components/ghana/ExperiencesListing";
import { Accent } from "@/components/ghana/Decor";

export const metadata: Metadata = {
  title: "All Ghana Experiences | Azura Travels",
  description: "Every Azura trip, stay and experience in Ghana for December 2026 and January 2027.",
};

export default function ExperiencesPage() {
  return (
    <main className="w-full bg-background">
      <PageHero
        image={accraNight}
        alt="Accra skyline at night"
        heightClass="min-h-[320px] md:min-h-[360px]"
        eyebrow="All experiences"
        title={<>Everything We Offer <Accent>in Ghana</Accent></>}
        subtitle="Trips, stays and experiences for December in Ghana and the January flagship."
      />
      <section className="px-4 md:px-10 lg:px-20 pt-4 pb-16">
        <ExperiencesListing />
      </section>
    </main>
  );
}
