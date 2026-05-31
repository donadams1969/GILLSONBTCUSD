-- ============================================================
-- VALORAIPLUS® v5.5 KODEX — SEED DATA (seed.sql)
-- Idempotent: safe to re-run via ON CONFLICT DO UPDATE
-- Case: CUD-26-682107 | Node: SAINT_PAUL_2207
-- ============================================================

SELECT public.valoraiplus_set_context();

-- ── TOKENS ─────────────────────────────────────────────────
INSERT INTO public.valoraiplus_tokens (symbol, name, description, token_type, status) VALUES
  ('VALOR',    'Valor Core Token',        'Primary sovereign governance token',           'SOVEREIGN',    'ACTIVE'),
  ('FED.CLAIM','Federal Claim Token',     'Qui tam relator evidence backing',             'CLAIM',        'ACTIVE'),
  ('WHISTLE',  'Whistleblower Token',     'Protected disclosure registry',                'PROTECTION',   'ACTIVE'),
  ('QUI.TAM',  'Qui Tam Token',           'False Claims Act action tracker',              'LEGAL',        'ACTIVE'),
  ('GHOST.OPS','Ghost Operations Token',  'Covert surveillance tracker',                  'INTELLIGENCE', 'ACTIVE'),
  ('NEWT',     'Newt Protocol Token',     'Neural witness testimony anchor',              'EVIDENCE',     'ACTIVE'),
  ('DAO.GOV',  'DAO Governance Token',    'Decentralized authority voting',               'GOVERNANCE',   'ACTIVE')
ON CONFLICT (symbol) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  status      = EXCLUDED.status,
  updated_at  = NOW();

-- ── AUTHORIZED NODES ───────────────────────────────────────
INSERT INTO public.valoraiplus_authorized_nodes (node_id, node_name, location, hardware_anchor, is_active) VALUES
  ('SAINT_PAUL_2207',  'Saint Paul HQ Node',                   'Saint Paul, MN',    '0UAK57S1BT',             TRUE),
  ('CSULB_ACADEMIC',   'CSULB Academic Trust',                  'Long Beach, CA',    'GILLSON_ACADEMIC_TRUST', TRUE),
  ('PRESIDIO_WATCH',   'Presidio Federal Enclave Monitor',      'San Francisco, CA', 'PRESIDIO_FED_ENCLAVE',   TRUE),
  ('SF_COURT_RELAY',   'SF Superior Court Relay — Dept 12',     'San Francisco, CA', 'DEPT_12_RELAY',          TRUE)
ON CONFLICT (node_id) DO UPDATE SET
  node_name       = EXCLUDED.node_name,
  is_active       = EXCLUDED.is_active,
  last_sync       = NOW();

-- ── FEDERAL LEDGER ─────────────────────────────────────────
INSERT INTO public.valoraiplus_federal_ledger (agency_code, agency_name, wave, status, evidence_hash) VALUES
  ('HUD-OIG', 'HUD Office of Inspector General',         1, 'ACTIVE',  'QmHUD_OIG_EVIDENCE_HASH_001'),
  ('DOJ',     'Department of Justice',                   1, 'ACTIVE',  'QmDOJ_EVIDENCE_HASH_002'),
  ('FTC',     'Federal Trade Commission',                2, 'ACTIVE',  'QmFTC_EVIDENCE_HASH_003'),
  ('SEC',     'Securities and Exchange Commission',      2, 'ACTIVE',  'QmSEC_EVIDENCE_HASH_004'),
  ('CFPB',    'Consumer Financial Protection Bureau',    3, 'PENDING', 'QmCFPB_EVIDENCE_HASH_005')
ON CONFLICT (agency_code) DO UPDATE SET
  status        = EXCLUDED.status,
  evidence_hash = EXCLUDED.evidence_hash,
  updated_at    = NOW();

