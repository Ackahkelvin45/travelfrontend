/** Resumable-checkout persistence: survive tab closes, failed redirects and
 * abandoned Paystack sessions. Cleared on success or expiry. */

export const PENDING_BOOKING_KEY = "azura.pendingBooking";
export const PENDING_BOOKING_EVENT = "azura:pending-booking-changed";
const KEY = PENDING_BOOKING_KEY;

function notify() {
  try {
    window.dispatchEvent(new Event(PENDING_BOOKING_EVENT));
  } catch { /* SSR */ }
}

export interface PendingBooking {
  bookingId: string;
  reference: string;
  email: string;
  packageTitle: string;
  amountDueToday: string;
  currency: string;
  /** ISO — mirrors the backend's 24h pending TTL (lazy expiry). */
  expiresAt: string;
}

export function savePendingBooking(data: PendingBooking): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    notify();
  } catch { /* storage unavailable — resume via email link instead */ }
}

export function getPendingBooking(): PendingBooking | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PendingBooking;
    if (new Date(data.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearPendingBooking(): void {
  try {
    localStorage.removeItem(KEY);
    notify();
  } catch { /* noop */ }
}
