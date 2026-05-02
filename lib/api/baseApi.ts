import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store/store'

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://azuratravelsbackend.cc/api/'
console.log(BASE_URL)

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')
      headers.set('Accept', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Tour', 'Booking', 'User', 'Blog', 'Payment'],
  endpoints: () => ({}),
})
