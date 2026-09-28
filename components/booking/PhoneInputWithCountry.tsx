"use client";

/**
 * Telephone input with an integrated country-code selector, backed by
 * react-phone-number-input (libphonenumber). Stores the value in E.164
 * (e.g. "+233506718377") so the backend/Paystack always get a valid format.
 */

import { useState } from "react";
import PhoneInput, { type Country } from "react-phone-number-input/mobile";
import "react-phone-number-input/style.css";

export default function PhoneInputWithCountry({
  value,
  onChange,
  placeholder,
  defaultCountry = "GH",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultCountry?: Country;
}) {
  const [country, setCountry] = useState<Country | undefined>(defaultCountry);
  const [focused, setFocused] = useState(false);

  return (
    // One bordered shell contains [flag ▾ +233] [number] — the focus ring
    // wraps the whole field and the flag sits INSIDE the input.
    <div
      className={`phone-input-azura flex items-stretch w-full border rounded-xl transition-colors bg-white dark:bg-gray-900 ${
        focused ? "border-primary" : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <PhoneInput
        international
        withCountryCallingCode
        defaultCountry={defaultCountry}
        country={country}
        onCountryChange={setCountry}
        value={value || undefined}
        onChange={(v) => onChange(v ?? "")}
        placeholder={placeholder}
        className="flex-1 flex min-w-0"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        numberInputProps={{
          className:
            "flex-1 min-w-0 py-3 pr-4 text-sm font-open-sans text-text-primary placeholder-gray-300 dark:placeholder-gray-500 outline-none bg-transparent",
        }}
        countrySelectProps={{
          className:
            "country-select-azura flex items-center gap-1.5 pl-4 pr-2 py-3 text-sm font-open-sans text-text-primary outline-none cursor-pointer",
        }}
      />
    </div>
  );
}
