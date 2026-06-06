'use client'

import { useState } from 'react'
import { Download, FileText, CheckCircle, Loader2, Printer, ShieldCheck } from 'lucide-react'

interface DocMeta {
  id: number
  name: string
  pdfName: string
  type: string
  group: string
  fsx: string
}

// Actual filed documents — read from the real PDFs submitted in CUD-26-682107
const DOCS: DocMeta[] = [
  // ── Stack A — Answer & Initial Filings (Docs 01–05) ────────────────────────
  { id:1,  name:"UD-105 Answer + Affirmative Defenses",                                                      pdfName:"CUD-26-682107_Doc001_UD105_Answer_AffirmativeDefenses.pdf",                         type:"Answer",                              group:"A", fsx:"77260001" },
  { id:2,  name:"Defendant's Verification of Answer",                                                        pdfName:"CUD-26-682107_Doc002_Verification_Answer.pdf",                                      type:"Verification",                        group:"A", fsx:"77260002" },
  { id:3,  name:"Proof of Electronic Service — Answer",                                                      pdfName:"CUD-26-682107_Doc003_POS_Answer.pdf",                                               type:"Proof of Electronic Service",         group:"A", fsx:"77260003" },
  { id:4,  name:"Civil Case Cover Sheet",                                                                     pdfName:"CUD-26-682107_Doc004_CivilCaseCoverSheet.pdf",                                      type:"Civil Case Cover Sheet",              group:"A", fsx:"77260004" },
  { id:5,  name:"Notice of Remote Appearance",                                                                pdfName:"CUD-26-682107_Doc005_NoticeRemoteAppearance.pdf",                                   type:"Notice of Remote Appearance",         group:"A", fsx:"77260005" },
  // ── Stack B — Stay of Proceedings (Docs 06–10) ─────────────────────────────
  { id:6,  name:"Ex Parte Application to Stay Proceedings",                                                   pdfName:"CUD-26-682107_Doc006_ExParte_StayProceedings.pdf",                                  type:"Ex Parte Application",                group:"B", fsx:"77260006" },
  { id:7,  name:"Declaration in Support of Ex Parte Application",                                            pdfName:"CUD-26-682107_Doc007_Dec_ExParte.pdf",                                              type:"Declaration / Affidavit",             group:"B", fsx:"77260007" },
  { id:8,  name:"Proposed Order Granting Stay of Proceedings",                                               pdfName:"CUD-26-682107_Doc008_ProposedOrder_Stay.pdf",                                       type:"Proposed Order",                      group:"B", fsx:"77260008" },
  { id:9,  name:"Notice of Related Cases Matrix",                                                             pdfName:"CUD-26-682107_Doc009_NoticeRelatedCases.pdf",                                       type:"Notice of Related Case",              group:"B", fsx:"77260009" },
  { id:10, name:"Memorandum of Points and Authorities — Stay",                                                pdfName:"CUD-26-682107_Doc010_MPA_Stay.pdf",                                                 type:"Memorandum of Points and Authorities",group:"B", fsx:"77260010" },
  // ── Stack C — Demurrer (Docs 11–15) ────────────────────────────────────────
  { id:11, name:"Defendant's Demurrer to Complaint",                                                         pdfName:"CUD-26-682107_Doc011_Demurrer.pdf",                                                  type:"Demurrer",                            group:"C", fsx:"77260011" },
  { id:12, name:"Notice of Hearing on Demurrer",                                                              pdfName:"CUD-26-682107_Doc012_NoticeHearing_Demurrer.pdf",                                   type:"Notice of Hearing",                   group:"C", fsx:"77260012" },
  { id:13, name:"Points and Authorities — Demurrer",                                                          pdfName:"CUD-26-682107_Doc013_MPA_Demurrer.pdf",                                             type:"Memorandum of Points and Authorities",group:"C", fsx:"77260013" },
  { id:14, name:"Declaration of Meet and Confer Compliance",                                                  pdfName:"CUD-26-682107_Doc014_Dec_MeetConfer.pdf",                                           type:"Declaration / Affidavit",             group:"C", fsx:"77260014" },
  { id:15, name:"Proposed Order Sustaining Demurrer",                                                         pdfName:"CUD-26-682107_Doc015_ProposedOrder_Demurrer.pdf",                                   type:"Proposed Order",                      group:"C", fsx:"77260015" },
  // ── Stack D — Motion to Strike (Docs 16–20) ────────────────────────────────
  { id:16, name:"Motion to Strike Punitive Allegations",                                                      pdfName:"CUD-26-682107_Doc016_MotionStrike.pdf",                                             type:"Motion to Strike",                    group:"D", fsx:"77260016" },
  { id:17, name:"Notice of Motion to Strike",                                                                 pdfName:"CUD-26-682107_Doc017_NoticeMotion_Strike.pdf",                                      type:"Notice of Motion",                    group:"D", fsx:"77260017" },
  { id:18, name:"Points and Authorities — Motion to Strike",                                                  pdfName:"CUD-26-682107_Doc018_MPA_Strike.pdf",                                               type:"Memorandum of Points and Authorities",group:"D", fsx:"77260018" },
  { id:19, name:"Proposed Order on Motion to Strike",                                                         pdfName:"CUD-26-682107_Doc019_ProposedOrder_Strike.pdf",                                     type:"Proposed Order",                      group:"D", fsx:"77260019" },
  { id:20, name:"Proof of Electronic Service — Motions Stack",                                                pdfName:"CUD-26-682107_Doc020_POS_MotionsStack.pdf",                                         type:"Proof of Electronic Service",         group:"D", fsx:"77260020" },
  // ── Stack E — Habitability & Accommodation (Docs 21–27) ────────────────────
  { id:21, name:"Notice of Prior Reasonable Accommodation Request",                                           pdfName:"CUD-26-682107_Doc021_Notice_PriorAccommodation.pdf",                                type:"Notice (Other)",                      group:"E", fsx:"77260021" },
  { id:22, name:"Clinical Verification of Service Animal Status",                                             pdfName:"CUD-26-682107_Doc022_ClinicalVerification_ServiceAnimal.pdf",                       type:"Exhibit(s) to Pleading",              group:"E", fsx:"77260022" },
  { id:23, name:"Notice of Material Breach of Habitability Duties",                                           pdfName:"CUD-26-682107_Doc023_Notice_HabitabilityBreach.pdf",                                type:"Notice (Other)",                      group:"E", fsx:"77260023" },
  { id:24, name:"Demand for Facility Maintenance Log Inspection",                                             pdfName:"CUD-26-682107_Doc024_Demand_MaintenanceLog.pdf",                                    type:"Demand for Inspection",               group:"E", fsx:"77260024" },
  { id:25, name:"Chronological Record of Inpatient Treatment Stay",                                           pdfName:"CUD-26-682107_Doc025_InpatientTimeline.pdf",                                        type:"Exhibit(s) to Pleading",              group:"E", fsx:"77260025" },
  { id:26, name:"Tenant Union Organizing Manifest",                                                           pdfName:"CUD-26-682107_Doc026_TenantUnion_Manifest.pdf",                                     type:"Exhibit(s) to Pleading",              group:"E", fsx:"77260026" },
  { id:27, name:"Proof of Electronic Service — Context Stack",                                                pdfName:"CUD-26-682107_Doc027_POS_ContextStack.pdf",                                         type:"Proof of Electronic Service",         group:"E", fsx:"77260027" },
  // ── Stack F — Jurisdictional Firewall (Docs 28–34) ─────────────────────────
  { id:28, name:"Motion to Quash for Lack of Personal Jurisdiction",                                          pdfName:"CUD-26-682107_Doc028_MotionQuash_Jurisdiction.pdf",                                 type:"Motion to Quash",                     group:"F", fsx:"77260028" },
  { id:29, name:"Declaration of Witness Intimidation",                                                        pdfName:"CUD-26-682107_Doc029_Dec_WitnessIntimidation.pdf",                                  type:"Declaration / Affidavit",             group:"F", fsx:"77260029" },
  { id:30, name:"Request for Judicial Notice — Federal Statutes",                                             pdfName:"CUD-26-682107_Doc030_RJN_FederalStatutes.pdf",                                      type:"Request for Judicial Notice",         group:"F", fsx:"77260030" },
  { id:31, name:"Points and Authorities — Motion to Quash",                                                   pdfName:"CUD-26-682107_Doc031_MPA_Quash.pdf",                                                type:"Memorandum of Points and Authorities",group:"F", fsx:"77260031" },
  { id:32, name:"Proposed Order Granting Motion to Quash",                                                    pdfName:"CUD-26-682107_Doc032_ProposedOrder_Quash.pdf",                                      type:"Proposed Order",                      group:"F", fsx:"77260032" },
  { id:33, name:"Affidavit of Unserved Defective Process",                                                    pdfName:"CUD-26-682107_Doc033_Affidavit_DefectiveProcess.pdf",                               type:"Declaration / Affidavit",             group:"F", fsx:"77260033" },
  { id:34, name:"Proof of Electronic Service — Jurisdictional Firewall",                                      pdfName:"CUD-26-682107_Doc034_POS_JurisdictionalFirewall.pdf",                               type:"Proof of Electronic Service",         group:"F", fsx:"77260034" },
  // ── Stack G — Agency Complaints & Cross-Action (Docs 35–38) ────────────────
  { id:35, name:"Complaint to California Dept. of Real Estate",                                               pdfName:"CUD-26-682107_Doc035_DRE_Complaint.pdf",                                            type:"Complaint",                           group:"G", fsx:"77260035" },
  { id:36, name:"Clinical Practice Abandonment Audit",                                                        pdfName:"CUD-26-682107_Doc036_BBS_Complaint.pdf",                                            type:"Report (Other)",                      group:"G", fsx:"77260036" },
  { id:37, name:"Cross-Complaint for Elder Abuse & Tortious Breach",                                          pdfName:"CUD-26-682107_Doc037_CrossComplaint_ElderAbuse.pdf",                                type:"Cross-Complaint",                     group:"G", fsx:"77260037" },
  { id:38, name:"Notice of Lodging Independent Civil Cross-Action",                                           pdfName:"CUD-26-682107_Doc038_Notice_Lodging_CrossAction.pdf",                               type:"Notice (Other)",                      group:"G", fsx:"77260038" },
  // ── Stack H — Forensic Omnibus & v5 Index (Docs 39–55) ─────────────────────
  { id:39, name:"Master Evidentiary Index & Trauma Registry",                                                 pdfName:"CUD-26-682107_Doc039_EvidenceIndex.pdf",                                            type:"Index (Other)",                       group:"H", fsx:"77260039" },
  { id:40, name:"Motion to Invoke Statutory Presumption of Retaliation [REVISED]",                            pdfName:"valoraiplus_CUD-26-682107_Doc40_REV_Motion_StatutoryPresumptionRetaliation.pdf",    type:"Motion (Other)",                      group:"H", fsx:"77260040" },
  { id:41, name:"Supplemental Facts and Agency Evidence",                                                     pdfName:"CUD-26-682107_Doc041_Supplemental_Facts.pdf",                                       type:"Declaration / Affidavit",             group:"H", fsx:"77260041" },
  { id:42, name:"Motion to Dismiss for Fraud on the Court",                                                   pdfName:"CUD-26-682107_Doc042_Motion_Dismiss_Fraud.pdf",                                     type:"Motion to Dismiss",                   group:"H", fsx:"77260042" },
  { id:43, name:"Notice of Depository and Final Evidence Lodging",                                            pdfName:"CUD-26-682107_Doc043_Notice_Depository.pdf",                                        type:"Notice (Other)",                      group:"H", fsx:"77260043" },
  { id:44, name:"Proof of Electronic Service — v5.0 Master Manifest Update",                                  pdfName:"CUD-26-682107_Doc044_POS_MasterManifest.pdf",                                       type:"Proof of Electronic Service",         group:"H", fsx:"77260044" },
  { id:45, name:"Notice of Filing Lodging — Master Evidence Locker",                                          pdfName:"CUD-26-682107_Doc045_Notice_FilingLodging.pdf",                                     type:"Notice (Other)",                      group:"H", fsx:"77260045" },
  { id:46, name:"Master Bundle Index v5.5 KODEX",                                                             pdfName:"CUD-26-682107_Doc046_MasterBundle_v55_KODEX.pdf",                                   type:"Index (Other)",                       group:"H", fsx:"77260046" },
  // ── Stack I — Forensic Dossier / Fee Waiver / Lodging / Constructive Eviction (May 19, 2026) ──
  { id:56, name:"Consolidated Forensic Dossier: Omnibus Statement of Evidentiary Facts (REVISED)",            pdfName:"CUD-26-682107_Doc056_Consolidated_Forensic_Dossier_v4.pdf",                         type:"Omnibus Statement / Evidentiary Record",group:"I", fsx:"77260056" },
  { id:57, name:"Application for Waiver of Court Fees and Costs (FW-001 Format) — R2",                        pdfName:"CUD-26-682107_Doc057A_FeeWaiver_FW001_R2.pdf",                                      type:"Fee Waiver Application",              group:"I", fsx:"77260057" },
  { id:59, name:"Notice of Lodging and Transmittal — Docs 56, 57 & 58; Mimecast Barrier Statement",          pdfName:"CUD-26-682107_Doc059_Notice_Lodging_Transmittal.pdf",                               type:"Notice (Other)",                      group:"I", fsx:"77260059" },
  { id:66, name:"Statement of Constructive Eviction: Two-Period Chronological Evidentiary Record",            pdfName:"CUD-26-682107_Doc066_Constructive_Eviction_Chronological_Record_R2.pdf",             type:"Statement / Evidentiary Record",      group:"I", fsx:"77260066" },
  // ── Stack J — ADA / MC-410 / Motion to Compel (May 21–22, 2026) ──────────
  { id:89, name:"Amended Notice of Unauthorized Representation; Motion to Compel Financial Disclosure (Retainer, Insurance, Bonding) — R2", pdfName:"CUD-26-682107_Doc089_R2_Amended_Motion_Compel_Financial_Disclosure.pdf", type:"Amended Motion", group:"J", fsx:"77260089" },
  { id:92, name:"Electronic Request for Reasonable Accommodation (MC-410); Attachment to Answer (UD-105) — Affirmative Defenses",           pdfName:"CUD-26-682107_Doc092_Electronic_MC410_RA_AffirmativeDefenses_UD105.pdf",  type:"MC-410 / Answer Attachment",          group:"J", fsx:"77260092" },
  { id:94, name:"Final Notice of Combined Electronic Submission; Expanded Distribution MC-410 / ADA E-Filing — R1",                          pdfName:"CUD-26-682107_Doc094_R1_Final_Notice_Expanded_Distribution_MC410.pdf",    type:"Notice (Other)",                      group:"J", fsx:"77260094" },
  // ── Stack K — ADA / Rule 1.100 Filing Accommodation; Dept 12; HUD Notice (May 26, 2026) ──
  { id:116,   name:"Motion for Reasonable Accommodation Regarding Filing Procedures; Electronic-Filing Accommodation; Non-Default Protection", pdfName:"CUD-26-682107_Doc116_Motion_RA_FilingProcedures.pdf",                     type:"Motion / Rule 1.100 Request",         group:"K", fsx:"77260116" },
  { id:1161,  name:"Technical Appendix to Doc 116-R1 — VALORAIPLUS Evidence Module Inventory (116A-R1)",                                      pdfName:"CUD-26-682107_Doc116A_R1_Technical_Appendix_VALORAIPLUS_EvidenceModules.pdf", type:"Technical Appendix",               group:"K", fsx:"77260116" },
  { id:1162,  name:"Proof of Service and Technical Transmission Certificate for Doc 116-R1 (116B-R1)",                                        pdfName:"CUD-26-682107_Doc116B_R1_ProofOfService_TechnicalTransmissionCert.pdf",   type:"Proof of Service / Certificate",      group:"K", fsx:"77260116" },
  { id:117,   name:"Lead Notice: VTU Secretary Communications; ADA Coordinator Transmission; Dept 12 Notice; Related Protective Case CCH-28-589086", pdfName:"CUD-26-682107_Doc117_VTU_Secretary_Lead_Notice_ADA_Dept12.pdf",  type:"Lead Notice",                         group:"K", fsx:"77260117" },
  { id:120,   name:"Notice of Dependent Adult Abuse Concerns; Mandated-Reporter Review; ADA/FEHA Non-Compliance; Request for Immediate Access Protection", pdfName:"CUD-26-682107_Doc120_DepAdult_MandatedReporter_ADA_FEHA_Notice.pdf", type:"Notice (Other)", group:"K", fsx:"77260120" },
  { id:121,   name:"Urgent Notice: HUD Regulatory Compliance; Mandated-Reporter Review; ADA/FEHA Meaningful Access; Request for Procedural Estoppel / Pause", pdfName:"CUD-26-682107_Doc121_HUD_MandatedReporter_ADA_Estoppel.pdf", type:"Notice (Other)",  group:"K", fsx:"77260121" },
]

