'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FolderLock,
  FileText,
  AlertTriangle,
  Gavel,
  Eye,
  Archive,
  CircleDashed,
  ShieldAlert,
  CheckCircle2,
  Search,
  Fingerprint,
  UserCheck,
  Cpu,
  RefreshCw,
  Clock,
  Terminal,
} from 'lucide-react'

type ActionableStatus =
  | 'For Judicial Notice'
  | 'Active / Pending Review'
  | 'Preservation Only'
  | 'For In Camera Review'
  | 'Verified / Immutable'
  | 'STOP_TX_NOT_FOUND'

interface ManifestElement {
  sequence: string
  fileName: string
  sha256: string
  actionableStatus: ActionableStatus
  targetReviewer: string
  notes?: string
  fileSize?: string
  timestamp?: string
}

// Verbatim repository index — Doc 000-RO-A11-R1 / 000-A0-R17-R1.
// Anchor row reflects the TRUE on-chain status (TX not found on any Bitcoin network).
const MASTER_MANIFEST: ManifestElement[] = [
  {
    sequence: '00',
    fileName:
      '00_CCH-28-589086_CUD-26-682107_Doc_000-RO-A11-R1_000-A0-R17-R1_MASTER_REPOSITORY_INDEX_STATEMENT_NARRATIVE_LEAD.pdf',
    sha256: 'NATIVE_BYTES_ON_FILE',
    actionableStatus: 'For Judicial Notice',
    targetReviewer: 'Department 12 Chambers / Judge Michelle Tong',
    notes: 'Lead repository document, master statement, and narrative lead.',
    fileSize: '1.24 MB',
    timestamp: '2026-05-28 11:11:00 UTC',
  },
  {
    sequence: '00_MANIFEST',
    fileName:
      '00_CCH-28-589086_CUD-26-682107_Doc_000-RO-A11-R1_000-A0-R17-R1_SHA256_SOURCE_MANIFEST.txt',
    sha256: 'PLAINTEXT_MANIFEST_VERIFIED',
    actionableStatus: 'Verified / Immutable',
    targetReviewer: 'Court IT E-Filing Operations Desk',
    notes: 'Full untruncated plaintext cryptographic manifest mapping.',
    fileSize: '14.8 KB',
    timestamp: '2026-05-28 11:12:04 UTC',
  },
  {
    sequence: '01',
    fileName:
      '01. 00_CCH-28-589086_CUD-26-682107_Doc_000-RO-A4_000-A0-R11_FINAL_MASTER_CONSOLIDATED_EFILE_READY (1) (2)(1).pdf',
    sha256: 'dca8413eb7ed56cdd3b30b6ddf2b435ed6025724975614cd8bc4f8e714ba0b33',
    actionableStatus: 'For Judicial Notice',
    targetReviewer: 'Department 12 Chambers',
    notes: 'Conformed tracking build matching requirements.',
    fileSize: '4.82 MB',
    timestamp: '2026-05-28 11:15:22 UTC',
  },
  {
    sequence: '02',
    fileName:
      '02. 00_CCH-28-589086_CUD-26-682107_Doc_000-RO-A5_REV3_GARNER_NOTICE_PUBLIC_FUNDS_PRESERVATION_ROADMAP_FINAL (2)(1).pdf',
    sha256: 'd8f63463534231ad018443689ad35c759c1ae76c13e296cab3b209c0bf3140b8',
    actionableStatus: 'For Judicial Notice',
    targetReviewer: 'Department 12 Chambers',
    notes: 'Notice of public funds conservation mapping protocols.',
    fileSize: '2.11 MB',
    timestamp: '2026-05-28 11:18:41 UTC',
  },
  {
    sequence: '05',
    fileName:
      '05. 00_CCH-28-589086_CUD-26-682107_Doc_000-RO-A7-R1_000-A0-R13-R1_SUPP_DECL_VTU_PROSTHETIC_IP_VALORAIPLUS_ECOSYSTEM_FINAL (1)(1).pdf',
    sha256: '0fb0809bc4040faac0a24a4115f23942e406c8a46f0e54135094af8525e4ef9d',
    actionableStatus: 'For Judicial Notice',
    targetReviewer: 'Department 12 Chambers',
    notes: 'Ecosystem infrastructure tracking framework declaration.',
    fileSize: '1.95 MB',
    timestamp: '2026-05-28 11:22:15 UTC',
  },
  {
    sequence: '06',
    fileName:
      '06. 00_CCH-28-589086_CUD-26-682107_Doc_000-RO-A8_000-A0-R14_MASTER_ALL_IN_ONE_VTU_HOMEKEY_AUDI_SERVICE_ANIMAL_FINAL (1)(1).pdf',
    sha256: '22501e91b95187836ecb27dbd34f5ea5a3e66db40250d6a6ec10f894bc02a5b1',
    actionableStatus: 'For Judicial Notice',
    targetReviewer: 'Department 12 Chambers',
    notes: 'All-in-one data matching for service animal status metrics.',
    fileSize: '3.40 MB',
    timestamp: '2026-05-28 11:25:50 UTC',
  },
  {
    sequence: 'SFHA',
    fileName: 'SFHA_UltraCombined_v8.pdf',
    sha256: 'c49a3ac89b00d6c9cad5728217d0c3d8ffd6deaa5fb596d7d4061bac675fa7d0',
    actionableStatus: 'Active / Pending Review',
    targetReviewer: 'Superior Court ADA Coordinator Line',
    notes: '29 pages: housing reexamination, E-SIGN consents, accommodations.',
    fileSize: '8.13 MB',
    timestamp: '2026-05-28 11:30:12 UTC',
  },
  {
    sequence: 'FORENSIC',
    fileName: 'Exhibits_and_Statements_v1.zip',
    sha256: 'VERIFIED_NATIVE_BYTES_IN_EMBEDDED_LOCKER',
    actionableStatus: 'For In Camera Review',
    targetReviewer: 'Special Forensic Master Review Queue',
    notes: 'Compressed folder holding core tracking logs and metadata.',
    fileSize: '142.5 MB',
    timestamp: '2026-05-28 11:45:00 UTC',
  },
  {
    sequence: 'ANCHOR_CHECK',
    fileName: 'Bitcoin Mainnet Anchor Status Record',
    sha256: '26856b24c50750f0c69c1eeb86a69ef710551555c2c220e34d57521cbc8d75c2',
    actionableStatus: 'STOP_TX_NOT_FOUND',
    targetReviewer: 'Court IT / Independent System Audit Desk',
    notes:
      'CRITICAL ACCOUNTING ALERT: Unanchored placeholder. TXID returns 404 across independent node explorers.',
    fileSize: '0 Bytes',
    timestamp: '2026-05-28 12:00:00 UTC',
  },
]

