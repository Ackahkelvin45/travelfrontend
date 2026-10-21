import type { ComponentQuote } from "@/lib/api/bookingsApi";
import { fmtMoney } from "@/lib/format";

/** Receipt lines from a server quote, grouped the way the canvas shows them.
 * Amounts are the server's; grouping only adds server line values together. */
export function quoteLines(q: ComponentQuote) {
  const add = (a: string, b: string) => (parseFloat(a) + parseFloat(b)).toFixed(2);
  const lines: { label: string; amount: string; saving?: boolean }[] = [
    { label: `Core experience × ${q.num_guests}`, amount: q.core_total },
  ];

  const stays = new Map<string, { label: string; count: number; amount: string }>();
  let staySaving = "0", stayPct = "";
  for (const r of q.rooms) {
    const s = stays.get(r.stay_type) ?? { label: r.name, count: 0, amount: "0" };
    stays.set(r.stay_type, { ...s, count: s.count + 1, amount: add(s.amount, r.charge) });
    staySaving = add(staySaving, r.discount);
    stayPct = r.discount_percent;
  }
  stays.forEach((s) => lines.push({ label: `${s.label} × ${s.count} · ${q.rooms[0].nights} nights`, amount: s.amount }));
  if (parseFloat(staySaving) > 0) {
    lines.push({ label: `Stay package saving ${parseFloat(stayPct)}%`, amount: staySaving, saving: true });
  }

  const exps = new Map<string, { label: string; count: number; amount: string }>();
  let bundleSaving = "0", bundles = 0, bundlePct = "";
  for (const t of q.travellers) {
    for (const e of t.experiences) {
      const x = exps.get(e.code) ?? { label: e.name, count: 0, amount: "0" };
      exps.set(e.code, { ...x, count: x.count + 1, amount: add(x.amount, e.price) });
    }
    if (parseFloat(t.bundle_discount) > 0) {
      bundleSaving = add(bundleSaving, t.bundle_discount);
      bundles++;
      bundlePct = t.bundle.match(/\(([\d.]+)%\)/)?.[1] ?? "";
    }
  }
  exps.forEach((x) => lines.push({ label: `${x.label} × ${x.count}`, amount: x.amount }));
  if (bundles) lines.push({ label: `Full experiences saving ${bundlePct ? `${parseFloat(bundlePct)}% ` : ""}× ${bundles}`, amount: bundleSaving, saving: true });
  return lines;
}

export default function QuoteSummary({ quote, className = "" }: { quote: ComponentQuote; className?: string }) {
  const c = quote.currency;
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <dl className="flex flex-col gap-2 py-3 border-y border-gray-100 dark:border-gray-800 text-[13px] text-gray-700 dark:text-gray-300">
        {quoteLines(quote).map((l) => (
          <div key={l.label} className={`flex justify-between gap-3 ${l.saving ? "text-green-700 dark:text-green-400" : ""}`}>
            <dt>{l.label}</dt>
            <dd className="shrink-0">{l.saving ? "−" : ""}{fmtMoney(l.amount, c)}</dd>
          </div>
        ))}
      </dl>
      <div className="flex justify-between items-baseline">
        <span className="font-bold text-text-primary">Total</span>
        <span className="font-montserrat text-[22px] font-bold text-text-primary">{fmtMoney(quote.total, c)}</span>
      </div>
      <div className="flex justify-between text-[13px] text-gray-700 dark:text-gray-300">
        <span>Average per person</span>
        <span>{fmtMoney(quote.average_per_person, c)}</span>
      </div>
    </div>
  );
}
