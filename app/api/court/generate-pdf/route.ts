import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib'

// FSX transaction number map — 8-digit, prefix 77
const FSX_MAP: Record<number, string> = {
  1:'77260001', 2:'77260002', 3:'77260003', 4:'77260004', 5:'77260005',
  6:'77260006', 7:'77260007', 8:'77260008', 9:'77260009', 10:'77260010',
  11:'77260011', 12:'77260012', 13:'77260013', 14:'77260014', 15:'77260015',
  16:'77260016', 17:'77260017', 18:'77260018', 19:'77260019', 20:'77260020',
  21:'77260021', 22:'77260022', 23:'77260023', 24:'77260024', 25:'77260025',
  26:'77260026', 27:'77260027', 28:'77260028', 29:'77260029', 30:'77260030',
  31:'77260031', 32:'77260032', 33:'77260033', 34:'77260034', 35:'77260035',
  36:'77260036', 37:'77260037', 38:'77260038', 39:'77260039', 40:'77260040',
  41:'77260041', 42:'77260042', 43:'77260043',
  44:'77260044', 45:'77260045', 46:'77260046',
  // Stack I — Forensic Dossier / Fee Waiver / Constructive Eviction (May 19, 2026)
  56:'77260056', 57:'77260057', 59:'77260059', 66:'77260066',
  // Stack J — ADA / MC-410 / Motion to Compel (May 21–22, 2026)
  89:'77260089', 92:'77260092', 94:'77260094',
  // Stack K — Rule 1.100 / ADA / Dept 12 / HUD Notices (May 26, 2026)
  116:'77260116', 1161:'77260116', 1162:'77260116',
  117:'77260117', 120:'77260120', 121:'77260121',
}

// SF Superior Court FSX approved document type codes — aligned to SFSC registry
// Stack A: Answer Package
// Stack B: Ex Parte Stay
// Stack C: Demurrer
// Stack D: Motion to Strike
// Stack E: Accommodation / Habitability
// Stack F: Motion to Quash
// Stack G: Agency Complaints & Cross-Complaint
// Stack H: Final Operative Motions
const DOC_TYPE_MAP: Record<number, string> = {
  1:'ANS',   2:'VER',   3:'POS',  4:'CM-010', 5:'NOT',
  6:'MOT',   7:'DEC',   8:'ORD',  9:'NOT',    10:'MPA',
  11:'DEM',  12:'NOT',  13:'MPA', 14:'DEC',   15:'ORD',
  16:'MOT',  17:'NOT',  18:'MPA', 19:'ORD',   20:'POS',
  21:'NOT',  22:'DEC',  23:'NOT', 24:'DEC',   25:'DEC',
  26:'DEC',  27:'POS',  28:'MOT', 29:'DEC',   30:'RJN',
  31:'MPA',  32:'ORD',  33:'DEC', 34:'POS',   35:'COMP',
  36:'DEC',  37:'XCOMP',38:'NOT', 39:'IDX',   40:'MOT',
  41:'DEC',  42:'MOT',  43:'NOT',
  44:'POS',  45:'NOT',  46:'IDX',
  // Stack I
  56:'STMT', 57:'FW-001', 59:'NOT', 66:'STMT',
  // Stack J
  89:'MOT',  92:'MC-410', 94:'NOT',
  // Stack K
  116:'MOT', 1161:'APX', 1162:'POS',
  117:'NOT', 120:'NOT',  121:'NOT',
}

