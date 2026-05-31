import type { Metadata } from "next"
import { SafetyPanel } from "@/components/safety/SafetyPanel"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Youth Safety & Sovereign Controls // VALORAIPLUS",
  description: "Local-first guardrails for children, teens, and vulnerable users. No surveillance. PIN-protected modes. WCAG AA oriented.",
}

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Dot overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(hsl(217 33% 17%) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 flex flex-col gap-10">
        {/* Back nav */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
              <Shield className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-balance">
              Youth Safety & Sovereign Controls
            </h1>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Local-first guardrails for children, teenagers, and vulnerable users. No data leaves your device.
            PIN-protected modes with PBKDF2-SHA256 (310k iterations). WCAG AA oriented.
          </p>
        </header>

        {/* Full safety panel */}
        <div className="glass-panel rounded-2xl p-8">
          <SafetyPanel />
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">How it works</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed flex flex-col gap-2">
              <li className="flex gap-2">
                <span className="text-primary font-bold shrink-0">1.</span>
                Select an age mode (Adult, Teen, or Child) above.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold shrink-0">2.</span>
                Teen/Child modes automatically enable link confirmations and text redaction.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold shrink-0">3.</span>
                Optionally set a PIN to prevent switching back to Adult mode without authorization.
              </li>
            </ul>
          </div>

          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Privacy guarantee</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed flex flex-col gap-2">
              <li>All settings stored in localStorage only.</li>
              <li>Zero network requests on any toggle or mode change.</li>
              <li>PIN is hashed with PBKDF2-SHA256 before storage -- never stored in plaintext.</li>
              <li>No telemetry, no analytics, no third-party calls.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground/50 font-mono tracking-widest uppercase pt-4">
          Safety mode protects children, teenagers, and vulnerable users while keeping the tool accessible to disabled veterans and disabled users worldwide.
        </footer>
      </div>
    </div>
  )
}
