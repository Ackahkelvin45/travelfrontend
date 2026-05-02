import { baseApi } from './baseApi'

export type PriceTier = 'shared' | 'private' | 'vip'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'abandoned'

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

export interface InitializePaymentRequest {
  booking_id: string
}

export interface InitializePaymentResponse {
  authorization_url: string
  access_code: string
  reference: string
  amount: string
  currency: string
  booking_reference: string
}

export interface VerifyPaymentResponse {
  status: PaymentStatus
  booking_reference: string
  booking_status: BookingStatus
  amount: string
  currency: string
  paid_at: string
}

export interface BookingDetail {
  id: string
  reference: string
  first_name: string
  last_name: string
  email: string
  package_title: string
  num_guests: number
  travel_date: string
  unit_price: string
  total_amount: string
  currency: string
  status: BookingStatus
  payment_status: PaymentStatus
  payment_reference: string
  created_at: string
}

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation<CreateBookingResponse, CreateBookingRequest>({
      query: (body) => ({
        url: '/bookings/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
    }),

    initializePayment: builder.mutation<InitializePaymentResponse, InitializePaymentRequest>({
      query: (body) => ({
        url: '/payments/initialize/',
        method: 'POST',
        body,
      }),
    }),

    verifyPayment: builder.query<VerifyPaymentResponse, string>({
      query: (reference) => `/payments/verify/${reference}/`,
    }),

    getBookingByReference: builder.query<BookingDetail, string>({
      query: (reference) => `/bookings/${reference}/`,
      providesTags: (_result, _error, reference) => [{ type: 'Booking', id: reference }],
    }),

    getMyBookings: builder.query<{ results: BookingDetail[]; count: number }, { page?: number; page_size?: number }>({
      query: (params) => ({ url: '/bookings/', params }),
      providesTags: [{ type: 'Booking', id: 'LIST' }],
    }),

    cancelBooking: builder.mutation<BookingDetail, string>({
      query: (reference) => ({
        url: `/bookings/${reference}/cancel/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, reference) => [
        { type: 'Booking', id: reference },
        { type: 'Booking', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useCreateBookingMutation,
  useInitializePaymentMutation,
  useVerifyPaymentQuery,
  useGetBookingByReferenceQuery,
  useGetMyBookingsQuery,
  useCancelBookingMutation,
} = bookingsApi
