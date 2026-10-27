import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone_number?: string | null
  country?: string | null
  /** Azura team member — shows the link to the Django admin (server enforces permissions). */
  is_staff?: boolean
}

interface AuthState {
  user: User | null
  token: string | null        // simplejwt access token, in memory only
  isAuthenticated: boolean
  /** The startup session check (cookie refresh) has finished. */
  hydrated: boolean
}

// The refresh token is an httpOnly cookie the browser sends to /api/auth/
// (never readable here); the access token lives only in memory and is
// restored from the cookie on each page load (StoreProvider).
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
}

// Not a secret: only spares signed-out visitors a refresh call on every load.
export const SIGNED_IN_KEY = 'azura.signedIn'
const remember = (on: boolean) => {
  try { if (on) localStorage.setItem(SIGNED_IN_KEY, '1'); else localStorage.removeItem(SIGNED_IN_KEY) } catch { /* storage blocked */ }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionChecked: (state) => {
      state.hydrated = true
    },
    setCredentials: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token
      state.isAuthenticated = true
      remember(true)
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    updateToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      remember(false)
    },
  },
})

export const { sessionChecked, setCredentials, setUser, updateToken, logout } = authSlice.actions
export default authSlice.reducer
