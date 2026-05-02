import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type TourCategory = 'adventure' | 'luxury' | 'cultural' | 'wildlife' | 'beach' | 'city'

interface ToursFilters {
  destination: string
  dateFrom: string
  dateTo: string
  priceMin: number
  priceMax: number
  category: TourCategory | ''
  rating: number
  duration: number
}

interface ToursPagination {
  page: number
  limit: number
  total: number
}

interface ToursState {
  filters: ToursFilters
  pagination: ToursPagination
  selectedTourId: string | null
}

const initialState: ToursState = {
  filters: {
    destination: '',
    dateFrom: '',
    dateTo: '',
    priceMin: 0,
    priceMax: 100000,
    category: '',
    rating: 0,
    duration: 0,
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
  },
  selectedTourId: null,
}

const toursSlice = createSlice({
  name: 'tours',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ToursFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
      state.pagination.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.pagination.total = action.payload
    },
    setSelectedTour: (state, action: PayloadAction<string | null>) => {
      state.selectedTourId = action.payload
    },
  },
})

export const { setFilters, resetFilters, setPage, setTotal, setSelectedTour } = toursSlice.actions
export default toursSlice.reducer
