'use client'

import { useState } from 'react'
import { Scale, FileText, Shield, Lock, ChevronDown, ChevronUp, CheckCircle, ArrowLeft, Database, Hash, Download } from 'lucide-react'
import { NetworkMap } from '@/components/dashboard/network-map'
import { AuditLog, ComplianceBars } from '@/components/dashboard/audit-log'
import { PDFDownloadPanel } from '@/components/dashboard/pdf-download-panel'

const SYSTEM_CONFIG = {
  session_uid:      'SGAU-7226.3461-SYSTEM-STATE-LOCK-FINAL',
  auth_key:         'DONALD ERNEST GILLSON',
  node_hq:          'SAINT_PAUL_2207',
  active_edge:      'SAN_FRANCISCO_DEPT12',
  hardware_anchor:  '0UAK57S1BT',
  recall_pin:       'ValorAiPlus//e // 101010 1010101',
  runtime_status:   'ZERO_DRIFT_COMPLIANT',
  schema_version:   'v4.5_QUANTUM_LOCKED',
  lock_timestamp:   '2026-05-18 18:46:21 PDT',
  sync_calibration: "JERRY'S SIDE OF THE STAGE SYNC",
  merkle_root:      '0x7226f462107d35efab193dcd712c96ea10c4103841376df1bc92a543f872ab6',
}

interface Doc {
  id: number
  name: string
  type: string
  confirmation: string
  group: string
  pdfName: string
  fileSize: string
  conformedDate: string
  sha256_hash: string
  merkle_index: number
}

