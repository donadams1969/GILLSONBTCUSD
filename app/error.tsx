"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-lg w-full border border-border bg-card p-8 space-y-4">
        <h1 className="text-2xl font-serif font-bold tracking-tight">SYSTEM FAULT</h1>
        <div className="h-px bg-primary/30" />
        <p className="text-sm text-muted-foreground font-mono break-all leading-relaxed">
          {error?.message ?? "Unknown error"}
        </p>
        {error?.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            Digest: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-primary text-primary-foreground font-serif font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    </main>
  )
}
