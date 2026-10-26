/** Academy donations on the public /donate page (checkout donations ride on
 * the booking's first payment instead). */

import { openPaystackPopup, PAYSTACK_USE_POPUP } from "@/lib/payments/paystack";
import type { DonationStart } from "@/lib/api/donationsApi";

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
