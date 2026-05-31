import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

async function generateMerkleRoot(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: NextRequest) {
  const nodeKey = request.headers.get("x-valor-key");

  // In production: validate against env var VALOR_NODE_KEY
  const expectedKey = process.env.VALOR_NODE_KEY;
  if (expectedKey && nodeKey !== expectedKey) {
    return NextResponse.json(
      { error: "ACCESS_DENIED", detail: "Invalid node key" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const timestamp = new Date().toISOString();
  const statePayload = JSON.stringify({
    node: "Saint Paul",
    timestamp,
    assets: ["DONNY", "JAXX", "LEG1904", "GILLGOLD", "GILLBTC"],
    supply: 5_000_000,
    parentCid: "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
    toolkitSha256: "6778c1914a4861e00902aae73fe9245a6e6ed9fc732c66950d0da9e7de56b5c7",
  });

  const merkleRoot = await generateMerkleRoot(statePayload);

  return NextResponse.json(
    {
      status: "ANCHORED",
      merkleRoot: `0x${merkleRoot}`,
      timestamp,
      node: "Saint Paul",
      payload: statePayload,
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
