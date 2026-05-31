import { NextResponse } from "next/server";

/**
 * Returns the security headers the site is currently serving.
 * Called by the interactive audit page to prove header enforcement.
 */
export async function GET(request: Request) {
  const url = new URL("/", request.url);

  try {
    const res = await fetch(url.toString(), { method: "HEAD", redirect: "follow" });
    const headerMap: Record<string, string> = {};
    const auditKeys = [
      "content-security-policy-report-only",
      "content-security-policy",
      "x-content-type-options",
      "x-frame-options",
      "referrer-policy",
      "permissions-policy",
    ];
    for (const key of auditKeys) {
      const val = res.headers.get(key);
      if (val) headerMap[key] = val;
    }
    return NextResponse.json({ status: "ok", headers: headerMap });
  } catch (e: unknown) {
    return NextResponse.json({
      status: "error",
      message: e instanceof Error ? e.message : "Fetch failed",
    });
  }
}
