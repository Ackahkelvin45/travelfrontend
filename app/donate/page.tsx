import type { Metadata } from "next";
import { Accent, Eyebrow } from "@/components/ghana/Decor";
import Reveal from "@/components/ui/Reveal";
import DonateForm from "./DonateForm";

export const metadata: Metadata = {
  title: "Support the Michael Blackson Academy | Azura Travels",
  description: "Donate to the Michael Blackson Academy in Ghana. No travel booking needed; every donation goes to the Academy's own account.",
};

/** Permanent, shareable donation page (Change Request v4 §7), e.g. for
 * Michael Blackson's social bio. No booking needed. */
export default function DonatePage() {
  return (
    <main className="w-full bg-background pt-28 md:pt-32 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-10 flex flex-col lg:flex-row gap-12 items-start">
        <div className="lg:w-1/2 flex flex-col gap-4">
          <Reveal><Eyebrow>Michael Blackson Academy</Eyebrow></Reveal>
          <Reveal delay={100}>
            <h1 className="font-raleway font-bold text-4xl md:text-5xl text-text-primary leading-tight">Support the <Accent>Academy</Accent></h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The Michael Blackson Academy is a school in Ghana that guests on the Ghana Experience visit with Michael.
              You can give without booking a trip. Every donation is a separate payment that goes to the Academy&apos;s own account,
              and you get a receipt by email.
            </p>
          </Reveal>
        </div>
        <div className="lg:w-1/2 w-full">
          <DonateForm />
        </div>
      </div>
    </main>
  );
}
