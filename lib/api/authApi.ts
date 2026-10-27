import { authUrl, baseApi } from './baseApi'
import type { User } from '../features/auth/authSlice'

interface LoginRequest {
  email: string
  password: string
}

/** /api/auth/token/ — the refresh token is set as an httpOnly cookie. */
interface TokenPairResponse {
  access: string
}

interface RegisterRequest {
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  country?: string
  password: string
  password_confirm: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TokenPairResponse, LoginRequest>({
      query: (credentials) => ({
        url: authUrl('token/'),
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<User, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register/',
        method: 'POST',
        body: data,
      }),
    }),

    /** Sign out: revokes the refresh cookie server-side and clears it. */
    revokeToken: builder.mutation<void, void>({
      query: () => ({ url: authUrl('token/blacklist/'), method: 'POST' }),
    }),

    getMe: builder.query<User, void>({
      query: () => '/auth/me/',
      providesTags: ['User'],
    }),

    requestAccountDeletion: builder.mutation<{ detail: string }, void>({
      query: () => ({ url: '/auth/delete-request/', method: 'POST' }),
    }),
    resendVerification: builder.mutation<{ detail: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/resend-verification/',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useRevokeTokenMutation,
  useGetMeQuery,
  useResendVerificationMutation,
  useRequestAccountDeletionMutation,
} = authApi