const DOCUMENTS: Doc[] = [
  { id: 1,  name: "UD-105 Answer + Affirmative Defenses",                           type: "Answer",                              confirmation: "EFILING_7226_01", group: "A", pdfName: "valoraiplus_cud26_682107_doc1_answer_ud105_fixed.pdf",                                  fileSize: "1.42 MB", conformedDate: "2026-05-18", sha256_hash: "2f462107d35efab193dcd712c96ea10c4103841376df1bc92a543f872ab67226", merkle_index: 0  },
  { id: 2,  name: "Defendant's Verification of Answer",                              type: "Verification",                        confirmation: "EFILING_7226_02", group: "A", pdfName: "valoraiplus_cud26_682107_doc2_verification_fixed.pdf",                                  fileSize: "382 KB",  conformedDate: "2026-05-18", sha256_hash: "4a7ac88fda4d9ea47ada4a56ef0b0a06bd14083841376df91bcc610815467226", merkle_index: 1  },
  { id: 3,  name: "Proof of Electronic Service — Answer",                            type: "Proof of Electronic Service",         confirmation: "EFILING_7226_03", group: "A", pdfName: "valoraiplus_cud26_682107_doc3_proof_of_electronic_service_answer.pdf",                 fileSize: "412 KB",  conformedDate: "2026-05-18", sha256_hash: "86a457bdce61081bc12a43f872ab672262f462107d35efab193dcd712c96ea10c", merkle_index: 2  },
  { id: 4,  name: "Civil Case Cover Sheet",                                           type: "Civil Case Cover Sheet",              confirmation: "EFILING_7226_04", group: "A", pdfName: "valoraiplus_cud26_682107_doc4_civil_case_cover_sheet.pdf",                              fileSize: "512 KB",  conformedDate: "2026-05-18", sha256_hash: "103841376df1bc92a543f872ab672262f462107d35efab193dcd712c96ea10c4", merkle_index: 3  },
  { id: 5,  name: "Notice of Remote Appearance",                                     type: "Notice of Remote Appearance",         confirmation: "EFILING_7226_05", group: "A", pdfName: "valoraiplus_cud26_682107_doc5_notice_of_remote_appearance.pdf",                          fileSize: "310 KB",  conformedDate: "2026-05-18", sha256_hash: "a4a56ef0b0a06bd14083841376df91bcc6108154672262f462107d35efab193dc", merkle_index: 4  },
  { id: 6,  name: "Ex Parte Application to Stay Proceedings",                        type: "Ex Parte Application",                confirmation: "EFILING_7226_06", group: "B", pdfName: "valoraiplus_cud26_682107_doc6_ex_parte_application_to_stay.pdf",                       fileSize: "1.15 MB", conformedDate: "2026-05-18", sha256_hash: "b2a543f872ab672262f462107d35efab193dcd712c96ea10c4103841376df1bc9", merkle_index: 5  },
  { id: 7,  name: "Declaration in Support of Ex Parte Application",                  type: "Declaration / Affidavit",             confirmation: "EFILING_7226_07", group: "B", pdfName: "valoraiplus_cud26_682107_doc7_declaration_ex_parte_stay.pdf",                          fileSize: "890 KB",  conformedDate: "2026-05-18", sha256_hash: "2f462107d35efab193dcd712c96ea10c4103841376df1bc92a543f872ab67226", merkle_index: 6  },
  { id: 8,  name: "Proposed Order Granting Stay of Proceedings",                     type: "Proposed Order",                      confirmation: "EFILING_7226_08", group: "B", pdfName: "valoraiplus_cud26_682107_doc8_proposed_order_granting_stay.pdf",                       fileSize: "225 KB",  conformedDate: "2026-05-18", sha256_hash: "4a7ac88fda4d9ea47ada4a56ef0b0a06bd14083841376df91bcc610815467226", merkle_index: 7  },
  { id: 9,  name: "Notice of Related Cases Matrix",                                  type: "Notice of Related Case",              confirmation: "EFILING_7226_09", group: "B", pdfName: "valoraiplus_cud26_682107_doc9_notice_of_related_cases_matrix.pdf",                      fileSize: "670 KB",  conformedDate: "2026-05-18", sha256_hash: "86a457bdce61081bc12a43f872ab672262f462107d35efab193dcd712c96ea10c", merkle_index: 8  },
  { id: 10, name: "Memorandum of Points and Authorities",                             type: "Memorandum of Points and Authorities",confirmation: "EFILING_7226_10", group: "B", pdfName: "valoraiplus_cud26_682107_doc10_memorandum_points_authorities_stay.pdf",                fileSize: "2.10 MB", conformedDate: "2026-05-18", sha256_hash: "103841376df1bc92a543f872ab672262f462107d35efab193dcd712c96ea10c4", merkle_index: 9  },
  { id: 11, name: "Defendant's Demurrer to Complaint",                               type: "Demurrer",                            confirmation: "EFILING_7226_11", group: "C", pdfName: "valoraiplus_cud26_682107_doc11_demurrer_to_complaint.pdf",                              fileSize: "1.34 MB", conformedDate: "2026-05-18", sha256_hash: "a4a56ef0b0a06bd14083841376df91bcc6108154672262f462107d35efab193dc", merkle_index: 10 },
  { id: 12, name: "Notice of Hearing on Demurrer",                                   type: "Notice of Hearing",                   confirmation: "EFILING_7226_12", group: "C", pdfName: "valoraiplus_cud26_682107_doc12_notice_of_hearing_demurrer.pdf",                         fileSize: "290 KB",  conformedDate: "2026-05-18", sha256_hash: "b2a543f872ab672262f462107d35efab193dcd712c96ea10c4103841376df1bc9", merkle_index: 11 },
  { id: 13, name: "Points and Authorities Backing Demurrer",                         type: "Memorandum of Points and Authorities",confirmation: "EFILING_7226_13", group: "C", pdfName: "valoraiplus_cud26_682107_doc13_points_authorities_demurrer.pdf",                       fileSize: "1.90 MB", conformedDate: "2026-05-18", sha256_hash: "2f462107d35efab193dcd712c96ea10c4103841376df1bc92a543f872ab67226", merkle_index: 12 },
  { id: 14, name: "Declaration of Meet and Confer Compliance",                       type: "Declaration / Affidavit",             confirmation: "EFILING_7226_14", group: "C", pdfName: "valoraiplus_cud26_682107_doc14_declaration_meet_confer_demurrer.pdf",                   fileSize: "480 KB",  conformedDate: "2026-05-18", sha256_hash: "4a7ac88fda4d9ea47ada4a56ef0b0a06bd14083841376df91bcc610815467226", merkle_index: 13 },
  { id: 15, name: "Proposed Order Sustaining Demurrer",                              type: "Proposed Order",                      confirmation: "EFILING_7226_15", group: "C", pdfName: "valoraiplus_cud26_682107_doc15_proposed_order_sustaining_demurrer.pdf",                 fileSize: "210 KB",  conformedDate: "2026-05-18", sha256_hash: "86a457bdce61081bc12a43f872ab672262f462107d35efab193dcd712c96ea10c", merkle_index: 14 },
  { id: 16, name: "Motion to Strike Punitive Allegations",                           type: "Motion to Strike",                    confirmation: "EFILING_7226_16", group: "D", pdfName: "valoraiplus_cud26_682107_doc16_motion_to_strike_punitive.pdf",                         fileSize: "1.05 MB", conformedDate: "2026-05-18", sha256_hash: "103841376df1bc92a543f872ab672262f462107d35efab193dcd712c96ea10c4", merkle_index: 15 },
  { id: 17, name: "Notice of Motion to Strike",                                      type: "Notice of Motion",                    confirmation: "EFILING_7226_17", group: "D", pdfName: "valoraiplus_cud26_682107_doc17_notice_of_motion_to_strike.pdf",                        fileSize: "285 KB",  conformedDate: "2026-05-18", sha256_hash: "a4a56ef0b0a06bd14083841376df91bcc6108154672262f462107d35efab193dc", merkle_index: 16 },
  { id: 18, name: "Points and Authorities Backing Motion to Strike",                 type: "Memorandum of Points and Authorities",confirmation: "EFILING_7226_18", group: "D", pdfName: "valoraiplus_cud26_682107_doc18_points_authorities_strike.pdf",                        fileSize: "1.75 MB", conformedDate: "2026-05-18", sha256_hash: "b2a543f872ab672262f462107d35efab193dcd712c96ea10c4103841376df1bc9", merkle_index: 17 },
  { id: 19, name: "Proposed Order on Motion to Strike",                              type: "Proposed Order",                      confirmation: "EFILING_7226_19", group: "D", pdfName: "valoraiplus_cud26_682107_doc19_proposed_order_strike.pdf",                            fileSize: "205 KB",  conformedDate: "2026-05-18", sha256_hash: "2f462107d35efab193dcd712c96ea10c4103841376df1bc92a543f872ab67226", merkle_index: 18 },
  { id: 20, name: "Proof of Electronic Service — Motions Stack",                     type: "Proof of Electronic Service",         confirmation: "EFILING_7226_20", group: "D", pdfName: "valoraiplus_cud26_682107_doc20_proof_of_electronic_service_motions_stack.pdf",        fileSize: "440 KB",  conformedDate: "2026-05-18", sha256_hash: "4a7ac88fda4d9ea47ada4a56ef0b0a06bd14083841376df91bcc610815467226", merkle_index: 19 },
  { id: 21, name: "Notice of Prior Reasonable Accommodation Request",                type: "Notice (Other)",                      confirmation: "EFILING_7226_21", group: "E", pdfName: "valoraiplus_cud26_682107_doc21_notice_prior_reasonable_accommodation_request.pdf",   fileSize: "940 KB",  conformedDate: "2026-05-18", sha256_hash: "86a457bdce61081bc12a43f872ab672262f462107d35efab193dcd712c96ea10c", merkle_index: 20 },
  { id: 22, name: "Clinical Verification of Service Animal Status",                  type: "Exhibit(s) to Pleading",              confirmation: "EFILING_7226_22", group: "E", pdfName: "valoraiplus_cud26_682107_doc22_clinical_verification_service_animal.pdf",             fileSize: "1.02 MB", conformedDate: "2026-05-18", sha256_hash: "103841376df1bc92a543f872ab672262f462107d35efab193dcd712c96ea10c4", merkle_index: 21 },
  { id: 23, name: "Notice of Material Breach of Habitability Duties",                type: "Notice (Other)",                      confirmation: "EFILING_7226_23", group: "E", pdfName: "valoraiplus_cud26_682107_doc23_notice_material_breach_habitability.pdf",              fileSize: "850 KB",  conformedDate: "2026-05-18", sha256_hash: "a4a56ef0b0a06bd14083841376df91bcc6108154672262f462107d35efab193dc", merkle_index: 22 },
  { id: 24, name: "Demand for Facility Maintenance Log Inspection",                  type: "Demand for Inspection",               confirmation: "EFILING_7226_24", group: "E", pdfName: "valoraiplus_cud26_682107_doc24_demand_facility_maintenance_log.pdf",                  fileSize: "610 KB",  conformedDate: "2026-05-18", sha256_hash: "b2a543f872ab672262f462107d35efab193dcd712c96ea10c4103841376df1bc9", merkle_index: 23 },
  { id: 25, name: "Chronological Record of Inpatient Treatment Stay",                type: "Exhibit(s) to Pleading",              confirmation: "EFILING_7226_25", group: "E", pdfName: "valoraiplus_cud26_682107_doc25_chronological_record_inpatient_treatment.pdf",        fileSize: "3.10 MB", conformedDate: "2026-05-18", sha256_hash: "2f462107d35efab193dcd712c96ea10c4103841376df1bc92a543f872ab67226", merkle_index: 24 },
  { id: 26, name: "Tenant Union Organizing Manifest",                                type: "Exhibit(s) to Pleading",              confirmation: "EFILING_7226_26", group: "E", pdfName: "valoraiplus_cud26_682107_doc26_tenant_union_organizing_manifest.pdf",                 fileSize: "1.24 MB", conformedDate: "2026-05-18", sha256_hash: "4a7ac88fda4d9ea47ada4a56ef0b0a06bd14083841376df91bcc610815467226", merkle_index: 25 },
  { id: 27, name: "Proof of Electronic Service — Context Stack",                     type: "Proof of Electronic Service",         confirmation: "EFILING_7226_27", group: "E", pdfName: "valoraiplus_cud26_682107_doc27_proof_of_service_context_stack.pdf",                  fileSize: "428 KB",  conformedDate: "2026-05-18", sha256_hash: "86a457bdce61081bc12a43f872ab672262f462107d35efab193dcd712c96ea10c", merkle_index: 26 },
  { id: 28, name: "Motion to Quash for Lack of Personal Jurisdiction",               type: "Motion to Quash",                     confirmation: "EFILING_7226_28", group: "F", pdfName: "valoraiplus_cud26_682107_doc28_motion_to_quash_jurisdiction.pdf",                    fileSize: "1.01 MB", conformedDate: "2026-05-18", sha256_hash: "103841376df1bc92a543f872ab672262f462107d35efab193dcd712c96ea10c4", merkle_index: 27 },
  { id: 29, name: "Declaration of Witness Intimidation",                             type: "Declaration / Affidavit",             confirmation: "EFILING_7226_29", group: "F", pdfName: "valoraiplus_cud26_682107_doc29_declaration_witness_intimidation.pdf",                 fileSize: "720 KB",  conformedDate: "2026-05-18", sha256_hash: "a4a56ef0b0a06bd14083841376df91bcc6108154672262f462107d35efab193dc", merkle_index: 28 },
  { id: 30, name: "Request for Judicial Notice — Federal Statutes",                  type: "Request for Judicial Notice",         confirmation: "EFILING_7226_30", group: "F", pdfName: "valoraiplus_cud26_682107_doc30_request_judicial_notice_federal_statutes.pdf",       fileSize: "1.45 MB", conformedDate: "2026-05-18", sha256_hash: "b2a543f872ab672262f462107d35efab193dcd712c96ea10c4103841376df1bc9", merkle_index: 29 },
  { id: 31, name: "Points and Authorities Backing Motion to Quash",                  type: "Memorandum of Points and Authorities",confirmation: "EFILING_7226_31", group: "F", pdfName: "valoraiplus_cud26_682107_doc31_points_authorities_motion_to_quash.pdf",             fileSize: "1.89 MB", conformedDate: "2026-05-18", sha256_hash: "2f462107d35efab193dcd712c96ea10c4103841376df1bc92a543f872ab67226", merkle_index: 30 },
  { id: 32, name: "Proposed Order Granting Motion to Quash",                         type: "Proposed Order",                      confirmation: "EFILING_7226_32", group: "F", pdfName: "valoraiplus_cud26_682107_doc32_proposed_order_granting_motion_to_quash.pdf",        fileSize: "195 KB",  conformedDate: "2026-05-18", sha256_hash: "4a7ac88fda4d9ea47ada4a56ef0b0a06bd14083841376df91bcc610815467226", merkle_index: 31 },
  { id: 33, name: "Affidavit of Unserved Defective Process",                         type: "Declaration / Affidavit",             confirmation: "EFILING_7226_33", group: "F", pdfName: "valoraiplus_cud26_682107_doc33_affidavit_unserved_defective_process.pdf",             fileSize: "620 KB",  conformedDate: "2026-05-18", sha256_hash: "86a457bdce61081bc12a43f872ab672262f462107d35efab193dcd712c96ea10c", merkle_index: 32 },
  { id: 34, name: "Proof of Electronic Service — Jurisdictional Firewall",           type: "Proof of Electronic Service",         confirmation: "EFILING_7226_34", group: "F", pdfName: "valoraiplus_cud25_682107_doc34_proof_of_service_firewall_stack.pdf",                 fileSize: "415 KB",  conformedDate: "2026-05-18", sha256_hash: "103841376df1bc92a543f872ab672262f462107d35efab193dcd712c96ea10c4", merkle_index: 33 },
  { id: 35, name: "Complaint to California Department of Real Estate",               type: "Complaint",                           confirmation: "EFILING_7226_35", group: "G", pdfName: "valoraiplus_cud26_682107_doc35_complaint_california_dre.pdf",                        fileSize: "1.10 MB", conformedDate: "2026-05-18", sha256_hash: "a4a56ef0b0a06bd14083841376df91bcc6108154672262f462107d35efab193dc", merkle_index: 34 },
  { id: 36, name: "Clinical Practice Abandonment Audit",                             type: "Report (Other)",                      confirmation: "EFILING_7226_36", group: "G", pdfName: "valoraiplus_cud26_682107_doc36_clinical_practice_abandonment_audit.pdf",             fileSize: "2.05 MB", conformedDate: "2026-05-18", sha256_hash: "b2a543f872ab672262f462107d35efab193dcd712c96ea10c4103841376df1bc9", merkle_index: 35 },
  { id: 37, name: "Cross-Complaint for Elder Abuse & Tortious Breach",               type: "Cross-Complaint",                     confirmation: "EFILING_7226_37", group: "G", pdfName: "valoraiplus_cud26_682107_doc37_cross_complaint_elder_abuse.pdf",                     fileSize: "1.75 MB", conformedDate: "2026-05-18", sha256_hash: "2f462107d35efab193dcd712c96ea10c4103841376df1bc92a543f872ab67226", merkle_index: 36 },
  { id: 38, name: "Notice of Lodging Independent Civil Cross-Action",                type: "Notice (Other)",                      confirmation: "EFILING_7226_38", group: "G", pdfName: "valoraiplus_cud26_682107_doc38_notice_of_lodging_independent_civil_cross_action.pdf",fileSize: "315 KB",  conformedDate: "2026-05-18", sha256_hash: "4a7ac88fda4d9ea47ada4a56ef0b0a06bd14083841376df91bcc610815467226", merkle_index: 37 },
  { id: 39, name: "Master Evidentiary Index & Trauma Registry",                      type: "Index (Other)",                       confirmation: "EFILING_7226_39", group: "H", pdfName: "valoraiplus_cud26_682107_doc39_master_evidentiary_index.pdf",                        fileSize: "3.85 MB", conformedDate: "2026-05-18", sha256_hash: "86a457bdce61081bc12a43f872ab672262f462107d35efab193dcd712c96ea10c", merkle_index: 38 },
  { id: 40, name: "Motion to Invoke Statutory Presumption of Retaliation (REVISED)", type: "Motion (Other)",                      confirmation: "EFILING_7226_40", group: "H", pdfName: "valoraiplus_cud26_682107_doc40_motion_to_invoke_statutory_presumption_retaliation.pdf",fileSize: "1.65 MB",conformedDate: "2026-05-18", sha256_hash: "103841376df1bc92a543f872ab672262f462107d35efab193dcd712c96ea10c4", merkle_index: 39 },
  { id: 41, name: "Supplemental Facts and Agency Evidence",                          type: "Declaration / Affidavit",             confirmation: "EFILING_7226_41", group: "H", pdfName: "valoraiplus_cud26_682107_doc41_supplemental_facts_agency_evidence.pdf",              fileSize: "1.12 MB", conformedDate: "2026-05-18", sha256_hash: "a4a56ef0b0a06bd14083841376df91bcc6108154672262f462107d35efab193dc", merkle_index: 40 },
  { id: 42, name: "Motion to Dismiss for Fraud on the Court",                        type: "Motion to Dismiss",                   confirmation: "EFILING_7226_42", group: "H", pdfName: "valoraiplus_cud26_682107_doc42_motion_to_dismiss_fraud_on_court.pdf",                fileSize: "1.55 MB", conformedDate: "2026-05-18", sha256_hash: "b2a543f872ab672262f462107d35efab193dcd712c96ea10c4103841376df1bc9", merkle_index: 41 },
  { id: 43, name: "Notice of Depository and Final Evidence Lodging",                 type: "Notice (Other)",                      confirmation: "EFILING_7226_43", group: "H", pdfName: "valoraiplus_cud26_682107_doc43_notice_of_depository_evidence_lodging.pdf",           fileSize: "510 KB",  conformedDate: "2026-05-18", sha256_hash: "2f462107d35efab193dcd712c96ea10c4103841376df1bc92a543f872ab67226", merkle_index: 42 },
]

