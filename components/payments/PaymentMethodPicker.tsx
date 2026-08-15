"use client";

/**
 * The buyer's explicit payment-method choice: Mobile Money (with a network
 * picker — networks are NEVER inferred from the phone prefix, which goes
 * stale with number portability) or Card. Options come from the backend's
 * /payments/channels/ so routing changes never need a frontend deploy.
 */

import { usePaymentChannelsQuery, type MomoProvider, type PaymentChannel } from "@/lib/api/bookingsApi";

export interface PaymentMethodState {
  channel: PaymentChannel;
  momoPhone: string;
  momoProvider: MomoProvider | "";
}

export const DEFAULT_PAYMENT_METHOD: PaymentMethodState = {
  channel: "momo",
  momoPhone: "",
  momoProvider: "",
};

export function paymentMethodValid(state: PaymentMethodState): boolean {
  if (state.channel === "card") return true;
  return /^(\+?233|0)?\d{9}$/.test(state.momoPhone.replace(/\s+/g, "")) && !!state.momoProvider;
}

export function paymentMethodDisabledReason(state: PaymentMethodState): string | null {
  if (state.channel === "card") return null;
  if (!state.momoProvider) return "Choose your Mobile Money network";
  if (!/^(\+?233|0)?\d{9}$/.test(state.momoPhone.replace(/\s+/g, ""))) return "Enter the MoMo number to charge";
  return null;
}

export default function PaymentMethodPicker({
  value,
  onChange,
}: {
  value: PaymentMethodState;
  onChange: (next: PaymentMethodState) => void;
}) {
  const { data } = usePaymentChannelsQuery();
  const momo = data?.channels.find((c) => c.code === "momo");
  const card = data?.channels.find((c) => c.code === "card");

  const channelButton = (
    code: PaymentChannel,
    label: string,
    description: string,
  ) => (
    <button
      type="button"
      onClick={() => onChange({ ...value, channel: code })}
      className={`text-left rounded-2xl border-2 p-4 transition-colors flex-1 ${
        value.channel === code
          ? "border-primary bg-primary/5"
          : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
      }`}
    >
      <p className="text-sm font-bold font-open-sans text-text-primary mb-1">{label}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">{description}</p>
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {channelButton("momo", momo?.label ?? "Mobile Money", "Approve a prompt on your phone — no card needed.")}
        {channelButton("card", card?.label ?? "Card (Visa / Mastercard)", "Pay securely with your bank card.")}
      </div>

      {value.channel === "momo" && (
        <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
          <div>
            <label className="block text-xs font-semibold font-open-sans text-text-primary mb-2">
              Network <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(momo?.providers ?? [
                { code: "mtn" as MomoProvider, label: "MTN Mobile Money", direct: true },
                { code: "atl" as MomoProvider, label: "AT Money (AirtelTigo)", direct: true },
                { code: "vod" as MomoProvider, label: "Telecel Cash", direct: false },
              ]).map((provider) => (
                <button
                  key={provider.code}
                  type="button"
                  onClick={() => onChange({ ...value, momoProvider: provider.code })}
                  className={`px-4 py-2 rounded-full text-xs font-semibold font-open-sans border transition-colors ${
                    value.momoProvider === provider.code
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 dark:border-gray-700 text-text-primary hover:border-primary"
                  }`}
                >
                  {provider.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-open-sans mt-1.5">
              Pick the network of the number being charged — we never guess it from the prefix.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold font-open-sans text-text-primary mb-2">
              Mobile Money number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={value.momoPhone}
              onChange={(e) => onChange({ ...value, momoPhone: e.target.value })}
              placeholder="055 123 4567"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary placeholder-gray-300 dark:placeholder-gray-500 outline-none focus:border-primary transition-colors bg-white dark:bg-gray-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}
