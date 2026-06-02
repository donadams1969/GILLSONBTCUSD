import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  const { data: wallets, error } = await supabase
    .from('valoraiplus_connected_wallets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ wallets: [], error: error.message }, { status: 500 })
  }

  return NextResponse.json({ wallets: wallets ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  let body: {
    provider?: string
    chain?: string
    wallet_address?: string
    native_symbol?: string
    native_balance?: number
    balance_usd?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const provider = (body.provider ?? '').trim()
  const wallet_address = (body.wallet_address ?? '').trim()

  if (!provider || !wallet_address) {
    return NextResponse.json(
      { error: 'provider and wallet_address are required' },
      { status: 400 },
    )
  }

  const { data: wallet, error } = await supabase
    .from('valoraiplus_connected_wallets')
    .upsert(
      {
        provider,
        chain: body.chain ?? 'evm',
        wallet_address,
        native_symbol: body.native_symbol ?? 'ETH',
        native_balance: body.native_balance ?? 0,
        balance_usd: body.balance_usd ?? 0,
        is_connected: true,
        last_updated: new Date().toISOString(),
      },
      { onConflict: 'provider,wallet_address' },
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ wallet })
}
