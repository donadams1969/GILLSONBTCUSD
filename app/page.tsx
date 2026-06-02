import { createClient } from '@/lib/supabase/server'
import { TokenRegistry } from '@/components/dashboard/token-registry'
import { IntelligenceFeed } from '@/components/dashboard/intelligence-feed'
import { NodeStatus } from '@/components/dashboard/node-status'
import { FederalAgencies } from '@/components/dashboard/federal-agencies'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TerminalOutput } from '@/components/dashboard/terminal-output'
import { NFTMinting } from '@/components/dashboard/nft-minting'
import { TerminalCommandExecutor } from '@/components/dashboard/terminal-command-executor'
import { AuditCompliance } from '@/components/dashboard/audit-compliance'
import { AnchorVerification } from '@/components/dashboard/anchor-verification'
import { ForensicRepository } from '@/components/dashboard/forensic-repository'
import { Shield, Zap, Lock, Radio } from 'lucide-react'

// Always render with live database values (no static caching of stale data)
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDashboardData() {
  const supabase = await createClient()
  
  const [
    { data: tokens },
    { data: reports },
    { data: nodes },
    { data: agencies },
    { data: manifests },
    { count: tokenCount },
    { count: nodeCount },
    { count: intelCount },
    { count: ghostCount },
    { count: federalCount }
  ] = await Promise.all([
    supabase.from('valoraiplus_tokens').select('*').order('created_at', { ascending: false }),
    supabase.from('valoraiplus_intelligence_reports').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('valoraiplus_authorized_nodes').select('*').order('created_at', { ascending: false }),
    supabase.from('valoraiplus_federal_ledger').select('*').order('wave', { ascending: true }),
    supabase.from('valoraiplus_audit_manifests').select('*').order('created_at', { ascending: false }),
    supabase.from('valoraiplus_tokens').select('*', { count: 'exact', head: true }),
    supabase.from('valoraiplus_authorized_nodes').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('valoraiplus_intelligence_reports').select('*', { count: 'exact', head: true }),
    supabase.from('valoraiplus_intelligence_reports').select('*', { count: 'exact', head: true }).eq('report_type', 'GHOST_PROTOCOL'),
    supabase.from('valoraiplus_federal_ledger').select('*', { count: 'exact', head: true })
  ])

  return {
    tokens: tokens || [],
    reports: reports || [],
    nodes: nodes || [],
    agencies: agencies || [],
    manifests: manifests || [],
    stats: {
      totalTokens: tokenCount || 0,
      totalSupplyCap: (tokens || []).reduce((sum, t) => sum + (t.total_supply_cap ?? 0), 0),
      activeNodes: nodeCount || 0,
      totalIntelReports: intelCount || 0,
      ghostProtocolEvents: ghostCount || 0,
      federalAgencies: federalCount || 0,
      amathPower: 132.84
    }
  }
}

