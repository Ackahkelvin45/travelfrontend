import { baseApi } from './baseApi'
import type { TourCategory } from '../features/tours/toursSlice'

export interface Tour {
 id: string
 title: string
 slug: string
 description: string
 destination: string
 category: TourCategory
 price: number
 originalPrice?: number
 duration: number
 maxGroupSize: number
 rating: number
 reviewCount: number
 images: string[]
 highlights: string[]
 included: string[]
 excluded: string[]
 startDates: string[]
 isFeatured: boolean
 createdAt: string
}

export interface ToursListResponse {
 tours: Tour[]
 total: number
 page: number
 limit: number
}

export interface ToursQueryParams {
 page?: number
 limit?: number
 destination?: string
 category?: TourCategory | ''
 priceMin?: number
 priceMax?: number
 rating?: number
 duration?: number
 dateFrom?: string
 dateTo?: string
 search?: string
}

export const toursApi = baseApi.injectEndpoints({
 endpoints: (builder) => ({
 getTours: builder.query<ToursListResponse, ToursQueryParams>({
 query: (params) => ({
 url: '/tours',
 params,
 }),
 providesTags: (result) =>
 result
 ? [
 ...result.tours.map(({ id }) => ({ type: 'Tour' as const, id })),
 { type: 'Tour', id: 'LIST' },
 ]
 : [{ type: 'Tour', id: 'LIST' }],
 }),

 getTourById: builder.query<Tour, string>({
 query: (id) => `/tours/${id}`,
 providesTags: (_result, _error, id) => [{ type: 'Tour', id }],
 }),

 getTourBySlug: builder.query<Tour, string>({
 query: (slug) => `/tours/slug/${slug}`,
 providesTags: (_result, _error, slug) => [{ type: 'Tour', id: slug }],
 }),

 getFeaturedTours: builder.query<Tour[], void>({
 query: () => '/tours/featured',
 providesTags: [{ type: 'Tour', id: 'FEATURED' }],
 }),

 searchTours: builder.query<ToursListResponse, string>({
 query: (q) => ({ url: '/tours/search', params: { q } }),
 providesTags: [{ type: 'Tour', id: 'SEARCH' }],
 }),
 }),
})

export const {
 useGetToursQuery,
 useGetTourByIdQuery,
 useGetTourBySlugQuery,
 useGetFeaturedToursQuery,
 useSearchToursQuery,
} = toursApi
