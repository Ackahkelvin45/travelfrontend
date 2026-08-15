import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../api/baseApi'
import authReducer from '../features/auth/authSlice'
import themeReducer from '../features/theme/themeSlice'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
