'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/lib/store/store'
import { refreshAccess } from '@/lib/api/baseApi'
import { SIGNED_IN_KEY, logout, sessionChecked, setCredentials } from '@/lib/features/auth/authSlice'

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Restore the session after mount: the access token comes back from the
  // httpOnly refresh cookie. (`store` is a module singleton.)
  useEffect(() => {
    let signedIn = false
    try {
      signedIn = localStorage.getItem(SIGNED_IN_KEY) === '1'
      localStorage.removeItem('token') // tokens stored by older versions
      localStorage.removeItem('refreshToken')
    } catch { /* storage blocked */ }
    if (!signedIn) {
      store.dispatch(sessionChecked())
      return
    }
    refreshAccess().then((access) => {
      store.dispatch(access ? setCredentials({ token: access }) : logout())
      store.dispatch(sessionChecked())
    })
  }, [])

  return <Provider store={store}>{children}</Provider>
}
