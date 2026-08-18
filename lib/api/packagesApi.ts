import { baseApi } from './baseApi'

export interface PackageCoverImage {
 id: string
 image: string
 caption: string | null
 is_cover: boolean
 order: number
 uploaded_at: string
}

export interface Package {
 id: string
 title: string
 slug: string
 category: string
 category_display: string
 destination: string
 duration_days: number
 price_shared: string
 price_private: string
 price_vip: string
 currency: string
 is_featured: boolean
 is_active: boolean
 available_from: string
 available_to: string
 cover_image: PackageCoverImage | null
 avg_rating: number | null
 review_count: number
 has_options: boolean
 from_price: string | null
 is_day_tour: boolean
 price_usd_estimate: string | null
 next_departure: string | null
}

export interface TourDeparture {
 id: string
 date: string
 capacity: number | null
 seats_left: number | null
 is_full: boolean
 note: string | null
}

export interface PackageVideo {
 id: string
 video: string | null
 video_url: string | null
 poster: string | null
 caption: string | null
 order: number
}

export interface PackageItinerary {
 id: string
 day: number
 title: string
 description: string
 activities: string[]
 notes: string
}

export interface PackageFAQ {
 id: string
 question: string
 answer: string
 order: number
}

export interface PackageDetail {
 id: string
 title: string
 slug: string
 category: string
 category_display: string
 description: string
 highlights: string[]
 whats_included: string[]
 destination: string
 map_url: string
 latitude: string
 longitude: string
 duration_days: number
 max_guests: number
 price_shared: string
 price_private: string
 price_vip: string
 currency: string
 available_from: string
 available_to: string
 is_active: boolean
 is_featured: boolean
 avg_rating: number | null
 review_count: number
 images: PackageCoverImage[]
 videos: PackageVideo[]
 itineraries: PackageItinerary[]
 faqs: PackageFAQ[]
 whats_excluded: string[]
 has_options: boolean
 from_price: string | null
 options: PackageOption[]
 is_day_tour: boolean
 price_usd_estimate: string | null
 departures: TourDeparture[]
 early_bird_deadline: string | null
 early_bird_active: boolean
 allow_installments: boolean
 deposit_minimum: string | null
 final_payment_deadline: string | null
 visa_addon_enabled: boolean
 visa_fee: string | null
 visa_info: string | null
 refund_tiers: { min_days: number; percent: number }[]
 created_at: string
 updated_at: string
}

export interface PackageOption {
 id: string
 hotel_name: string
 star_rating: number
 hotel_image: string | null
 occupancy: 'single' | 'double'
 occupancy_display: string
 guests_per_booking: number
 price_per_person: string
 early_bird_price_per_person: string | null
 is_active: boolean
 order: number
}

/** GET /packages/{id}/pricing/ — the full server-priced matrix. All money
 * shown in the booking flow comes from here; selection is pure lookup. */
export interface PricingMatrix {
 package_id: string
 currency: string
 tour_start: string | null
 tour_end: string | null
 options: {
  id: string
  hotel_name: string
  star_rating: number
  hotel_image: string | null
  occupancy: 'single' | 'double'
  occupancy_display: string
  guests_per_booking: number
  standard_price_per_person: string
  early_bird_price_per_person: string | null
  effective_price_per_person: string
  early_bird_applied: boolean
  standard_total: string
  effective_total: string
  saving_total: string
 }[]
 visa: {
  enabled: boolean
  fee_per_guest: string | null
  info: string | null
  refundable: boolean
 }
 installments: {
  enabled: boolean
  deposit_minimum: string | null
  final_payment_deadline: string | null
 }
 early_bird: {
  active: boolean
  deadline: string | null
 }
 /** Paystack Ghana charges GHS only — non-GHS packages disclose the
  * conversion applied at charge time. */
 charge: {
  currency: string
  exchange_rate: string | null
  rate_source: string | null
 }
 server_now: string
}

export interface PolicyDoc {
 type: 'terms' | 'installment' | 'refund' | 'privacy'
 type_display: string
 version: string
 title: string
 body: string
 published_at: string
}

export interface TripUpdate {
 id: string
 title: string
 body: string
 published_at: string
}

export interface PackagesListResponse {
 count: number
 next: string | null
 previous: string | null
 results: Package[]
}

export interface PackagesQueryParams {
 page?: number
 page_size?: number
 category?: string
 price_min?: string
 price_max?: string
 duration?: string
 travel_from?: string
 travel_to?: string
 sort?: string
 search?: string
 ordering?: string
 destinations?: string
}

export interface PackageReview {
 id: string
 reviewer_name: string
 rating: number
 title?: string
 body: string
 created_at: string
 images?: string[]
}

export interface PackageReviewsResponse {
 count: number
 next: string | null
 previous: string | null
 results: PackageReview[]
}

export interface PackageReviewCreate {
 reviewer_name: string
 reviewer_email: string
 rating: number
 title?: string
 body: string
 booking_reference?: string
}

export const packagesApi = baseApi.injectEndpoints({
 endpoints: (builder) => ({
 getPackages: builder.query<PackagesListResponse, PackagesQueryParams>({
 query: (params) => ({
 url: '/packages/',
 params,
 }),
 providesTags: (result) =>
 result
 ? [
 ...result.results.map(({ id }) => ({ type: 'Tour' as const, id })),
 { type: 'Tour', id: 'LIST' },
 ]
 : [{ type: 'Tour', id: 'LIST' }],
 }),

 getPackageDetail: builder.query<PackageDetail, string>({
 query: (slug) => `/packages/${slug}/`,
 providesTags: (_result, _error, slug) => [{ type: 'Tour', id: slug }],
 }),

 getPackagePricing: builder.query<PricingMatrix, string>({
 query: (id) => `/packages/${id}/pricing/`,
 providesTags: (_result, _error, id) => [{ type: 'Tour', id: `pricing-${id}` }],
 }),

 getTripUpdates: builder.query<TripUpdate[], string>({
 query: (id) => `/packages/${id}/updates/`,
 }),

 getCurrentPolicies: builder.query<PolicyDoc[], void>({
 query: () => '/bookings/policies/',
 }),

 getTrendingPackages: builder.query<Package[], void>({
 query: () => '/packages/trending/',
 providesTags: [{ type: 'Tour', id: 'TRENDING' }],
 }),

 getPackageReviews: builder.query<PackageReviewsResponse, string>({
 query: (packageId) => `/packages/${packageId}/reviews/`,
 providesTags: (_result, _error, packageId) => [{ type: 'Tour', id: `reviews-${packageId}` }],
 }),

 submitPackageReview: builder.mutation<PackageReview, { packageId: string; body: PackageReviewCreate }>({
 query: ({ packageId, body }) => ({
 url: `/packages/${packageId}/reviews/`,
 method: 'POST',
 body,
 }),
 invalidatesTags: (_result, _error, { packageId }) => [
 { type: 'Tour', id: `reviews-${packageId}` },
 { type: 'Tour', id: packageId },
 ],
 }),
 }),
})

export const {
 useGetPackagesQuery,
 useGetPackageDetailQuery,
 useGetTrendingPackagesQuery,
 useGetPackageReviewsQuery,
 useSubmitPackageReviewMutation,
 useGetPackagePricingQuery,
 useGetTripUpdatesQuery,
 useGetCurrentPoliciesQuery,
} = packagesApi
