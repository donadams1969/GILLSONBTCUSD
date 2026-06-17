import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, PageSizes, PDFFont, PDFPage } from 'pdf-lib'

/**
 * Filing-ready PDF rendering of the VALORAIPLUS//e Forensic Codex & Cold-Storage
 * Attestation for lodging in CUD-26-682107.
 *
 * Deterministic: filing date and PDF timestamps are pinned so the output is
 * byte-stable and its SHA-256 is independently re-verifiable.
 *
 * This Codex locks to the SINGLE canonical Master Root computed by the live
 * deterministic system over all 59 exhibits, and states the Bitcoin OP_RETURN
 * anchor as PREPARED / AWAITING BROADCAST (no txid asserted). No EVM/Base anchor
 * is claimed; an unrelated empty-input Base transfer is explicitly excluded.
 *
 * MANDATORY DISCLAIMER: demonstration / forensic-integrity artifact. Not bank
 * approval, regulatory certification, solvency verification, or audit opinion.
 */

const CANONICAL_DATE = new Date('2026-06-17T00:00:00.000Z')
const DATE_LABEL = 'June 17, 2026'
const CASE_NO = 'CUD-26-682107'
const FSX = '77260201'
const DOC_TYPE = 'CODEX'
const COURT = 'SUPERIOR COURT OF CALIFORNIA, COUNTY OF SAN FRANCISCO'
const DEPT = 'DEPARTMENT 12'
const FILER = 'Donald Ernest Gillson, In Pro Per Defendant'
const INQUIRY = 'SFefiling@sftc.org'
const MASTER_ROOT = '0d0922805bb9456515ec3dd557cdcb6dbd40d6e788ccb8950ebf166858486f93'

const W = PageSizes.Letter[0]
const H = PageSizes.Letter[1]
const M = 72
const BODY = 10
const LEAD = 15

type Block =
  | { kind: 'h1'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'bullet'; text: string }
  | { kind: 'mono'; text: string }
  | { kind: 'rule' }
  | { kind: 'space'; size?: number }
  | { kind: 'kv'; k: string; v: string }
  | { kind: 'sign'; lines: string[] }