-- ── NFT ASSETS ─────────────────────────────────────────────
INSERT INTO public.valoraiplus_nft_assets (symbol, name, description, collateral_uci, status) VALUES
  ('$CSULB2207', 'VALORAIPLUS OMEGA NFT',  'Primary sovereign collateral — GILLSON_ACADEMIC_TRUST backing', 467525700.00, 'MINTED_CLOSED_LOOP'),
  ('$DONNY',     'Donny Guardian NFT',     'donadams1969.eth / donnygillson.eth identity anchor',            1000000.00,   'ACTIVE'),
  ('$JAXX',      'Jaxx Protection NFT',    'Protected dependent welfare and safety anchor',                  500000.00,    'ACTIVE')
ON CONFLICT (symbol) DO UPDATE SET
  collateral_uci = EXCLUDED.collateral_uci,
  status         = EXCLUDED.status,
  updated_at     = NOW();

-- ── SYSTEM CONFIG ──────────────────────────────────────────
INSERT INTO public.valoraiplus_system_config (key, value) VALUES
  ('session_uid',     'SGAU-7226.3461-SYSTEM-STATE-LOCK-FINAL'),
  ('auth_key',        'DONALD ERNEST GILLSON'),
  ('node',            'SAINT_PAUL_2207'),
  ('hardware_anchor', '0UAK57S1BT'),
  ('recall_pin',      'ValorAiPlus//e // 101010 1010101'),
  ('runtime_status',  'KODEX_LOCKED'),
  ('schema_version',  'v5.5'),
  ('case_number',     'CUD-26-682107'),
  ('related_case',    'CCH-28-589086'),
  ('dept',            '12'),
  ('court',           'Superior Court of California, County of San Francisco'),
  ('inquiry_email',   'SFefiling@sftc.org'),
  ('lock_timestamp',   NOW()::TEXT)
ON CONFLICT (key) DO UPDATE SET
  value      = EXCLUDED.value,
  updated_at = NOW();

-- ── INTELLIGENCE REPORTS ───────────────────────────────────
INSERT INTO public.valoraiplus_intelligence_reports (report_type, title, content, severity, source_node) VALUES
  ('SYSTEM',         'v5.5 KODEX Schema Initialized',              'All VALORAIPLUS tables created and seeded for CUD-26-682107',                                           'INFO',     'SAINT_PAUL_2207'),
  ('COURT',          'Department 12 Filing Status',                 '46 baseline documents in KODEX + Stacks I-K filed PDFs ready for RapidLegal FSX submission',           'INFO',     'SF_COURT_RELAY'),
  ('FEDERAL',        'HUD-OIG Evidence Package Prepared',           'Federal housing fraud evidence compiled for qui tam consideration under 31 U.S.C. § 3730',             'HIGH',     'SAINT_PAUL_2207'),
  ('GHOST_PROTOCOL', 'Mimecast Barrier Detected',                   'Email communications to STP management intercepted/filtered at corporate gateway — logged',            'HIGH',     'PRESIDIO_WATCH'),
  ('GHOST_PROTOCOL', 'Witness Intimidation Pattern — Coordinated', 'Suppression activity detected: Chance Agathoni + Colby Lowsik coordinated per Dec filed Doc 029',      'CRITICAL', 'SAINT_PAUL_2207'),
  ('ADA',            'Rule 1.100 Accommodation Active',             'ADA Coordinator C. Joy Guandique notified. MC-410 Doc 092 submitted. Dept 12 notice filed Doc 117',    'INFO',     'SF_COURT_RELAY'),
  ('REGULATORY',     'DRE Complaint Filed — William Landrum',       'Unlicensed real estate practice complaint filed. Doc 035 in registry.',                                 'HIGH',     'SAINT_PAUL_2207'),
  ('REGULATORY',     'BBS Complaints Filed — Clinical Abandonment', 'BBS Complaints #2002026002097 and #2002026002098 filed against Colby Lowsik. Doc 036 in registry.',    'HIGH',     'SAINT_PAUL_2207')
ON CONFLICT DO NOTHING;

