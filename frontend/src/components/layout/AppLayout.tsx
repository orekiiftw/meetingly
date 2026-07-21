import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  FileAudio,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  X,
} from "lucide-react"
import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"

const SIDEBAR = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/generate", label: "Generate", icon: FileAudio },
  { to: "/app/settings", label: "Settings", icon: Settings },
]

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [apiOk, setApiOk] = useState<boolean | null>(null)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    let cancelled = false
    apiFetch("/api/health")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setApiOk(d?.status === "ok")
      })
      .catch(() => {
        if (!cancelled) setApiOk(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSignOut = () => {
    signOut()
    navigate("/signin", { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Logo to="/app" />
        <span className="ml-auto rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Local
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        {SIDEBAR.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-brand/15 text-foreground border border-brand/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3 space-y-2">
        {user && (
          <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-1">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        )}
        <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Shield className="h-3.5 w-3.5 text-brand" />
            Ephemeral media
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Audio is processed in memory and discarded. Accounts are stored;
            meetings are not.
          </p>
          <Link
            to="/security"
            className="text-[11px] text-brand hover:underline"
          >
            Learn about security →
          </Link>
        </div>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/">
            <Sparkles className="h-3.5 w-3.5" />
            Marketing site
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-card/40">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-background shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4 sm:px-6">
          <button
            type="button"
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
            <X className="hidden h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {user ? `Hi, ${user.name.split(" ")[0]}` : "Workspace"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              Generate structured minutes without storing media
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]",
                apiOk === null && "border-border text-muted-foreground",
                apiOk === true &&
                  "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                apiOk === false &&
                  "border-red-500/30 bg-red-500/10 text-red-400"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  apiOk === null && "bg-zinc-500",
                  apiOk === true && "bg-success",
                  apiOk === false && "bg-destructive"
                )}
              />
              {apiOk === null
                ? "Checking API…"
                : apiOk
                  ? "API online"
                  : "API offline"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
            <Button variant="brand" size="sm" asChild>
              <Link to="/app/generate">New MoM</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
