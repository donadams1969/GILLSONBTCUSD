import { NextResponse } from "next/server";

/**
 * Sovereign price oracle -- serves token reference prices from our own edge.
 * In production, this would pull from Chainlink direct-request or an
 * on-chain read via a backend viem client. For now, it returns the
 * anchored reference prices with a small simulated drift to prove liveness.
 */

const BASE_PRICES: Record<string, number> = {
  LEG1904: 4135,
  DONNY: 110.98,
  JAXX: 110.98,
  GILLGOLD: 2745.5,
  GILLBTC: 98420,
  XAU_USD: 4135,
  BTC_USD: 98420,
};

export const dynamic = "force-dynamic";

export async function GET() {
  const ts = Date.now();
  // Simulate small price drift (+/- 0.15%) for liveness proof
  const prices = Object.fromEntries(
    Object.entries(BASE_PRICES).map(([k, v]) => {
      const drift = 1 + (Math.random() * 0.003 - 0.0015);
      return [k, parseFloat((v * drift).toFixed(2))];
    })
  );

  return NextResponse.json(
    {
      prices,
      ts,
      source: "sovereign-edge",
      ttl: 10_000,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    }
  );
}
