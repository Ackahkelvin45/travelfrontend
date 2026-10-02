"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLoginMutation, authApi } from "@/lib/api/authApi";
import { setCredentials, setUser } from "@/lib/features/auth/authSlice";
import { store } from "@/lib/store/store";
import Spinner from "@/components/ui/Spinner";
import VerifyEmailBanner from "@/components/auth/VerifyEmailBanner";
import { PENDING_CLAIM_KEY } from "@/lib/pendingBooking";

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243" />
  </svg>
);

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Correct password, unverified account: the backend refuses with
  // code "email_not_verified" — show the resend banner, not "bad credentials".
  const [unverified, setUnverified] = useState(false);

  const next = searchParams.get("next") || "/dashboard";
  const verified = searchParams.get("verified"); // "1" | "invalid" | null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    try {
      const tokens = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token: tokens.access, refreshToken: tokens.refresh }));
      const me = await store.dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })).unwrap();
      dispatch(setUser(me));
      // A guest who came from a confirmation-email claim link and had to
      // register first: finish attaching their booking now.
      let pendingClaim: string | null = null;
      try { pendingClaim = localStorage.getItem(PENDING_CLAIM_KEY); } catch { /* ignore */ }
      if (pendingClaim) {
        router.replace(`/claim?token=${encodeURIComponent(pendingClaim)}`);
        return;
      }
      router.replace(next);
    } catch (err: unknown) {
      const code = (err as { data?: { code?: string[] } })?.data?.code;
      if (code?.includes("email_not_verified")) {
        setUnverified(true);
      } else {
        setError("Invalid email or password.");
      }
    }
  };

  return (
    <main className="w-full px-4 mt-24 py-16 flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
        <h1 className="text-2xl font-bold font-raleway text-text-primary mb-2">Welcome back</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans mb-6">
          Sign in to manage your bookings and payments.
        </p>

        {verified === "1" && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm font-open-sans text-green-700 dark:text-green-300">
            Your email is confirmed — welcome aboard! 🎉
          </div>
        )}
        {(verified === "invalid" || unverified) && (
          <div className="mb-6">
            <VerifyEmailBanner email={email} variant="warning" />
          </div>
        )}

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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
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
