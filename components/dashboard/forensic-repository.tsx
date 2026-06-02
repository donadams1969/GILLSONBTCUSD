'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  },
  {
    sequence: '00_MANIFEST',
    fileName:
      '00_CCH-28-589086_CUD-26-682107_Doc_000-RO-A11-R1_000-A0-R17-R1_SHA256_SOURCE_MANIFEST.txt',
    sha256: 'PLAINTEXT_MANIFEST_VERIFIED',
    actionableStatus: 'Verified / Immutable',
    targetReviewer: 'Court IT E-Filing Operations Desk',
  },
  {
    sequence: '01',
    fileName:
      '01. 00_CCH-28-589086_CUD-26-682107_Doc_000-RO-A4_000-A0-R11_FINAL_MASTER_CONSOLIDATED_EFILE_READY (1) (2)(1).pdf',
    sha256: 'dca8413eb7ed56cdd3b30b6ddf2b435ed6025724975614cd8bc4f8e714ba0b33',
    actionableStatus: 'For Judicial Notice',
    targetReviewer: 'Department 12 Chambers',
  },
  {
    sequence: '02',
    fileName:
      '02. 00_CCH-28-589086_CUD-26-682107_Doc_000-RO-A5_REV3_GARNER_NOTICE_PUBLIC_FUNDS_PRESERVATION_ROADMAP_FINAL (2)(1).pdf',
    sha256: 'd8f63463534231ad018443689ad35c759c1ae76c13e296cab3b209c0bf3140b8',
    actionableStatus: 'For Judicial Notice',
    targetReviewer: 'Department 12 Chambers',
  },
  {
    sequence: '05',
    fileName:
      '05. 00_CCH-28-589086_CUD-26-682107_Doc_000-RO-A7-R1_000-A0-R13-R1_SUPP_DECL_VTU_PROSTHETIC_IP_VALORAIPLUS_ECOSYSTEM_FINAL (1)(1).pdf',
    sha256: '0fb0809bc4040faac0a24a4115f23942e406c8a46f0e54135094af8525e4ef9d',
    actionableStatus: 'For Judicial Notice',
    targetReviewer: 'Department 12 Chambers',
  },
  {
    sequence: '06',
    fileName:
      '06. 00_CCH-28-589086_CUD-26-682107_Doc_000-RO-A8_000-A0-R14_MASTER_ALL_IN_ONE_VTU_HOMEKEY_AUDI_SERVICE_ANIMAL_FINAL (1)(1).pdf',
    sha256: '22501e91b95187836ecb27dbd34f5ea5a3e66db40250d6a6ec10f894bc02a5b1',
    actionableStatus: 'For Judicial Notice',
    targetReviewer: 'Department 12 Chambers',
  },
  {
    sequence: 'SFHA',
    fileName: 'SFHA_UltraCombined_v8.pdf',
    sha256: 'c49a3ac89b00d6c9cad5728217d0c3d8ffd6deaa5fb596d7d4061bac675fa7d0',
    actionableStatus: 'Active / Pending Review',
    targetReviewer: 'Superior Court ADA Coordinator Line',
  },
  {
    sequence: 'FORENSIC',
    fileName: 'Exhibits_and_Statements_v1.zip',
    sha256: 'VERIFIED_NATIVE_BYTES_IN_EMBEDDED_LOCKER',
    actionableStatus: 'For In Camera Review',
    targetReviewer: 'Special Forensic Master Review Queue',
  },
  {
    sequence: 'ANCHOR_CHECK',
    fileName: 'Bitcoin Mainnet Anchor Status Record',
    sha256: '26856b24c50750f0c69c1eeb86a69ef710551555c2c220e34d57521cbc8d75c2',
    actionableStatus: 'STOP_TX_NOT_FOUND',
    targetReviewer: 'Court IT / Independent System Audit Desk',
  },
]

const statusConfig: Record<
  ActionableStatus,
  { icon: typeof FileText; color: string; border: string; bg: string; label: string }
