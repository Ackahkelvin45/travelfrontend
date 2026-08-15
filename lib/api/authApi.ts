import { baseApi } from './baseApi'
import type { User } from '../features/auth/authSlice'

interface LoginRequest {
  email: string
  password: string
}

/** simplejwt token pair — /api/auth/token/ */
interface TokenPairResponse {
  access: string
  refresh: string
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
        url: '/auth/token/',
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

    refreshToken: builder.mutation<{ access: string }, { refresh: string }>({
      query: (body) => ({
        url: '/auth/token/refresh/',
        method: 'POST',
        body,
      }),
    }),

    getMe: builder.query<User, void>({
      query: () => '/auth/me/',
      providesTags: ['User'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
} = authApi
