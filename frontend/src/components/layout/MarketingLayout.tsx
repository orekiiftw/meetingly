import { useState } from "react"
import { Link, NavLink, Outlet } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

const NAV = [
  { to: "/features", label: "Features" },
  { to: "/security", label: "Security" },
]

export function MarketingLayout() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="relative min-h-dvh flex flex-col">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,_rgb(139_92_246_/_0.14),_transparent_60%)]" />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <Button variant="brand" size="sm" asChild>
                <Link to="/app">Open workspace</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/signin">Sign in</Link>
                </Button>
                <Button variant="brand" size="sm" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block rounded-md px-3 py-2 text-sm",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button variant="brand" size="sm" className="flex-1" asChild>
                  <Link to="/app" onClick={() => setOpen(false)}>
                    Open workspace
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to="/signin" onClick={() => setOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button variant="brand" size="sm" className="flex-1" asChild>
                    <Link to="/signup" onClick={() => setOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="relative flex-1">
        <Outlet />
      </main>

      <footer className="relative border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <Logo />
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Stateless minutes of meeting. Upload, process, export — nothing
                is stored.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Product
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/features" className="text-zinc-400 hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/app/generate" className="text-zinc-400 hover:text-foreground transition-colors">
                    Generate MoM
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Company
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/security" className="text-zinc-400 hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <span className="text-zinc-500">Docs (soon)</span>
                </li>
                <li>
                  <span className="text-zinc-500">Changelog (soon)</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Stack
              </p>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>Gemini native audio</li>
                <li>FastAPI streaming core</li>
                <li>Zero persistence by design</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Meetingly. All rights reserved.</p>
            <p className="font-mono">Powered by Google Gemini</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