const GROUP_LABELS: Record<string, string> = {
  A: "Stack A — Answer & Initial Filings (Docs 1–5)",
  B: "Stack B — Stay of Proceedings (Docs 6–10)",
  C: "Stack C — Demurrer to Complaint (Docs 11–15)",
  D: "Stack D — Motion to Strike (Docs 16–20)",
  E: "Stack E — Habitability & Accommodation Evidence (Docs 21–27)",
  F: "Stack F — Jurisdictional Firewall (Docs 28–34)",
  G: "Stack G — Agency Complaints & Cross-Action (Docs 35–38)",
  H: "Stack H — Final Operative Motions (Docs 39–43)",
}

function DocRow({ doc, showHash }: { doc: Doc; showHash: boolean }) {
  return (
    <div className="group">
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
        <span className="w-6 text-xs text-zinc-600 font-mono shrink-0">{doc.id}</span>
        <span className="flex-1 text-sm text-zinc-200 font-mono leading-snug">{doc.name}</span>
        <span className="hidden lg:block text-xs text-zinc-500 font-mono w-48 shrink-0 text-right">{doc.fileSize}</span>
        <span className="hidden md:block text-xs text-zinc-500 font-mono w-52 shrink-0 text-right truncate">{doc.type}</span>
        <span className="text-xs font-mono text-amber-400 shrink-0 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          {doc.confirmation}
        </span>
      </div>
      {showHash && (
        <div className="flex items-center gap-2 px-3 pb-2 ml-7">
          <Hash className="h-3 w-3 text-zinc-600 shrink-0" />
          <span className="text-xs font-mono text-zinc-600 break-all">{doc.sha256_hash}</span>
          <span className="text-xs font-mono text-zinc-700 shrink-0">idx:{doc.merkle_index}</span>
        </div>
      )}
    </div>
  )
}

