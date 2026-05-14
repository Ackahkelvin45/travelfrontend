"use client";

import { useState } from "react";
import { PhotoSlider } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

interface TourGalleryProps {
 images: string[];
 title: string;
}

export default function TourGallery({ images, title }: TourGalleryProps) {
 const [visible, setVisible] = useState(false);
 const [photoIndex, setPhotoIndex] = useState(0);

 const validImages = images.filter((src) => !!src && src.trim() !== "");
 if (!validImages.length) return null;

 const shown = validImages.slice(0, 4);
 const count = shown.length;

 const openAt = (i: number) => {
 setPhotoIndex(i);
 setVisible(true);
 };

 return (
 <div className="w-full mb-10 relative">
 <PhotoSlider
 images={validImages.map((src, i) => ({ src, key: i }))}
 visible={visible}
 onClose={() => setVisible(false)}
 index={photoIndex}
 onIndexChange={setPhotoIndex}
 />

 {/* 1 image */}
 {count === 1 && (
 <div
 className="rounded-2xl overflow-hidden h-[800px] cursor-pointer"
 onClick={() => openAt(0)}
 >
 <img src={shown[0]} alt={title} className="w-full h-full object-cover" />
 </div>
 )}

 {/* 2 images */}
 {count === 2 && (
 <div className="grid grid-cols-2 gap-2 h-[800px] rounded-2xl overflow-hidden">
 {shown.map((src, i) => (
 <img
 key={i}
 src={src}
 alt={title}
 className="w-full h-full object-cover cursor-pointer"
 onClick={() => openAt(i)}
 />
 ))}
 </div>
 )}

 {/* 3+ images */}
 {count >= 3 && (
 <>
 {/* Mobile: single hero */}
 <div
 className="md:hidden rounded-2xl overflow-hidden h-[500px] cursor-pointer"
 onClick={() => openAt(0)}
 >
 <img src={shown[0]} alt={title} className="w-full h-full object-cover" />
 </div>

 {/* Desktop: hero left + right grid */}
 <div
 className="hidden md:grid gap-2 rounded-2xl overflow-hidden h-[800px]"
 style={{
 gridTemplateColumns: "1fr 1fr",
 gridTemplateRows: "1fr 1fr",
 }}
 >
 {/* Hero — spans both rows */}
 <img
 src={shown[0]}
 alt={title}
 className="w-full h-full object-cover cursor-pointer"
 style={{ gridRow: "1 / 3" }}
 onClick={() => openAt(0)}
 />

 {/* Top right */}
 <img
 src={shown[1]}
 alt={title}
 className="w-full h-full object-cover cursor-pointer"
 onClick={() => openAt(1)}
 />

 {/* Bottom right */}
 {count === 3 ? (
 <img
 src={shown[2]}
 alt={title}
 className="w-full h-full object-cover cursor-pointer"
 onClick={() => openAt(2)}
 />
 ) : (
 <div
 className="grid gap-2"
 style={{ gridTemplateColumns: "1fr 1fr" }}
 >
 <img
 src={shown[2]}
 alt={title}
 className="w-full h-full object-cover cursor-pointer"
 onClick={() => openAt(2)}
 />
 <div
 className="relative cursor-pointer"
 onClick={() => openAt(3)}
 >
 <img
 src={shown[3]}
 alt={title}
 className="absolute inset-0 w-full h-full object-cover"
 />
 <div className="absolute inset-0 bg-black/40 flex items-end justify-end p-4 hover:bg-black dark:hover:bg-white dark:hover:text-black/50 transition-colors">
 <span className="bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold font-open-sans px-4 py-2 rounded-full">
 {validImages.length > 4
 ? `+${validImages.length - 4} more`
 : "See all photos"}
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