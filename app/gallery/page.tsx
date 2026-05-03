import GalleryClient from "@/components/gallery/GalleryClient";

export const metadata = {
  title: "Gallery | Travel and Tour",
  description: "Explore our collection of destination and package photos.",
};

export default function GalleryPage() {
  return (
    <main className="pt-20">
      <GalleryClient />
    </main>
  );
}
