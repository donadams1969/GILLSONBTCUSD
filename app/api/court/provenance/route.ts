import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { buildPDF, DOCS, FSX_MAP, DOC_TYPE_MAP } from '../generate-pdf/route'

/**
 * Forensic Provenance Declaration & Hash Register — VALORAIPLUS//e
 * Case: CUD-26-682107 | Court: SF Superior Court, Dept 12
 *
 * Automates the "closing the loop" protocol end-to-end. For each requested
 * exhibit it regenerates the byte-deterministic PDF, computes its SHA-256,
 * assembles a canonical evidence manifest, then derives the Master Root Hash
 * as the SHA-256 of that manifest (a single-level Merkle commitment).
 *
 * Because /api/court/generate-pdf is now deterministic (pinned filing date and
 * pinned PDF Creation/Modification timestamps), these hashes are stable and any
 * party may re-verify them against the exhibits downloaded from this app.
 *
 * MANDATORY DISCLAIMER: demonstration artifact. Not external certification,
 * bank approval, audit opinion, or solvency verification.
 */

const MANDATORY_DISCLAIMER =
  'This is a demonstration artifact. It is not bank approval, regulatory certification, ' +
  'financial solvency verification, or independent audit opinion.'

const CASE_NO = 'CUD-26-682107'
const COURT = 'SUPERIOR COURT OF CALIFORNIA, COUNTY OF SAN FRANCISCO'
const DEPT = 'DEPARTMENT 12'
const DECLARANT = 'Dr. Donald Ernest Gillson, Ed.D., In Pro Per Defendant'

// Default exhibit set requested in the closing-the-loop protocol.
// C013 -> 13, C022 -> 22, C029 -> 29, C065 -> 65, C086 -> 86
const DEFAULT_EXHIBITS = [13, 22, 29, 65, 86]

// Map an exhibit token (e.g. "C013", "13", "116A") to a numeric DOCS key.
function resolveId(token: string): number | null {
  const t = token.trim().toUpperCase()
  // Stack K appendices: 116A -> 1161, 116B -> 1162
  if (t === 'C116A' || t === '116A') return 1161
  if (t === 'C116B' || t === '116B') return 1162
  const m = t.match(/^C?0*(\d+)$/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  return Number.isFinite(n) ? n : null
}

function exhibitLabel(id: number): string {
  if (id === 1161) return 'C116A'
  if (id === 1162) return 'C116B'
  return `C${String(id).padStart(3, '0')}`
}

// Recursive key-sort for deterministic canonical JSON.
function sortedKeys(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj
  if (Array.isArray(obj)) return obj.map(sortedKeys)
  return Object.keys(obj as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = sortedKeys((obj as Record<string, unknown>)[k])
      return acc
    }, {})
}

async function buildRegister(ids: number[]) {
  const entries = []
  for (const id of ids) {
    const doc = DOCS[id]
    if (!doc) continue
    const bytes = await buildPDF(id)
    const sha256 = crypto.createHash('sha256').update(bytes).digest('hex')
    entries.push({
      exhibit: exhibitLabel(id),
      document_id: id,
      name: doc.name,
      file_name: doc.pdfName,
      doc_type_code: DOC_TYPE_MAP[id] ?? null,
      fsx_transaction: FSX_MAP[id] ?? null,
      byte_length: bytes.length,
      sha256,
      verify_command: `sha256sum "${doc.pdfName}"  # expect ${sha256}`,
    })
  }
  return entries
}