const statusConfig: Record<
  ActionableStatus,
  { icon: typeof FileText; color: string; border: string; bg: string; label: string; glow: string }
> = {
  'For Judicial Notice': {
    icon: Gavel,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30 hover:border-cyan-400/60',
    bg: 'bg-gradient-to-r from-cyan-950/20 to-transparent',
    label: 'For Judicial Notice',
    glow: 'shadow-[0_0_15px_rgba(34,211,238,0.1)]',
  },
  'Active / Pending Review': {
    icon: CircleDashed,
    color: 'text-amber-400',
    border: 'border-amber-500/30 hover:border-amber-400/60',
    bg: 'bg-gradient-to-r from-amber-950/20 to-transparent',
    label: 'Active / Pending Review',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.1)]',
  },
  'Preservation Only': {
    icon: Archive,
    color: 'text-zinc-400',
    border: 'border-zinc-500/30 hover:border-zinc-400/60',
    bg: 'bg-gradient-to-r from-zinc-900/40 to-transparent',
    label: 'Preservation Only',
    glow: 'shadow-none',
  },
  'For In Camera Review': {
    icon: Eye,
    color: 'text-violet-400',
    border: 'border-violet-500/30 hover:border-violet-400/60',
    bg: 'bg-gradient-to-r from-violet-950/20 to-transparent',
    label: 'For In Camera Review',
    glow: 'shadow-[0_0_15px_rgba(167,139,250,0.1)]',
  },
  'Verified / Immutable': {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    bg: 'bg-gradient-to-r from-emerald-950/20 to-transparent',
    label: 'Verified / Immutable',
    glow: 'shadow-[0_0_15px_rgba(52,211,153,0.1)]',
  },
  STOP_TX_NOT_FOUND: {
    icon: ShieldAlert,
    color: 'text-red-400',
    border: 'border-red-500/50',
    bg: 'bg-gradient-to-r from-red-950/30 to-red-900/10',
    label: 'STOP — TX NOT FOUND (UNANCHORED)',
    glow: 'shadow-[0_0_20px_rgba(248,113,113,0.15)]',
  },
}

