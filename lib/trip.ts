/** Trip builder → checkout state (component pricing). The builder's choices
 * become a TripSelection the server prices; nothing here computes money. */

import type { ComponentMatrix } from "@/lib/api/packagesApi";
import type { PaymentPlan, RoomHold, TravelMode, TripSelection } from "@/lib/api/bookingsApi";

export interface TripChoices {
  mode: TravelMode;
  /** Group size (single/couple force 1/2). */
  groupSize: number;
  /** StayType code, or "" for "I'll arrange my own stay". */
  stay: string;
  /** Units chosen; clamped to the valid range for the guest count. */
  units: number;
  /** Experience code → how many guests take it (guests 1..count). */
  counts: Record<string, number>;
  names: string[];
}

export const DEFAULT_CHOICES: TripChoices = { mode: "couple", groupSize: 3, stay: "", units: 0, counts: {}, names: [] };

export function guestCount(c: TripChoices): number {
  return c.mode === "single" ? 1 : c.mode === "couple" ? 2 : Math.max(3, c.groupSize);
}

type Stay = ComponentMatrix["stay_types"][number];

/** Valid unit counts for n guests: enough beds, and every unit filled to its minimum. */
export function unitRange(stay: Stay, n: number): [number, number] {
  return [Math.ceil(n / stay.capacity), Math.floor(n / Math.max(stay.min_occupancy, 1))];
}

export function unitsFor(c: TripChoices, stay: Stay | undefined, n: number): number {
  if (!stay) return 0;
  const [lo, hi] = unitRange(stay, n);
  return Math.min(hi, Math.max(lo, c.units || lo));
}

/** Guests spread evenly over the units (guest i → unit ⌊i·units/n⌋); the
 * first `count` guests take each experience. */
export function toSelection(packageId: string, c: TripChoices, matrix: ComponentMatrix, plan: PaymentPlan = "full"): TripSelection {
  const n = guestCount(c);
  const stay = matrix.stay_types.find((s) => s.code === c.stay);
  const units = unitsFor(c, stay, n);
  const rooms = Array.from({ length: units }, () => ({ stay_type: c.stay, occupants: [] as number[] }));
  for (let i = 0; i < n && units; i++) rooms[Math.floor((i * units) / n)].occupants.push(i);
  return {
    package_id: packageId,
    mode: c.mode,
    payment_plan: plan,
    rooms,
    travellers: Array.from({ length: n }, (_, i) => ({
      name: c.names[i] ?? "",
      experiences: matrix.experiences.filter((e) => i < Math.min(n, c.counts[e.code] ?? 0)).map((e) => e.code),
    })),
  };
}

// ── Checkout persistence (survives reloads within the tab) ───────────────────

export interface CheckoutState {
  packageId: string;
  packageTitle: string;
  choices: TripChoices;
  hold: RoomHold | null;
  details?: {
    fullName: string; email: string; phone: string; country: string;
    acceptedPolicies: string[]; marketingConsent: boolean;
  };
  /** Set once the booking exists, so a payment retry never creates a second one. */
  booking?: { id: string; reference: string; plan: PaymentPlan };
}

const KEY = "azura.checkout";

export function saveCheckout(state: CheckoutState): void {
  try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
}

export function loadCheckout(): CheckoutState | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CheckoutState) : null;
  } catch {
    return null;
  }
}

export function clearCheckout(): void {
  try { sessionStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}

export function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}
