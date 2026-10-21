/** Public contact details: the admin's Operational Settings when filled in,
 * otherwise the bracketed placeholders in site.ts (never invented values). */

import { CONTACT } from "./site";

export interface SiteSettings {
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  emergency_phone: string;
  staffed_hours: string;
  legal_name: string;
  legal_address: string;
  hold_minutes: number;
  /** Academy donations are live (verified settlement account). */
  donations_open?: boolean;
}

export type Contact = typeof CONTACT & { whatsappHref: string };

export function mergeContact(s?: Partial<SiteSettings> | null): Contact {
  const legal = [s?.legal_name, s?.legal_address].filter(Boolean).join(", ");
  const whatsappDigits = (s?.whatsapp_number ?? "").replace(/\D/g, "") || CONTACT.whatsappDigits;
  return {
    email: s?.contact_email || CONTACT.email,
    phone: s?.contact_phone || CONTACT.phone,
    whatsapp: s?.whatsapp_number || CONTACT.whatsapp,
    whatsappDigits,
    emergency: s?.emergency_phone || CONTACT.emergency,
    legal: legal || CONTACT.legal,
    staffedHours: s?.staffed_hours || CONTACT.staffedHours,
    whatsappHref: whatsappDigits ? `https://wa.me/${whatsappDigits}` : "/about#contact",
  };
}
