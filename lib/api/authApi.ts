import { baseApi } from './baseApi'
import type { User } from '../features/auth/authSlice'

interface LoginRequest {
 email: string
 password: string
}

interface RegisterRequest {
 firstName: string
 lastName: string
 email: string
 password: string
}

interface AuthResponse {
 user: User
 token: string
 refreshToken: string
}

interface RefreshTokenResponse {
 token: string
 refreshToken: string
}

export const authApi = baseApi.injectEndpoints({
 endpoints: (builder) => ({
 login: builder.mutation<AuthResponse, LoginRequest>({
 query: (credentials) => ({
 url: '/auth/login',
 method: 'POST',
 body: credentials,
 }),
 }),

 register: builder.mutation<AuthResponse, RegisterRequest>({
 query: (data) => ({
 url: '/auth/register',
 method: 'POST',
 body: data,
 }),
 }),

 logout: builder.mutation<void, void>({
 query: () => ({
 url: '/auth/logout',
 method: 'POST',
 }),
 }),

 refreshToken: builder.mutation<RefreshTokenResponse, { refreshToken: string }>({
 query: (body) => ({
 url: '/auth/refresh',
 method: 'POST',
 body,
 }),
 }),

 getMe: builder.query<User, void>({
 query: () => '/auth/me',
 providesTags: ['User'],
 }),
 }),
})

export const {
 useLoginMutation,
 useRegisterMutation,
 useLogoutMutation,
 useRefreshTokenMutation,
 useGetMeQuery,
} = authApi