const CODEX: Block[] = [
  { kind: 'h1', text: 'VALORAIPLUS//e — FORENSIC CODEX & COLD-STORAGE ATTESTATION' },
  { kind: 'p', text: 'Evidence Provenance, Off-Disk Preservation & Blockchain Anchor Record' },
  { kind: 'p', text: 'Intelligence / Forensic Record — Prepared for Lodging' },
  { kind: 'rule' },
  { kind: 'kv', k: 'Case No.', v: CASE_NO },
  { kind: 'kv', k: 'Court', v: 'SF Superior Court, County of San Francisco — Department 12' },
  { kind: 'kv', k: 'Related Case', v: 'CCH-28-589086' },
  { kind: 'kv', k: 'Declarant / Defendant', v: 'Donald Ernest Gillson, In Pro Per' },
  { kind: 'kv', k: 'Codex Date', v: DATE_LABEL },
  { kind: 'kv', k: 'System Identifier', v: 'VALORAIPLUS//e' },
  { kind: 'kv', k: 'Repository', v: 'donadams1969/GILLSONBTCUSD' },
  { kind: 'space', size: 6 },
  { kind: 'mono', text: 'MANDATORY DISCLAIMER. This is a technical demonstration and forensic-integrity artifact. It is NOT bank approval, regulatory certification, financial-solvency verification, or an independent audit opinion. Every cryptographic value in this Codex is independently reproducible from the deterministic source documents using the standard sha256sum utility.' },
  { kind: 'rule' },

  { kind: 'h2', text: '1. CANONICAL MASTER ROOT (VERIFIED)' },
  { kind: 'p', text: 'There is exactly one canonical integrity commitment for this matter. Any other "root" value appearing in prior drafts is superseded and must be disregarded.' },
  { kind: 'kv', k: 'Master Root Hash (SHA-256)', v: '' },
  { kind: 'mono', text: MASTER_ROOT },
  { kind: 'bullet', text: 'Hash length: 64 hex characters (256-bit) — valid.' },
  { kind: 'bullet', text: 'Exhibits committed: 59 deterministic court documents (Stacks A–K).' },
  { kind: 'bullet', text: 'Derivation: SHA-256 of the canonical key-sorted JSON manifest of all 59 exhibit SHA-256 digests.' },
  { kind: 'bullet', text: 'Reproducibility: fully reproducible; documents are byte-deterministic (pinned timestamps).' },
  { kind: 'p', text: 'Superseded values (DO NOT USE): two earlier draft roots circulated during preparation — one only 62 characters (not a valid SHA-256) and one not produced by this system. Neither is reproducible from the evidence and neither is used in this Codex.' },

  { kind: 'h2', text: '2. TIERED COLD-STORAGE ARCHITECTURE' },
  { kind: 'p', text: 'Evidence is preserved off the application disk across independent tiers, so the integrity of the record does not depend on any single store.' },
  { kind: 'bullet', text: 'Tier 0 — Deterministic Regeneration (source of truth). All 59 PDFs are byte-deterministic (filing date and PDF Creation/Modification timestamps pinned to a canonical epoch); each can be regenerated identically and carries a fixed SHA-256.' },
  { kind: 'bullet', text: 'Tier 1 — Bitcoin OP_RETURN Anchor (immutable, off all controlled disk). Network: Bitcoin mainnet. OP_RETURN payload: the raw 32-byte Master Root below. Broadcast method: MANUAL — payload prepared by the system; defendant broadcasts from own wallet. Current status: PAYLOAD PREPARED — AWAITING BROADCAST. No txid has been recorded yet.' },
  { kind: 'bullet', text: 'Tier 2 — Off-Disk Object Storage (private archive). Store: Vercel Blob (private access). Contents: full evidence bundle (all 59 PDFs + hash register). Access: server-side authenticated retrieval only; private blob URLs never exposed to clients.' },
  { kind: 'bullet', text: 'Tier 3 — Immutable Ledger (tamper-evident). Store: Supabase PostgreSQL table valoraiplus_cold_storage_seals. Append-only; a database trigger blocks DELETE and blocks UPDATE of integrity fields; the anchor txid is write-once (null to value) and cannot be overwritten. Row Level Security enabled; service-role server access only.' },
  { kind: 'p', text: 'Bitcoin OP_RETURN payload (32 bytes = the raw 256-bit Master Root):' },
  { kind: 'mono', text: MASTER_ROOT },
  { kind: 'p', text: 'HONEST STATUS NOTE. The Bitcoin anchor payload has been generated and is ready for broadcast. As of the Codex date it has NOT yet been broadcast, so no transaction id is asserted. Once broadcast, the txid is written exactly once into the immutable ledger and this Codex is reissued with the confirmed txid.' },

  { kind: 'h2', text: '3. INDEPENDENT VERIFICATION PROCEDURE (FOR THE COURT)' },
  { kind: 'p', text: 'Any party may verify the record without trusting the defendant or this system:' },
  { kind: 'bullet', text: 'Regenerate any exhibit from the deterministic generator (/api/court/generate-pdf?id=N).' },
  { kind: 'bullet', text: 'Hash it: sha256sum "<filename>.pdf" — the digest matches the Evidence Manifest.' },
  { kind: 'bullet', text: 'Recompute the Master Root: SHA-256 of the canonical key-sorted JSON manifest of all 59 exhibit digests equals the value in Section 1.' },
  { kind: 'bullet', text: '(After broadcast) Confirm the anchor: look up the recorded Bitcoin txid and confirm its OP_RETURN output contains the 32-byte Master Root above.' },
  { kind: 'p', text: 'Altering a single byte of any exhibit changes that exhibit hash, which changes the manifest, which changes the Master Root — making any tampering cryptographically detectable.' },

  { kind: 'h2', text: '4. ITEMS EXPLICITLY EXCLUDED (FOR CANDOR)' },
  { kind: 'p', text: 'To keep this record defensible, the following are NOT claimed:' },
  { kind: 'bullet', text: 'No EVM/Base anchor is asserted. A Base mainnet transaction reviewed during preparation was found to be an ordinary value transfer (empty input data, 21,000 gas, zero logs). It contains no evidence hash and is therefore not an anchor of this record. It is excluded.' },
  { kind: 'bullet', text: 'No deployed smart contract, role grant, or Hardhat distribution is part of this record. No such contract exists in the repository.' },
  { kind: 'bullet', text: 'No solvency, valuation, or financial certification is made.' },

  { kind: 'h2', text: '5. ATTESTATION' },
  { kind: 'p', text: 'I declare under penalty of perjury under the laws of the State of California that the cryptographic facts stated in this Codex — the canonical Master Root, the exhibit count, the prepared (and as-yet-unbroadcast) Bitcoin OP_RETURN payload, the off-disk archive, and the immutable ledger — are true and correct to the best of my knowledge and were derived from direct inspection of the operative system, and that the values excluded in Section 4 were excluded because they are not supported by the evidence.' },
  { kind: 'p', text: `Executed on ${DATE_LABEL}, at San Francisco, California.` },
  { kind: 'sign', lines: ['Donald Ernest Gillson', 'Defendant, In Pro Per', 'donadams1969.eth'] },
]

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const trial = line ? line + ' ' + w : w
    if (font.widthOfTextAtSize(trial, size) > maxW && line) {
      lines.push(line)
      line = w
    } else {
      line = trial
    }
  }
  if (line) lines.push(line)
  return lines
}

