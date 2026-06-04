-- ============================================================
-- VALORAIPLUS® v5.5 KODEX — GOLDEN SOURCE MIGRATION
-- Case: CUD-26-682107 | Node: SAINT_PAUL_2207
-- Generated: 2026-05-27 | Schema version: v5.5
-- ============================================================

-- ── 1. TOKENS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.valoraiplus_tokens (
  id          SERIAL PRIMARY KEY,
  symbol      TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  token_type  TEXT NOT NULL DEFAULT 'SOVEREIGN',
  status      TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.valoraiplus_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tokens_select_authenticated"
  ON public.valoraiplus_tokens FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "tokens_select_anon"
  ON public.valoraiplus_tokens FOR SELECT
  TO anon USING (status = 'ACTIVE');

-- ── 2. AUTHORIZED NODES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.valoraiplus_authorized_nodes (
  id              SERIAL PRIMARY KEY,
  node_id         TEXT NOT NULL UNIQUE,
  node_name       TEXT NOT NULL,
  location        TEXT,
  hardware_anchor TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_sync       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.valoraiplus_authorized_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nodes_select_authenticated"
  ON public.valoraiplus_authorized_nodes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "nodes_select_anon"
  ON public.valoraiplus_authorized_nodes FOR SELECT
  TO anon USING (is_active = true);

-- ── 3. FEDERAL LEDGER ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.valoraiplus_federal_ledger (
  id             SERIAL PRIMARY KEY,
  agency_code    TEXT NOT NULL UNIQUE,
  agency_name    TEXT NOT NULL,
  wave           INTEGER NOT NULL DEFAULT 1,
  status         TEXT NOT NULL DEFAULT 'ACTIVE',
  evidence_hash  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.valoraiplus_federal_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "federal_select_authenticated"
  ON public.valoraiplus_federal_ledger FOR SELECT
  TO authenticated USING (true);

-- ── 4. INTELLIGENCE REPORTS ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.valoraiplus_intelligence_reports (
  id          SERIAL PRIMARY KEY,
  report_type TEXT NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT,
  severity    TEXT NOT NULL DEFAULT 'INFO',
  source_node TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.valoraiplus_intelligence_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intel_select_authenticated"
  ON public.valoraiplus_intelligence_reports FOR SELECT
  TO authenticated USING (true);

-- ── 5. COURT DOCUMENTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.valoraiplus_court_documents (
  id                    SERIAL PRIMARY KEY,
  name                  TEXT NOT NULL,
  description           TEXT,
  file_name             TEXT UNIQUE,
  status                TEXT NOT NULL DEFAULT 'PENDING',
  filed_date            TIMESTAMPTZ,
  confirmation_number   TEXT,
  rapidlegal_doc_type   TEXT,
  fsx_transaction_number TEXT,
  sf_doc_type_code      TEXT,
  inquiry_email         TEXT NOT NULL DEFAULT 'SFefiling@sftc.org',
  case_number           TEXT NOT NULL DEFAULT 'CUD-26-682107',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.valoraiplus_court_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "court_docs_select_authenticated"
  ON public.valoraiplus_court_documents FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "court_docs_select_anon"
  ON public.valoraiplus_court_documents FOR SELECT
  TO anon USING (status = 'FILED');

CREATE POLICY "court_docs_insert_authenticated"
  ON public.valoraiplus_court_documents FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "court_docs_update_authenticated"
  ON public.valoraiplus_court_documents FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ── 6. NFT ASSETS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.valoraiplus_nft_assets (
  id               SERIAL PRIMARY KEY,
  symbol           TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  description      TEXT,
  collateral_uci   NUMERIC(20,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'PENDING',
  mint_address     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- View alias for backward compat
CREATE OR REPLACE VIEW public.nft_assets AS
  SELECT * FROM public.valoraiplus_nft_assets;

ALTER TABLE public.valoraiplus_nft_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nft_select_authenticated"
  ON public.valoraiplus_nft_assets FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "nft_select_anon"
  ON public.valoraiplus_nft_assets FOR SELECT
  TO anon USING (status = 'MINTED_CLOSED_LOOP' OR status = 'ACTIVE');

-- ── 7. SYSTEM CONFIG ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.valoraiplus_system_config (
  id         SERIAL PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  value      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.valoraiplus_system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_select_authenticated"
  ON public.valoraiplus_system_config FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "config_update_authenticated"
  ON public.valoraiplus_system_config FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ── 8. UPDATED_AT TRIGGER FUNCTION ─────────────────────────
CREATE OR REPLACE FUNCTION public.valoraiplus_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to mutable tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'valoraiplus_tokens',
    'valoraiplus_federal_ledger',
    'valoraiplus_court_documents',
    'valoraiplus_nft_assets',
    'valoraiplus_system_config'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
       CREATE TRIGGER set_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.valoraiplus_set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- ── 9. SET CONTEXT HELPER ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.valoraiplus_set_context()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('app.case_number', 'CUD-26-682107', FALSE);
  PERFORM set_config('app.node',        'SAINT_PAUL_2207',  FALSE);
  PERFORM set_config('app.schema',      'v5.5',             FALSE);
END;
$$;
