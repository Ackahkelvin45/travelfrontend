"use client";

interface TourGalleryProps {
  images: string[];
  title: string;
}

export default function TourGallery({ images, title }: TourGalleryProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden ]">
      {/* Left — single tall image */}
      <img src={images[0]} alt={title} className="w-full h-full object-cover" />

      {/* Right — top image + two bottom images */}
      <div className="grid grid-rows-[1fr_1fr] gap-2">
        <img src={images[1]} alt={title} className="w-full h-full object-cover" />

        <div className="grid grid-cols-2 gap-2">
          <img src={images[2]} alt={title} className="w-full h-full object-cover" />

          {/* Last image with "See all photos" overlay */}
          <div className="relative">
            <img src={images[3]} alt={title} className="w-full h-full object-cover" />
            <button className="absolute inset-0 bg-black/40 flex items-end justify-end p-4 hover:bg-black/50 transition-colors">
              <span className="bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold font-open-sans px-4 py-2 rounded-full">
                See all photos
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}