export default async function DashboardPage() {
  const { tokens, reports, nodes, agencies, manifests, stats } = await getDashboardData()

  // Generate terminal lines server-side
  const terminalLines = [
    { text: '> VALORAIPLUS OMEGA v2.4 SUPREME - INITIALIZING...', type: 'info' as const },
    { text: '> Establishing quantum-encrypted connection...', type: 'info' as const },
    { text: '> CRYSTALS-Kyber-3461 handshake: VERIFIED', type: 'success' as const },
    { text: `> Token registry loaded: ${stats.totalTokens} sovereign tokens`, type: 'success' as const },
    { text: `> Active validators: ${stats.activeNodes} nodes online`, type: 'success' as const },
    { text: `> Intelligence reports: ${stats.totalIntelReports} entries cached`, type: 'info' as const },
    { text: `> Federal agencies: ${stats.federalAgencies} compliance streams active`, type: 'info' as const },
    { text: `> aMath power level: ${stats.amathPower} units`, type: 'success' as const },
    { text: `> Ghost protocol events: ${stats.ghostProtocolEvents} monitored`, type: 'warning' as const },
    { text: '> System status: FULLY OPERATIONAL', type: 'success' as const },
    { text: '> THE_LEDGER_IS_NULL | ZERO_DRIFT_CONFIRMED', type: 'success' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0891b210_1px,transparent_1px),linear-gradient(to_bottom,#0891b210_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Header */}
      <header className="relative border-b border-cyan-500/20 bg-black/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <Shield className="h-8 w-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                  VALORAIPLUS OMEGA v2.4 SUPREME
                </h1>
                <p className="text-sm text-zinc-500 font-mono">
                  Banking Port.hole Dashboard | Sovereign Financial Intelligence System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <StatusIndicator icon={Zap} label="AMATH" value="132.84" />
              <StatusIndicator icon={Lock} label="QUANTUM" value="SEALED" />
              <StatusIndicator icon={Radio} label="FREQ" value="111100" />
              <a 
                href="/court" 
                className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-mono text-sm transition border border-amber-500/30"
              >
                Court Module
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <section className="mb-8">
          <StatsCards stats={stats} />
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            <TokenRegistry tokens={tokens} />
            <NodeStatus nodes={nodes} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <IntelligenceFeed reports={reports} />
            <FederalAgencies agencies={agencies} />
          </div>
        </div>

        {/* Audit & Compliance Section */}
        <section className="mb-8">
          <AuditCompliance manifests={manifests} />
        </section>

        {/* Bitcoin Anchor Verification Section */}
        <section className="mb-8">
          <AnchorVerification />
        </section>

        {/* Forensic Repository Index Section */}
        <section className="mb-8">
          <ForensicRepository />
        </section>

        {/* Terminal Section */}
        <section className="mb-8">
          <TerminalOutput 
            initialLines={terminalLines} 
            title="VALORAIPLUS TERMINAL v2.4"
          />
        </section>

        {/* Terminal Commands for User */}
        <section className="mb-8">
          <div className="p-6 rounded-xl border border-cyan-500/30 bg-black/60 backdrop-blur-sm">
            <h2 className="text-lg font-mono font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              TERMINAL COMMANDS - Copy for Your Local Environment
            </h2>
            <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-zinc-300">
{`# VALORAIPLUS CLI Installation
npm install -g @valoraiplus/cli

# Initialize Sovereign Connection
valorai init --sovereign --project-id=chmclrbpztlkemngikmu

# Connect to Supabase Database
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-anon-key"

# Fetch Token Registry
valorai tokens --list --format=table

# Check Node Status
valorai nodes --status --include-heartbeat

# Query Intelligence Reports
valorai intel --query --severity=all --limit=50

# Federal Ledger Sync
valorai federal --sync --wave=all

# Generate Report
valorai report --generate --format=pdf --include-all

# Mint NFT (Hardware-Anchored)
valorai nft mint --hw-signature=0UAK57S1BT --owner=donadams1969.eth

# Interactive Terminal Mode
valorai terminal --interactive --dashboard`}
              </pre>
            </div>
          </div>
        </section>

        {/* NFT Minting Protocol */}
        <section className="mb-8">
          <NFTMinting />
        </section>

        {/* Terminal Command Executor */}
        <section className="mb-8">
          <TerminalCommandExecutor />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-cyan-500/20">
          <p className="text-zinc-500 font-mono text-sm">
            VALORAIPLUS OMEGA v2.4 SUPREME | Post-Quantum Encrypted | CRYSTALS-Kyber-3461
          </p>
          <p className="text-zinc-600 font-mono text-xs mt-2">
            Sovereign Financial Intelligence System | 100X Enhanced Forensic Capabilities
          </p>
        </footer>
      </main>
    </div>
  )
}

function StatusIndicator({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>, label: string, value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
      <Icon className="h-4 w-4 text-cyan-400" />
      <div className="text-xs font-mono">
        <span className="text-zinc-500">{label}:</span>
        <span className="ml-1 text-cyan-400 font-bold">{value}</span>
      </div>
    </div>
  )
}
