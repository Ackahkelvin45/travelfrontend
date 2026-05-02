import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BookingFormState {
  tourId: string
  date: string
  adults: number
  children: number
  extras: string[]
}

type BookingStatus = 'idle' | 'pending' | 'confirmed' | 'cancelled'

interface BookingsState {
  form: BookingFormState
  status: BookingStatus
  currentBookingId: string | null
}

const initialState: BookingsState = {
  form: {
    tourId: '',
    date: '',
    adults: 1,
    children: 0,
    extras: [],
  },
  status: 'idle',
  currentBookingId: null,
}

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookingForm: (state, action: PayloadAction<Partial<BookingFormState>>) => {
      state.form = { ...state.form, ...action.payload }
    },
    setBookingTour: (state, action: PayloadAction<string>) => {
      state.form.tourId = action.payload
    },
    toggleExtra: (state, action: PayloadAction<string>) => {
      const idx = state.form.extras.indexOf(action.payload)
      if (idx === -1) {
        state.form.extras.push(action.payload)
      } else {
        state.form.extras.splice(idx, 1)
      }
    },
    setBookingStatus: (state, action: PayloadAction<BookingStatus>) => {
      state.status = action.payload
    },
    setCurrentBooking: (state, action: PayloadAction<string | null>) => {
      state.currentBookingId = action.payload
    },
    resetBookingForm: (state) => {
      state.form = initialState.form
      state.status = 'idle'
    },
  },
})

export const {
  setBookingForm,
  setBookingTour,
  toggleExtra,
  setBookingStatus,
  setCurrentBooking,
  resetBookingForm,
} = bookingsSlice.actions
export default bookingsSlice.reducer
