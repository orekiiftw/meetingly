import { Link } from "react-router-dom"
import { DatabaseZap, FileX, KeyRound, ServerCrash, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const pillars = [
  {
    icon: DatabaseZap,
    title: "No database",
    body: "There is no Postgres, Redis, or object store in the critical path. State dies with the HTTP request.",
  },
  {
    icon: Trash2,
    title: "Temp-only media",
    body: "Uploads land in a request-scoped temp directory. ffmpeg output and source files are unlinked in finally.",
  },
  {
    icon: FileX,
    title: "Remote file cleanup",
    body: "After Gemini generation, the File API object is deleted so audio does not linger in Google storage.",
  },
  {
    icon: KeyRound,
    title: "Your API key",
    body: "GEMINI_API_KEY lives only on the server environment. The browser never sees or stores it.",
  },
]

export function SecurityPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-2xl space-y-4 mb-14">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Security
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Privacy is a product feature, not a toggle
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Meetingly is designed so the least privileged default is also the only
          mode: process the file, return the minutes, forget everything.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {pillars.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-card/50 p-6 space-y-3"
          >
            <Icon className="h-5 w-5 text-brand" />
            <h2 className="font-medium">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {body}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8 flex gap-4">
        <ServerCrash className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm">
          <p className="font-medium text-amber-100">What we still depend on</p>
          <p className="text-muted-foreground leading-relaxed">
            Audio is processed by Google Gemini during the request. Content is
            subject to Google&apos;s API terms and data handling for generative
            AI. Use only recordings you are authorized to process.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Button variant="brand" asChild>
          <Link to="/app/generate">Generate with zero retention</Link>
        </Button>
      </div>
    </div>
  )
}
