/** Academy donations: a gift chosen at checkout waits here until the booking
 * is paid, then runs as its own Paystack charge (never part of the booking). */

import { openPaystackPopup, PAYSTACK_USE_POPUP } from "@/lib/payments/paystack";
import type { DonationStart } from "@/lib/api/donationsApi";

/** percent: a whole number from 2 to 15. */
export type DonationChoice = { percent: number } | { amount: string } | null;

export interface PendingDonation {
  bookingId: string;
  name: string;
  email: string;
  choice: Exclude<DonationChoice, null>;
}

const KEY = "azura.donation";

export function savePendingDonation(d: PendingDonation | null): void {
  try {
    if (d) sessionStorage.setItem(KEY, JSON.stringify(d));
    else sessionStorage.removeItem(KEY);
  } catch { /* storage unavailable */ }
}

export function loadPendingDonation(): PendingDonation | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingDonation) : null;
  } catch {
    return null;
  }
}

/** Open Paystack for a started donation; the thanks page verifies it. */
export async function payDonation(start: DonationStart, goToThanks: (reference: string) => void): Promise<void> {
  if (PAYSTACK_USE_POPUP && start.access_code) {
    try {
      await openPaystackPopup(start.access_code, { onSuccess: () => goToThanks(start.reference) });
      return;
    } catch { /* popup failed to load: use the hosted page */ }
  }
  window.location.href = start.authorization_url;
}
