import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for trusted server-side writes to RLS-protected
 * tables (e.g. the append-only cold_storage_seals ledger). This key bypasses
 * RLS and MUST only ever be used inside server route handlers — never imported
 * into a client component.
 *
 * Per Fluid-compute guidance, create a fresh client per request rather than
 * holding one in a module-global.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRole) {
    throw new Error(
      'Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
    )
  }

  return createSupabaseClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
