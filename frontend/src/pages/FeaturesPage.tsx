import { Link } from "react-router-dom"
import {
  AudioLines,
  ClipboardCopy,
  FileVideo,
  Layers,
  ShieldCheck,
  Workflow,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: FileVideo,
    title: "Video & audio ingestion",
    body: "Accept MP4, MKV, MOV, WebM, MP3, WAV, M4A and more via a single FormData upload.",
  },
  {
    icon: AudioLines,
    title: "Transient ffmpeg extract",
    body: "Video tracks are stripped to mono speech audio in a temp workspace that is always deleted.",
  },
  {
    icon: Workflow,
    title: "Schema-locked MoM",
    body: "Gemini returns validated JSON: title, participants, summary, decisions, action items, next steps.",
  },
  {
    icon: ClipboardCopy,
    title: "One-click Markdown",
    body: "Copy clean Markdown for Notion, Confluence, Linear, or email without reformatting.",
  },
  {
    icon: Layers,
    title: "Workspace tabs",
    body: "Review Executive Summary, Key Decisions, and Action Items (as checkboxes) in a focused UI.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by architecture",
    body: "No database, no object storage, no retained PDFs. Stateless from request to response.",
  },
]

export function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-2xl space-y-4 mb-14">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Features
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          A lean pipeline for serious meeting ops
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Meetingly is intentionally narrow: get accurate minutes out of a
          recording as fast as possible, then get out of the way.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {features.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="rounded-xl border border-border bg-card/50 p-6 space-y-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border border-border">
              <Icon className="h-5 w-5 text-brand" />
            </div>
            <h2 className="font-medium">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {body}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
        <h2 className="text-xl font-semibold mb-6">Technical workflow</h2>
        <ol className="space-y-4 text-sm">
          {[
            "Browser uploads media with multipart FormData.",
            "FastAPI validates type and size (max 100 MB).",
            "If video, ffmpeg extracts a compact speech track.",
            "Audio is uploaded to Gemini File API, then deleted after generation.",
            "response_schema forces structured MoM JSON.",
            "Frontend renders tabs and offers Markdown copy.",
          ].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-zinc-300 pt-0.5 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Button variant="brand" asChild>
            <Link to="/app/generate">Try it in the workspace</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
