interface TourOverviewProps {
 description: string;
 highlights: string[];
 included: string[];
 notIncluded: string[];
}

const CheckIcon = ({ included }: { included: boolean }) => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
 stroke={included ? "#22c55e" : "#ef4444"}>
 {included
 ? <><polyline points="20 6 9 17 4 12" /></>
 : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
 </svg>
);

export default function TourOverview({ description, highlights, included, notIncluded }: TourOverviewProps) {
 return (
 <section className="py-6 border-b border-gray-100">
 <h2 className="text-xl font-bold font-raleway text-text-primary mb-3">Tour Overview</h2>
 <p className="text-sm text-gray-700 font-open-sans leading-relaxed mb-5">{description}</p>

 <h3 className="text-base font-bold font-raleway text-text-primary mb-3">Tour Highlights</h3>
 <ul className="flex flex-col gap-2 mb-6">
 {highlights.map((item, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-gray-700 font-open-sans">
 <span className="mt-0.5 shrink-0 text-primary">•</span>
 {item}
 </li>
 ))}
 </ul>

 <h3 className="text-base font-bold font-raleway text-text-primary mb-3">What&apos;s Included</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
 {included.map((item, i) => (
 <div key={i} className="flex items-center gap-2 text-sm text-gray-700 font-open-sans">
 <CheckIcon included={true} />
 {item}
 </div>
 ))}
 {notIncluded.map((item, i) => (
 <div key={i} className="flex items-center gap-2 text-sm text-gray-700 font-open-sans">
 <CheckIcon included={false} />
 {item}
 </div>
 ))}
 </div>
 </section>
 );
}