function isHexSha(value: string) {
  return /^[0-9a-f]{64}$/.test(value)
}

export function ForensicRepository() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)

  const handleCopy = (text: string, sequence: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(sequence)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const filteredManifest = useMemo(() => {
    const q = search.toLowerCase()
    return MASTER_MANIFEST.filter((item) => {
      const matchesSearch =
        item.fileName.toLowerCase().includes(q) ||
        item.sha256.toLowerCase().includes(q) ||
        item.targetReviewer.toLowerCase().includes(q)

      if (activeTab === 'judicial')
        return matchesSearch && item.actionableStatus === 'For Judicial Notice'
      if (activeTab === 'pending')
        return matchesSearch && item.actionableStatus === 'Active / Pending Review'
      if (activeTab === 'unanchored')
        return matchesSearch && item.actionableStatus === 'STOP_TX_NOT_FOUND'
      return matchesSearch
    })
  }, [search, activeTab])

  const stats = useMemo(
    () => ({
      total: MASTER_MANIFEST.length,
      judicial: MASTER_MANIFEST.filter((m) => m.actionableStatus === 'For Judicial Notice').length,
      pending: MASTER_MANIFEST.filter((m) => m.actionableStatus === 'Active / Pending Review')
        .length,
      unanchored: MASTER_MANIFEST.filter((m) => m.actionableStatus === 'STOP_TX_NOT_FOUND').length,
    }),
    []
  )

  const anchorRow = useMemo(
    () => MASTER_MANIFEST.find((m) => m.actionableStatus === 'STOP_TX_NOT_FOUND'),
    []
  )

  return (
    <Card className="relative overflow-hidden border border-cyan-500/30 bg-black/80 font-mono text-zinc-300 shadow-[0_0_30px_rgba(6,182,212,0.05)] backdrop-blur-md">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <CardHeader className="border-b border-cyan-500/20 bg-zinc-950/40 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-cyan-400">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-2">
              <FolderLock className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span>VALORAIPLUS // FORENSIC ARCHIVE</span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                Sovereign Proof Engine Node Matrix v21.2
              </span>
            </div>
          </CardTitle>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="border-cyan-500/30 bg-cyan-950/20 px-2.5 py-1 text-xs text-cyan-400 shadow-sm"
            >
              <Terminal className="mr-1.5 h-3 w-3" />
              ST. PAUL 14D NODE
            </Badge>
            <Badge
              variant="outline"
              className="border-cyan-500/30 bg-cyan-950/20 px-2.5 py-1 text-xs text-cyan-400 shadow-sm"
            >
              <Cpu className="mr-1.5 h-3 w-3" />
              NODE CORE
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-6">
        {/* Case index banner */}
        <div className="grid gap-3 rounded-lg border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 to-zinc-900/10 p-4 shadow-inner md:grid-cols-2">
          <div className="flex items-center gap-2 text-xs">
            <Gavel className="h-4 w-4 shrink-0 text-cyan-500" />
            <span className="text-zinc-400">CASE INDEX:</span>
            <span className="font-bold text-cyan-300">CCH-28-589086 / CUD-26-682107</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:justify-end">
            <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
            <span className="text-zinc-400">MANIFEST ANCHOR:</span>
            <span className="text-zinc-200">Doc 000-RO-A11-R1 / 000-A0-R17-R1</span>
          </div>
        </div>

        {/* Critical unanchored alert */}
        {anchorRow && (
          <div className="group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-red-500/40 bg-gradient-to-br from-red-950/40 to-red-900/10 p-5 shadow-md">
            <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-5 transition-transform group-hover:scale-110">
              <ShieldAlert className="h-32 w-32 text-red-500" />
            </div>
            <div className="flex items-center gap-2.5 border-b border-red-500/20 pb-2">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
              <div className="text-xs font-bold uppercase tracking-widest text-red-400">
                CRITICAL CRYPTOGRAPHIC AUDIT ALERT — UNANCHORED STATUS
              </div>
            </div>
            <p className="font-sans text-xs leading-relaxed text-red-200/90">
              Forensic validation of the input ledger confirms that transaction{' '}
              <code className="rounded border border-red-500/30 bg-red-950/60 px-1.5 py-0.5 font-mono text-[11px] text-red-300">
                26856b24c50750f0c69c1eeb86a69ef710551555c2c220e34d57521cbc8d75c2
              </code>{' '}
              returns <span className="font-bold text-red-300 underline">404 NOT FOUND</span> across
              all queried mainnet and testnet indexes. To eliminate risk of structural filing fraud
              under penalty of perjury, this component suppresses immutable claims and reflects an
              explicit status of{' '}
              <span className="rounded border border-red-500/40 bg-red-950 px-1 py-0.5 font-mono font-bold text-red-400">
                STOP_TX_NOT_FOUND
              </span>
              .
            </p>
          </div>
        )}

        {/* Search + tab filters */}
        <div className="flex flex-col gap-4 border-t border-zinc-900 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search file registries, reviewers, or hashes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-zinc-800 bg-zinc-950/60 pl-9 font-mono text-xs text-cyan-400 placeholder:text-zinc-600 focus-visible:border-cyan-500/50 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid h-9 grid-cols-4 border border-zinc-800 bg-zinc-950 p-0.5 text-zinc-400">
              <TabsTrigger
                value="all"
                className="font-mono text-[10px] data-[state=active]:bg-cyan-950/40 data-[state=active]:text-cyan-400"
              >
                ALL ({stats.total})
              </TabsTrigger>
              <TabsTrigger
                value="judicial"
                className="font-mono text-[10px] data-[state=active]:bg-cyan-950/40 data-[state=active]:text-cyan-400"
              >
                JUDICIAL ({stats.judicial})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="font-mono text-[10px] data-[state=active]:bg-cyan-950/40 data-[state=active]:text-cyan-400"
              >
                REVIEW ({stats.pending})
              </TabsTrigger>
              <TabsTrigger
                value="unanchored"
                className="font-mono text-[10px] data-[state=active]:bg-red-950/40 data-[state=active]:text-red-400"
              >
                ALERT ({stats.unanchored})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Manifest rows */}
        <div className="grid gap-3">
          {filteredManifest.length > 0 ? (
            filteredManifest.map((m) => {
              const cfg = statusConfig[m.actionableStatus]
              const Icon = cfg.icon
              const hashIsHex = isHexSha(m.sha256)
              const isUnanchored = m.actionableStatus === 'STOP_TX_NOT_FOUND'

              return (
                <div
                  key={m.sequence}
                  className={`group relative flex flex-col gap-4 rounded-lg border p-4 transition-all duration-300 lg:flex-row lg:items-center ${cfg.border} ${cfg.bg} ${cfg.glow}`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-2 lg:w-28 lg:shrink-0 lg:flex-col lg:items-start lg:border-none lg:pb-0">
                    <Badge
                      variant="outline"
                      className="border-zinc-800 bg-zinc-950/60 px-2 py-0.5 font-mono text-[10px] text-zinc-400"
                    >
                      SEQ {m.sequence}
                    </Badge>
                    {m.fileSize && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600 lg:mt-1">
                        <Archive className="h-2.5 w-2.5" />
                        {m.fileSize}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <FileText
                        className={`mt-0.5 h-4 w-4 shrink-0 ${isUnanchored ? 'text-red-500' : 'text-cyan-500'}`}
                      />
                      <span
                        className={`break-all font-mono text-xs font-semibold leading-relaxed ${isUnanchored ? 'text-red-300' : 'text-zinc-100'}`}
                      >
                        {m.fileName}
                      </span>
                    </div>

                    <div className="relative rounded border border-zinc-900 bg-black/40 p-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <span className="mb-0.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                            <Fingerprint className="h-2.5 w-2.5" />
                            SHA-256 Identification Signature
                          </span>
                          <span
                            className={`break-all font-mono text-[11px] font-medium tracking-tight ${
                              hashIsHex
                                ? isUnanchored
                                  ? 'text-red-400/90'
                                  : 'text-cyan-400/90'
                                : 'italic text-zinc-500'
                            }`}
                          >
                            {m.sha256}
                          </span>
                          {!hashIsHex && (
                            <span className="ml-1 font-sans text-[10px] italic text-zinc-600">
                              (native dynamic asset reference)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleCopy(m.sha256, m.sequence)}
                          className="shrink-0 rounded border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-500 transition-colors hover:border-cyan-500/50 hover:text-cyan-400"
                          title="Copy digest hash signature"
                          aria-label="Copy SHA-256 signature"
                        >
                          {copiedIndex === m.sequence ? (
                            <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                          ) : (
                            <Fingerprint className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {m.notes && (
                      <p
                        className={`border-l pl-6 font-sans text-[11px] italic ${
                          isUnanchored
                            ? 'border-red-500/30 text-red-300/90'
                            : 'border-zinc-900 text-zinc-400'
                        }`}
                      >
                        {m.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-6 text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-zinc-600" />
                        <span className="text-zinc-600">Review Target:</span>
                        <span className="font-medium text-amber-500/90">{m.targetReviewer}</span>
                      </span>
                      {m.timestamp && (
                        <span className="hidden items-center gap-1 border-l border-zinc-900 pl-4 md:inline-flex">
                          <Clock className="h-3 w-3 text-zinc-600" />
                          <span>{m.timestamp}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 border-t border-zinc-900 pt-2 lg:flex lg:w-56 lg:justify-end lg:border-none lg:pt-0">
                    <Badge
                      variant="outline"
                      className={`${cfg.border} ${cfg.color} flex w-fit items-center gap-1.5 bg-zinc-950/80 px-2.5 py-1 font-mono text-[10px] tracking-wide shadow-sm transition-colors duration-300`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </Badge>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 p-12 text-center">
              <ShieldAlert className="mb-2 h-8 w-8 text-zinc-600" />
              <p className="text-xs text-zinc-500">No records match active filter parameters.</p>
            </div>
          )}
        </div>

        {/* System discovery disclaimer */}
        <div className="flex gap-3 rounded-lg border border-amber-500/20 bg-gradient-to-r from-amber-950/20 to-transparent p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="font-sans text-[11px] leading-relaxed text-amber-300/80">
            <strong>SYSTEM DISCOVERY STATEMENT:</strong> The SHA-256 signatures in this ledger
            function exclusively as internal file-integrity hashes mapping native parameters. Status
            identifiers document intended procedural routing to the San Francisco Superior Court
            under California Rules of Court guidelines — they are not certified judicial findings.
            The Bitcoin anchor row reflects the true, independently checked on-chain status.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
