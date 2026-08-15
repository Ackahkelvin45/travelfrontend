'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/lib/store/store'
import { hydrateFromStorage } from '@/lib/features/auth/authSlice'

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Hydrate tokens after mount — reading localStorage during render would
  // cause SSR/client hydration mismatches. (`store` is a module singleton.)
  useEffect(() => {
    store.dispatch(hydrateFromStorage())
  }, [])

  return <Provider store={store}>{children}</Provider>
}
