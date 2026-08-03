"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { API, setAuthToken, getAuthToken } from "@/app/utils/api/api"
import type { User } from "@/app/types"

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<boolean>
  setAccessToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const setSession = (data: { accessToken: string; user: User }) => {
    setAuthToken(data.accessToken)
    setAccessToken(data.accessToken)
    setUser(data.user)
  }

  const clearSession = () => {
    setAuthToken(null)
    setAccessToken(null)
    setUser(null)
  }

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const { accessToken, user } = (await API.post("/auth/refresh", {}, { timeout: 5000 })).data.data
      setSession({ accessToken, user })
      return true
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } }
      // 400 "Refresh token required" just means there's no session yet
      if (err.response?.status !== 400 || err.response?.data?.message !== "Refresh token required") {
        console.error("Token refresh failed:", error)
      }
      clearSession()
      return false
    }
  }, [])

  // Restore an existing session on mount by fetching the full, fresh user profile.
  // The access token travels as an HTTP-only cookie; if it has expired the response
  // interceptor transparently refreshes it and retries before we read the result.
  // On a fresh page load we have no token in JS state yet, so we rotate once via
  // /auth/refresh to materialize an explicit token (and an equally fresh profile).
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await API.get("/auth/me", { timeout: 5000 })
        const meUser = res.data?.data?.user as User | undefined
        if (meUser && getAuthToken()) {
          setUser(meUser)
          setAccessToken(getAuthToken() ?? null)
          return
        }
      } catch {
        // No valid access session - fall through to a full token refresh
      }
      await refreshAccessToken()
    }
    restoreSession().finally(() => setLoading(false))
  }, [refreshAccessToken])

  const login = async (email: string, password: string, rememberMe = false) => {
    setLoading(true)
    try {
      const { accessToken, user } = (
        await API.post("/auth/login", { email, password, rememberMe })
      ).data.data
      setSession({ accessToken, user })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await API.post("/auth/logout", {})
    } finally {
      clearSession()
    }
  }

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    loading,
    login,
    logout,
    refreshAccessToken,
    setAccessToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
