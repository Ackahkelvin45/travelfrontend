import type { StaticImageData } from "next/image";
import Link from "next/link";
import PageHero from "./PageHero";
import LeadForm from "./LeadForm";
import Reveal from "../ui/Reveal";
import { Eyebrow } from "./Decor";

/** A Ghana Experience category that isn't on sale yet: no prices, no booking,
 * just an enquiry form (client feedback, Oct 2026). */
export default function ComingSoon({ image, alt, title, intro, enquiry }: {
  image: StaticImageData; alt: string; title: string; intro: string; enquiry: string;
}) {
  return (
    <main className="w-full bg-background">
      <PageHero image={image} alt={alt} eyebrow="Coming soon" title={title} subtitle={intro} />
      <section className="px-4 md:px-10 lg:px-20 py-12">
        <Reveal className="flex flex-col lg:flex-row rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="flex-1 p-8 md:p-12 flex flex-col gap-4">
            <Eyebrow>Not bookable yet</Eyebrow>
            <h2 className="font-raleway font-bold text-2xl md:text-3xl text-text-primary">Be first to hear</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We&apos;re finalising details and prices. Leave your email and we&apos;ll tell you as soon as it opens.
              We only message you if you agree, and you can opt out any time.
            </p>
            <Link href="/ghana-experience-2027" className="self-start font-semibold text-[#8A6420] dark:text-primary underline underline-offset-2">
              See the Michael Blackson Ghana Experience
            </Link>
          </div>
          <div className="flex-1 bg-[#FAF5EB] dark:bg-gray-900 p-8 md:p-12">
            <LeadForm title={enquiry} cta="Keep me posted" />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
