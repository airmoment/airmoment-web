"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  clearStoredToken,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  type StoredUser,
} from "./api"

interface AuthState {
  token: string | null
  user: StoredUser | null
  isLoggedIn: boolean
  isHydrated: boolean
  login: (token: string, user: StoredUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<StoredUser | null>(null)
  // localStorage는 클라이언트에만 있어서, 첫 렌더 후 동기화한다.
  // isHydrated가 false인 동안 로그인 상태에 따라 UI가 깜박이는 것을 막을 수 있다.
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setToken(getStoredToken())
    setUser(getStoredUser())
    setIsHydrated(true)
  }, [])

  const login = useCallback((newToken: string, newUser: StoredUser) => {
    setStoredToken(newToken)
    setStoredUser(newUser)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isLoggedIn: Boolean(token),
      isHydrated,
      login,
      logout,
    }),
    [token, user, isHydrated, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
