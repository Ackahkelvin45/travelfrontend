interface TourMapProps {
 embedUrl?: string;
}

export default function TourMap({ embedUrl }: TourMapProps) {
 if (!embedUrl) return null;
 return (
 <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
 <h2 className="text-xl font-bold font-raleway text-text-primary mb-4">Where you&apos;ll go</h2>
 <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 h-64 md:h-80 bg-gray-100 dark:bg-gray-800">
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
 </div>
 </section>
 );
}
