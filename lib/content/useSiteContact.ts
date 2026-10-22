"use client";

import { useGetSiteSettingsQuery } from "@/lib/api/packagesApi";
import { mergeContact } from "./contact";

/** Client-side contact details (admin settings, placeholder fallback). */
export function useSiteContact() {
  const { data } = useGetSiteSettingsQuery();
  return mergeContact(data);
}
