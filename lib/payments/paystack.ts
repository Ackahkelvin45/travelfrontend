/**
 * Paystack Inline (popup) helper — the in-app overlay where the buyer pays
 * inside Paystack's own UI. Same SDK integration shape as EnqoreAccessFE.
 *
 * The payment is initialised server-side (the initialize response carries the
 * Paystack `access_code`); here we just open the popup for it via
 * `resumeTransaction`, which needs ONLY that access_code — so no Paystack key
 * ships in the frontend build. Payment settlement stays authoritative on the
 * backend (webhook re-verified with the gateway + status polling); the popup
 * callbacks only annotate the UI.
 */
import type { PaystackPopCallbacks } from "@paystack/inline-js";

import type { InitializePaymentResponse } from "@/lib/api/bookingsApi";

/**
 * Toggle: in-app popup (default) vs Paystack's hosted page. Set
 * `NEXT_PUBLIC_PAYSTACK_USE_POPUP="false"` to force the hosted redirect. This is
 * a plain boolean flag — no key, nothing sensitive, safe to inline in the build.
 */
export const PAYSTACK_USE_POPUP =
  process.env.NEXT_PUBLIC_PAYSTACK_USE_POPUP !== "false";

/**
 * Open Paystack's popup for an already-initialised transaction (its access_code).
 * Resolves once the popup is opened; the outcome arrives via `callbacks` and
 * (authoritatively) via status polling. REJECTS if the SDK chunk fails to load or
 * `resumeTransaction` throws synchronously — the caller catches that and falls
 * back to the hosted page. Browser-only (dynamic import).
 */
export async function openPaystackPopup(
  accessCode: string,
  callbacks: PaystackPopCallbacks = {},
): Promise<void> {
  const { default: PaystackPop } = await import("@paystack/inline-js");
  const popup = new PaystackPop();
  // No public key is passed — resumeTransaction identifies the transaction (and
  // the merchant) entirely from the server-minted access_code.
  popup.resumeTransaction(accessCode, callbacks);
}

// ── Azura-specific layer on top of the popup ─────────────────────────────────

const PROMPT_KEY_PREFIX = "azura.paymentPrompt.";

export function savePaymentPrompt(reference: string, prompt: string): void {
  try {
    sessionStorage.setItem(PROMPT_KEY_PREFIX + reference, prompt);
  } catch { /* storage unavailable — generic copy will show */ }
}

export function readPaymentPrompt(reference: string): string | null {
  try {
    return sessionStorage.getItem(PROMPT_KEY_PREFIX + reference);
  } catch {
    return null;
  }
}

/**
 * Route the user after POST /payments/initialize/ succeeded:
 *  - direct MoMo → the approve-prompt is already on their phone; go straight
 *    to the callback page, which polls to settlement
 *  - card (popup enabled) → open the Inline popup here, then poll
 *  - anything else (Telecel hosted MoMo, popup disabled/failed) → hosted page
 */
export async function routeAfterInitialize(
  payment: InitializePaymentResponse,
  navigateToCallback: (reference: string) => void,
): Promise<void> {
  if (payment.channel === "momo" && payment.payment_prompt) {
    savePaymentPrompt(payment.reference, payment.payment_prompt);
    navigateToCallback(payment.reference);
    return;
  }

  if (PAYSTACK_USE_POPUP && payment.access_code) {
    try {
      const done = () => navigateToCallback(payment.reference);
      await openPaystackPopup(payment.access_code, {
        onSuccess: done, // outcome is confirmed by the backend poll, not this callback
        onCancel: done,  // buyer may have paid then closed — the poll decides
        onError: done,
      });
      return;
    } catch {
      // SDK chunk failed to load — fall through to the hosted page.
    }
  }

  if (payment.authorization_url) {
    window.location.href = payment.authorization_url;
    return;
  }
  // No prompt, no popup, no URL — let the callback page's poll figure it out.
  navigateToCallback(payment.reference);
}
