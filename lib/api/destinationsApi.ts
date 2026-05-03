import { baseApi } from './baseApi'

export interface DestinationImage {
  id: string
  image: string
  caption: string | null
  is_cover?: boolean
  order?: number
  uploaded_at?: string
}

export interface Destination {
  id: string
  name: string
  description: string
  package_count: number
  images: DestinationImage[]
  created_at: string
  updated_at: string
}

export interface DestinationDetail {
  id: string
  name: string
  description: string
  map_url: string | null
  latitude: string | null
  longitude: string | null
  package_count: number
  images: DestinationImage[]
  created_at: string
  updated_at: string
}

export interface DestinationsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Destination[]
}

export const destinationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDestinations: builder.query<DestinationsListResponse, { page_size?: number }>({
      query: (params) => ({ url: '/packages/destinations/', params }),
    }),
    getDestinationDetail: builder.query<DestinationDetail, string>({
      query: (id) => `/packages/destinations/${id}/`,
    }),
  }),
})

export const { useGetDestinationsQuery, useGetDestinationDetailQuery } = destinationsApi
