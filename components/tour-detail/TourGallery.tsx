"use client";

import { useState } from "react";
import { PhotoSlider } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { ImageIcon } from "@/components/ui/icons";

interface TourGalleryProps {
  images: string[];
  title: string;
}

export default function TourGallery({ images, title }: TourGalleryProps) {
  const [visible, setVisible] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const validImages = images.filter((src) => !!src && src.trim() !== "");

  // No photos yet — hold the hero slot with a quiet branded placeholder so
  // the page keeps its shape instead of collapsing into text.
  if (!validImages.length) {
    return (
      <div className="w-full mb-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 h-[220px] md:h-[300px] flex flex-col items-center justify-center gap-2.5">
        <span className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <ImageIcon size={22} />
        </span>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans">Photos coming soon</p>
      </div>
    );
  }

  const shown = validImages.slice(0, 4);
  const count = shown.length;

  const openAt = (i: number) => {
    setPhotoIndex(i);
    setVisible(true);
  };

  const heroHeights = "h-[280px] sm:h-[360px] md:h-[480px]";

  return (
    <div className="w-full mb-8 relative">
      <PhotoSlider
        images={validImages.map((src, i) => ({ src, key: i }))}
        visible={visible}
        onClose={() => setVisible(false)}
        index={photoIndex}
        onIndexChange={setPhotoIndex}
      />

      {/* 1 image */}
      {count === 1 && (
        <div className={`rounded-2xl overflow-hidden ${heroHeights} cursor-pointer group`} onClick={() => openAt(0)}>
          <img src={shown[0]} alt={title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
      )}

      {/* 2 images */}
      {count === 2 && (
        <div className={`grid grid-cols-2 gap-2 ${heroHeights} rounded-2xl overflow-hidden`}>
          {shown.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={title}
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => openAt(i)}
            />
          ))}
        </div>
      )}

      {/* 3+ images */}
      {count >= 3 && (
        <>
          {/* Mobile: single hero with count chip */}
          <div
            className="md:hidden rounded-2xl overflow-hidden h-[280px] sm:h-[360px] cursor-pointer relative"
            onClick={() => openAt(0)}
          >
            <img src={shown[0]} alt={title} className="w-full h-full object-cover" />
            <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold font-open-sans px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <ImageIcon size={13} />
              {validImages.length} photos
            </span>
          </div>

          {/* Desktop: hero left + right grid */}
          <div
            className="hidden md:grid gap-2 rounded-2xl overflow-hidden h-[480px]"
            style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}
          >
            <img
              src={shown[0]}
              alt={title}
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              style={{ gridRow: "1 / 3" }}
              onClick={() => openAt(0)}
            />
            <img
              src={shown[1]}
              alt={title}
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => openAt(1)}
            />
            {count === 3 ? (
              <img
                src={shown[2]}
                alt={title}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => openAt(2)}
              />
            ) : (
              <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <img
                  src={shown[2]}
                  alt={title}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => openAt(2)}
                />
                <div className="relative cursor-pointer group" onClick={() => openAt(3)}>
                  <img src={shown[3]} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors flex items-end justify-end p-4">
                    <span className="bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold font-open-sans px-4 py-2 rounded-full">
                      {validImages.length > 4 ? `+${validImages.length - 4} more` : "See all photos"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
