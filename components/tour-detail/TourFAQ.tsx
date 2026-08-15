"use client";

import { AccordionItem } from "@/components/ui/Accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface TourFAQProps {
  items: FAQItem[];
}

export default function TourFAQ({ items }: TourFAQProps) {
  if (!items.length) return null;

  return (
    <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
      <h2 className="text-xl font-bold font-raleway text-text-primary mb-4">Frequently asked questions</h2>
      <div className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <AccordionItem key={i} title={item.question} defaultOpen={i === 0}>
            <p className="leading-relaxed">{item.answer}</p>
          </AccordionItem>
        ))}
      </div>
    </section>
  );
}
