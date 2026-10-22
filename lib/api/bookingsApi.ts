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

export interface ConfigurableCheckoutRequest {
  package_id: string
  num_guests: number
  selected_addon_codes: string[]
  payment_plan: PaymentPlan
  first_name: string
  last_name: string
  email: string
  phone?: string
  country?: string
  special_requests?: string
  accepted_policies: string[]
  expected_total?: string
}

// ── Payments ─────────────────────────────────────────────────────────────────

export type PaymentChannel = 'any' | 'card' | 'momo'
export type MomoProvider = 'mtn' | 'atl' | 'vod'

export interface InitializePaymentRequest {
  booking_id: string
  intent?: 'balance' | 'deposit' | 'custom' | 'addon' | 'traveller'
  amount?: string
  /** intent=traveller: pay this group member's outstanding share. */
  traveller_id?: string
  /** intent=traveller: receipt email of the member paying. */
  payer_email?: string
  /** intent=addon on a trip booking: the guests it's for, and their 18+ confirmation. */
  traveller_ids?: string[]
  adult?: boolean
  /** intent=addon: the experience to buy; it joins the booking once paid. */
  addon_code?: string
  /** any (default) = Paystack popup offering card + Mobile Money, the buyer
   * picks method/network/number inside Paystack · card = card-only popup ·
   * momo = approve-prompt pushed to the phone (MTN/AirtelTigo) or
   * mobile-money-only hosted page (Telecel). */
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
  /** Chargeback open with the card issuer — refunds on this payment are blocked. */
  disputed: boolean
  status: PaymentStatus
  paid_at: string | null
  created_at: string
}

// ── Booking detail (ledger-aware) ────────────────────────────────────────────

export interface BookingDetail {
  id: string
  reference: string
  /** Component bookings only ("single" | "couple" | "group"); empty for older flows. */
  mode: TravelMode | ''
  coordinator_name: string | null
  lead_contacted_at: string | null
  pay_separately: boolean
  travellers: {
    id: string; full_name: string; is_lead: boolean; unit: string | null; experiences: string[]
    travel_info_submitted: boolean; share: string; paid: string; outstanding: string
  }[]
  marketing_consent: boolean
  photo_consent: boolean
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
  /** What the total is made of — same decomposition the receipts use. */
  line_items: {
    lines: { label: string; detail: string; amount: string; category: string }[]
    subtotal: string
    discount: string
    discount_note: string
    total: string
  }
  /** Installment Policy: set once the overdue notice went out; cure ends 72h later. */
  overdue_notice_sent_at: string | null
  cure_deadline: string | null
  /** Latest cancellation request, if the guest ever lodged one. */
  cancellation_request: {
    status: 'pending' | 'approved' | 'rejected'
    requested_at: string
    refund_total: string | null
    percent: string | null
    resolved_at: string | null
    staff_note: string
  } | null
  created_at: string
}

export interface AvailableAddons {
  can_add: boolean
  reason: string | null
  open_until: string | null
  currency: string
  /** Trip bookings return per-guest options (eligible_travellers etc.) and no quantity/line_total. */
  addons: {
    code: string; name: string; description: string | null; unit: string; unit_price: string; refundable: boolean
    quantity?: number; line_total?: string
    adults_only?: boolean; vehicle_capacity?: number; eligible_travellers?: string[]
  }[]
}

export interface CancellationQuote {
  eligible: boolean
  pending: boolean
  refund_total: string
  currency: string
  breakdown: { days_before_departure: number; percent: string; net_paid: string; tier_applied: { min_days: number; percent: number } }
  arrival_rule: string
}


// ── Component pricing (Change Request v4) ────────────────────────────────────

export type TravelMode = 'single' | 'couple' | 'group'

/** Travellers by list index; rooms list occupants by that index. */
export interface TripSelection {
  package_id: string
  mode: TravelMode
  /** adult: the guest confirmed they are 18+ (needed for adults-only experiences). */
  travellers: { name?: string; experiences: string[]; adult?: boolean }[]
  rooms: { stay_type: string; occupants: number[] }[]
  payment_plan?: PaymentPlan
  /** This checkout's hold: its own held rooms don't count as sold out. */
  hold_token?: string
}

export interface ComponentQuote {
  package_id: string
  mode: TravelMode
  payment_plan: PaymentPlan
  currency: string
  core_price_per_person: string
  num_guests: number
  travellers: {
    index: number
    name: string
    core: string
    room: string | null
    adult: boolean
    experiences: { code: string; name: string; price: string; refundable: boolean }[]
    /** Airport transfer code, priced per vehicle in `transfers`. */
    transfer: string | null
    experiences_subtotal: string
    room_share: string
    transfer_share: string
    /** This guest's part of the total; shares add up to the total exactly. */
    share: string
    room_deposit: string
    due_now: string
  }[]
  rooms: {
    stay_type: string
    name: string
    occupants: number[]
    price_per_night: string
    nights: number
    charge: string
    discount: string
    deposit: string
    unit?: string
  }[]
  transfers: { code: string; name: string; guests: number[]; vehicles: number; price: string; charge: string; refundable: boolean }[]
  core_total: string
  rooms_total: string
  experiences_total: string
  transfers_total: string
  subtotal: string
  discount_name: string
  discount_percent: string
  discount_total: string
  accommodation_deposit_percent: string
  total: string
  average_per_person: string
  deposit_required: string | null
  amount_due_today: string
  balance_after_today: string
  final_payment_deadline: string | null
}

