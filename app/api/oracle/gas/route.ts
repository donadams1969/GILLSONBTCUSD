import { NextResponse } from "next/server";

/**
 * Sovereign gas oracle -- provides gas estimates from our edge.
 * In production, replace with ethers/viem provider.getGasPrice()
 * or a Chainlink Fast Gas feed read.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  // Simulated gas in GWEI (realistic mainnet range)
  const base = 18 + Math.random() * 35;
  const priority = 1.2 + Math.random() * 0.8;

  return NextResponse.json({
    baseFee: parseFloat(base.toFixed(1)),
    priorityFee: parseFloat(priority.toFixed(2)),
    total: parseFloat((base + priority).toFixed(1)),
    unit: "GWEI",
    ts: Date.now(),
    source: "sovereign-edge",
  });
}
