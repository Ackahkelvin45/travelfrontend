import { CheckIcon, XIcon } from "@/components/ui/icons";

interface TourOverviewProps {
  description: string;
  highlights: string[];
}

/** About the tour: description + highlights. Inclusions live in their own
 * section (TourInclusions) so each block has one job. */
export default function TourOverview({ description, highlights }: TourOverviewProps) {
  return (
    <section className="pt-2">
      <h2 className="text-xl font-bold font-raleway text-text-primary mb-3">About this tour</h2>
      <p className="text-[15px] text-gray-700 dark:text-gray-300 font-open-sans leading-relaxed">
        {description}
      </p>

      {highlights.length > 0 && (
        <>
          <h3 className="text-base font-bold font-raleway text-text-primary mt-6 mb-3">Highlights</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {highlights.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                <span className="mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <CheckIcon size={11} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

interface TourInclusionsProps {
  included: string[];
  notIncluded: string[];
}

/** What's included / not included — two scannable columns with clear
 * positive/negative iconography. */
export function TourInclusions({ included, notIncluded }: TourInclusionsProps) {
  if (!included.length && !notIncluded.length) return null;

  return (
    <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
      <h2 className="text-xl font-bold font-raleway text-text-primary mb-4">What&apos;s included</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
        {included.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {included.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                <span className="mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <CheckIcon size={11} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}
        {notIncluded.length > 0 && (
          <div>
            <p className="text-xs font-semibold font-open-sans uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2.5 sm:hidden">
              Not included
            </p>
            <ul className="flex flex-col gap-2.5">
              {notIncluded.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500 dark:text-gray-400 font-open-sans">
                  <span className="mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center">
                    <XIcon size={10} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
