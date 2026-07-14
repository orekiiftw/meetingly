import { Navigate, Outlet, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
        <p className="text-sm">Loading session…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate to="/signin" replace state={{ from: location.pathname }} />
    )
  }

  return <Outlet />
}
