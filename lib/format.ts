/** Display helpers — money VALUES always come from the backend; the frontend
 * only formats them. Never compute prices client-side. */

export function fmtMoney(amount: string | number, currency: string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return `${currency} —`;
  return `${currency} ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = iso.includes("T") ? new Date(iso) : new Date(iso + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtDateLong(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = iso.includes("T") ? new Date(iso) : new Date(iso + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

/** Compact range: "Jan 4 – 13, 2027" / "Jan 28 – Feb 3, 2027" /
 * "Dec 28, 2026 – Jan 3, 2027". */
export function fmtDateRange(fromIso: string | null | undefined, toIso: string | null | undefined): string {
  if (!fromIso || !toIso) return "—";
  const from = new Date(fromIso.includes("T") ? fromIso : fromIso + "T00:00:00");
  const to = new Date(toIso.includes("T") ? toIso : toIso + "T00:00:00");
  const month = (d: Date) => d.toLocaleDateString("en-US", { month: "short" });
  if (from.getFullYear() !== to.getFullYear()) return `${fmtDate(fromIso)} – ${fmtDate(toIso)}`;
  if (from.getMonth() !== to.getMonth()) {
    return `${month(from)} ${from.getDate()} – ${month(to)} ${to.getDate()}, ${to.getFullYear()}`;
  }
  return `${month(from)} ${from.getDate()} – ${to.getDate()}, ${to.getFullYear()}`;
}

export function daysUntil(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  const target = new Date(isoDate + (isoDate.includes("T") ? "" : "T00:00:00"));
  return Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