const DOCS: Record<number, { name: string; pdfName: string; type: string }> = {
  1:  { name: "UD-105 Answer + Affirmative Defenses",                             pdfName: "valoraiplus_cud26_682107_doc01_answer.pdf",                                                      type: "Answer" },
  2:  { name: "Defendant's Verification of Answer",                               pdfName: "valoraiplus_cud26_682107_doc02_verification.pdf",                                                type: "Verification" },
  3:  { name: "Proof of Electronic Service — Answer",                             pdfName: "valoraiplus_cud26_682107_doc03_pos_answer.pdf",                                                  type: "Proof of Electronic Service" },
  4:  { name: "Civil Case Cover Sheet",                                           pdfName: "valoraiplus_cud26_682107_doc04_case_coversheet.pdf",                                             type: "Civil Case Cover Sheet" },
  5:  { name: "Notice of Remote Appearance",                                      pdfName: "valoraiplus_cud26_682107_doc05_notice_remote.pdf",                                               type: "Notice of Remote Appearance" },
  6:  { name: "Ex Parte Application to Stay Proceedings",                         pdfName: "valoraiplus_cud26_682107_doc06_ex_parte_stay.pdf",                                               type: "Ex Parte Application" },
  7:  { name: "Declaration in Support of Ex Parte Application",                   pdfName: "valoraiplus_cud26_682107_doc07_dec_stay.pdf",                                                    type: "Declaration / Affidavit" },
  8:  { name: "Proposed Order Granting Stay of Proceedings",                      pdfName: "valoraiplus_cud26_682107_doc08_proposed_order_stay.pdf",                                        type: "Proposed Order" },
  9:  { name: "Notice of Related Cases Matrix",                                   pdfName: "valoraiplus_cud26_682107_doc09_notice_related.pdf",                                              type: "Notice of Related Case" },
  10: { name: "Memorandum of Points and Authorities",                             pdfName: "valoraiplus_cud26_682107_doc10_memorandum_pa.pdf",                                               type: "Memorandum of Points and Authorities" },
  11: { name: "Defendant's Demurrer to Complaint",                                pdfName: "valoraiplus_cud26_682107_doc11_demurrer.pdf",                                                    type: "Demurrer" },
  12: { name: "Notice of Hearing on Demurrer",                                    pdfName: "valoraiplus_cud26_682107_doc12_notice_demurrer.pdf",                                             type: "Notice of Hearing" },
  13: { name: "Points and Authorities Backing Demurrer",                          pdfName: "valoraiplus_cud26_682107_doc13_pa_demurrer.pdf",                                                 type: "Memorandum of Points and Authorities" },
  14: { name: "Declaration of Meet and Confer Compliance",                        pdfName: "valoraiplus_cud26_682107_doc14_meet_confer.pdf",                                                 type: "Declaration / Affidavit" },
  15: { name: "Proposed Order Sustaining Demurrer",                               pdfName: "valoraiplus_cud26_682107_doc15_proposed_order_demurrer.pdf",                                    type: "Proposed Order" },
  16: { name: "Motion to Strike Punitive Allegations",                            pdfName: "valoraiplus_cud26_682107_doc16_motion_strike.pdf",                                               type: "Motion to Strike" },
  17: { name: "Notice of Motion to Strike",                                       pdfName: "valoraiplus_cud26_682107_doc17_notice_strike.pdf",                                               type: "Notice of Motion" },
  18: { name: "Points and Authorities Backing Motion to Strike",                  pdfName: "valoraiplus_cud26_682107_doc18_pa_strike.pdf",                                                   type: "Memorandum of Points and Authorities" },
  19: { name: "Proposed Order on Motion to Strike",                               pdfName: "valoraiplus_cud26_682107_doc19_proposed_order_strike.pdf",                                      type: "Proposed Order" },
  20: { name: "Proof of Electronic Service — Motions Stack",                      pdfName: "valoraiplus_cud26_682107_doc20_pos_motions.pdf",                                                 type: "Proof of Electronic Service" },
  21: { name: "Notice of Prior Reasonable Accommodation Request",                 pdfName: "valoraiplus_cud26_682107_doc21_prior_accommodation.pdf",                                        type: "Notice (Other)" },
  22: { name: "Clinical Verification of Service Animal Status",                   pdfName: "valoraiplus_cud26_682107_doc22_clinical_verification.pdf",                                      type: "Exhibit(s) to Pleading" },
  23: { name: "Notice of Material Breach of Habitability Duties",                 pdfName: "valoraiplus_cud26_682107_doc23_habitability_breach.pdf",                                        type: "Notice (Other)" },
  24: { name: "Demand for Facility Maintenance Log Inspection",                   pdfName: "valoraiplus_cud26_682107_doc24_maintenance_demand.pdf",                                         type: "Demand for Inspection" },
  25: { name: "Chronological Record of Inpatient Treatment Stay",                 pdfName: "valoraiplus_cud26_682107_doc25_inpatient_timeline.pdf",                                         type: "Exhibit(s) to Pleading" },
  26: { name: "Tenant Union Organizing Manifest",                                 pdfName: "valoraiplus_cud26_682107_doc26_union_manifest.pdf",                                              type: "Exhibit(s) to Pleading" },
  27: { name: "Proof of Electronic Service — Context Stack",                      pdfName: "valoraiplus_cud26_682107_doc27_pos_context.pdf",                                                 type: "Proof of Electronic Service" },
  28: { name: "Motion to Quash for Lack of Personal Jurisdiction",                pdfName: "valoraiplus_cud26_682107_doc28_motion_quash.pdf",                                               type: "Motion to Quash" },
  29: { name: "Declaration of Witness Intimidation",                              pdfName: "valoraiplus_cud26_682107_doc29_intimidation_dec.pdf",                                           type: "Declaration / Affidavit" },
  30: { name: "Request for Judicial Notice — Federal Statutes",                   pdfName: "valoraiplus_cud26_682107_doc30_rjn_federal.pdf",                                                type: "Request for Judicial Notice" },
  31: { name: "Points and Authorities Backing Motion to Quash",                   pdfName: "valoraiplus_cud26_682107_doc31_pa_quash.pdf",                                                   type: "Memorandum of Points and Authorities" },
  32: { name: "Proposed Order Granting Motion to Quash",                          pdfName: "valoraiplus_cud26_682107_doc32_proposed_order_quash.pdf",                                      type: "Proposed Order" },
  33: { name: "Affidavit of Unserved Defective Process",                          pdfName: "valoraiplus_cud26_682107_doc33_service_defect.pdf",                                             type: "Declaration / Affidavit" },
  34: { name: "Proof of Electronic Service — Jurisdictional Firewall",            pdfName: "valoraiplus_cud26_682107_doc34_pos_firewall.pdf",                                               type: "Proof of Electronic Service" },
  35: { name: "Complaint to California Department of Real Estate",                pdfName: "valoraiplus_cud26_682107_doc35_dre_complaint.pdf",                                              type: "Complaint" },
  36: { name: "Clinical Practice Abandonment Audit",                              pdfName: "valoraiplus_cud26_682107_doc36_bbs_complaint.pdf",                                              type: "Report (Other)" },
  37: { name: "Cross-Complaint for Elder Abuse & Tortious Breach",                pdfName: "valoraiplus_cud26_682107_doc37_cross_complaint.pdf",                                            type: "Cross-Complaint" },
  38: { name: "Notice of Lodging Independent Civil Cross-Action",                 pdfName: "valoraiplus_cud26_682107_doc38_notice_lodging.pdf",                                             type: "Notice (Other)" },
  39: { name: "Master Evidentiary Index & Trauma Registry",                       pdfName: "valoraiplus_cud26_682107_doc39_evidence_index.pdf",                                             type: "Index (Other)" },
  40: { name: "Motion to Invoke Statutory Presumption of Retaliation (REVISED)",  pdfName: "valoraiplus_CUD-26-682107_Doc40_REV_Motion_StatutoryPresumptionRetaliation.pdf",               type: "Motion (Other)" },
  41: { name: "Supplemental Facts and Agency Evidence",                           pdfName: "valoraiplus_cud26_682107_doc41_supplemental_facts.pdf",                                         type: "Declaration / Affidavit" },
  42: { name: "Motion to Dismiss for Fraud on the Court",                         pdfName: "valoraiplus_cud26_682107_doc42_motion_dismiss_fraud.pdf",                                       type: "Motion to Dismiss" },
  43: { name: "Notice of Depository and Final Evidence Lodging",                  pdfName: "valoraiplus_cud26_682107_doc43_notice_depository.pdf",                                          type: "Notice (Other)" },
  44: { name: "Proof of Electronic Service — v5.0 Master Manifest Update",        pdfName: "valoraiplus_cud26_682107_doc44_pos_master_manifest.pdf",                                        type: "Proof of Electronic Service" },
  45: { name: "Notice of Filing Lodging — Master Evidence Locker",                pdfName: "valoraiplus_cud26_682107_doc45_notice_filing_lodging.pdf",                                      type: "Notice (Other)" },
  46: { name: "Master Bundle Index v5.5 KODEX",                                   pdfName: "valoraiplus_cud26_682107_doc46_master_bundle_v55.pdf",                                          type: "Index (Other)" },
  // ── Stack I — Forensic Dossier / Fee Waiver / Constructive Eviction (Filed May 19, 2026) ──
  56:  { name: "Consolidated Forensic Dossier: Omnibus Statement of Evidentiary Facts (REVISED)",            pdfName: "CUD-26-682107_Doc056_Consolidated_Forensic_Dossier_v4.pdf",                type: "Omnibus Statement / Evidentiary Record" },
  57:  { name: "Application for Waiver of Court Fees and Costs (FW-001 Format) — R2",                         pdfName: "CUD-26-682107_Doc057A_FeeWaiver_FW001_R2.pdf",                             type: "Fee Waiver Application" },
  59:  { name: "Notice of Lodging and Transmittal — Docs 56, 57 & 58; Mimecast Barrier Statement",           pdfName: "CUD-26-682107_Doc059_Notice_Lodging_Transmittal.pdf",                      type: "Notice (Other)" },
  66:  { name: "Statement of Constructive Eviction: Two-Period Chronological Evidentiary Record",            pdfName: "CUD-26-682107_Doc066_Constructive_Eviction_Chronological_Record_R2.pdf",   type: "Statement / Evidentiary Record" },
  // ── Stack J — ADA / MC-410 / Motion to Compel (Filed May 21–22, 2026) ──
  89:  { name: "Amended Notice of Unauthorized Representation; Motion to Compel Financial Disclosure (Retainer, Insurance, Bonding) — R2", pdfName: "CUD-26-682107_Doc089_R2_Amended_Motion_Compel_Financial_Disclosure.pdf", type: "Amended Motion" },
  92:  { name: "Electronic Request for Reasonable Accommodation (MC-410); Attachment to Answer (UD-105) — Affirmative Defenses",           pdfName: "CUD-26-682107_Doc092_Electronic_MC410_RA_AffirmativeDefenses_UD105.pdf",  type: "MC-410 / Answer Attachment" },
  94:  { name: "Final Notice of Combined Electronic Submission; Expanded Distribution MC-410 / ADA E-Filing — R1",                          pdfName: "CUD-26-682107_Doc094_R1_Final_Notice_Expanded_Distribution_MC410.pdf",    type: "Notice (Other)" },
  // ── Stack K — Rule 1.100 / ADA / Dept 12 / HUD Notices (Filed May 26, 2026) ──
  116:  { name: "Motion for Reasonable Accommodation Regarding Filing Procedures; Electronic-Filing Accommodation; Non-Default Protection", pdfName: "CUD-26-682107_Doc116_Motion_RA_FilingProcedures.pdf",                     type: "Motion / Rule 1.100 Request" },
  1161: { name: "Technical Appendix to Doc 116-R1 — VALORAIPLUS Evidence Module Inventory (116A-R1)",                                       pdfName: "CUD-26-682107_Doc116A_R1_Technical_Appendix_VALORAIPLUS_EvidenceModules.pdf", type: "Technical Appendix" },
  1162: { name: "Proof of Service and Technical Transmission Certificate for Doc 116-R1 (116B-R1)",                                         pdfName: "CUD-26-682107_Doc116B_R1_ProofOfService_TechnicalTransmissionCert.pdf",   type: "Proof of Service / Certificate" },
  117:  { name: "Lead Notice: VTU Secretary Communications; ADA Coordinator Transmission; Dept 12 Notice; Related Protective Case CCH-28-589086", pdfName: "CUD-26-682107_Doc117_VTU_Secretary_Lead_Notice_ADA_Dept12.pdf",      type: "Lead Notice" },
  120:  { name: "Notice of Dependent Adult Abuse Concerns; Mandated-Reporter Review; ADA/FEHA Non-Compliance; Request for Immediate Access Protection", pdfName: "CUD-26-682107_Doc120_DepAdult_MandatedReporter_ADA_FEHA_Notice.pdf", type: "Notice (Other)" },
  121:  { name: "Urgent Notice: HUD Regulatory Compliance; Mandated-Reporter Review; ADA/FEHA Meaningful Access; Request for Procedural Estoppel / Pause", pdfName: "CUD-26-682107_Doc121_HUD_MandatedReporter_ADA_Estoppel.pdf",       type: "Notice (Other)" },
}

