/** The flagship's headline facts for marketing copy, from the package and its
 * live price list. Name and dates fall back to the static copy if the API is
 * down; prices never do (null = leave the price out). */

import type { ComponentMatrix } from "@/lib/api/packagesApi";
import { fmtMoney } from "@/lib/format";
import { TRIP } from "./site";

export interface FlagshipFacts {
  name: string;
  /** "Wed 6 – Mon 11 January 2027" */
  dates: string;
  /** "6–11 Jan 2027" */
  shortDates: string;
  /** "USD 899.00" or null */
  corePrice: string | null;
  /** Cheapest unit of each kind on sale, e.g. { price: "USD 1,100.00", nights: 5 } */
  airbnbFrom: { price: string; nights: number } | null;
  hotelFrom: { price: string; nights: number } | null;
}

type Pkg = { title: string; available_from: string | null; available_to: string | null } | null | undefined;

const day = (iso: string) => new Date(iso.includes("T") ? iso : iso + "T00:00:00");

function longRange(fromIso: string, toIso: string) {
  const a = day(fromIso), b = day(toIso);
  const wd = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short" });
  const mon = (d: Date) => d.toLocaleDateString("en-GB", { month: "long" });
  const start = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
    ? `${wd(a)} ${a.getDate()}` : `${wd(a)} ${a.getDate()} ${mon(a)}${a.getFullYear() !== b.getFullYear() ? ` ${a.getFullYear()}` : ""}`;
  return `${start} – ${wd(b)} ${b.getDate()} ${mon(b)} ${b.getFullYear()}`;
}

function shortRange(fromIso: string, toIso: string) {
  const a = day(fromIso), b = day(toIso);
  const mon = (d: Date) => d.toLocaleDateString("en-GB", { month: "short" });
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()}–${b.getDate()} ${mon(b)} ${b.getFullYear()}`
    : `${a.getDate()} ${mon(a)} – ${b.getDate()} ${mon(b)} ${b.getFullYear()}`;
}

function cheapest(matrix: ComponentMatrix, kind: "airbnb" | "hotel") {
  const stays = matrix.stay_types.filter((s) => s.kind === kind && s.on_sale && !s.stay_only);
  if (!stays.length) return null;
  const s = stays.reduce((lo, x) => (parseFloat(x.unit_total) < parseFloat(lo.unit_total) ? x : lo));
  return { price: fmtMoney(s.unit_total, matrix.currency), nights: s.nights };
}

export function flagshipFacts(pkg: Pkg, matrix: ComponentMatrix | null | undefined): FlagshipFacts {
  const hasDates = !!(pkg?.available_from && pkg?.available_to);
  return {
    name: pkg?.title || TRIP.name,
    dates: hasDates ? longRange(pkg!.available_from!, pkg!.available_to!) : TRIP.dates,
    shortDates: hasDates ? shortRange(pkg!.available_from!, pkg!.available_to!) : TRIP.shortDates,
    corePrice: matrix?.core_price_per_person ? fmtMoney(matrix.core_price_per_person, matrix.currency) : null,
    airbnbFrom: matrix ? cheapest(matrix, "airbnb") : null,
    hotelFrom: matrix ? cheapest(matrix, "hotel") : null,
  };
}
