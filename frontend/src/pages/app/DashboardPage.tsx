import { Link } from "react-router-dom"
import {
  ArrowRight,
  Clock,
  FileAudio,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const stats = [
  {
    label: "Retention",
    value: "0 days",
    hint: "Nothing stored server-side",
    icon: Shield,
  },
  {
    label: "Pipeline",
    value: "Ephemeral",
    hint: "Temp files only",
    icon: Zap,
  },
  {
    label: "Export",
    value: "Markdown",
    hint: "Copy in one click",
    icon: FileAudio,
  },
  {
    label: "Typical run",
    value: "30–90s",
    hint: "Depends on length",
    icon: Clock,
  },
]

const tips = [
  "Use clear audio; reduce background music when possible.",
  "Name speakers early in the recording for better attribution.",
  "After generation, copy Markdown into your source of truth immediately.",
]

export function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back. Your workspace is ready — still fully stateless.
          </p>
        </div>
        <Button variant="brand" asChild>
          <Link to="/app/generate">
            <Sparkles className="h-4 w-4" />
            Generate minutes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, hint, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card/60 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-brand" />
            </div>
            <p className="text-xl font-semibold tracking-tight">{value}</p>
            <p className="text-[11px] text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-xl border border-border bg-card/60 p-6 space-y-4">
          <h2 className="font-medium">Quick start</h2>
          <ol className="space-y-3 text-sm text-zinc-300">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-mono">
                1
              </span>
              Open Generate and drop a meeting recording.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-mono">
                2
              </span>
              Wait while audio is extracted and sent to Gemini.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-mono">
                3
              </span>
              Review tabs and copy Markdown for your team.
            </li>
          </ol>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/generate">Go to Generate</Link>
          </Button>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card/60 p-6 space-y-4">
          <h2 className="font-medium">Best practices</h2>
          <ul className="space-y-3">
            {tips.map((tip) => (
              <li
                key={tip}
                className="text-sm text-muted-foreground leading-relaxed flex gap-2"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center space-y-2">
        <p className="text-sm font-medium">No history by design</p>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Past generations are not listed here because Meetingly does not store
          them. Export what you need before you leave the results view.
        </p>
      </div>
    </div>
  )
}
