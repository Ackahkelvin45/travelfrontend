"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Reveal from "../ui/Reveal";
import CardPulse from "./CardPulse";
import { BlackStar } from "./Decor";
import { useGetConfigurableMatrixQuery } from "@/lib/api/packagesApi";
import { usePackagesWithFlagship } from "@/lib/useFlagship";
import { fmtDateRange, fmtMoney } from "@/lib/format";
import { FLAGSHIP_SLUG } from "@/lib/content/site";

type Kind = "trip" | "stay" | "exp";
type Item = {
  key: string; kind: Kind; title: string; sub: string; when: string;
  price: number | null; currency: string; unit: string; img: string | null; href: string; flagship: boolean; months: string[];
};

const KINDS: { id: Kind; label: string }[] = [
  { id: "trip", label: "Trips" },
  { id: "stay", label: "Stays" },
  { id: "exp", label: "Experiences" },
];
const MONTHS = [
  { id: "all", label: "Any time" },
  { id: "2026-12", label: "December 2026" },
  { id: "2027-01", label: "January 2027" },
];

/** YYYY-MM strings covered by an availability window (capped at 24 months). */
function monthsBetween(from: string | null, to: string | null): string[] {
  if (!from) return [];
  const out: string[] = [];
  let [y, m] = from.slice(0, 7).split("-").map(Number);
  const end = (to ?? from).slice(0, 7);
  for (let i = 0; i < 24; i++) {
    const ym = `${y}-${String(m).padStart(2, "0")}`;
    out.push(ym);
    if (ym >= end) break;
    if (++m > 12) { m = 1; y++; }
  }
  return out;
}

