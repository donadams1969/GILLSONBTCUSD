import Link from "next/link";

export default function AuditFooter() {
  return (
    <div className="border-t border-border bg-card py-4">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
        <span>WCAG AA Compliant</span>
        <span className="text-border">|</span>
        <span>CSP Deployed (Report-Only)</span>
        <span className="text-border">|</span>
        <span>Youth Safety Active</span>
        <span className="text-border">|</span>
        <Link
          href="/audit"
          className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
        >
          View Audit Artifacts
        </Link>
        <span className="text-border">|</span>
        <Link
          href="/safety"
          className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
        >
          Safety Controls
        </Link>
      </div>
    </div>
  );
}
