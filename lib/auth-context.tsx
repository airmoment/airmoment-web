"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { AuthModal } from "@/components/auth-modal"
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
  /**
   * 로그인 모달을 띄움. 이미 로그인 상태면 onSuccess를 즉시 실행한다.
   * 어떤 컴포넌트에서든 "로그인이 필요한 액션"을 한 줄로 트리거할 수 있다.
   */
  requestLogin: (onSuccess?: () => void) => void
  openLoginModal: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<StoredUser | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  // 로그인 후 한 번만 실행할 후속 액션. 콜백을 state에 넣으면 setState가 함수로
  // 호출되는 문제가 있어서 ref로 보관한다.
  const pendingActionRef = useRef<(() => void) | null>(null)

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

  const openLoginModal = useCallback(() => setModalOpen(true), [])

  const requestLogin = useCallback(
    (onSuccess?: () => void) => {
      if (token) {
        onSuccess?.()
        return
      }
      pendingActionRef.current = onSuccess ?? null
      setModalOpen(true)
    },
    [token]
  )

  const handleAuthenticated = useCallback(() => {
    const pending = pendingActionRef.current
    pendingActionRef.current = null
    pending?.()
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isLoggedIn: Boolean(token),
      isHydrated,
      login,
      logout,
      requestLogin,
      openLoginModal,
    }),
    [token, user, isHydrated, login, logout, requestLogin, openLoginModal]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAuthenticated={handleAuthenticated}
      />
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
