"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { logout, setUser } from "@/lib/features/auth/authSlice";
import { useGetMeQuery } from "@/lib/api/authApi";

export default function AccountMenu() {
  const dispatch = useDispatch();
  const { token, user, hydrated } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: me } = useGetMeQuery(undefined, { skip: !token || !!user });

  useEffect(() => {
    if (me && !user) dispatch(setUser(me));
  }, [me, user, dispatch]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!hydrated) return null;

  if (!token) {
    return (
      <Link
        href="/login"
        className="text-base text-text-primary hover:text-primary transition-colors whitespace-nowrap"
      >
        Sign in
      </Link>
    );
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "•"
    : "•";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold font-raleway flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="Account menu"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg py-2 z-50">
          {user && (
            <p className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-open-sans border-b border-gray-100 dark:border-gray-800 truncate">
              {user.email}
            </p>
          )}
          <Link
            href="/dashboard" onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-open-sans text-text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            My bookings
          </Link>
          <button
            onClick={() => { dispatch(logout()); setOpen(false); }}
            className="block w-full text-left px-4 py-2.5 text-sm font-open-sans text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