function buildResponse(register: Awaited<ReturnType<typeof buildRegister>>) {
  // Canonical manifest committed to the Master Root.
  const manifest = {
    schema_version: 'VALORAIPLUS-PROVENANCE-1.0',
    case_number: CASE_NO,
    court: COURT,
    department: DEPT,
    declarant: DECLARANT,
    hash_algorithm: 'SHA-256',
    exhibit_count: register.length,
    exhibits: register.map((e) => ({
      exhibit: e.exhibit,
      file_name: e.file_name,
      sha256: e.sha256,
      byte_length: e.byte_length,
    })),
  }

  const canonicalManifest = JSON.stringify(sortedKeys(manifest))
  const masterRoot = crypto.createHash('sha256').update(canonicalManifest, 'utf8').digest('hex')

  // Human-readable manifest lines (sha256sum format).
  const manifestText = register.map((e) => `${e.sha256}  ${e.file_name}`).join('\n')

  const declaration = [
    'ADDENDUM: FORENSIC PROVENANCE DECLARATION & HASH REGISTER',
    '',
    `I, ${DECLARANT.split(',')[0]}, declare under penalty of perjury under the laws of the`,
    'State of California that the integrity of the evidence presented in this matter is',
    'independently verifiable through the following SHA-256 manifest. Each exhibit has been',
    'hashed individually, and these hashes are committed to the Master Root below.',
    '',
    '1. INDIVIDUAL EXHIBIT INTEGRITY REGISTER',
    ...register.map(
      (e) => `   ${e.exhibit}  ${e.file_name}\n        SHA-256: ${e.sha256}`,
    ),
    '',
    '2. MASTER ROOT HASH (SHA-256 of canonical manifest)',
    `   ${masterRoot}`,
    '',
    '3. VERIFICATION STATEMENT',
    '   Any party or the Court may verify the integrity of the lodged evidence by',
    '   downloading each exhibit from the Master Repository and running',
    '   `sha256sum [filename]` to confirm it matches this Register. The Master Root is',
    '   the SHA-256 of the canonical (key-sorted) JSON manifest of all exhibit hashes.',
    '',
    `Executed on ${new Date().toISOString().slice(0, 10)}, at San Francisco, California.`,
    '',
    '_________________________________',
    DECLARANT,
  ].join('\n')

  return {
    ok: true,
    system: 'VALORAIPLUS//e',
    instrument: 'Forensic Provenance Declaration & Hash Register',
    case_number: CASE_NO,
    hash_algorithm: 'SHA-256',
    exhibit_count: register.length,
    register,
    manifest,
    manifest_text: manifestText,
    master_root_hash: masterRoot,
    declaration_text: declaration,
    deterministic: true,
    note:
      'PDFs are byte-deterministic (pinned filing date + pinned PDF timestamps), ' +
      'so these hashes are stable and re-verifiable against downloaded exhibits.',
    mandatory_disclaimer: MANDATORY_DISCLAIMER,
    computed_at: new Date().toISOString(),
  }
}

function parseIds(raw: string | null): { ids: number[]; invalid: string[] } {
  if (!raw) return { ids: DEFAULT_EXHIBITS, invalid: [] }
  const ids: number[] = []
  const invalid: string[] = []
  for (const tok of raw.split(',').map((s) => s.trim()).filter(Boolean)) {
    const id = resolveId(tok)
    if (id !== null && DOCS[id]) ids.push(id)
    else invalid.push(tok)
  }
  return { ids: ids.length ? ids : DEFAULT_EXHIBITS, invalid }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const { ids, invalid } = parseIds(searchParams.get('exhibits'))

  if (invalid.length) {
    return NextResponse.json(
      {
        error: `Unknown exhibit token(s): ${invalid.join(', ')}.`,
        valid_ids: Object.keys(DOCS),
      },
      { status: 400 },
    )
  }

  const register = await buildRegister(ids)
  return NextResponse.json(buildResponse(register))
}

export async function POST(req: NextRequest) {
  let body: { exhibits?: Array<string | number> } = {}
  try {
    body = await req.json()
  } catch {
    /* empty body -> defaults */
  }

  const ids: number[] = []
  const invalid: string[] = []
  for (const tok of body.exhibits ?? DEFAULT_EXHIBITS) {
    const id = resolveId(String(tok))
    if (id !== null && DOCS[id]) ids.push(id)
    else invalid.push(String(tok))
  }

  if (invalid.length) {
    return NextResponse.json(
      { error: `Unknown exhibit token(s): ${invalid.join(', ')}.`, valid_ids: Object.keys(DOCS) },
      { status: 400 },
    )
  }

  const register = await buildRegister(ids.length ? ids : DEFAULT_EXHIBITS)
  return NextResponse.json(buildResponse(register))
}
