import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { apiFetch, formatApiError, getToken, setToken } from "@/lib/api"

export interface AuthUser {
  id: number
  email: string
  name: string
  created_at: string
}

interface AuthResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [loading, setLoading] = useState(true)

  const applyAuth = useCallback((res: AuthResponse) => {
    setToken(res.access_token)
    setTokenState(res.access_token)
    setUser(res.user)
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    setTokenState(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const t = getToken()
    if (!t) {
      setUser(null)
      setTokenState(null)
      return
    }
    const res = await apiFetch("/api/auth/me")
    if (!res.ok) {
      signOut()
      return
    }
    const me = (await res.json()) as AuthUser
    setUser(me)
    setTokenState(t)
  }, [signOut])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (getToken()) {
          await refreshUser()
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshUser])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(formatApiError(payload, "Sign in failed"))
      }
      applyAuth(payload as AuthResponse)
    },
    [applyAuth]
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(formatApiError(payload, "Sign up failed"))
      }
      applyAuth(payload as AuthResponse)
    },
    [applyAuth]
  )

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [user, token, loading, signIn, signUp, signOut, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