export async function GET(_req: NextRequest) {
  const pdf = await PDFDocument.create()
  const reg = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const mono = await pdf.embedFont(StandardFonts.Courier)

  pdf.setTitle(`Forensic Codex & Cold-Storage Attestation | ${CASE_NO}`)
  pdf.setAuthor(FILER)
  pdf.setSubject(`${DOC_TYPE} | FSX: ${FSX} | ${CASE_NO}`)
  pdf.setKeywords([`FSX:${FSX}`, CASE_NO, DOC_TYPE, 'VALORAIPLUS', 'ColdStorage', MASTER_ROOT])
  pdf.setCreator('VALORAIPLUS PDF ENGINE v4.0')
  pdf.setProducer(`FSX Transaction ${FSX}`)
  pdf.setCreationDate(CANONICAL_DATE)
  pdf.setModificationDate(CANONICAL_DATE)

  const maxW = W - M * 2
  let page: PDFPage = pdf.addPage(PageSizes.Letter)
  let pageNum = 1
  let y = H - M

  const footer = (p: PDFPage, n: number) => {
    p.drawLine({ start: { x: M, y: M + 20 }, end: { x: W - M, y: M + 20 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) })
    p.drawText(`${CASE_NO}  |  FSX: ${FSX}  |  ${DOC_TYPE}  |  Page ${n}`, { x: M, y: M + 6, size: 8, font: reg, color: rgb(0.4, 0.4, 0.4) })
  }
  const header = (p: PDFPage) => {
    const label = `FSX Transaction ID: ${FSX}`
    const lw = bold.widthOfTextAtSize(label, 9)
    p.drawText(label, { x: W - M - lw, y: H - M + 6, size: 9, font: bold, color: rgb(0, 0, 0) })
  }
  header(page)

  const ensure = (need: number) => {
    if (y - need < M + 36) {
      footer(page, pageNum)
      page = pdf.addPage(PageSizes.Letter)
      pageNum += 1
      header(page)
      y = H - M
    }
  }

  for (const b of CODEX) {
    switch (b.kind) {
      case 'h1': {
        ensure(LEAD * 2)
        for (const ln of wrap(b.text, bold, 14, maxW)) {
          ensure(18)
          const tw = bold.widthOfTextAtSize(ln, 14)
          page.drawText(ln, { x: (W - tw) / 2, y, size: 14, font: bold, color: rgb(0, 0, 0) })
          y -= 18
        }
        y -= 4
        break
      }
      case 'h2': {
        ensure(LEAD + 8)
        y -= 4
        page.drawText(b.text, { x: M, y, size: 11, font: bold, color: rgb(0, 0, 0) })
        y -= LEAD + 2
        break
      }
      case 'p': {
        for (const ln of wrap(b.text, reg, BODY, maxW)) {
          ensure(LEAD)
          page.drawText(ln, { x: M, y, size: BODY, font: reg, color: rgb(0, 0, 0) })
          y -= LEAD
        }
        y -= 3
        break
      }
      case 'bullet': {
        const lines = wrap(b.text, reg, BODY, maxW - 16)
        lines.forEach((ln, i) => {
          ensure(LEAD)
          if (i === 0) page.drawText('•', { x: M, y, size: BODY, font: bold, color: rgb(0, 0, 0) })
          page.drawText(ln, { x: M + 16, y, size: BODY, font: reg, color: rgb(0, 0, 0) })
          y -= LEAD
        })
        break
      }
      case 'mono': {
        for (const ln of wrap(b.text, mono, 8.5, maxW - 16)) {
          ensure(13)
          page.drawText(ln, { x: M + 8, y, size: 8.5, font: mono, color: rgb(0.15, 0.15, 0.15) })
          y -= 13
        }
        y -= 3
        break
      }
      case 'kv': {
        ensure(LEAD)
        const label = `${b.k}: `
        page.drawText(label, { x: M, y, size: BODY, font: bold, color: rgb(0, 0, 0) })
        if (b.v) {
          const lx = M + bold.widthOfTextAtSize(label, BODY)
          page.drawText(b.v, { x: lx, y, size: BODY, font: reg, color: rgb(0, 0, 0) })
        }
        y -= LEAD
        break
      }
      case 'rule': {
        ensure(12)
        page.drawLine({ start: { x: M, y: y + 4 }, end: { x: W - M, y: y + 4 }, thickness: 1, color: rgb(0, 0, 0) })
        y -= 12
        break
      }
      case 'space': {
        y -= b.size ?? 6
        break
      }
      case 'sign': {
        ensure(LEAD * (b.lines.length + 2))
        y -= 8
        page.drawText('_________________________________', { x: M, y, size: BODY, font: reg, color: rgb(0, 0, 0) })
        y -= LEAD
        for (const ln of b.lines) {
          page.drawText(ln, { x: M, y, size: BODY, font: reg, color: rgb(0, 0, 0) })
          y -= LEAD
        }
        break
      }
    }
  }

  // ── PROOF OF SERVICE PAGE ──────────────────────────────────────────────
  footer(page, pageNum)
  page = pdf.addPage(PageSizes.Letter)
  pageNum += 1
  header(page)
  y = H - M
  page.drawText(COURT, { x: M, y, size: 9, font: bold, color: rgb(0, 0, 0) }); y -= 14
  page.drawText(`Case No. ${CASE_NO}  |  FSX: ${FSX}  |  ${DOC_TYPE}  |  ${DEPT}`, { x: M, y, size: 9, font: reg, color: rgb(0, 0, 0) }); y -= 20
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: rgb(0, 0, 0) }); y -= 20
  page.drawText('PROOF OF SERVICE (ELECTRONIC)', { x: M, y, size: 11, font: bold, color: rgb(0, 0, 0) }); y -= 18
  const pos = [
    'I, Donald Ernest Gillson, declare under penalty of perjury under the laws',
    'of the State of California that the foregoing document entitled:',
    '',
    '"Forensic Codex & Cold-Storage Attestation"',
    '',
    'was electronically served on all counsel of record and parties via the',
    `Court's approved e-filing system on ${DATE_LABEL}, in compliance with`,
    'California Rules of Court, Rule 2.251(b).',
    '',
    `Executed on ${DATE_LABEL}, at San Francisco, California.`,
    '',
    '_________________________________',
    'Donald Ernest Gillson, Defendant, In Pro Per',
  ]
  for (const ln of pos) { page.drawText(ln, { x: M, y, size: BODY, font: reg, color: rgb(0, 0, 0) }); y -= 16 }

  const boxY = M + 60, boxH = 110, boxW = W - M * 2
  page.drawRectangle({ x: M, y: boxY, width: boxW, height: boxH, borderWidth: 1.5, borderColor: rgb(0, 0, 0), color: rgb(0.97, 0.97, 0.97) })
  let by = boxY + boxH - 18
  const bl = (t: string, s: number, f: PDFFont) => { const tw = f.widthOfTextAtSize(t, s); page.drawText(t, { x: (W - tw) / 2, y: by, size: s, font: f, color: rgb(0, 0, 0) }); by -= s + 6 }
  bl('COURT INQUIRY COMPLIANCE', 10, bold)
  bl('All official clerk inquiries regarding processing, status, or amendment', 8, reg)
  bl('of this filing must be routed to the approved channel:', 8, reg)
  bl(INQUIRY, 11, bold)
  bl(`Reference FSX Transaction Number: ${FSX}`, 9, mono)
  footer(page, pageNum)

  const bytes = await pdf.save()
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CUD-26-682107_Forensic_Codex_${DATE_LABEL.replace(/[ ,]/g, '')}.pdf"`,
      'Content-Length': bytes.length.toString(),
      'X-FSX-Transaction': FSX,
      'X-Case-Number': CASE_NO,
      'X-Doc-Type-Code': DOC_TYPE,
      'X-Master-Root': MASTER_ROOT,
    },
  })
}
