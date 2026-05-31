import { Header } from "@/components/header"
import { ExecutionHero } from "@/components/execution-hero"
import { TabbedDashboard } from "@/components/tabbed-dashboard"
import { SiteFooter } from "@/components/site-footer"
import AuditFooter from "@/components/audit-footer"
import AccessibilityControls from "@/components/accessibility-controls"
import OraclePanel from "@/components/oracle-panel"
import TreasuryPanel from "@/components/treasury-panel"
import { ErrorBoundary } from "@/components/error-boundary"

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:font-bold"
      >
        Skip to main content
      </a>

      <Header />
      <main id="main" className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
        <ErrorBoundary>
          <ExecutionHero />
        </ErrorBoundary>
        <ErrorBoundary>
          <OraclePanel />
        </ErrorBoundary>
        <ErrorBoundary>
          <TreasuryPanel />
        </ErrorBoundary>
        <ErrorBoundary>
          <TabbedDashboard />
        </ErrorBoundary>
      </main>
      <AuditFooter />
      <SiteFooter />
      <AccessibilityControls />
    </div>
  )
}
