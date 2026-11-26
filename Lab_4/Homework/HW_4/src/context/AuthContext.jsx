import { createContext, useContext, useMemo, useState } from 'react'

const DEMO_USERNAME = import.meta.env.VITE_DEMO_USERNAME ?? ''
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD ?? ''

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const value = useMemo(
    () => ({
      user,
      login: (username, password) => {
        const isMatch = Boolean(DEMO_USERNAME) && username === DEMO_USERNAME && password === DEMO_PASSWORD
        if (isMatch) {
          setUser({ name: username })
        }
        return isMatch
      },
      logout: () => setUser(null),
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
