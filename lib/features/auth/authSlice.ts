import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone_number?: string | null
  country?: string | null
}

interface AuthState {
  user: User | null
  token: string | null        // simplejwt access token
  refreshToken: string | null // simplejwt refresh token
  isAuthenticated: boolean
  hydrated: boolean
}

// Tokens are hydrated from localStorage in a client effect (StoreProvider) —
// reading it at module init causes SSR/client hydration mismatches.
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  hydrated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        state.token = localStorage.getItem('token')
        state.refreshToken = localStorage.getItem('refreshToken')
      }
      state.hydrated = true
    },
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>
    ) => {
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('refreshToken', action.payload.refreshToken)
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    updateToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token
      localStorage.setItem('token', action.payload.token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    },
  },
})

export const { hydrateFromStorage, setCredentials, setUser, updateToken, logout } = authSlice.actions
export default authSlice.reducer
