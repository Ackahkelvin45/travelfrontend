"use client";

import { useMemo } from "react";

export interface PasswordRules {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

/** Frontend mirror of accounts/password_validation.py — must stay in sync. */
export function checkPasswordRules(password: string): PasswordRules {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[()[\]{}|\\`~!@#$%^&*_\-+=;:'",<>./?]/.test(password),
  };
}

const RULE_ITEMS: { key: keyof PasswordRules; label: string }[] = [
  { key: "length", label: "Be at least 8 characters long" },
  { key: "uppercase", label: "Include an uppercase letter" },
  { key: "lowercase", label: "Include a lowercase letter" },
  { key: "number", label: "Include a number" },
  { key: "special", label: "Include a special character" },
];

interface PasswordChecklistProps {
  rules: PasswordRules;
  /** Show the panel — controlled by the parent so it can hide when done. */
  visible: boolean;
  /** Password and confirm match — shows a green "match" row when true. */
  matchesConfirm?: boolean;
  /** At least one character typed (hides the panel for untouched fields). */
  touched: boolean;
}

/**
 * Live password requirement checklist — the floating modal under the
 * password field. Each rule turns green (with a check icon) the moment
 * it's satisfied as the user types; unmet rules stay neutral gray.
 * Purely visual: real enforcement also happens on the backend.
 */
export default function PasswordChecklist({
  rules,
  visible,
  matchesConfirm,
  touched,
}: PasswordChecklistProps) {
  const allPassed = useMemo(
    () => RULE_ITEMS.every((r) => rules[r.key]),
    [rules],
  );

  if (!visible || !touched) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg px-4 py-3 flex flex-col gap-1.5"
    >
      <p className="text-xs font-semibold font-montserrat uppercase tracking-widest text-text-primary/70 mb-1">
        Password requirements
      </p>
      {RULE_ITEMS.map(({ key, label }) => {
        const passed = rules[key];
        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                passed ? "bg-green-500" : "border border-gray-300 dark:border-gray-600"
              }`}
            >
              {passed && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span
              className={`text-xs font-open-sans transition-colors duration-300 ${
                passed
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
      {typeof matchesConfirm === "boolean" && (
        <div className="flex items-center gap-2 mt-1 border-t border-gray-100 dark:border-gray-800 pt-2">
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
              matchesConfirm ? "bg-green-500" : "border border-gray-300 dark:border-gray-600"
            }`}
          >
            {matchesConfirm && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span
            className={`text-xs font-open-sans transition-colors duration-300 ${
              matchesConfirm
                ? "text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Passwords match
          </span>
        </div>
      )}
      {allPassed && matchesConfirm && (
        <p className="text-xs font-open-sans text-green-600 dark:text-green-400 mt-1">
          Strong password — you're good to go.
        </p>
      )}
    </div>
  );
}
