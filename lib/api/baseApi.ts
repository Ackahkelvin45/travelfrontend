import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import type { RootState } from '../store/store'
import { logout, updateToken } from '../features/auth/authSlice'

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://azuratravelsbackend.cc/api/'

const rawBaseQuery = fetchBaseQuery({
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
})

// Prevents several concurrent 401s from each firing their own refresh.
let refreshing: Promise<string | null> | null = null

/**
 * Wraps the base query: on a 401 it transparently refreshes the access token
 * using the stored refresh token, then retries the original request once. If
 * there's no refresh token or the refresh fails, it clears the session so the
 * UI reflects a logged-out state instead of looping on 401s.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status !== 401) return result

  const refresh = (api.getState() as RootState).auth.refreshToken
  if (!refresh) {
    api.dispatch(logout())
    return result
  }

  // Single in-flight refresh shared across concurrent 401s.
  if (!refreshing) {
    refreshing = (async () => {
      const resp = await rawBaseQuery(
        { url: '/auth/token/refresh/', method: 'POST', body: { refresh } },
        api,
        extraOptions,
      )
      const access = (resp.data as { access?: string } | undefined)?.access ?? null
      if (access) {
        api.dispatch(updateToken({ token: access }))
      } else {
        api.dispatch(logout())
      }
      return access
    })()
  }

  const newAccess = await refreshing
  refreshing = null

  if (newAccess) {
    // Retry the original request with the refreshed token.
    result = await rawBaseQuery(args, api, extraOptions)
  }
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Tour', 'Booking', 'User', 'Blog', 'Payment'],
  endpoints: () => ({}),
})