> = {
  'For Judicial Notice': {
    icon: Gavel,
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/5',
    label: 'For Judicial Notice',
  },
  'Active / Pending Review': {
    icon: CircleDashed,
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/5',
    label: 'Active / Pending Review',
  },
  'Preservation Only': {
    icon: Archive,
    color: 'text-zinc-400',
    border: 'border-zinc-500/40',
    bg: 'bg-zinc-500/5',
    label: 'Preservation Only',
  },
  'For In Camera Review': {
    icon: Eye,
    color: 'text-violet-300',
    border: 'border-violet-500/40',
    bg: 'bg-violet-500/5',
    label: 'For In Camera Review',
  },
  'Verified / Immutable': {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/5',
    label: 'Verified / Immutable',
  },
  STOP_TX_NOT_FOUND: {
    icon: ShieldAlert,
    color: 'text-red-400',
    border: 'border-red-500/50',
    bg: 'bg-red-500/10',
    label: 'STOP — TX NOT FOUND (UNANCHORED)',
  },
}

function isHexSha(value: string) {
  return /^[0-9a-f]{64}$/.test(value)
}

export function ForensicRepository() {
  const judicialCount = MASTER_MANIFEST.filter(
    (m) => m.actionableStatus === 'For Judicial Notice'
  ).length
  const anchorRow = MASTER_MANIFEST.find((m) => m.actionableStatus === 'STOP_TX_NOT_FOUND')

  return (
    <Card className="border-cyan-500/30 bg-black/60 backdrop-blur-sm">
      <CardHeader className="border-b border-cyan-500/20">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 font-mono text-cyan-400">
          <span className="flex items-center gap-2">
            <FolderLock className="h-5 w-5" />
            FORENSIC REPOSITORY INDEX
          </span>
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/40 font-mono text-[10px] text-cyan-400">
              {MASTER_MANIFEST.length} RECORDS
            </Badge>
            <Badge variant="outline" className="border-cyan-500/40 font-mono text-[10px] text-cyan-400">
              {judicialCount} FOR JUDICIAL NOTICE
            </Badge>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Case reference */}
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 font-mono text-xs text-zinc-400">
          CASE CCH-28-589086 / CUD-26-682107 · Doc 000-RO-A11-R1 / 000-A0-R17-R1
        </div>

        {/* Honest anchor banner */}
        {anchorRow && (
          <div className="flex gap-3 rounded-lg border border-red-500/40 bg-red-500/10 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
            <div className="space-y-1">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-red-400">
                Anchor Status — Not On Chain
              </div>
              <p className="text-xs leading-relaxed text-red-200/80">
                The referenced Bitcoin TXID was not found on mainnet, testnet, or in any mempool across
                independent explorers. It is recorded here as <span className="font-mono">UNANCHORED</span>{' '}
                and must not be represented as a verified or immutable anchor until broadcast and confirmed.
              </p>
            </div>
          </div>
        )}

        {/* Manifest rows */}
        <div className="grid gap-2">
          {MASTER_MANIFEST.map((m) => {
            const cfg = statusConfig[m.actionableStatus]
            const Icon = cfg.icon
            const hashIsHex = isHexSha(m.sha256)
            return (
              <div
                key={m.sequence}
                className={`flex flex-col gap-3 rounded-lg border ${cfg.border} ${cfg.bg} p-3 sm:flex-row sm:items-start`}
              >
                <div className="flex items-center gap-2 sm:w-28 sm:shrink-0">
                  <Badge
                    variant="outline"
                    className="border-zinc-600/50 font-mono text-[10px] text-zinc-400"
                  >
                    {m.sequence}
                  </Badge>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    <span className="break-all font-mono text-xs text-zinc-200">{m.fileName}</span>
                  </div>

                  <div className="mt-2 flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500">SHA-256</span>
                    <span
                      className={`break-all font-mono text-[11px] ${
                        hashIsHex
                          ? m.actionableStatus === 'STOP_TX_NOT_FOUND'
                            ? 'text-red-300'
                            : 'text-cyan-300'
                          : 'text-zinc-500'
                      }`}
                    >
                      {m.sha256}
                      {!hashIsHex && (
                        <span className="ml-1 text-zinc-600">(native byte reference)</span>
                      )}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-zinc-500">
                    <span className="text-zinc-600">Reviewer:</span> {m.targetReviewer}
                  </div>
                </div>

                <div className="sm:w-52 sm:shrink-0">
                  <Badge
                    variant="outline"
                    className={`${cfg.border} ${cfg.color} flex w-fit items-center gap-1 font-mono text-[10px]`}
                  >
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer disclaimer */}
        <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-[11px] leading-relaxed text-amber-200/80">
            SHA-256 values are integrity references for the listed native files. Statuses reflect intended
            judicial handling, not a court ruling or adjudication. The Bitcoin anchor row reflects the true,
            independently checked on-chain status.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
