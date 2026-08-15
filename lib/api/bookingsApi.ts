import { baseApi } from './baseApi'

export type PriceTier = 'shared' | 'private' | 'vip'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'abandoned' | 'refunded'
export type PaymentPlan = 'full' | 'installment'
export type PaymentState = 'unpaid' | 'partially_paid' | 'fully_paid'

// ── Legacy tier flow (old catalog) ───────────────────────────────────────────

export interface CreateBookingRequest {
  package_id: string
  price_tier: PriceTier
  first_name: string
  last_name: string
  email: string
  phone?: string
  country?: string
  num_guests?: number
  travel_date?: string
  special_requests?: string
}

export interface CreateBookingResponse {
  id: string
  reference: string
  total_amount: string
  currency: string
  status: BookingStatus
  message: string
}

// ── Option-based checkout (flagship flow) ────────────────────────────────────

export interface CheckoutRequest {
  option_id: string
  visa: boolean
  payment_plan: PaymentPlan
  first_name: string
  last_name: string
  email: string
  phone?: string
  country?: string
  special_requests?: string
  accepted_policies: string[]
  /** Total the customer saw — mismatch returns 409 with a fresh quote. */
  expected_total: string
}

export interface CheckoutResponse {
  id: string
  reference: string
  total_amount: string
  amount_due_today: string
  deposit_required: string | null
  early_bird_applied: boolean
  currency: string
  status: BookingStatus
  message: string
}

// ── Payments ─────────────────────────────────────────────────────────────────

export type PaymentChannel = 'card' | 'momo'
export type MomoProvider = 'mtn' | 'atl' | 'vod'

export interface InitializePaymentRequest {
  booking_id: string
  intent?: 'balance' | 'deposit' | 'custom'
  amount?: string
  /** card = hosted/Inline popup · momo = approve-prompt pushed to the phone
   * (MTN/AirtelTigo) or mobile-money-only hosted page (Telecel). */
  channel?: PaymentChannel
  momo_phone?: string
  momo_provider?: MomoProvider
}

export interface PaymentChannelsResponse {
  channels: {
    code: PaymentChannel
    label: string
    providers: { code: MomoProvider; label: string; direct: boolean }[]
  }[]
}

export interface InitializePaymentResponse {
  authorization_url: string | null
  access_code: string | null
  channel: PaymentChannel
  /** Direct MoMo only: the "approve on your phone" copy to display. */
  payment_prompt: string | null
  reference: string
  amount: string
  currency: string
  /** Set when the gateway charge differs from the booking currency (USD
   * bookings are charged in GHS at an admin-set rate). */
  charged_amount: string | null
  charged_currency: string | null
  exchange_rate: string | null
  booking_reference: string
}

export interface PaymentStatusResponse {
  status: PaymentStatus
  booking_reference: string
  booking_status: BookingStatus
  amount: string
  currency: string
  paid_at: string | null
  amount_paid: string
  balance: string
}

export interface PaymentRow {
  id: string
  reference: string | null
  amount: string
  currency: string
  /** What the gateway actually charged when it differs (GHS for USD bookings). */
  charged_amount: string | null
  charged_currency: string | null
  purpose: 'full' | 'deposit' | 'installment'
  method: 'paystack' | 'bank_transfer' | 'other'
  status: PaymentStatus
  paid_at: string | null
  created_at: string
}

// ── Booking detail (ledger-aware) ────────────────────────────────────────────

export interface BookingDetail {
  id: string
  reference: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  country: string | null
  package_title: string
  package_id: string
  num_guests: number
  travel_date: string
  unit_price: string
  total_amount: string
  amount_paid: string
  amount_refunded: string
  balance: string
  payment_state: PaymentState
  payment_plan: PaymentPlan
  deposit_required: string | null
  payment_deadline: string | null
  early_bird_applied: boolean
  early_bird_discount: string
  addons: { code: string; name: string; unit_price: string; quantity: number; line_total: string; refundable: boolean }[]
  currency: string
  status: BookingStatus
  payment_status: PaymentStatus | null
  payment_reference: string | null
  payments: PaymentRow[]
  created_at: string
}

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Legacy tier flow
    createBooking: builder.mutation<CreateBookingResponse, CreateBookingRequest>({
      query: (body) => ({ url: '/bookings/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
    }),

    // Flagship option flow
    checkout: builder.mutation<CheckoutResponse, CheckoutRequest>({
      query: (body) => ({ url: '/bookings/checkout/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
    }),

    initializePayment: builder.mutation<InitializePaymentResponse, InitializePaymentRequest>({
      query: (body) => ({ url: '/payments/initialize/', method: 'POST', body }),
    }),

    paymentChannels: builder.query<PaymentChannelsResponse, void>({
      query: () => '/payments/channels/',
    }),

    /** One-shot verify after the Paystack redirect — hits the gateway once. */
    verifyPayment: builder.query<PaymentStatusResponse, string>({
      query: (reference) => `/payments/verify/${reference}/`,
    }),

    /** DB-only poll target — never hits the gateway. */
    paymentStatus: builder.query<PaymentStatusResponse, string>({
      query: (reference) => `/payments/status/${reference}/`,
    }),

    getBookingByReference: builder.query<BookingDetail, string>({
      query: (reference) => `/bookings/${reference}/`,
      providesTags: (_result, _error, reference) => [{ type: 'Booking', id: reference }],
    }),

    getMyBookings: builder.query<BookingDetail[], void>({
      query: () => '/bookings/mine/',
      providesTags: [{ type: 'Booking', id: 'LIST' }],
    }),

    claimBooking: builder.mutation<{ reference: string; detail: string }, { token: string }>({
      query: (body) => ({ url: '/bookings/claim/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
    }),
  }),
})

export const {
  useCreateBookingMutation,
  useCheckoutMutation,
  useInitializePaymentMutation,
  usePaymentChannelsQuery,
  useVerifyPaymentQuery,
  useLazyPaymentStatusQuery,
  usePaymentStatusQuery,
  useGetBookingByReferenceQuery,
  useGetMyBookingsQuery,
  useClaimBookingMutation,
} = bookingsApi