const GROUP_LABELS: Record<string, string> = {
  A: "Stack A — Answer & Initial Filings (1–5)",
  B: "Stack B — Stay of Proceedings (6–10)",
  C: "Stack C — Demurrer (11–15)",
  D: "Stack D — Motion to Strike (16–20)",
  E: "Stack E — Habitability & Accommodation (21–27)",
  F: "Stack F — Jurisdictional Firewall (28–34)",
  G: "Stack G — Agency Complaints & Cross-Action (35–38)",
  H: "Stack H — Forensic Omnibus & v5 KODEX Index (39–46)",
  I: "Stack I — Forensic Dossier / Fee Waiver / Constructive Eviction (56, 57, 59, 66) ★ Filed May 19, 2026",
  J: "Stack J — ADA Accommodation / MC-410 / Motion to Compel Financial Disclosure (89, 92, 94) ★ Filed May 21–22, 2026",
  K: "Stack K — Rule 1.100 / ADA / Dept 12 / HUD Notices (116, 116A, 116B, 117, 120, 121) ★ Filed May 26, 2026",
}

async function downloadDoc(id: number, pdfName: string) {
  const res = await fetch(`/api/court/generate-pdf?id=${id}`)
  if (!res.ok) throw new Error(await res.text())
  const blob = await res.blob()
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = pdfName
  a.click()
  URL.revokeObjectURL(url)
}

