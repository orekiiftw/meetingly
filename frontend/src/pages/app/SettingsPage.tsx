import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, CircleAlert, Loader2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"

interface Health {
  status: string
  model: string
  gemini_configured: string
}

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [health, setHealth] = useState<Health | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetch("/api/health")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return (await r.json()) as Health
      })
      .then(setHealth)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const geminiOk = health?.gemini_configured === "true"

  const handleSignOut = () => {
    signOut()
    navigate("/signin", { replace: true })
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-2xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Account details and API connectivity. Meeting media is never stored.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium">Account</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Signed-in user profile
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
        {user && (
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Name</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="font-medium break-all">{user.email}</dd>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Member since</dt>
              <dd className="text-muted-foreground">
                {new Date(user.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card/60 divide-y divide-border">
        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium">API status</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Backend health and Gemini configuration
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-400">
              <CircleAlert className="h-4 w-4 shrink-0 mt-0.5" />
              Cannot reach API: {error}. Is the backend running on port 8000?
            </div>
          )}

          {!error && health && (
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <dt className="text-xs text-muted-foreground">Service</dt>
                <dd className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {health.status === "ok" ? "Online" : health.status}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs text-muted-foreground">Model</dt>
                <dd className="font-mono text-xs sm:text-sm">{health.model}</dd>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <dt className="text-xs text-muted-foreground">GEMINI_API_KEY</dt>
                <dd className="flex items-center gap-2">
                  {geminiOk ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm">Configured on server</span>
                    </>
                  ) : (
                    <>
                      <CircleAlert className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-amber-100/90">
                        Missing — set in backend/.env
                      </span>
                    </>
                  )}
                </dd>
              </div>
            </dl>
          )}

          {loading && !health && !error && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking…
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/60 p-5 space-y-3">
        <h2 className="text-sm font-medium">Appearance</h2>
        <p className="text-xs text-muted-foreground">
          Dark mode is the default (and only) theme — optimized for long
          generation sessions.
        </p>
        <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
          <span className="rounded-md bg-background px-3 py-1.5 font-medium shadow-sm">
            Dark
          </span>
          <span className="px-3 py-1.5 text-muted-foreground">Light (soon)</span>
        </div>
      </section>
    </div>
  )
}
