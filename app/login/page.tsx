"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLoginMutation, authApi } from "@/lib/api/authApi";
import { setCredentials, setUser } from "@/lib/features/auth/authSlice";
import { store } from "@/lib/store/store";
import Spinner from "@/components/ui/Spinner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get("next") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const tokens = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token: tokens.access, refreshToken: tokens.refresh }));
      const me = await store.dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })).unwrap();
      dispatch(setUser(me));
      router.replace(next);
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <main className="w-full px-4 mt-24 py-16 flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
        <h1 className="text-2xl font-bold font-raleway text-text-primary mb-2">Welcome back</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans mb-8">
          Sign in to manage your bookings and payments.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold font-open-sans text-text-primary mb-2">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold font-open-sans text-text-primary mb-2">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-open-sans bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit" disabled={isLoading}
            className="w-full bg-primary text-white py-3.5 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading && <Spinner className="w-4 h-4 text-white" />}
            Sign in
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans mt-6 text-center">
          No account yet?{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="mt-24 py-16 flex justify-center"><Spinner /></main>}>
      <LoginContent />
    </Suspense>
  );
}
