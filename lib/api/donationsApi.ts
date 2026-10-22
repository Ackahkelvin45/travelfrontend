import { baseApi } from './baseApi'

/** Academy donations (Change Request v4 §7) and group "pay your share" links.
 * Donations are their own Paystack charge, settled to the Academy's account. */

export interface DonationRequest {
  name: string
  email: string
  /** Custom USD amount, or `percent` of `booking_id`'s total (checkout). */
  amount?: string
  percent?: 5 | 10
  booking_id?: string
}

export interface DonationStart {
  reference: string
  access_code: string
  authorization_url: string
  amount: string
  currency: string
  charged_amount: string
  charged_currency: string
}

export interface TravellerShare {
  booking_id: string
  reference: string
  package_title: string
  organiser: string
  status: string
  currency: string
  traveller_id: string
  full_name: string
  share: string
  paid: string
  outstanding: string
  payable: boolean
}

export const donationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startDonation: builder.mutation<DonationStart, DonationRequest>({
      query: (body) => ({ url: '/donations/', method: 'POST', body }),
    }),
    verifyDonation: builder.query<{ reference: string; status: 'pending' | 'success' | 'failed'; amount: string; currency: string }, string>({
      query: (reference) => `/donations/verify/${reference}/`,
    }),
    travellerShare: builder.query<TravellerShare, string>({
      query: (travellerId) => `/bookings/share/${travellerId}/`,
    }),
  }),
})

export const { useStartDonationMutation, useLazyVerifyDonationQuery, useTravellerShareQuery } = donationsApi
