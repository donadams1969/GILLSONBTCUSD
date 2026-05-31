import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      owner_wallet,
      asset_name,
      hardware_signature,
      value_complexity_index,
      provenance,
    } = body

    // Validate required fields
    if (!owner_wallet || !hardware_signature) {
      return NextResponse.json(
        { error: 'Missing required fields: owner_wallet, hardware_signature' },
        { status: 400 }
      )
    }

    // Generate unique token ID with hardware signature
    const tokenId = `Ω∞∞∞∞∞-${Date.now()}-${hardware_signature}`

    const { data, error } = await supabase
      .from('valoraiplus_nft_assets')
      .insert({
        token_id: tokenId,
        owner_wallet,
        asset_name: asset_name || `VALORAIPLUS® NFT #${hardware_signature}`,
        authority_status: 'SUPREME VERIFIED',
        provenance: provenance || 'VALORCHAIN_SOVEREIGN_NODE',
        hardware_signature,
        value_complexity_index: value_complexity_index || 10.45,
        encryption_standard: 'CRYSTALS-Kyber 3461',
        growth_factor: '10465%',
        uci_tether: 467525700.0,
        drift_tolerance: 0.0002,
        perimeter_freq: 111100,
        mint_status: 'MINTED_CLOSED_LOOP',
        waterfall_verified: true,
        node_locked: 'SAINT_PAUL_2207',
        tx_hash: `0xNFT_MINT_${hardware_signature}_${Date.now()}`,
        signature_proof: `DILITHIUM5-SIG-${hardware_signature}`,
        metadata: {
          node: 'SAINT_PAUL_2207',
          freq: 111100,
          amath: 132.84,
          optimized: true,
          minted_via: 'VALORAIPLUS_API',
        },
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] NFT mint error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      nft: data,
      message: `NFT ${tokenId} minted successfully`,
    })
  } catch (error) {
    console.error('[v0] NFT mint exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('valoraiplus_nft_assets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ nfts: [], error: error.message })
    }

    return NextResponse.json({ nfts: data ?? [] })
  } catch (error) {
    console.error('[v0] NFT fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
