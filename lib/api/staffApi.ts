/**
 * Staff portal API — /api/staff/… (Azura operations team).
 * Every action is permission-gated server-side; `staffMe.perms` tells the UI
 * which buttons to show. Reuses the 'Booking' tag so guest-facing caches stay
 * consistent when staff record a payment.
 */
import { baseApi } from './baseApi'
import type { BookingDetail } from './bookingsApi'

export type StaffPerm =
  | 'bookings.view_booking' | 'bookings.view_special_requests' | 'payments.add_payment'
  | 'bookings.extend_deadline' | 'bookings.mark_arrived' | 'bookings.resolve_cancellation'
  | 'bookings.cancel_booking' | 'bookings.cancel_as_organizer' | 'payments.process_refund'

export interface StaffMe { email: string; name: string; groups: string[]; perms: StaffPerm[] }

export interface StaffBookingRow {
  reference: string; first_name: string; last_name: string; email: string
  package_title: string; travel_date: string; num_guests: number
  total_amount: string; amount_paid: string; balance: string; currency: string
  payment_state: 'unpaid' | 'partially_paid' | 'fully_paid'
  status: BookingDetail['status']; is_overdue: boolean; arrived_at: string | null
  payment_deadline: string | null; has_pending_cancellation: boolean; created_at: string
}

export interface StaffBookingListParams {
  q?: string; status?: string; payment_state?: string
  overdue?: '1'; arrived?: '1'; pending_cancellation?: '1'; page?: number
}

export interface Paginated<T> { count: number; next: string | null; previous: string | null; results: T[] }

export interface TravellerChange {
  kind: 'correction' | 'replacement'
  from: { first_name: string; last_name: string; email: string; phone: string | null }
  to: { first_name: string; last_name: string; email: string; phone: string | null }
  note: string; at: string; by: string; days_to_departure: number
}

export interface AddonChange {
  code: string; name: string; charge: string; fee: string; refund: string
  old_total: string; new_total: string; note: string; at: string; by: string
}

export interface StaffBooking extends BookingDetail {
  days_to_departure: number
  traveller_changes: TravellerChange[]
  addon_changes: AddonChange[]
  special_requests?: string | null   // only present with bookings.view_special_requests
  account_email: string | null
  arrived_at: string | null
  is_overdue: boolean
  payment_deadline_override: string | null
  payment_deadline_override_reason: string
  reminders_sent: Record<string, string>
  cancellation_requests: {
    id: string; status: 'pending' | 'approved' | 'rejected'; requested_at: string; reason: string
    refund_total: string | null; percent: string | null; resolved_at: string | null; staff_note: string
  }[]
  refunds: {
    id: string; amount: string; currency: string; status: 'pending' | 'processed' | 'rejected'
    gateway_amount: string | null; processed_at: string | null; external_reference: string; requested_at: string
  }[]
  policy_acceptances: { type: string; title: string; version: string; accepted_at: string }[]
}

export interface StaffCancellation {
  id: string; status: 'pending' | 'approved' | 'rejected'; requested_at: string; reason: string
  resolved_at: string | null; staff_note: string
  refund_total: string | null; percent: string | null; days_before_departure: number | null
  booking: {
    reference: string; first_name: string; last_name: string; email: string; package_title: string
    travel_date: string; status: string; amount_paid: string; balance: string; currency: string; arrived_at: string | null
  }
}

export interface StaffRefund {
  id: string; status: 'pending' | 'processed' | 'rejected'; amount: string; currency: string
  reason: string | null; requested_at: string; processed_at: string | null
  external_reference: string; execution_note: string
  gateway_instruction: string | null; payment_reference: string | null; payment_method: string | null
  basis: string | null; percent: string | null
  booking: { reference: string; first_name: string; last_name: string; email: string; package_title: string; currency: string }
}

const tagFor = (reference: string) => [{ type: 'Booking' as const, id: `staff-${reference}` }, { type: 'Booking' as const, id: 'STAFF_LIST' }]