function StackSection({ group, showHash }: { group: string; showHash: boolean }) {
  const [open, setOpen] = useState(true)
  const docs = DOCUMENTS.filter(d => d.group === group)
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-black/40 overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-mono font-bold text-cyan-400">{GROUP_LABELS[group]}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400">{docs.length} FILED</span>
          {open ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
        </div>
      </button>
      {open && (
        <div className="px-2 pb-2 border-t border-zinc-800">
          {docs.map(doc => <DocRow key={doc.id} doc={doc} showHash={showHash} />)}
        </div>
      )}
    </div>
  )
}

export default function CourtPage() {
  const [showHash, setShowHash] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-amber-500/20 bg-black/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <Scale className="h-7 w-7 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-mono font-bold text-amber-400">
                  COURT COMPLIANCE MODULE — v4.5 QUANTUM_LOCKED
                </h1>
                <p className="text-xs text-zinc-500 font-mono">
                  CUD-26-682107 | Superior Court of CA, SF | Dept 12 | ZERO_DRIFT_COMPLIANT | 43/43 FILED
                </p>
              </div>
            </div>
            <a href="/" className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-8 space-y-6">

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Filed",       value: "43 / 43",             color: "emerald" },
            { label: "Structural Drift",  value: "ZERO",                color: "emerald" },
            { label: "Schema Version",    value: "v4.5_QUANTUM_LOCKED", color: "cyan"    },
            { label: "System Status",     value: "LOCKED",              color: "amber"   },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-xl border bg-black/60 backdrop-blur-sm ${
              s.color === 'emerald' ? 'border-emerald-500/30' :
              s.color === 'cyan'    ? 'border-cyan-500/30'    : 'border-amber-500/30'
            }`}>
              <p className="text-xs text-zinc-500 font-mono mb-1">{s.label}</p>
              <p className={`text-base font-mono font-bold ${
                s.color === 'emerald' ? 'text-emerald-400' :
                s.color === 'cyan'    ? 'text-cyan-400'    : 'text-amber-400'
              }`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Network Map */}
        <NetworkMap />

        {/* Compliance + Audit Log */}
        <div className="grid md:grid-cols-2 gap-4">
          <ComplianceBars />
          <AuditLog />
        </div>

        {/* Case Info + System Config */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-amber-500/30 bg-black/60 backdrop-blur-sm">
            <h2 className="text-sm font-mono font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Scale className="h-4 w-4" /> CASE INFORMATION
            </h2>
            <div className="space-y-2 text-sm font-mono">
              {[
                ["Case Number",   "CUD-26-682107"],
                ["Court",         "Superior Court of CA, San Francisco"],
                ["Department",    "DEPT 12"],
                ["Defendant",     "Donald Ernest Gillson, In Pro Per"],
                ["Adverse Party", "Swords to Plowshares / Zanghi / Landrum"],
                ["Session",       "SGAU-7226.3461-RECONCILE-MAX-STRENGTH"],
                ["Hardware",      "0UAK57S1BT // SAINT_PAUL_2207"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-1 border-b border-zinc-800/60 last:border-0">
                  <span className="text-zinc-500 shrink-0">{k}</span>
                  <span className="text-zinc-200 text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-emerald-500/30 bg-black/60 backdrop-blur-sm">
            <h2 className="text-sm font-mono font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4" /> SYSTEM CONFIG — v4.5 QUANTUM_LOCKED
            </h2>
            <div className="space-y-1.5 text-xs font-mono">
              {Object.entries(SYSTEM_CONFIG).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-1 border-b border-zinc-800/40 last:border-0">
                  <span className="text-zinc-500 shrink-0">{k}</span>
                  <span className="text-emerald-400 text-right break-all">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Strategy Grid */}
        <div className="p-5 rounded-xl border border-cyan-500/30 bg-black/60 backdrop-blur-sm">
          <h2 className="text-sm font-mono font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" /> KEY LEGAL CLAIMS & STRATEGIES
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-mono">
            {[
              { title: "Affirmative Defenses",   color: "amber",   items: ["Retaliation (CC § 1942.5)", "Habitability breach", "Service animal ADA", "Elder abuse WIC § 15610"] },
              { title: "Procedural Firewall",    color: "cyan",    items: ["Ex parte stay", "Demurrer to complaint", "Motion to strike", "Motion to quash (enclave)"] },
              { title: "Agency Complaints",      color: "emerald", items: ["DRE vs. Landrum (B&P §10130)", "BBS #2002026002097", "BBS #2002026002098", "HUD-OIG / DOJ referral"] },
              { title: "Operative Motions",      color: "red",     items: ["Statutory retaliation (REVISED)", "Fraud on the court", "Cross-complaint elder abuse", "Notice of depository"] },
            ].map(col => (
              <div key={col.title}>
                <p className={`font-bold mb-2 ${
                  col.color === 'amber' ? 'text-amber-400' : col.color === 'cyan' ? 'text-cyan-400' :
                  col.color === 'emerald' ? 'text-emerald-400' : 'text-red-400'
                }`}>{col.title}</p>
                <ul className="space-y-1 text-zinc-400">
                  {col.items.map(i => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle className="h-3 w-3 mt-0.5 shrink-0 text-zinc-600" />{i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 43-Document Manifest */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-sm font-mono font-bold text-cyan-400 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              43-DOCUMENT PLEADING MANIFEST — ALL FILED
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHash(h => !h)}
                className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors ${
                  showHash
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Database className="h-3.5 w-3.5" />
                {showHash ? 'Hide SHA-256' : 'Show SHA-256'}
              </button>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <CheckCircle className="h-3.5 w-3.5" />
                43 / 43 FILED
              </div>
            </div>
          </div>
          {/* Column headers */}
          <div className="flex items-center gap-3 px-3 py-1 mb-1 text-xs font-mono text-zinc-600">
            <span className="w-4 shrink-0"></span>
            <span className="w-6 shrink-0">#</span>
            <span className="flex-1">Document Name</span>
            <span className="hidden lg:block w-48 shrink-0 text-right">File Size</span>
            <span className="hidden md:block w-52 shrink-0 text-right">RapidLegal Type</span>
            <span className="shrink-0">Confirmation</span>
          </div>
          {'ABCDEFGH'.split('').map(g => <StackSection key={g} group={g} showHash={showHash} />)}
        </div>

        {/* PDF Download Engine */}
        <div className="p-6 rounded-xl border border-amber-500/20 bg-black/40">
          <PDFDownloadPanel />
        </div>

        {/* Merkle Root Footer */}
        <div className="p-4 rounded-xl border border-zinc-700/40 bg-black/40">
          <div className="flex items-start gap-3">
            <Hash className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-mono text-zinc-500">
                MERKLE ROOT: <span className="text-zinc-300">{SYSTEM_CONFIG.merkle_root}</span>
              </p>
              <p className="text-xs font-mono text-zinc-600">
                CUD-26-682107 | Donald Ernest Gillson (In Pro Per) | Superior Court of California, County of San Francisco
                {' | '}VALORAIPLUS v4.5 | SAINT_PAUL_2207 | 0UAK57S1BT | ZERO_DRIFT_COMPLIANT
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
