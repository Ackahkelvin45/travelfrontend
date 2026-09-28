"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLoginMutation, useRegisterMutation } from "@/lib/api/authApi";
import { setCredentials, setUser } from "@/lib/features/auth/authSlice";
import Spinner from "@/components/ui/Spinner";
import VerifyEmailBanner from "@/components/auth/VerifyEmailBanner";
import PasswordChecklist, {
  checkPasswordRules,
  type PasswordRules,
} from "@/components/auth/PasswordChecklist";

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

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold font-open-sans text-text-primary mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"} required value={value} placeholder="••••••••"
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary transition-colors"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "", password_confirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const next = searchParams.get("next") || "/dashboard";
  const isLoading = isRegistering;

  const rules: PasswordRules = checkPasswordRules(form.password);
  const allRulesPassed = Object.values(rules).every(Boolean);
  const passwordsMatch =
    form.password_confirm.length > 0 && form.password === form.password_confirm;

  const update = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!allRulesPassed) {
      setError("Please meet all password requirements before continuing.");
      return;
    }
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await register(form).unwrap();
      // Account created — but the user must verify their email before they
      // can sign in. Show the verification screen instead of logging in.
      setRegistered(true);
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
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
        <h1 className="text-2xl font-bold font-raleway text-text-primary mb-2">Create your account</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans mb-6">
          Track your booking, payments and trip updates in one place.
        </p>

        {registered && (
          <div className="mb-6">
            <VerifyEmailBanner email={form.email} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            {field("First name", "first_name")}
            {field("Last name", "last_name")}
          </div>
          {field("Email", "email", "email", "you@example.com")}
          <div>
            <PasswordField
              label="Password"
              value={form.password}
              onChange={(v) => {
                setPasswordTouched(true);
                update("password", v);
              }}
            />
            {/* Live requirement checklist — appears as you type */}
            <PasswordChecklist
              rules={rules}
              visible={!allRulesPassed}
              matchesConfirm={form.password_confirm.length > 0 ? passwordsMatch : undefined}
              touched={passwordTouched}
            />
          </div>
          <PasswordField label="Confirm password" value={form.password_confirm} onChange={(v) => update("password_confirm", v)} />

          {error && (
            <p className="text-sm text-red-600 font-open-sans bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit" disabled={isLoading || !allRulesPassed || !passwordsMatch}
            className="w-full bg-primary text-white py-3.5 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
