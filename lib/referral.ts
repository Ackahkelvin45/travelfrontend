/** Referral attribution: a ?ref=CODE link is remembered for 30 days and sent
 * with chats, saved quotes and bookings. Attribution only, never a discount. */

const KEY = "azura.referral";
const THIRTY_DAYS = 30 * 86_400_000;

export function captureReferral(): void {
  const code = new URLSearchParams(window.location.search).get("ref");
  if (!code || !/^[\w-]{1,40}$/.test(code)) return;
  try { localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() })); } catch { /* storage blocked */ }
}

export function referralCode(): string {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as { code: string; at: number } | null;
    return saved && Date.now() - saved.at < THIRTY_DAYS ? saved.code : "";
  } catch {
    return "";
  }
}
