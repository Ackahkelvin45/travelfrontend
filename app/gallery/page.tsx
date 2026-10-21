import GalleryClient from "@/components/gallery/GalleryClient";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Gallery · Ghana Through Our Lens | Azura Travels",
  description: "Photos from Accra in December, Crown Forest, the coast and our Ghana trips.",
};

export default function GalleryPage() {
  return (
    <main className="pt-20">
      <header className="px-4 pt-14 pb-10 flex flex-col items-center text-center gap-3">
        <Reveal className="flex items-center gap-3">
          <span aria-hidden="true" className="kente w-10 h-1.5 rounded-sm" />
          <span className="font-montserrat text-sm font-semibold uppercase tracking-[0.25em] text-[#8A6420] dark:text-[#C9A96E]">Gallery</span>
          <span aria-hidden="true" className="kente w-10 h-1.5 rounded-sm" />
        </Reveal>
        <Reveal delay={100}>
          <h1 className="font-raleway font-bold text-4xl md:text-5xl text-text-primary">
            Ghana, <em className="font-cormorant italic text-[#8A6420] dark:text-[#C9A96E]">Through Our Lens</em>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="text-gray-700 dark:text-gray-300 max-w-xl">Accra in December, Crown Forest, the coast and the moments in between.</p>
        </Reveal>
      </header>
      <GalleryClient />
    </main>
  );
}