function downloadText(filename: string, text: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function PDFDownloadPanel() {
  const [downloading, setDownloading] = useState<Set<number>>(new Set())
  const [done, setDone]               = useState<Set<number>>(new Set())
  const [allBusy, setAllBusy]         = useState(false)
  const [provBusy, setProvBusy]       = useState(false)
  const [masterRoot, setMasterRoot]   = useState<string | null>(null)
  const [provCount, setProvCount]     = useState(0)

  const handleProvenance = async () => {
    setProvBusy(true)
    try {
      // Hash every document in the registry and build the Master Root.
      const exhibits = DOCS.map(d => d.id)
      const res = await fetch('/api/court/provenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibits }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setMasterRoot(data.master_root_hash)
      setProvCount(data.exhibit_count)
      const stamp = new Date().toISOString().slice(0, 10)
      downloadText(`CUD-26-682107_Forensic_Provenance_Declaration_${stamp}.txt`, data.declaration_text)
      downloadText(`CUD-26-682107_evidence_manifest_${stamp}.txt`, data.manifest_text)
      downloadText(
        `CUD-26-682107_hash_register_${stamp}.json`,
        JSON.stringify({ master_root_hash: data.master_root_hash, manifest: data.manifest, register: data.register }, null, 2),
        'application/json',
      )
    } catch (e) {
      console.error('[v0] provenance generation failed:', e)
    } finally {
      setProvBusy(false)
    }
  }

  const handleSingle = async (doc: DocMeta) => {
    setDownloading(prev => new Set(prev).add(doc.id))
    try {
      await downloadDoc(doc.id, doc.pdfName)
      setDone(prev => new Set(prev).add(doc.id))
    } finally {
      setDownloading(prev => { const s = new Set(prev); s.delete(doc.id); return s })
    }
  }

  const handleAll = async () => {
    setAllBusy(true)
    for (const doc of DOCS) {
      setDownloading(prev => new Set(prev).add(doc.id))
      try {
        await downloadDoc(doc.id, doc.pdfName)
        setDone(prev => new Set(prev).add(doc.id))
      } catch {}
      setDownloading(prev => { const s = new Set(prev); s.delete(doc.id); return s })
      await new Promise(r => setTimeout(r, 300))
    }
    setAllBusy(false)
  }

  const TOTAL = DOCS.length
  const groups = ['A','B','C','D','E','F','G','H','I','J','K']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-mono font-bold text-white">RapidLegal PDF Engine — v5.5 KODEX + Filed Docs Registry</h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Case CUD-26-682107 &bull; Dept 12 &bull; Judge Michelle Tong &bull; {TOTAL} Documents &bull; SFefiling@sftc.org
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleProvenance}
            disabled={provBusy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-mono font-bold text-sm transition"
          >
            {provBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {provBusy ? 'Hashing & Sealing...' : 'Provenance Declaration'}
          </button>
          <button
            onClick={handleAll}
            disabled={allBusy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-bold text-sm transition"
          >
            {allBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {allBusy ? `Generating All ${TOTAL}...` : `Download All ${TOTAL} PDFs`}
          </button>
        </div>
      </div>

      {masterRoot && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 font-mono text-xs space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="h-4 w-4" />
            FORENSIC PROVENANCE SEALED — {provCount} EXHIBITS HASHED (SHA-256)
          </div>
          <div className="text-emerald-300">
            Master Root Hash:&nbsp;
            <span className="text-emerald-200 break-all select-all">{masterRoot}</span>
          </div>
          <div className="text-emerald-300/70">
            Declaration, sha256sum manifest, and JSON hash register downloaded. Re-verify any exhibit with
            &nbsp;<span className="text-emerald-200">sha256sum &lt;filename&gt;</span>.
          </div>
        </div>
      )}

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 font-mono text-xs text-amber-300 space-y-0.5">
        <div className="font-bold text-amber-400">FSX COMPLIANCE ACTIVE — REAL FILED DOCS REGISTRY</div>
        <div>Stacks A–H: KODEX baseline (Docs 1–46) &bull; Stacks I–K: Actual filed PDFs (Docs 56–121)</div>
        <div>Court: SF Superior &bull; Case No. CUD-26-682107 on all pages &bull; Related: CCH-28-589086</div>
        <div>ADA Coordinator: C. Joy Guandique &bull; jguandique@sftc.org &bull; Rule 1.100 accommodations active</div>
      </div>

      {done.size > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-400 font-mono">
            <span>{done.size} of {TOTAL} generated</span>
            <span>{Math.round((done.size / TOTAL) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${(done.size / TOTAL) * 100}%` }}
            />
          </div>
        </div>
      )}

      {groups.map(g => {
        const groupDocs = DOCS.filter(d => d.group === g)
        if (groupDocs.length === 0) return null
        const isRealFiled = ['I','J','K'].includes(g)
        return (
          <div key={g} className={`rounded-lg border overflow-hidden ${isRealFiled ? 'border-emerald-500/40' : 'border-zinc-800'}`}>
            <div className={`px-4 py-2 border-b flex items-center gap-2 ${isRealFiled ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
              {isRealFiled && <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">FILED PDF</span>}
              <span className={`font-mono text-xs font-bold ${isRealFiled ? 'text-emerald-300' : 'text-zinc-300'}`}>{GROUP_LABELS[g]}</span>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {groupDocs.map(doc => {
                const busy  = downloading.has(doc.id)
                const ready = done.has(doc.id)
                return (
                  <div key={doc.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-900/60 transition">
                    <span className="text-xs text-zinc-600 font-mono w-8 shrink-0">
                      {doc.id === 1161 ? '116A' : doc.id === 1162 ? '116B' : doc.id}
                    </span>
                    <FileText className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-200 truncate">{doc.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        FSX: {doc.fsx} &bull; {doc.type}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSingle(doc)}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition shrink-0
                        bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50"
                    >
                      {busy   ? <Loader2 className="h-3 w-3 animate-spin" /> :
                       ready  ? <CheckCircle className="h-3 w-3 text-emerald-400" /> :
                                <Download className="h-3 w-3" />}
                      {busy ? 'Gen...' : ready ? 'Done' : 'PDF'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Printer className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-mono font-bold text-zinc-300">Terminal Print Commands</span>
        </div>
        <div className="space-y-1 font-mono text-[10px] text-zinc-400">
          <p className="text-zinc-500"># macOS / Linux — print individual</p>
          <p className="text-emerald-400">{'lpr <filename>.pdf'}</p>
          <p className="text-zinc-500 mt-2"># Print all 46 at once (run from download folder)</p>
          <p className="text-emerald-400">{'for f in valoraiplus_*.pdf; do lpr "$f"; done'}</p>
          <p className="text-zinc-500 mt-2"># Windows PowerShell</p>
          <p className="text-emerald-400 break-all">{'Get-ChildItem -Filter "valoraiplus_*.pdf" | ForEach-Object { Start-Process $_.FullName -Verb Print }'}</p>
        </div>
      </div>
    </div>
  )
}
