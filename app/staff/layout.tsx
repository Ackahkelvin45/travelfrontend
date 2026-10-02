"use client";

/**
 * Staff portal shell. Gate: signed in + is_staff, else back to login. The
 * server enforces every action's permission; this just avoids showing a team
 * member a portal they can't use.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { useStaffMeQuery, useStaffCancellationsQuery, useStaffRefundsQuery, useStaffBookingsQuery } from "@/lib/api/staffApi";
import Spinner from "@/components/ui/Spinner";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, hydrated, user } = useSelector((s: RootState) => s.auth);
  const { data: me, isLoading, isError } = useStaffMeQuery(undefined, { skip: !token });
  const { data: pendingCancellations } = useStaffCancellationsQuery({ status: "pending" }, { skip: !me });
  const { data: overdue } = useStaffBookingsQuery({ overdue: "1" }, { skip: !me });
  const canSeeRefunds = !!me?.perms.includes("payments.process_refund");
  const { data: pendingRefunds } = useStaffRefundsQuery({ status: "pending" }, { skip: !me || !canSeeRefunds });

  useEffect(() => {
    if (hydrated && !token) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, token, router, pathname]);

  if (!hydrated || (token && isLoading)) {
    return <main className="mt-24 py-16 flex justify-center"><Spinner /></main>;
  }
  if (!token) return null;
  if (isError || !me || (user && user.is_staff === false)) {
    return (
      <main className="w-full px-4 mt-24 py-16 max-w-lg mx-auto text-center">
        <h1 className="text-xl font-bold font-raleway text-text-primary mb-2">Staff only</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-open-sans">
          This area is for the Azura Travels team. If you should have access, ask an administrator to add you to a staff group.
        </p>
        <Link href="/dashboard" className="inline-block mt-6 text-primary font-semibold text-sm underline">Back to my bookings</Link>
      </main>
    );
  }

  return (
    <main className="w-full px-4 md:px-10 mt-24 py-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-open-sans">Azura staff portal</p>
          <p className="text-sm font-open-sans text-text-primary">
            {me.name || me.email} · <span className="text-gray-500">{me.groups.join(", ") || "no group"}</span>
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm font-semibold font-open-sans">
          <NavLink href="/staff" active={pathname === "/staff" || pathname.startsWith("/staff/bookings")}>Bookings</NavLink>
          <NavLink href="/staff/cancellations" active={pathname.startsWith("/staff/cancellations")} count={pendingCancellations?.length}>Cancellations</NavLink>
          <NavLink href="/staff/overdue" active={pathname.startsWith("/staff/overdue")} count={overdue?.count}>Overdue</NavLink>
          {canSeeRefunds && (
            <NavLink href="/staff/refunds" active={pathname.startsWith("/staff/refunds")} count={pendingRefunds?.length}>Refunds to pay</NavLink>
          )}
        </nav>
      </div>
      {children}
    </main>
  );
}

function NavLink({ href, active, count, children }: { href: string; active: boolean; count?: number; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full border flex items-center gap-2 ${active ? "bg-primary text-white border-primary" : "border-gray-200 dark:border-gray-700 text-text-primary hover:border-primary"}`}
    >
      {children}
      {!!count && (
        <span className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${active ? "bg-white text-primary" : "bg-red-600 text-white"}`}>{count}</span>
      )}
    </Link>
  );
}
