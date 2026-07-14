import { Link } from "react-router-dom"
import {
  ArrowRight,
  Check,
  FileAudio,
  Gavel,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const highlights = [
  {
    icon: FileAudio,
    title: "Native audio understanding",
    body: "Skip Whisper pipelines. Gemini listens to the recording and drafts minutes directly.",
  },
  {
    icon: Gavel,
    title: "Decisions & actions",
    body: "Structured JSON for executive summary, key decisions, owners, and priorities.",
  },
  {
    icon: Lock,
    title: "Zero retention",
    body: "Files live only for the request. Temp audio and remote Gemini uploads are deleted.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    body: "FastAPI + ffmpeg extract + one multimodal call. No database round-trips.",
  },
]

const steps = [
  { n: "01", title: "Upload", body: "Drop MP4, MKV, MP3, WAV, or M4A up to 100 MB." },
  { n: "02", title: "Process", body: "Video audio is stripped in-memory with ffmpeg." },
  { n: "03", title: "Generate", body: "Gemini returns schema-validated minutes." },
  { n: "04", title: "Export", body: "Copy Markdown and paste into Notion, Slack, or email." },
]

export function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-20">
        <div className="mx-auto max-w-3xl text-center space-y-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            Stateless MoM platform for modern teams
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance leading-[1.1]">
            Meeting minutes that{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-300 bg-clip-text text-transparent">
              write themselves
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground text-balance leading-relaxed">
            Meetingly turns video and audio recordings into executive-ready
            minutes — summary, decisions, and action items — without storing
            your data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button variant="brand" size="lg" asChild>
              <Link to="/signup">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/signin">Sign in</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Free accounts · Gemini native audio · Media never retained
          </p>
        </div>

        {/* Product preview card */}
        <div className="mx-auto mt-16 max-w-4xl animate-fade-up">
          <div className="rounded-2xl border border-border bg-card/60 shadow-2xl shadow-brand/5 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">
                app.meetingly / generate
              </span>
            </div>
            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {[
                {
                  label: "Executive Summary",
                  text: "Q3 roadmap alignment. Team agreed to ship onboarding v2 before marketing launch.",
                },
                {
                  label: "Key Decisions",
                  text: "Freeze API surface for two sprints. Hire contractor for design polish.",
                },
                {
                  label: "Action Items",
                  text: "☐ Priya — publish RFC · ☐ Alex — cost model by Friday",
                },
              ].map((card) => (
                <div key={card.label} className="p-5 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                    {card.label}
                  </p>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Logos / trust strip */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs text-muted-foreground">
          <span className="font-medium text-zinc-400">Built for</span>
          {["Startups", "Product teams", "Agencies", "Founders", "Ops leads"].map(
            (t) => (
              <span key={t} className="font-mono uppercase tracking-widest text-[11px]">
                {t}
              </span>
            )
          )}
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <div className="max-w-xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Everything you need after the call ends
          </h2>
          <p className="mt-3 text-muted-foreground">
            A focused product surface — not another bloated meeting suite.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {highlights.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card/50 p-6 hover:border-zinc-600 transition-colors"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 border border-brand/25">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="font-medium text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-t border-border bg-card/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-10">
            From recording to Markdown in one flow
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="space-y-3">
                <span className="font-mono text-xs text-brand">{s.n}</span>
                <h3 className="font-medium">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-brand/10 via-card to-card p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Ready for your next meeting?
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Upload a recording and get structured minutes in minutes — with
              nothing stored on the server.
            </p>
            <ul className="space-y-2 text-sm text-zinc-300">
              {[
                "Native multimodal generation",
                "Copy Markdown export",
                "No data warehouse, no lock-in",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-brand shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <Button variant="brand" size="lg" asChild>
              <Link to="/signup">
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/features">See features</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
