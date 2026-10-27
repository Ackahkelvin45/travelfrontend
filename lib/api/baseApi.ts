import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import type { RootState } from '../store/store'
import { logout, updateToken } from '../features/auth/authSlice'

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://azuratravelsbackend.cc/api/'

/** Sign-in endpoints go through the site's own domain (/api/auth/ is routed
 * to the backend), so the httpOnly refresh cookie is first-party. */
export const authUrl = (path: string) =>
  `${typeof window === 'undefined' ? '' : window.location.origin}/api/auth/${path}`

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

/** A new access token from the refresh cookie, or null. Tried twice: another
 * tab may have just rotated the cookie under this request. */
export async function refreshAccess(): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 400))
    try {
      const resp = await fetch(authUrl('token/refresh/'), { method: 'POST', credentials: 'same-origin' })
      if (resp.ok) return ((await resp.json()) as { access?: string }).access ?? null
      if (resp.status !== 401) return null
    } catch {
      return null
    }
  }
  return null
}

/**
 * Wraps the base query: on a 401 it refreshes the access token from the
 * cookie, then retries the original request once. If that fails it clears
 * the session so the UI shows signed out instead of looping on 401s.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  // Signed out (e.g. a wrong password on sign-in): nothing to refresh.
  if (result.error?.status !== 401 || !(api.getState() as RootState).auth.token) return result

  // Single in-flight refresh shared across concurrent 401s.
  if (!refreshing) {
    refreshing = refreshAccess().then((access) => {
      api.dispatch(access ? updateToken({ token: access }) : logout())
      return access
    })
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
