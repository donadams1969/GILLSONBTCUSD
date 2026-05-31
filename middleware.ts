import { NextRequest, NextResponse } from "next/server";

const ENFORCE_CSP = process.env.CSP_ENFORCE === "true";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspValue = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}' https://*.vercel-scripts.com https://*.vercel.app`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https: blob:`,
    `connect-src 'self' https://*.vercel.app https://*.alchemy.com wss://*.alchemy.com https://*.infura.io`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
  ].join("; ");

  const response = NextResponse.next();

  const cspHeader = ENFORCE_CSP
    ? "Content-Security-Policy"
    : "Content-Security-Policy-Report-Only";
  response.headers.set(cspHeader, cspValue);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Nonce", nonce);

  return response;
}

export const config = {
  matcher: "/:path*",
};
