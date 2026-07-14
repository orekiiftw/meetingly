import { MoMWorkspace } from "@/components/MoMWorkspace"

export function GeneratePage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Generate</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Upload a meeting recording. Gemini produces structured minutes you can
          copy as Markdown. Files are discarded after processing.
        </p>
      </div>
      <MoMWorkspace />
    </div>
  )
}
