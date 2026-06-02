// Live wallet connection helpers using the injected EIP-1193 provider
// (window.ethereum). Read-only: we only request accounts and read balances.

export type WalletProviderId =
  | 'MetaMask'
  | 'Coinbase'
  | 'Phantom'
  | 'Ledger'
  | 'Uniswap'
  | 'Injected'

interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
  isPhantom?: boolean
  providers?: Eip1193Provider[]
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

function pickProvider(preferred: WalletProviderId): Eip1193Provider | null {
  if (typeof window === 'undefined') return null
  const eth = window.ethereum
  if (!eth) return null

  const candidates: Eip1193Provider[] =
    Array.isArray(eth.providers) && eth.providers.length > 0
      ? eth.providers
      : [eth]

  if (preferred === 'MetaMask') {
    return candidates.find((p) => p.isMetaMask) ?? candidates[0]
  }
  if (preferred === 'Coinbase') {
    return candidates.find((p) => p.isCoinbaseWallet) ?? candidates[0]
  }
  if (preferred === 'Phantom') {
    return candidates.find((p) => p.isPhantom) ?? candidates[0]
  }
  return candidates[0]
}

export function isWalletAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean(window.ethereum)
}

export interface LiveWalletResult {
  address: string
  nativeBalance: number
  symbol: string
}

const WEI_PER_ETH = 1e18

export async function connectWallet(
  preferred: WalletProviderId,
): Promise<LiveWalletResult> {
  const provider = pickProvider(preferred)
  if (!provider) {
    throw new Error(
      'No browser wallet detected. Install MetaMask, Coinbase Wallet, or another EIP-1193 wallet.',
    )
  }

  const accounts = (await provider.request({
    method: 'eth_requestAccounts',
  })) as string[]

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts returned by the wallet.')
  }

  const address = accounts[0]

  const balanceHex = (await provider.request({
    method: 'eth_getBalance',
    params: [address, 'latest'],
  })) as string

  const nativeBalance = parseInt(balanceHex, 16) / WEI_PER_ETH

  return { address, nativeBalance, symbol: 'ETH' }
}

// Fetches a live ETH/USD spot price from Coinbase's public API.
export async function fetchEthUsdPrice(): Promise<number> {
  try {
    const res = await fetch(
      'https://api.coinbase.com/v2/prices/ETH-USD/spot',
      { cache: 'no-store' },
    )
    if (!res.ok) return 0
    const json = (await res.json()) as { data?: { amount?: string } }
    return Number(json?.data?.amount ?? 0)
  } catch {
    return 0
  }
}
