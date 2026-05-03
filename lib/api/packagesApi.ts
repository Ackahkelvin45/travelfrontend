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
 itineraries: PackageItinerary[]
 faqs: PackageFAQ[]
 created_at: string
 updated_at: string
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
} = packagesApi
