import { baseApi } from './baseApi'

export interface GalleryImage {
  id: string
  image: string
  caption: string | null
  type: 'package' | 'destination'
  source_id: string
  source_name: string
}

export interface GalleryResponse {
  packages: Array<{
    id: string
    image: string
    caption: string | null
    image_type: 'package'
    package_id: string
    package_title: string
  }>
  destinations: Array<{
    id: string
    image: string
    caption: string | null
    image_type: 'destination'
    destination_id: string
    destination_name: string
  }>
  total_packages: number
  total_destinations: number
  total_images: number
}

export interface TransformedGalleryResponse {
  count: number
  next: string | null
  previous: string | null
  results: GalleryImage[]
}

export interface GalleryParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  type?: 'all' | 'package' | 'destination'
}

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query<TransformedGalleryResponse, GalleryParams>({
      query: (params) => ({ url: '/packages/gallery/', params }),
      transformResponse: (response: GalleryResponse, meta, arg) => {
        const packages = (response.packages || []).map((pkg) => ({
          id: pkg.id,
          image: pkg.image,
          caption: pkg.caption,
          type: pkg.image_type,
          source_id: pkg.package_id,
          source_name: pkg.package_title,
        }))

        const destinations = (response.destinations || []).map((dest) => ({
          id: dest.id,
          image: dest.image,
          caption: dest.caption,
          type: dest.image_type,
          source_id: dest.destination_id,
          source_name: dest.destination_name,
        }))

        let results = [...packages, ...destinations]

        // Handle frontend filtering if needed, though backend should ideally handle it
        if (arg.type && arg.type !== 'all') {
          results = results.filter((img) => img.type === arg.type)
        }

        // Determine correct total count for pagination
        let count = response.total_images
        if (arg.type === 'package') count = response.total_packages
        else if (arg.type === 'destination') count = response.total_destinations

        return {
          count: count || results.length,
          next: null,
          previous: null,
          results,
        }
      },
    }),
  }),
})

export const { useGetGalleryQuery } = galleryApi
