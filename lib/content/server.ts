/** Server-component data: cached API reads with safe fallbacks, so a backend
 * hiccup degrades to the static copy instead of breaking a marketing page. */

import type { ComponentMatrix, PackageDetail } from "@/lib/api/packagesApi";
import { mergeContact, type Contact, type SiteSettings } from "./contact";
import { FLAGSHIP_SLUG } from "./site";
import { flagshipFacts, type FlagshipFacts } from "./flagship";

const API = (process.env.NEXT_PUBLIC_API_URL || "https://azuratravelsbackend.cc/api/").replace(/\/?$/, "/");

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 300 } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function getSiteContact(): Promise<Contact> {
  return mergeContact(await get<SiteSettings>("site-settings/"));
}

/** The flagship's detail and (component) price list, or nulls. */
export async function getFlagship(): Promise<{ detail: PackageDetail | null; matrix: ComponentMatrix | null }> {
  const list = await get<{ results: { id: string; slug: string }[] }>("packages/?page_size=50");
  const id = list?.results.find((p) => p.slug === FLAGSHIP_SLUG)?.id;
  if (!id) return { detail: null, matrix: null };
  const [detail, matrix] = await Promise.all([get<PackageDetail>(`packages/${id}/`), get<ComponentMatrix>(`packages/${id}/pricing/`)]);
  return { detail, matrix: matrix?.pricing_model === "component" ? matrix : null };
}

/** Name, dates and "from" prices for marketing copy (prices only from the API). */
export async function getFlagshipFacts(): Promise<FlagshipFacts> {
  const { detail, matrix } = await getFlagship();
  return flagshipFacts(detail, matrix);
}