export default function ExperiencesListing() {
  const { packages, flagship, isLoading, isError } = usePackagesWithFlagship();
  const { data: matrix } = useGetConfigurableMatrixQuery(flagship?.id ?? "", { skip: !flagship });

  const [kinds, setKinds] = useState<Set<Kind>>(new Set());
  const [month, setMonth] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"rec" | "low" | "high">("rec");
  const [view, setView] = useState<"grid" | "list">("grid");

  const all = useMemo<Item[]>(() => {
    const trips: Item[] = packages.map((p) => ({
      key: p.id, kind: "trip", title: p.title, sub: p.destination ?? "Ghana",
      when: p.available_from && p.available_to ? fmtDateRange(p.available_from, p.available_to) : `${p.duration_days}-day tour · flexible dates`,
      price: p.from_price ? Number(p.from_price) : p.price_shared ? Number(p.price_shared) : null,
      currency: p.currency, unit: "per traveller", img: p.cover_image?.image ?? null,
      href: `/tour/${p.id}`, flagship: p.slug === FLAGSHIP_SLUG, months: monthsBetween(p.available_from, p.available_to),
    }));
    const flagMonths = flagship ? monthsBetween(flagship.available_from, flagship.available_to) : [];
    const addons: Item[] = (matrix?.addon_groups ?? []).flatMap((g) =>
      g.addons
        .filter((a) => Number(a.price) > 0)
        .map((a) => ({
          key: a.code, kind: (/accommodation|stay|hotel/i.test(g.name) ? "stay" : "exp") as Kind,
          title: a.name, sub: g.name, when: "With the Ghana Experience 2027",
          price: Number(a.price), currency: matrix?.currency ?? "USD",
          unit: a.unit === "per_person" ? "per guest" : "per booking", img: null,
          href: "/ghana-experience-2027", flagship: false, months: flagMonths,
        })),
    );
    return [...trips, ...addons];
  }, [packages, flagship, matrix]);

  const counts = (k: Kind) => all.filter((i) => i.kind === k).length;
  let list = all.filter((i) =>
    (kinds.size === 0 || kinds.has(i.kind)) &&
    (month === "all" || i.months.includes(month)) &&
    (!q || `${i.title} ${i.sub}`.toLowerCase().includes(q.toLowerCase())),
  );
  if (sort !== "rec") list = [...list].sort((a, b) => ((a.price ?? Infinity) - (b.price ?? Infinity)) * (sort === "low" ? 1 : -1));

  const toggleKind = (k: Kind) => setKinds((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const reset = () => { setKinds(new Set()); setMonth("all"); setQ(""); };
  const chips = [
    ...[...kinds].map((k) => ({ label: KINDS.find((x) => x.id === k)!.label, remove: () => toggleKind(k) })),
    ...(month !== "all" ? [{ label: MONTHS.find((m) => m.id === month)!.label, remove: () => setMonth("all") }] : []),
    ...(q ? [{ label: `“${q}”`, remove: () => setQ("") }] : []),
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <aside aria-label="Filters" className="w-full lg:w-72 lg:sticky lg:top-28 shrink-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="font-raleway font-bold text-lg text-text-primary">Filters</span>
          <button type="button" onClick={reset} className="text-sm font-semibold text-primary px-2 py-1">Reset</button>
        </div>
        <label className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 focus-within:border-primary transition-colors">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <span className="sr-only">Search experiences</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="flex-1 min-w-0 py-2.5 bg-transparent outline-none text-sm text-text-primary" />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">When are you travelling?</legend>
          {MONTHS.map((m) => (
            <button key={m.id} type="button" aria-pressed={month === m.id} onClick={() => setMonth(m.id)}
              className={`text-left text-sm px-3 py-2.5 rounded-xl border transition-colors ${month === m.id ? "border-primary bg-[#FAF5EB] dark:bg-gray-800 text-text-primary" : "border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary"}`}>
              {m.label}
            </button>
          ))}
        </fieldset>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type</legend>
          {KINDS.map((k) => (
            <label key={k.id} className="flex items-center justify-between gap-3 text-sm text-text-primary cursor-pointer">
              <span className="flex items-center gap-2.5"><input type="checkbox" checked={kinds.has(k.id)} onChange={() => toggleKind(k.id)} className="w-4 h-4 accent-[#BD8F3A]" />{k.label}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-full px-2 py-0.5">{counts(k.id)}</span>
            </label>
          ))}
        </fieldset>
      </aside>

      <div className="flex-1 min-w-0 w-full flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-700 dark:text-gray-300"><strong className="font-montserrat text-text-primary">{list.length}</strong> {list.length === 1 ? "listing" : "listings"} in Ghana</p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-text-primary">
                <option value="rec">Recommended</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
            <div role="group" aria-label="View" className="flex bg-gray-50 dark:bg-gray-900 rounded-xl p-1">
              {(["grid", "list"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={view === v} aria-label={`${v} view`} onClick={() => setView(v)}
                  className={`w-10 h-9 rounded-lg flex items-center justify-center transition-colors ${view === v ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}>
                  {v === "grid"
                    ? <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-primary"><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></svg>
                    : <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-primary"><path d="M4 6h16M4 12h16M4 18h16" /></svg>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button key={c.label} type="button" onClick={c.remove} aria-label={`Remove filter ${c.label}`}
                className="content-in inline-flex items-center gap-2 text-sm font-semibold text-[#6B4E1A] bg-[#FAF5EB] border border-[#F3E7CF] rounded-full px-3 py-1.5 hover:border-primary transition-colors">
                {c.label}<span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}

        {isError && <p className="text-red-600">We couldn&apos;t load experiences right now.</p>}

        <div key={`${view}-${list.length}`} className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {isLoading && [1, 2, 3].map((i) => <CardPulse key={i} />)}
          {list.map((it, i) => (
            <Reveal key={it.key} delay={Math.min(i, 6) * 50} className="h-full">
              <Link href={it.href} className={`group card-lift h-full flex bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md ${view === "grid" ? "flex-col" : "flex-col sm:flex-row"}`}>
                <div className={`relative overflow-hidden bg-[#FAF5EB] dark:bg-gray-800 shrink-0 ${view === "grid" ? "h-48" : "h-44 sm:h-auto sm:w-60"}`}>
                  {it.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.img} alt={it.title} className="img-zoom w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full min-h-40 flex flex-col items-center justify-center gap-2 text-[#8A6420]"><BlackStar size={34} /><span className="text-xs font-semibold">Photo coming soon</span></div>
                  )}
                  <span className={`absolute top-3 left-3 font-montserrat text-[11px] font-bold px-2.5 py-1 rounded-full ${it.flagship ? "bg-primary text-white" : "bg-white/90 text-[#6B4E1A]"}`}>
                    {KINDS.find((k) => k.id === it.kind)!.label.replace(/s$/, "")}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1.5 flex-1">
                  <span className="text-xs text-gray-700 dark:text-gray-300">{it.sub}</span>
                  <span className="font-raleway font-bold text-base text-text-primary leading-snug group-hover:text-primary transition-colors">{it.title}</span>
                  <span className="text-xs font-semibold text-[#8A6420] dark:text-[#C9A96E]">{it.when}</span>
                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 flex justify-end">
                    {it.price !== null ? <span>From <strong className="font-montserrat text-text-primary">{fmtMoney(it.price, it.currency)}</strong> <span className="text-xs">{it.unit}</span></span> : <span>Price on request</span>}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {!isLoading && !isError && list.length === 0 && (
          <div className="content-in border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
            <BlackStar size={40} />
            <p className="font-raleway font-bold text-lg text-text-primary">Nothing matches those filters</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Try a different month or type, or ask us through the chat button.</p>
            <button type="button" onClick={reset} className="bg-primary text-white font-montserrat font-semibold text-sm px-5 py-2.5 rounded-xl">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
