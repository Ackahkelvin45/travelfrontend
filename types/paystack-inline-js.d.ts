/**
 * Minimal ambient types for `@paystack/inline-js` (v2), which ships no `.d.ts`.
 * We only use the popup's `resumeTransaction` (open an already-initialised
 * transaction by its access_code). Payment outcome is authoritative via our
 * backend webhook + order polling — these callbacks are UX hints only.
 */
declare module "@paystack/inline-js" {
  export interface PaystackPopCallbacks {
    onSuccess?: (transaction: { reference?: string; status?: string }) => void;
    onCancel?: () => void;
    onError?: (error: unknown) => void;
    onLoad?: (response: unknown) => void;
  }

  export default class PaystackPop {
    /** Resume a transaction the server already initialised (by its access_code). */
    resumeTransaction(accessCode: string, callbacks?: PaystackPopCallbacks): void;
    /** Start a fresh transaction client-side (unused; we initialise server-side). */
    newTransaction(options: Record<string, unknown>): void;
  }
}
