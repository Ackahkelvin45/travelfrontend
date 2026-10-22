/** The signed view token per booking reference: without it the status
 * endpoint shows only status and amounts. Saved from the checkout response
 * and from `?t=` on emailed links; per-browser and best-effort. */

const KEY = "azura.bookingAccess";

function load(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function saveBookingAccess(reference: string, token: string | null | undefined): void {
  if (!reference || !token) return;
  try { localStorage.setItem(KEY, JSON.stringify({ ...load(), [reference]: token })); } catch { /* storage blocked */ }
}

export function bookingAccess(reference: string): string | undefined {
  return load()[reference];
}

/** transformResponse for checkout mutations: keep the token, pass the response through. */
export function keepBookingAccess<T extends { reference: string; view_token?: string }>(res: T): T {
  saveBookingAccess(res.reference, res.view_token);
  return res;
}
