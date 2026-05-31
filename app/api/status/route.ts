import { NextResponse } from "next/server";

/**
 * System health endpoint -- sovereign status beacon.
 * Returns uptime, module ID, security posture, and node provenance.
 */

export const dynamic = "force-dynamic";

const BOOT_TIME = Date.now();

export async function GET() {
  const uptime = Date.now() - BOOT_TIME;

  return NextResponse.json({
    status: "ACTIVE",
    runtime: "VALOR AI+ V1 SOVEREIGN EDGE",
    moduleId: "valoraiplus_module_id_77x_final",
    port: 5150,
    uptime,
    uptimeHuman: formatUptime(uptime),
    security: {
      csp: "report-only",
      hsts: true,
      xframe: "DENY",
      nosniff: true,
    },
    node: {
      location: "Saint Paul, MN",
      admin: "0xA3F7...D91E.eth",
      shards: 1_144_000,
      sync: "ZERO-DRIFT",
    },
    chainOfCustody: {
      parentCid: "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
      toolkitMeta: "ValorLoop_Audit_Toolkit_V2",
      toolkitSha256: "6778c1914a4861e00902aae73fe9245a6e6ed9fc732c66950d0da9e7de56b5c7",
      anchored: "2025-08-26T17:46:38.278419Z",
      forensicLayer: "SGAU-VALUEGUARD",
    },
    ts: Date.now(),
  });
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m ${s % 60}s`;
}
