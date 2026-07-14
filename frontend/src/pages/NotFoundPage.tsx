import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center space-y-4">
      <p className="font-mono text-xs text-brand">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        That route does not exist. Head back to the product or the workspace.
      </p>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button variant="brand" asChild>
          <Link to="/app">Workspace</Link>
        </Button>
      </div>
    </div>
  )
}
