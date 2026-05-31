import { NextResponse } from "next/server";

export const runtime = "edge";

// Sovereign balance ledger -- replace with DB / on-chain reads when ready
const LEDGER: Record<string, { amount: number; unit: string; vintage: string }> = {
  DONNY:    { amount: 1_000_000, unit: "VALOR", vintage: "2025" },
  JAXX:     { amount: 1_000_000, unit: "VALOR", vintage: "2025" },
  LEG1904:  { amount: 1_000_000, unit: "VALOR", vintage: "2025" },
  GILLGOLD: { amount: 1_000_000, unit: "VALOR", vintage: "2025" },
  GILLBTC:  { amount: 1_000_000, unit: "VALOR", vintage: "2026" },
};

export function GET() {
  const assets = Object.entries(LEDGER).map(([symbol, data]) => ({
    symbol: `$${symbol}`,
    ...data,
  }));

  const totalSupply = assets.reduce((sum, a) => sum + a.amount, 0);

  return NextResponse.json(
    {
      assets,
      totalSupply,
      lastAudit: new Date().toISOString(),
      node: "Saint Paul",
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