-- ── COURT DOCUMENTS — v5.5 KODEX 46-DOC BASELINE ──────────
INSERT INTO public.valoraiplus_court_documents
  (name, file_name, status, filed_date, confirmation_number, fsx_transaction_number, sf_doc_type_code, rapidlegal_doc_type, case_number)
VALUES
  -- Stack A
  ('UD-105 Answer + Affirmative Defenses',                           'CUD-26-682107_Doc001_UD105_Answer.pdf',              'FILED', NOW(), 'EFILING_7226_01',  '77260001', 'ANS',  'Answer',                              'CUD-26-682107'),
  ('Defendant''s Verification of Answer',                            'CUD-26-682107_Doc002_Verification.pdf',              'FILED', NOW(), 'EFILING_7226_02',  '77260002', 'VER',  'Verification',                        'CUD-26-682107'),
  ('Proof of Electronic Service — Answer',                           'CUD-26-682107_Doc003_POS_Answer.pdf',                'FILED', NOW(), 'EFILING_7226_03',  '77260003', 'POS',  'Proof of Electronic Service',         'CUD-26-682107'),
  ('Civil Case Cover Sheet',                                         'CUD-26-682107_Doc004_CivilCaseCoverSheet.pdf',       'FILED', NOW(), 'EFILING_7226_04',  '77260004', 'CM-010','Civil Case Cover Sheet',             'CUD-26-682107'),
  ('Notice of Remote Appearance',                                    'CUD-26-682107_Doc005_NoticeRemoteAppearance.pdf',    'FILED', NOW(), 'EFILING_7226_05',  '77260005', 'NOT',  'Notice of Remote Appearance',         'CUD-26-682107'),
  -- Stack B
  ('Ex Parte Application to Stay Proceedings',                       'CUD-26-682107_Doc006_ExParte_Stay.pdf',              'FILED', NOW(), 'EFILING_7226_06',  '77260006', 'MOT',  'Ex Parte Application',                'CUD-26-682107'),
  ('Declaration in Support of Ex Parte Application',                 'CUD-26-682107_Doc007_Dec_ExParte.pdf',               'FILED', NOW(), 'EFILING_7226_07',  '77260007', 'DEC',  'Declaration / Affidavit',             'CUD-26-682107'),
  ('Proposed Order Granting Stay of Proceedings',                    'CUD-26-682107_Doc008_ProposedOrder_Stay.pdf',        'FILED', NOW(), 'EFILING_7226_08',  '77260008', 'ORD',  'Proposed Order',                      'CUD-26-682107'),
  ('Notice of Related Cases Matrix',                                 'CUD-26-682107_Doc009_NoticeRelatedCases.pdf',        'FILED', NOW(), 'EFILING_7226_09',  '77260009', 'NOT',  'Notice of Related Case',              'CUD-26-682107'),
  ('Memorandum of Points and Authorities — Stay',                    'CUD-26-682107_Doc010_MPA_Stay.pdf',                  'FILED', NOW(), 'EFILING_7226_10',  '77260010', 'MPA',  'Memorandum of Points and Authorities','CUD-26-682107'),
  -- Stack C
  ('Defendant''s Demurrer to Complaint',                             'CUD-26-682107_Doc011_Demurrer.pdf',                  'FILED', NOW(), 'EFILING_7226_11',  '77260011', 'DEM',  'Demurrer',                            'CUD-26-682107'),
  ('Notice of Hearing on Demurrer',                                  'CUD-26-682107_Doc012_NoticeHearing_Demurrer.pdf',    'FILED', NOW(), 'EFILING_7226_12',  '77260012', 'NOT',  'Notice of Hearing',                   'CUD-26-682107'),
  ('Points and Authorities — Demurrer',                              'CUD-26-682107_Doc013_MPA_Demurrer.pdf',              'FILED', NOW(), 'EFILING_7226_13',  '77260013', 'MPA',  'Memorandum of Points and Authorities','CUD-26-682107'),
  ('Declaration of Meet and Confer Compliance',                      'CUD-26-682107_Doc014_Dec_MeetConfer.pdf',            'FILED', NOW(), 'EFILING_7226_14',  '77260014', 'DEC',  'Declaration / Affidavit',             'CUD-26-682107'),
  ('Proposed Order Sustaining Demurrer',                             'CUD-26-682107_Doc015_ProposedOrder_Demurrer.pdf',    'FILED', NOW(), 'EFILING_7226_15',  '77260015', 'ORD',  'Proposed Order',                      'CUD-26-682107'),
  -- Stack D
  ('Motion to Strike Punitive Allegations',                          'CUD-26-682107_Doc016_MotionStrike.pdf',              'FILED', NOW(), 'EFILING_7226_16',  '77260016', 'MOT',  'Motion to Strike',                    'CUD-26-682107'),
  ('Notice of Motion to Strike',                                     'CUD-26-682107_Doc017_NoticeMotion_Strike.pdf',       'FILED', NOW(), 'EFILING_7226_17',  '77260017', 'NOT',  'Notice of Motion',                    'CUD-26-682107'),
  ('Points and Authorities — Motion to Strike',                      'CUD-26-682107_Doc018_MPA_Strike.pdf',                'FILED', NOW(), 'EFILING_7226_18',  '77260018', 'MPA',  'Memorandum of Points and Authorities','CUD-26-682107'),
  ('Proposed Order on Motion to Strike',                             'CUD-26-682107_Doc019_ProposedOrder_Strike.pdf',      'FILED', NOW(), 'EFILING_7226_19',  '77260019', 'ORD',  'Proposed Order',                      'CUD-26-682107'),
  ('Proof of Electronic Service — Motions Stack',                    'CUD-26-682107_Doc020_POS_MotionsStack.pdf',          'FILED', NOW(), 'EFILING_7226_20',  '77260020', 'POS',  'Proof of Electronic Service',         'CUD-26-682107'),
  -- Stack E
  ('Notice of Prior Reasonable Accommodation Request',               'CUD-26-682107_Doc021_Notice_PriorAccommodation.pdf', 'FILED', NOW(), 'EFILING_7226_21',  '77260021', 'NOT',  'Notice (Other)',                      'CUD-26-682107'),
  ('Clinical Verification of Service Animal Status',                 'CUD-26-682107_Doc022_ClinicalVerification.pdf',      'FILED', NOW(), 'EFILING_7226_22',  '77260022', 'DEC',  'Exhibit(s) to Pleading',              'CUD-26-682107'),
  ('Notice of Material Breach of Habitability Duties',               'CUD-26-682107_Doc023_Habitability_Breach.pdf',       'FILED', NOW(), 'EFILING_7226_23',  '77260023', 'NOT',  'Notice (Other)',                      'CUD-26-682107'),
  ('Demand for Facility Maintenance Log Inspection',                 'CUD-26-682107_Doc024_Maintenance_Demand.pdf',        'FILED', NOW(), 'EFILING_7226_24',  '77260024', 'DEC',  'Demand for Inspection',               'CUD-26-682107'),
  ('Chronological Record of Inpatient Treatment Stay',               'CUD-26-682107_Doc025_Inpatient_Timeline.pdf',        'FILED', NOW(), 'EFILING_7226_25',  '77260025', 'DEC',  'Exhibit(s) to Pleading',              'CUD-26-682107'),
  ('Tenant Union Organizing Manifest',                               'CUD-26-682107_Doc026_TenantUnion_Manifest.pdf',      'FILED', NOW(), 'EFILING_7226_26',  '77260026', 'DEC',  'Exhibit(s) to Pleading',              'CUD-26-682107'),
  ('Proof of Electronic Service — Context Stack',                    'CUD-26-682107_Doc027_POS_ContextStack.pdf',          'FILED', NOW(), 'EFILING_7226_27',  '77260027', 'POS',  'Proof of Electronic Service',         'CUD-26-682107'),
  -- Stack F
  ('Motion to Quash for Lack of Personal Jurisdiction',              'CUD-26-682107_Doc028_MotionQuash.pdf',               'FILED', NOW(), 'EFILING_7226_28',  '77260028', 'MOT',  'Motion to Quash',                     'CUD-26-682107'),
  ('Declaration of Witness Intimidation',                            'CUD-26-682107_Doc029_Dec_WitnessIntimidation.pdf',   'FILED', NOW(), 'EFILING_7226_29',  '77260029', 'DEC',  'Declaration / Affidavit',             'CUD-26-682107'),
  ('Request for Judicial Notice — Federal Statutes',                 'CUD-26-682107_Doc030_RJN_FederalStatutes.pdf',       'FILED', NOW(), 'EFILING_7226_30',  '77260030', 'RJN',  'Request for Judicial Notice',         'CUD-26-682107'),
  ('Points and Authorities — Motion to Quash',                       'CUD-26-682107_Doc031_MPA_Quash.pdf',                 'FILED', NOW(), 'EFILING_7226_31',  '77260031', 'MPA',  'Memorandum of Points and Authorities','CUD-26-682107'),
  ('Proposed Order Granting Motion to Quash',                        'CUD-26-682107_Doc032_ProposedOrder_Quash.pdf',       'FILED', NOW(), 'EFILING_7226_32',  '77260032', 'ORD',  'Proposed Order',                      'CUD-26-682107'),
  ('Affidavit of Unserved Defective Process',                        'CUD-26-682107_Doc033_Affidavit_DefectiveProcess.pdf','FILED', NOW(), 'EFILING_7226_33',  '77260033', 'DEC',  'Declaration / Affidavit',             'CUD-26-682107'),
  ('Proof of Electronic Service — Jurisdictional Firewall',          'CUD-26-682107_Doc034_POS_JurisdictionalFirewall.pdf','FILED', NOW(), 'EFILING_7226_34',  '77260034', 'POS',  'Proof of Electronic Service',         'CUD-26-682107'),
  -- Stack G
  ('Complaint to California Dept. of Real Estate — William Landrum', 'CUD-26-682107_Doc035_DRE_Complaint.pdf',             'FILED', NOW(), 'EFILING_7226_35',  '77260035', 'COMP', 'Complaint',                           'CUD-26-682107'),
  ('Clinical Practice Abandonment Audit — BBS Complaints',          'CUD-26-682107_Doc036_BBS_Complaints.pdf',            'FILED', NOW(), 'EFILING_7226_36',  '77260036', 'DEC',  'Report (Other)',                      'CUD-26-682107'),
  ('Cross-Complaint for Elder Abuse & Tortious Breach',              'CUD-26-682107_Doc037_CrossComplaint_ElderAbuse.pdf', 'FILED', NOW(), 'EFILING_7226_37',  '77260037', 'XCOMP','Cross-Complaint',                    'CUD-26-682107'),
  ('Notice of Lodging Independent Civil Cross-Action',               'CUD-26-682107_Doc038_Notice_Lodging_CrossAction.pdf','FILED', NOW(), 'EFILING_7226_38',  '77260038', 'NOT',  'Notice (Other)',                      'CUD-26-682107'),
  -- Stack H
  ('Master Evidentiary Index & Trauma Registry',                     'CUD-26-682107_Doc039_EvidenceIndex.pdf',             'FILED', NOW(), 'EFILING_7226_39',  '77260039', 'IDX',  'Index (Other)',                       'CUD-26-682107'),
  ('Motion to Invoke Statutory Presumption of Retaliation [REVISED]','CUD-26-682107_Doc040_Motion_StatutoryPresumption.pdf','FILED',NOW(), 'EFILING_7226_40', '77260040', 'MOT',  'Motion (Other)',                      'CUD-26-682107'),
  ('Supplemental Facts and Agency Evidence',                         'CUD-26-682107_Doc041_Supplemental_Facts.pdf',        'FILED', NOW(), 'EFILING_7226_41',  '77260041', 'DEC',  'Declaration / Affidavit',             'CUD-26-682107'),
  ('Motion to Dismiss for Fraud on the Court',                       'CUD-26-682107_Doc042_Motion_Dismiss_Fraud.pdf',      'FILED', NOW(), 'EFILING_7226_42',  '77260042', 'MOT',  'Motion to Dismiss',                   'CUD-26-682107'),
  ('Notice of Depository and Final Evidence Lodging',                'CUD-26-682107_Doc043_Notice_Depository.pdf',         'FILED', NOW(), 'EFILING_7226_43',  '77260043', 'NOT',  'Notice (Other)',                      'CUD-26-682107'),
  ('Proof of Electronic Service — v5.0 Master Manifest',             'CUD-26-682107_Doc044_POS_MasterManifest.pdf',        'FILED', NOW(), 'EFILING_7226_44',  '77260044', 'POS',  'Proof of Electronic Service',         'CUD-26-682107'),
  ('Notice of Filing Lodging — Master Evidence Locker',              'CUD-26-682107_Doc045_Notice_FilingLodging.pdf',      'FILED', NOW(), 'EFILING_7226_45',  '77260045', 'NOT',  'Notice (Other)',                      'CUD-26-682107'),
  ('Master Bundle Index v5.5 KODEX',                                 'CUD-26-682107_Doc046_MasterBundle_v55.pdf',          'FILED', NOW(), 'EFILING_7226_46',  '77260046', 'IDX',  'Index (Other)',                       'CUD-26-682107'),
  -- Stack I (Filed May 19, 2026)
  ('Consolidated Forensic Dossier: Omnibus Statement of Evidentiary Facts (REVISED)', 'CUD-26-682107_Doc056_Consolidated_Forensic_Dossier_v4.pdf', 'FILED', '2026-05-19', 'EFILING_7226_56', '77260056', 'DEC', 'Omnibus Statement / Evidentiary Record', 'CUD-26-682107'),
  ('Application for Waiver of Court Fees and Costs (FW-001) — R2',  'CUD-26-682107_Doc057A_FeeWaiver_FW001_R2.pdf',       'FILED', '2026-05-19', 'EFILING_7226_57', '77260057', 'NOT',  'Fee Waiver Application',              'CUD-26-682107'),
  ('Notice of Lodging and Transmittal — Docs 56, 57 & 58',          'CUD-26-682107_Doc059_Notice_Lodging_Transmittal.pdf', 'FILED', '2026-05-19', 'EFILING_7226_59', '77260059', 'NOT',  'Notice (Other)',                      'CUD-26-682107'),
  ('Statement of Constructive Eviction: Two-Period Chronological Record', 'CUD-26-682107_Doc066_Constructive_Eviction_R2.pdf', 'FILED', '2026-05-19', 'EFILING_7226_66', '77260066', 'DEC', 'Statement / Evidentiary Record',     'CUD-26-682107'),
  -- Stack J (Filed May 21-22, 2026)
  ('Amended Notice of Unauthorized Representation; Motion to Compel Financial Disclosure — R2', 'CUD-26-682107_Doc089_R2_Motion_Compel_Financial_Disclosure.pdf', 'FILED', '2026-05-21', 'EFILING_7226_89', '77260089', 'MOT', 'Amended Motion', 'CUD-26-682107'),
  ('Electronic Request for Reasonable Accommodation (MC-410); Attachment to Answer (UD-105)', 'CUD-26-682107_Doc092_MC410_RA_AffirmativeDefenses.pdf', 'FILED', '2026-05-22', 'EFILING_7226_92', '77260092', 'NOT', 'MC-410 / Answer Attachment', 'CUD-26-682107'),
  ('Final Notice of Combined Electronic Submission; Expanded Distribution MC-410 / ADA — R1', 'CUD-26-682107_Doc094_R1_Final_Notice_Expanded_Distribution.pdf', 'FILED', '2026-05-22', 'EFILING_7226_94', '77260094', 'NOT', 'Notice (Other)', 'CUD-26-682107'),
  -- Stack K (Filed May 26, 2026)
  ('Motion for Reasonable Accommodation Regarding Filing Procedures; Non-Default Protection', 'CUD-26-682107_Doc116_Motion_RA_FilingProcedures.pdf', 'FILED', '2026-05-26', 'EFILING_7226_116', '77260116', 'MOT', 'Motion / Rule 1.100 Request', 'CUD-26-682107'),
  ('Technical Appendix to Doc 116-R1 — VALORAIPLUS Evidence Module Inventory (116A-R1)', 'CUD-26-682107_Doc116A_R1_Technical_Appendix_VALORAIPLUS.pdf', 'FILED', '2026-05-26', 'EFILING_7226_116A', '77260116', 'DEC', 'Technical Appendix', 'CUD-26-682107'),
  ('Proof of Service and Technical Transmission Certificate for Doc 116-R1 (116B-R1)', 'CUD-26-682107_Doc116B_R1_ProofOfService_TransmissionCert.pdf', 'FILED', '2026-05-26', 'EFILING_7226_116B', '77260116', 'POS', 'Proof of Service / Certificate', 'CUD-26-682107'),
  ('Lead Notice: VTU Secretary; ADA Coordinator Transmission; Dept 12; Related Case CCH-28-589086', 'CUD-26-682107_Doc117_VTU_Secretary_Lead_Notice_ADA_Dept12.pdf', 'FILED', '2026-05-26', 'EFILING_7226_117', '77260117', 'NOT', 'Lead Notice', 'CUD-26-682107'),
  ('Notice of Dependent Adult Abuse Concerns; Mandated-Reporter Review; ADA/FEHA Non-Compliance', 'CUD-26-682107_Doc120_DepAdult_MandatedReporter_ADA_FEHA.pdf', 'FILED', '2026-05-26', 'EFILING_7226_120', '77260120', 'NOT', 'Notice (Other)', 'CUD-26-682107'),
  ('Urgent Notice: HUD Regulatory Compliance; Mandated-Reporter Review; ADA/FEHA Meaningful Access', 'CUD-26-682107_Doc121_HUD_MandatedReporter_ADA_Estoppel.pdf', 'FILED', '2026-05-26', 'EFILING_7226_121', '77260121', 'NOT', 'Notice (Other)', 'CUD-26-682107')
