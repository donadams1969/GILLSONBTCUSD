// VALORAIPLUS Database Types
// Sovereign Financial Intelligence System

export interface Token {
  id: number
  symbol: string
  name: string
  description: string | null
  token_type: string
  status: 'ACTIVE' | 'PAUSED' | 'DEPRECATED'
  total_supply_cap: number
  created_at: string
  updated_at: string
}

export interface MintEvent {
  id: string
  token_id: string
  wallet_address: string
  amount: number
  idempotency_key: string
  tx_hash: string | null
  block_number: number | null
  gas_used: number | null
  status: 'PENDING' | 'CONFIRMED' | 'FAILED'
  reason: string | null
  pressure_psi: number
  bio_marker_verified: boolean
  created_at: string
}

export interface ClawbackEvidence {
  id: string
  case_id: string
  entity_name: string
  entity_type: string
  amount_recovered: number
  ip_addresses: string[]
  jurisdiction: string
  federal_agency: string | null
  evidence_hash: string
  navier_stokes_verified: boolean
  indictment_count: number
  status: 'ACTIVE' | 'RESOLVED' | 'PENDING'
  created_at: string
  updated_at: string
}

export interface IntelligenceReport {
  id: number
  report_type: string
  title: string
  content: string | null
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'ALERT' | 'HIGH'
  source_node: string | null
  created_at: string
}

export interface GhostProtocolLog {
  id: string
  event_type: string
  source_ip: string | null
  target_node: string | null
  action_taken: string
  blacklisted_entity: string | null
  recursive_deletion_count: number
  dns_poisoned: boolean
  quantum_routing_active: boolean
  ip_rotation_timestamp: string | null
  created_at: string
}

export interface DAOGovernance {
  id: string
  proposal_id: string
  proposer_wallet: string
  title: string
  description: string | null
  vote_start: string
  vote_end: string
  votes_for: number
  votes_against: number
  quorum_required: number
  execution_delay_days: number
  status: 'PENDING' | 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED'
  executed_at: string | null
  tx_hash: string | null
  created_at: string
}

export interface AuthorizedNode {
  id: number
  node_id: string
  node_name: string
  location: string | null
  hardware_anchor: string | null
  is_active: boolean
  last_sync: string
  created_at: string
}

export interface FederalLedger {
  id: number
  agency_code: string
  agency_name: string
  wave: number
  status: 'ACTIVE' | 'PENDING' | 'INGESTED'
  evidence_hash: string | null
  created_at: string
}

export interface ConnectedWallet {
  id: string
  provider: string
  chain: string
  wallet_address: string
  native_symbol: string
  native_balance: number
  balance_usd: number
  is_connected: boolean
  last_updated: string
  created_at: string
}

export interface ProjectAsset {
  id: string
  symbol: string
  name: string
  role: string
  protocol: string
  node_id: string | null
  merkle_root: string | null
  integration_status: string
  system_state: string | null
  balance: number
  price_usd: number
  is_active: boolean
  last_updated: string
  created_at: string
}

export interface PortalMetric {
  id: string
  key: string
  label: string
  value: string
  unit: string | null
  status: string
  sort_order: number
  updated_at: string
}

export interface PortalToken {
  id: string
  symbol: string
  category: 'PRIMARY' | 'SECONDARY'
  market_cap_b: number
  sort_order: number
  created_at: string
}

export interface PortalCompliance {
  id: string
  agency: string
  framework: string
  status: string
  expiration: string | null
  sort_order: number
}

export interface BaseActivity {
  id: string
  wallet_address: string
  direction: 'INBOUND' | 'OUTBOUND'
  anchor_type: string
  evidence_anchor: string
  label: string | null
  explorer_url: string | null
  observed_at: string
}

export interface TokenSync {
  id: string
  registry_label: string
  canonical_hash: string | null
  observed_hash: string | null
  hash_verified: boolean
  total_supply_cap: number
  last_sync: string | null
  created_at: string
}

// Dashboard Stats
export interface DashboardStats {
  totalTokens: number
  totalSupplyCap: number
  activeNodes: number
  totalIntelReports: number
  ghostProtocolEvents: number
  federalAgencies: number
  amathPower: number
}
