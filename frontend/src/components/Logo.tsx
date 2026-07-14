import { Link } from "react-router-dom"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  showWordmark = true,
  to = "/",
}: {
  className?: string
  showWordmark?: boolean
  to?: string
}) {
  return (
    <Link
      to={to}
      className={cn("inline-flex items-center gap-2.5 group", className)}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/20 border border-brand/30 group-hover:bg-brand/30 transition-colors">
        <Sparkles className="h-4 w-4 text-brand" />
      </div>
      {showWordmark && (
        <span className="text-sm font-semibold tracking-tight">Meetingly</span>
      )}
    </Link>
  )
}
