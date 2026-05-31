import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET() {
  return NextResponse.json(
    {
      status: "ONLINE",
      node: "Saint Paul",
      uptime: Math.floor(process.uptime?.() ?? Date.now() / 1000),
      timestamp: new Date().toISOString(),
      services: {
        treasury: "ACTIVE",
        otsAnchor: "STANDBY",
        oracleFeed: "ACTIVE",
        forensicLayer: "SGAU-VALUEGUARD",
      },
      parentCid: "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Node": "saint-paul",
      },
    }
  );
}