export interface StaffEmail {
  id: string; kind: string; to: string; subject: string; status: 'sent' | 'failed'
  provider_id: string; error: string; sent_at: string
}

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    staffMe: builder.query<StaffMe, void>({ query: () => '/staff/me/' }),

    staffBookings: builder.query<Paginated<StaffBookingRow>, StaffBookingListParams>({
      query: (params) => ({ url: '/staff/bookings/', params }),
      providesTags: [{ type: 'Booking', id: 'STAFF_LIST' }],
    }),

    staffBooking: builder.query<StaffBooking, string>({
      query: (reference) => `/staff/bookings/${reference}/`,
      providesTags: (_r, _e, reference) => [{ type: 'Booking', id: `staff-${reference}` }],
    }),

    recordOfflinePayment: builder.mutation<StaffBooking, { reference: string; amount: string; method: 'bank_transfer' | 'other'; note?: string; purpose?: string }>({
      query: ({ reference, ...body }) => ({ url: `/staff/bookings/${reference}/offline-payment/`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { reference }) => [...tagFor(reference), { type: 'Booking', id: reference }],
    }),

    extendDeadline: builder.mutation<StaffBooking, { reference: string; date: string; reason: string }>({
      query: ({ reference, ...body }) => ({ url: `/staff/bookings/${reference}/extend-deadline/`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { reference }) => [...tagFor(reference), { type: 'Booking', id: reference }],
    }),

    markArrived: builder.mutation<StaffBooking, { reference: string }>({
      query: ({ reference }) => ({ url: `/staff/bookings/${reference}/mark-arrived/`, method: 'POST' }),
      invalidatesTags: (_r, _e, { reference }) => tagFor(reference),
    }),

    changeTraveller: builder.mutation<StaffBooking, { reference: string; kind: 'correction' | 'replacement'; first_name: string; last_name: string; email?: string; phone?: string; note?: string }>({
      query: ({ reference, ...body }) => ({ url: `/staff/bookings/${reference}/traveller/`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { reference }) => [...tagFor(reference), { type: 'Booking', id: reference }, { type: 'Booking', id: `staff-emails-${reference}` }],
    }),
    removeAddon: builder.mutation<StaffBooking, { reference: string; code: string; note?: string }>({
      query: ({ reference, ...body }) => ({ url: `/staff/bookings/${reference}/remove-addon/`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { reference }) => [...tagFor(reference), { type: 'Booking', id: reference }, { type: 'Booking', id: 'STAFF_REFUNDS' }],
    }),
    staffBookingEmails: builder.query<StaffEmail[], string>({
      query: (reference) => `/staff/bookings/${reference}/emails/`,
      providesTags: (_r, _e, reference) => [{ type: 'Booking', id: `staff-emails-${reference}` }],
    }),
    staffCancelBooking: builder.mutation<StaffBooking, { reference: string; mode: 'guest' | 'organizer'; note?: string }>({
      query: ({ reference, ...body }) => ({ url: `/staff/bookings/${reference}/cancel/`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { reference }) => [...tagFor(reference), { type: 'Booking', id: reference }, { type: 'Booking', id: 'STAFF_REFUNDS' }],
    }),

    // Cancellation queue (Operations) and refunds to execute (Finance)
    staffCancellations: builder.query<StaffCancellation[], { status?: string }>({
      query: (params) => ({ url: '/staff/cancellations/', params }),
      providesTags: [{ type: 'Booking', id: 'STAFF_CANCELLATIONS' }],
    }),
    resolveCancellation: builder.mutation<StaffCancellation, { id: string; decision: 'approve' | 'reject'; note?: string; reference: string }>({
      query: ({ id, decision, note }) => ({ url: `/staff/cancellations/${id}/${decision}/`, method: 'POST', body: { note } }),
      invalidatesTags: (_r, _e, { reference }) => [
        { type: 'Booking', id: 'STAFF_CANCELLATIONS' }, { type: 'Booking', id: 'STAFF_REFUNDS' }, ...tagFor(reference), { type: 'Booking', id: reference },
      ],
    }),
    staffRefunds: builder.query<StaffRefund[], { status?: string }>({
      query: (params) => ({ url: '/staff/refunds/', params }),
      providesTags: [{ type: 'Booking', id: 'STAFF_REFUNDS' }],
    }),
    resolveRefund: builder.mutation<StaffRefund, { id: string; decision: 'process' | 'reject'; external_reference?: string; note?: string; reference: string }>({
      query: ({ id, decision, external_reference, note }) => ({ url: `/staff/refunds/${id}/${decision}/`, method: 'POST', body: { external_reference, note } }),
      invalidatesTags: (_r, _e, { reference }) => [{ type: 'Booking', id: 'STAFF_REFUNDS' }, ...tagFor(reference), { type: 'Booking', id: reference }],
    }),
  }),
})

export const {
  useStaffMeQuery,
  useStaffBookingsQuery,
  useStaffBookingQuery,
  useRecordOfflinePaymentMutation,
  useExtendDeadlineMutation,
  useMarkArrivedMutation,
  useStaffBookingEmailsQuery,
  useChangeTravellerMutation,
  useRemoveAddonMutation,
  useStaffCancelBookingMutation,
  useStaffCancellationsQuery,
  useResolveCancellationMutation,
  useStaffRefundsQuery,
  useResolveRefundMutation,
} = staffApi