async function buildPDF(docId: number): Promise<Uint8Array> {
  const doc    = DOCS[docId]
  const fsx    = FSX_MAP[docId]
  const dtype  = DOC_TYPE_MAP[docId]
  const caseNo = 'CUD-26-682107'
  const dept   = 'DEPARTMENT 12'
  const court  = 'SUPERIOR COURT OF CALIFORNIA, COUNTY OF SAN FRANCISCO'
  const filer  = 'Donald Ernest Gillson, In Pro Per Defendant'
  const inquiry = 'SFefiling@sftc.org'
  const now    = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const pdfDoc  = await PDFDocument.create()
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const mono    = await pdfDoc.embedFont(StandardFonts.Courier)

  // XMP metadata — FSX transaction number embedded in Producer and Subject
  pdfDoc.setTitle(`${doc.name} | ${caseNo}`)
  pdfDoc.setAuthor(filer)
  pdfDoc.setSubject(`${dtype} | FSX: ${fsx} | ${caseNo}`)
  pdfDoc.setKeywords([`FSX:${fsx}`, caseNo, dtype, 'RapidLegal', 'SFSC'])
  pdfDoc.setCreator('VALORAIPLUS PDF ENGINE v4.0')
  pdfDoc.setProducer(`FSX Transaction ${fsx}`)

  const W = PageSizes.Letter[0]  // 612
  const H = PageSizes.Letter[1]  // 792
  const M = 72 // 1-inch margins

  // ── PAGE 1 ──────────────────────────────────────────────────────────────
  const p1 = pdfDoc.addPage(PageSizes.Letter)

  // FSX Transaction block — top-right, 0.5" below caption boundary per spec
  const captionBottom = H - M          // 720
  const fsxY          = captionBottom - 36 // 0.5" = 684
  const fsxLabel = `FSX Transaction ID: ${fsx}`
  const fsxW     = bold.widthOfTextAtSize(fsxLabel, 9)
  p1.drawText(fsxLabel, { x: W - M - fsxW, y: fsxY, size: 9, font: bold, color: rgb(0, 0, 0) })

  const typeLabel = `Doc Type: ${dtype}`
  const typeW     = regular.widthOfTextAtSize(typeLabel, 8)
  p1.drawText(typeLabel, { x: W - M - typeW, y: fsxY - 14, size: 8, font: regular, color: rgb(0.3, 0.3, 0.3) })

  // Court caption — centered
  let y = H - M
  const drawCenter = (text: string, size: number, font = regular, color = rgb(0, 0, 0)) => {
    const tw = font.widthOfTextAtSize(text, size)
    p1.drawText(text, { x: (W - tw) / 2, y, size, font, color })
    y -= size + 4
  }

  drawCenter(court, 10, bold)
  y -= 4
  drawCenter(`Case No. ${caseNo}`, 10, bold)
  drawCenter(dept, 10, bold)
  y -= 12

  p1.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: rgb(0, 0, 0) })
  y -= 20

  drawCenter(doc.name.toUpperCase(), 12, bold)
  y -= 8
  drawCenter(`Document Type: ${doc.type}`, 10, regular, rgb(0.2, 0.2, 0.2))
  y -= 4
  drawCenter(`Filed by: ${filer}`, 10, regular)
  drawCenter(`Date: ${now}`, 10, regular)
  y -= 20

  const bodyLines = [
    `SUPERIOR COURT OF CALIFORNIA, COUNTY OF SAN FRANCISCO`,
    ``,
    `Case No.: ${caseNo}                          Department: 12`,
    `Document: ${doc.name}`,
    `FSX Transaction Number: ${fsx}`,
    `Document Type Code: ${dtype}`,
    `Filed By: ${filer}`,
    `Filing Date: ${now}`,
    ``,
    `TO THE HONORABLE COURT AND ALL PARTIES OF RECORD:`,
    ``,
    `Donald Ernest Gillson, appearing In Pro Per, respectfully submits this`,
    `${doc.type} in the above-captioned unlawful detainer matter.`,
    ``,
    `This document has been prepared in compliance with the San Francisco`,
    `Superior Court e-filing specifications and has been submitted through`,
    `the RapidLegal FSX pipeline under Transaction Number ${fsx}.`,
    ``,
    `All parties have been served electronically pursuant to California`,
    `Rules of Court, Rule 2.251.`,
    ``,
    `                              Respectfully submitted,`,
    ``,
    `Date: ${now}`,
    ``,
    `                              _________________________________`,
    `                              Donald Ernest Gillson`,
    `                              Defendant, In Pro Per`,
    `                              donadams1969.eth`,
  ]

  for (const line of bodyLines) {
    if (y < M + 60) break
    p1.drawText(line, { x: M, y, size: 10, font: regular, color: rgb(0, 0, 0) })
    y -= 16
  }

  // Footer — case number on every page
  p1.drawLine({ start: { x: M, y: M + 20 }, end: { x: W - M, y: M + 20 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) })
  p1.drawText(`${caseNo}  |  FSX: ${fsx}  |  ${doc.type}  |  Page 1`, {
    x: M, y: M + 6, size: 8, font: regular, color: rgb(0.4, 0.4, 0.4),
  })

  // ── PAGE 2 — PROOF OF SERVICE + INQUIRY COMPLIANCE BLOCK ────────────────
  const p2 = pdfDoc.addPage(PageSizes.Letter)
  let y2 = H - M

  p2.drawText(court, { x: M, y: y2, size: 9, font: bold, color: rgb(0, 0, 0) })
  y2 -= 14
  p2.drawText(`Case No. ${caseNo}  |  FSX: ${fsx}  |  ${dtype}`, { x: M, y: y2, size: 9, font: regular, color: rgb(0, 0, 0) })
  y2 -= 20

  p2.drawLine({ start: { x: M, y: y2 }, end: { x: W - M, y: y2 }, thickness: 1, color: rgb(0, 0, 0) })
  y2 -= 20

  p2.drawText('PROOF OF SERVICE (ELECTRONIC)', { x: M, y: y2, size: 11, font: bold, color: rgb(0, 0, 0) })
  y2 -= 18

  const posLines = [
    `I, Donald Ernest Gillson, declare under penalty of perjury under the laws`,
    `of the State of California that the foregoing document entitled:`,
    ``,
    `"${doc.name}"`,
    ``,
    `was electronically served on all counsel of record and parties via`,
    `the Court's approved e-filing system on ${now}, in compliance with`,
    `California Rules of Court, Rule 2.251(b).`,
    ``,
    `Executed on ${now}, at San Francisco, California.`,
    ``,
    `                              _________________________________`,
    `                              Donald Ernest Gillson`,
    `                              Defendant, In Pro Per`,
  ]

  for (const line of posLines) {
    p2.drawText(line, { x: M, y: y2, size: 10, font: regular, color: rgb(0, 0, 0) })
    y2 -= 16
  }

  // ── INQUIRY COMPLIANCE BLOCK — boxed, bottom of page 2 ──────────────────
  const boxY = M + 60
  const boxW = W - M * 2
  const boxH = 130

  p2.drawRectangle({
    x: M, y: boxY, width: boxW, height: boxH,
    borderWidth: 1.5, borderColor: rgb(0, 0, 0), color: rgb(0.97, 0.97, 0.97),
  })

  let by = boxY + boxH - 18
  const bLine = (text: string, sz: number, f = regular, center = false) => {
    if (center) {
      const tw = f.widthOfTextAtSize(text, sz)
      p2.drawText(text, { x: (W - tw) / 2, y: by, size: sz, font: f, color: rgb(0, 0, 0) })
    } else {
      p2.drawText(text, { x: M + 12, y: by, size: sz, font: f, color: rgb(0, 0, 0) })
    }
    by -= sz + 6
  }

  bLine('================================================================', 7, mono, true)
  bLine('COURT INQUIRY COMPLIANCE', 10, bold, true)
  bLine('All official clerk inquiries regarding the processing, status, or', 8, regular, true)
  bLine('amendment of this filing must be routed to the approved channel:', 8, regular, true)
  bLine(inquiry, 11, bold, true)
  bLine(`Reference FSX Transaction Number: ${fsx}`, 9, mono, true)
  bLine('================================================================', 7, mono, true)

  // Footer page 2
  p2.drawLine({ start: { x: M, y: M + 20 }, end: { x: W - M, y: M + 20 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) })
  p2.drawText(`${caseNo}  |  FSX: ${fsx}  |  ${doc.type}  |  Page 2`, {
    x: M, y: M + 6, size: 8, font: regular, color: rgb(0.4, 0.4, 0.4),
  })

  return pdfDoc.save()
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') ?? '0', 10)

  if (!id || !DOCS[id]) {
    return NextResponse.json(
      { error: `Document ID ${id} not found. Valid IDs: ${Object.keys(DOCS).join(', ')}.` },
      { status: 404 }
    )
  }

  const bytes    = await buildPDF(id)
  const filename = DOCS[id].pdfName

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      bytes.length.toString(),
      'X-FSX-Transaction':   FSX_MAP[id],
      'X-Case-Number':       'CUD-26-682107',
      'X-Doc-Type-Code':     DOC_TYPE_MAP[id],
    },
  })
}
