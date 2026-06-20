import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client using the service-role key.
 *
 * This client BYPASSES Row Level Security and must NEVER be imported into
 * client components or exposed to the browser. It is used exclusively by
 * trusted server routes (e.g. the cold-storage seal ledger) that need to
 * write to RLS-protected, append-only tables.
 *
 * Always create a fresh client per request (do not hoist to a module global)
 * to stay safe under Fluid compute.
 */
export function createServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for service client',
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
