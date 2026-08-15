"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLoginMutation, useRegisterMutation } from "@/lib/api/authApi";
import { setCredentials, setUser } from "@/lib/features/auth/authSlice";
import Spinner from "@/components/ui/Spinner";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "", password_confirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const next = searchParams.get("next") || "/dashboard";
  const isLoading = isRegistering || isLoggingIn;

  const update = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const user = await register(form).unwrap();
      const tokens = await login({ email: form.email, password: form.password }).unwrap();
      dispatch(setCredentials({ token: tokens.access, refreshToken: tokens.refresh }));
      dispatch(setUser(user));
      router.replace(next);
    } catch (err: unknown) {
      const data = (err as { data?: Record<string, string[] | string> })?.data;
      if (data && typeof data === "object") {
        const first = Object.values(data)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-semibold font-open-sans text-text-primary mb-2">{label}</label>
      <input
        type={type} required value={form[key]} placeholder={placeholder}
        onChange={(e) => update(key, e.target.value)}
        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
      />
    </div>
  );

  return (
    <main className="w-full px-4 mt-24 py-16 flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
        <h1 className="text-2xl font-bold font-raleway text-text-primary mb-2">Create your account</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans mb-8">
          Track your booking, payments and trip updates in one place.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            {field("First name", "first_name")}
            {field("Last name", "last_name")}
          </div>
          {field("Email", "email", "email", "you@example.com")}
          {field("Password", "password", "password")}
          {field("Confirm password", "password_confirm", "password")}

          {error && (
            <p className="text-sm text-red-600 font-open-sans bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit" disabled={isLoading}
            className="w-full bg-primary text-white py-3.5 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading && <Spinner className="w-4 h-4 text-white" />}
            Create account
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans mt-6 text-center">
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="mt-24 py-16 flex justify-center"><Spinner /></main>}>
      <RegisterContent />
    </Suspense>
  );
}