export interface RoomHold {
  token: string
  held_until: string
  server_now: string
  units: { stay_type: string; label: string }[]
}

export interface ComponentCheckoutRequest extends TripSelection {
  first_name: string
  last_name: string
  email: string
  phone?: string
  country?: string
  special_requests?: string
  accepted_policies: string[]
  marketing_consent: boolean
  /** Group only: each member pays their own share under this reference. */
  pay_separately?: boolean
  expected_total?: string
}

export interface ComponentCheckoutResponse extends CheckoutResponse {
  discount_amount: string
  quote: ComponentQuote
}

export interface TravelInfo {
  id: string
  full_name: string
  is_lead: boolean
  arrival_at: string | null
  arrival_flight: string
  departure_at: string | null
  departure_flight: string
  needs_transfer: boolean
  emergency_contact: string
  emergency_phone: string
  dietary: string
  accessibility: string
  travel_info_submitted_at: string | null
}

export interface LeadRequest {
  name: string
  email: string
  phone?: string
  source: 'chat' | 'saved_quote' | 'contact'
  message?: string
  marketing_consent?: boolean
  selection?: TripSelection
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

    // Core + add-ons flow (Michael Blackson style)
    configurableCheckout: builder.mutation<CheckoutResponse, ConfigurableCheckoutRequest>({
      query: (body) => ({ url: '/bookings/checkout/configurable/', method: 'POST', body }),
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

    // Experiences the owner can still add (until 7 days before departure)
    availableAddons: builder.query<AvailableAddons, string>({
      query: (reference) => `/bookings/${reference}/addons/available/`,
      providesTags: (_r, _e, reference) => [{ type: 'Booking', id: reference }],
    }),

    // Refund Policy: preview, then lodge, a cancellation request (owner only)
    cancellationQuote: builder.query<CancellationQuote, string>({
      query: (reference) => `/bookings/${reference}/cancellation-quote/`,
    }),
    componentQuote: builder.mutation<ComponentQuote, TripSelection>({
      query: (body) => ({ url: '/bookings/quote/', method: 'POST', body }),
    }),
    createHold: builder.mutation<RoomHold, { package_id: string; stay_types: string[]; replace_token?: string }>({
      query: (body) => ({ url: '/bookings/holds/', method: 'POST', body }),
    }),
    releaseHold: builder.mutation<void, string>({
      query: (token) => ({ url: `/bookings/holds/${token}/`, method: 'DELETE' }),
    }),
    componentCheckout: builder.mutation<ComponentCheckoutResponse, ComponentCheckoutRequest>({
      query: (body) => ({ url: '/bookings/checkout/component/', method: 'POST', body }),
    }),
    travelInfo: builder.query<{ travellers: TravelInfo[] }, string>({
      query: (reference) => `/bookings/${reference}/travel/`,
      providesTags: (_r, _e, reference) => [{ type: 'Booking', id: `travel-${reference}` }],
    }),
    saveTravelInfo: builder.mutation<{ travellers: TravelInfo[] }, { reference: string; travellers: Partial<TravelInfo>[] }>({
      query: ({ reference, travellers }) => ({ url: `/bookings/${reference}/travel/`, method: 'PUT', body: { travellers } }),
      invalidatesTags: (_r, _e, { reference }) => [{ type: 'Booking', id: `travel-${reference}` }],
    }),
    updatePreferences: builder.mutation<
      { marketing_consent: boolean; photo_consent: boolean },
      { reference: string; marketing_consent?: boolean; photo_consent?: boolean }
    >({
      query: ({ reference, ...body }) => ({ url: `/bookings/${reference}/preferences/`, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
    }),
    createLead: builder.mutation<{ id: string; detail: string }, LeadRequest>({
      query: (body) => ({ url: '/leads/', method: 'POST', body }),
    }),
    requestCancellation: builder.mutation<
      { detail: string; requested_at: string; refund_total: string | null; currency: string },
      { reference: string; reason?: string }
    >({
      query: ({ reference, reason }) => ({
        url: `/bookings/${reference}/cancellation-request/`, method: 'POST', body: { reason },
      }),
      invalidatesTags: (_r, _e, { reference }) => [{ type: 'Booking', id: 'LIST' }, { type: 'Booking', id: reference }],
    }),
  }),
})

export const {
  useCreateBookingMutation,
  useCheckoutMutation,
  useConfigurableCheckoutMutation,
  useInitializePaymentMutation,
  usePaymentChannelsQuery,
  useVerifyPaymentQuery,
  useLazyPaymentStatusQuery,
  usePaymentStatusQuery,
  useGetBookingByReferenceQuery,
  useGetMyBookingsQuery,
  useClaimBookingMutation,
  useAvailableAddonsQuery,
  useLazyCancellationQuoteQuery,
  useRequestCancellationMutation,
  useComponentQuoteMutation,
  useCreateHoldMutation,
  useReleaseHoldMutation,
  useComponentCheckoutMutation,
  useTravelInfoQuery,
  useSaveTravelInfoMutation,
  useCreateLeadMutation,
  useUpdatePreferencesMutation,
} = bookingsApi
