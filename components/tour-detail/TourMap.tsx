interface TourMapProps {
 embedUrl?: string;
}

export default function TourMap({ embedUrl }: TourMapProps) {
 return (
 <section className="py-6 border-b border-gray-100 dark:border-gray-800">
 <h2 className="text-xl font-bold font-raleway text-text-primary mb-4">Tour Map</h2>
 <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 h-64 md:h-80 bg-gray-100">
 {embedUrl ? (
 <iframe
 src={embedUrl}
 width="100%"
 height="100%"
 style={{ border: 0 }}
 allowFullScreen
 loading="lazy"
 referrerPolicy="no-referrer-when-downgrade"
 title="Tour Map"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-gray-700 dark:text-gray-300 text-sm font-open-sans">
 Map unavailable
 </div>
 )}
 </div>
 </section>
 );
}
