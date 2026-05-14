import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../api/baseApi'
import authReducer from '../features/auth/authSlice'
import toursReducer from '../features/tours/toursSlice'
import bookingsReducer from '../features/bookings/bookingsSlice'
import themeReducer from '../features/theme/themeSlice'

export const store = configureStore({
 reducer: {
 [baseApi.reducerPath]: baseApi.reducer,
 auth: authReducer,
 tours: toursReducer,
 bookings: bookingsReducer,
 theme: themeReducer,
 },
 middleware: (getDefaultMiddleware) =>
 getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