ON CONFLICT (file_name) DO UPDATE SET
  name                  = EXCLUDED.name,
  status                = EXCLUDED.status,
  fsx_transaction_number = EXCLUDED.fsx_transaction_number,
  sf_doc_type_code      = EXCLUDED.sf_doc_type_code,
  rapidlegal_doc_type   = EXCLUDED.rapidlegal_doc_type,
  updated_at            = NOW();

-- ── VERIFICATION ───────────────────────────────────────────
SELECT 'valoraiplus_tokens'             AS tbl, COUNT(*) AS rows FROM public.valoraiplus_tokens
UNION ALL
SELECT 'valoraiplus_authorized_nodes',          COUNT(*) FROM public.valoraiplus_authorized_nodes
UNION ALL
SELECT 'valoraiplus_federal_ledger',            COUNT(*) FROM public.valoraiplus_federal_ledger
UNION ALL
SELECT 'valoraiplus_intelligence_reports',      COUNT(*) FROM public.valoraiplus_intelligence_reports
UNION ALL
SELECT 'valoraiplus_court_documents',           COUNT(*) FROM public.valoraiplus_court_documents
UNION ALL
SELECT 'valoraiplus_nft_assets',                COUNT(*) FROM public.valoraiplus_nft_assets
UNION ALL
SELECT 'valoraiplus_system_config',             COUNT(*) FROM public.valoraiplus_system_config
ORDER BY tbl;
