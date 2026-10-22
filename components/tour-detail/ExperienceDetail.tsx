"use client";

/** Tour page for component-priced trips (canvas: Experience). Content comes
 * from the package (admin-editable); "Build your trip" opens the builder page. */

import { useState } from "react";
import Link from "next/link";
import TourGallery from "@/components/tour-detail/TourGallery";
import Reveal from "@/components/ui/Reveal";
import { useGetComponentMatrixQuery, type PackageDetail } from "@/lib/api/packagesApi";
import { FLAGSHIP_SLUG } from "@/lib/content/site";
import { fmtDateRange, fmtMoney } from "@/lib/format";

/** The way into the trip builder, which is its own page (/tour/<id>/build). */
function BookCard({ pkg }: { pkg: PackageDetail }) {
  const { data: matrix } = useGetComponentMatrixQuery(pkg.id);
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md p-6 flex flex-col gap-4">
      <div className="flex items-baseline gap-2">
        <span className="text-xs text-gray-600 dark:text-gray-400">From</span>
        <span className="font-montserrat text-2xl font-bold text-text-primary">{matrix?.core_price_per_person ? fmtMoney(matrix.core_price_per_person, matrix.currency) : "—"}</span>
        <span className="text-xs text-gray-600 dark:text-gray-400">per traveller</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Choose who&apos;s travelling, your Accra stay, experiences and airport transfers. Your total updates as you go, with each guest&apos;s share.
      </p>
      <Link href={`/tour/${pkg.id}/build`} className="text-center bg-primary text-white font-montserrat font-semibold rounded-xl py-3.5 transition hover:brightness-95">
        Build your trip
      </Link>
    </div>
  );
}

export default function ExperienceDetail({ pkg }: { pkg: PackageDetail }) {
  const [shared, setShared] = useState(false);
  const days = pkg.itineraries.slice().sort((a, b) => a.day - b.day);
  const share = async () => {
    const data = { title: pkg.title, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); setShared(true); }
    } catch { /* dismissed */ }
  };

  return (
    <main className="content-in w-full mt-20 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-1.5 items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/" className="hover:text-primary">Home</Link><span aria-hidden>/</span>
          <Link href="/december-in-ghana" className="hover:text-primary">December in Ghana</Link><span aria-hidden>/</span>
          <span aria-current="page">{pkg.title}</span>
        </nav>
        <div className="flex flex-wrap justify-between gap-4 items-start">
          <div>
            {pkg.slug === FLAGSHIP_SLUG && (
              <div className="flex gap-2 mb-2.5">
                <span className="bg-primary text-white font-montserrat text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md">Flagship</span>
                <span className="bg-primary/10 text-[#6B4E1A] dark:text-primary text-xs font-semibold px-2.5 py-1.5 rounded-md">January extension</span>
              </div>
            )}
            <h1 className="font-raleway text-[28px] md:text-[32px] font-bold leading-tight text-text-primary">{pkg.title}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-sm text-gray-700 dark:text-gray-300">
              {pkg.destination && <span>{pkg.destination}</span>}
              <span>{fmtDateRange(pkg.available_from, pkg.available_to)}</span>
              <span>{pkg.duration_days} days · {Math.max(pkg.duration_days - 1, 0)} nights</span>
            </div>
          </div>
          <button type="button" onClick={share} className="flex items-center gap-2 text-sm font-semibold text-[#8A6420] dark:text-primary">
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
            {shared ? "Link copied" : "Share"}
          </button>
        </div>
        <div className="mt-6">
          <TourGallery images={pkg.images.map((i) => i.image)} title={pkg.title} />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-10 pb-20 flex flex-wrap gap-10 items-start">
        <div className="flex-[999_1_600px] min-w-0 flex flex-col gap-8">
          <Reveal>
            <section className="flex flex-col gap-3">
              <h2 className="font-raleway text-2xl font-bold text-text-primary">Overview</h2>
              <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">{pkg.description}</p>
              <p className="flex gap-3 items-start rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-200">
                <span aria-hidden>ⓘ</span>
                Arriving on Tuesday 5 January? That night isn&apos;t part of the package. Add an extra night separately once rates are confirmed.
              </p>
            </section>
          </Reveal>

          {days.length > 0 && (
            <section className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4">
              <div className="flex flex-wrap justify-between items-center gap-2.5">
                <h2 className="font-raleway text-2xl font-bold text-text-primary">Daily Programme</h2>
                <span className="rounded-md bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">Published once venues and access are confirmed</span>
              </div>
              <ol className="flex flex-col">
                {days.map((d, i) => (
                  <li key={d.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="w-9 h-9 shrink-0 rounded-full bg-primary text-white font-montserrat font-bold text-sm flex items-center justify-center">{d.day}</span>
                      {i < days.length - 1 && <span aria-hidden className="flex-1 w-0.5 bg-primary/25 mt-1.5" />}
                    </div>
                    <div className="pb-5 flex flex-col gap-1">
                      <span className="font-raleway font-bold text-[15px] text-text-primary">{d.title}</span>
                      <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{d.description}</span>
                      {(d.activities ?? []).length > 0 && (
                        <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">{d.activities.map((a) => <li key={a}>{a}</li>)}</ul>
                      )}
                      {d.notes && <span className="text-xs text-gray-500 dark:text-gray-400">{d.notes}</span>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <Reveal>
            <section className="pt-8 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-green-100 dark:border-green-900 bg-green-50/60 dark:bg-green-950/20 p-5 flex flex-col gap-3">
                <h2 className="font-raleway text-lg font-bold text-text-primary">Included in Core</h2>
                <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-gray-700 dark:text-gray-300">{pkg.whats_included.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 flex flex-col gap-3">
                <h2 className="font-raleway text-lg font-bold text-text-primary">Not Included</h2>
                <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-gray-700 dark:text-gray-300">{pkg.whats_excluded.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </section>
          </Reveal>
        </div>

        {/* First on phones (right under the gallery), beside the content on desktop. */}
        <aside className="flex-[1_1_340px] min-w-0 order-first lg:order-none lg:sticky lg:top-24">
          <BookCard pkg={pkg} />
        </aside>
      </div>
    </main>
  );
}
