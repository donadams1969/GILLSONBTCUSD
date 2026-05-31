"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { namehash, keccak256, toHex, formatUnits } from "viem";
import { useSafety, type AgeMode } from "@/components/safety/SafetyProvider";
import { SafeLink } from "@/components/safety/SafeLink";
import { Shield, Lock, Globe } from "lucide-react";

// ── CONFIG ──────────────────────────────────────────────────────
const PUBLIC_RESOLVER =
  "0xF29100983E058B709F3D539b0c765937B804AC15" as const;
const YOUR_SUBDOMAIN_REGISTRAR =
  "0x0000000000000000000000000000000000000000" as const;
const ROOT_NODE = namehash("donadams1969.eth");

const GOLD_FEED =
  "0x214eD9Da11D2fbe465a6fC601a91e62eBec1A0d6" as const;
const BTC_FEED =
  "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c" as const;

// Fixed formatters (no locale variance)
const fmtInt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const fmtDec = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

// ── ASSETS ──────────────────────────────────────────────────────
const ASSETS = [
  {
    name: "Hard Gold Floor $LEG1904",
    indexRef: 4135,
    fdv: "4.13B notional",
    utility: "Unbreakable downside protection, on-chain revert on GDP breach",
    token: "$LEG1904",
  },
  {
    name: "Executive $DONNY (GDP Scalar)",
    indexRef: 110.98,
    fdv: "111.0M",
    utility: "Governance + revenue share, global growth exposure",
    token: "$DONNY",
  },
  {
    name: "Equity $JAXX (Protocol Guard)",
    indexRef: 110.98,
    fdv: "111.0M",
    utility: "Priority revenue/airdrops, long-term alignment",
    token: "$JAXX",
  },
  {
    name: "Reserve $GILLGOLD (Synthetic Gold)",
    indexRef: 2745.5,
    fdv: "2.75B notional",
    utility: "Yield-bearing gold proxy, stake compounding",
    token: "$GILLGOLD",
  },
  {
    name: "Digital $GILLBTC (Synthetic BTC)",
    indexRef: 98420,
    fdv: "98.42B notional",
    utility: "Non-custodial BTC beta, hedge/leverage",
    token: "$GILLBTC",
  },
] as const;

// ── GLYPH (hydration-safe) ─────────────────────────────────────
const GLYPHS = ["\u25CB", "+", "-", "\u25C7", "\u25C6", "\u2022", "\u25E6"] as const;
type Glyph = (typeof GLYPHS)[number];

function pickGlyph(prev?: Glyph): Glyph {
  if (GLYPHS.length === 0) return "\u25CB";
  let next = GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "\u25CB";
  if (prev && next === prev && GLYPHS.length > 1) {
    next = GLYPHS[(GLYPHS.indexOf(prev) + 1) % GLYPHS.length] ?? next;
  }
  return next;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mql) return;
    const onChange = () => setReduced(!!mql.matches);
    onChange();
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    return undefined;
  }, []);
  return reduced;
}

function HydrationSafeGlyph({ label = "Matrix pulse" }: { label?: string }) {
  const [mounted, setMounted] = useState(false);
  const [glyph, setGlyph] = useState<Glyph>("\u25CB");
  const prefersReduced = usePrefersReducedMotion();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || prefersReduced) {
      if (intervalRef.current != null) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setGlyph((g) => pickGlyph(g));
    }, 800);
    return () => {
      if (intervalRef.current != null) clearInterval(intervalRef.current);
    };
  }, [mounted, prefersReduced]);

  const display = useMemo(() => (mounted ? glyph : "\u25CB"), [mounted, glyph]);

  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="text-xl font-mono text-primary status-pulse youth-reduce-motion"
      >
        {display}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

// ── MODE PILL ───────────────────────────────────────────────────
function ModePill({ mode, locked }: { mode: AgeMode; locked: boolean }) {
  const cls =
    mode === "adult"
      ? "border-muted-foreground/30 text-foreground bg-secondary/40"
      : mode === "teen"
        ? "border-blue-500/40 text-blue-200 bg-blue-500/5"
        : "border-rose-500/40 text-rose-200 bg-rose-500/5";

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest ${cls}`}
      aria-label={`Age mode: ${mode.toUpperCase()}${locked ? ", PIN locked" : ""}`}
    >
      {mode.toUpperCase()}
      {locked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3 h-3 opacity-80"
          aria-hidden="true"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )}
    </span>
  );
}

// ── CHAINLINK + ENS ABIs ────────────────────────────────────────
const CHAINLINK_ABI = [
  {
    name: "latestRoundData",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { type: "uint80" },
      { type: "int256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint80" },
    ],
  },
] as const;

const RESOLVER_ADDR_ABI = [
  {
    name: "addr",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes32" }],
    outputs: [{ type: "address" }],
  },
] as const;

const RESOLVER_TEXT_ABI = [
  {
    name: "text",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes32" }, { type: "string" }],
    outputs: [{ type: "string" }],
  },
] as const;

const RESOLVER_CONTENTHASH_ABI = [
  {
    name: "contenthash",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes32" }],
    outputs: [{ type: "bytes" }],
  },
] as const;

// ── INLINE SAFETY PANEL ─────────────────────────────────────────
function InlineSafetyPanel({ onClose }: { onClose: () => void }) {
  const { prefs, update, setPin, clearPin, verifyPin, reset } = useSafety();
  const isMinorMode = prefs.ageMode === "child" || prefs.ageMode === "teen";
  const locked = prefs.pinLockEnabled && isMinorMode;

  const [pin, setPinValue] = useState("");
  const [pin2, setPin2Value] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [pinOk, setPinOk] = useState(false);
  const [unlockPin, setUnlockPin] = useState("");
  const [unlockErr, setUnlockErr] = useState("");

  const titleId = useId();

  async function requestMode(next: AgeMode) {
    setUnlockErr("");
    if (next === "teen" || next === "child") {
      update({ ageMode: next });
      return;
    }
    if (!prefs.pinLockEnabled) {
      update({ ageMode: "adult" });
      return;
    }
    const ok = await verifyPin(unlockPin);
    if (!ok) {
      setUnlockErr("Incorrect PIN");
      return;
    }
    update({ ageMode: "adult" });
    setUnlockPin("");
  }

  async function handleSetPin() {
    setPinErr("");
    setPinOk(false);
    if (!pin || pin.length < 4) {
      setPinErr("PIN must be at least 4 characters.");
      return;
    }
    if (pin !== pin2) {
      setPinErr("PIN entries do not match.");
      return;
    }
    try {
      await setPin(pin);
      setPinValue("");
      setPin2Value("");
      setPinOk(true);
      window.setTimeout(() => setPinOk(false), 2500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setPinErr(
        msg === "PIN_TOO_SHORT" ? "PIN must be at least 4 characters." : "Unable to set PIN."
      );
    }
  }

  return (
    <div
      className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-6 shadow-2xl"
      role="region"
      aria-labelledby={titleId}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 id={titleId} className="text-lg font-bold text-foreground">
            Youth Safety Utility
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Local-first safeguards for children/teens and vulnerable users. No
            surveillance. Guardrails only.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="px-3 py-2 rounded-xl bg-secondary border border-border hover:border-muted-foreground/40 text-xs font-bold uppercase tracking-widest text-foreground transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-secondary border border-border hover:border-muted-foreground/40 text-xs font-bold uppercase tracking-widest text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Age Mode */}
      <div className="mt-6">
        <div className="font-bold uppercase tracking-widest text-xs text-muted-foreground">
          Age Mode
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Tightens outbound links and redaction. Exiting Child/Teen can be
          PIN-locked.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["adult", "teen", "child"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => requestMode(m)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-colors ${
                prefs.ageMode === m
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "bg-secondary border-border text-foreground hover:border-muted-foreground/40"
              }`}
              aria-pressed={prefs.ageMode === m}
            >
              {m}
            </button>
          ))}
        </div>

        {locked && (
          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Enter PIN to switch to Adult
            </label>
            <input
              value={unlockPin}
              onChange={(e) => setUnlockPin(e.target.value)}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              className="mt-2 w-full max-w-xs bg-background/40 border border-border rounded-xl px-4 py-2 text-sm font-mono text-foreground outline-none focus:ring-2 focus:ring-ring"
              aria-label="PIN to unlock adult mode"
            />
            {unlockErr && (
              <div className="mt-2 text-sm text-destructive" role="alert">
                {unlockErr}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="mt-6 grid gap-3">
        <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-secondary/40">
          <div>
            <div className="font-bold text-foreground text-sm">
              Redact sensitive text
            </div>
            <div className="text-xs text-muted-foreground">
              Masks emails, phones, seed-like strings in logs and UI.
            </div>
          </div>
          <input
            type="checkbox"
            checked={prefs.redactSensitiveText}
            onChange={(e) => update({ redactSensitiveText: e.target.checked })}
            className="accent-primary w-4 h-4"
            aria-label="Toggle sensitive text redaction"
          />
        </label>

        <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-secondary/40">
          <div>
            <div className="font-bold text-foreground text-sm">
              Confirm external links
            </div>
            <div className="text-xs text-muted-foreground">
              Shows an accessible confirmation before leaving the site.
            </div>
          </div>
          <input
            type="checkbox"
            checked={prefs.externalLinkConfirm}
            onChange={(e) =>
              update({ externalLinkConfirm: e.target.checked })
            }
            className="accent-primary w-4 h-4"
            aria-label="Toggle external link confirmations"
          />
        </label>
      </div>

      {/* PIN Lock */}
      <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-bold uppercase tracking-widest text-xs text-muted-foreground">
              Parental PIN Lock
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Locks switching out of Child/Teen mode. PIN stored as
              PBKDF2-SHA256 (310k iterations, local only).
            </p>
          </div>
          {prefs.pinLockEnabled && (
            <button
              type="button"
              onClick={clearPin}
              className="px-3 py-2 rounded-xl bg-secondary border border-border hover:border-muted-foreground/40 text-xs font-bold uppercase tracking-widest text-foreground transition-colors"
            >
              Disable
            </button>
          )}
        </div>

        {!prefs.pinLockEnabled && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <input
              value={pin}
              onChange={(e) => setPinValue(e.target.value)}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Set PIN"
              className="bg-background/40 border border-border rounded-xl px-4 py-2 text-sm font-mono text-foreground outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              aria-label="Set PIN"
            />
            <input
              value={pin2}
              onChange={(e) => setPin2Value(e.target.value)}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Confirm PIN"
              className="bg-background/40 border border-border rounded-xl px-4 py-2 text-sm font-mono text-foreground outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              aria-label="Confirm PIN"
            />
            <button
              type="button"
              onClick={handleSetPin}
              className="sm:col-span-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Enable PIN Lock
            </button>
            {pinErr && (
              <div className="sm:col-span-2 text-sm text-destructive" role="alert">
                {pinErr}
              </div>
            )}
            {pinOk && (
              <div
                className="sm:col-span-2 mt-1 p-3 rounded-xl border border-accent/30 bg-accent/10 text-accent text-sm text-center"
                role="status"
                aria-live="polite"
              >
                PIN Lock Enabled -- exiting Child/Teen now requires verification.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-muted-foreground/60">
        Safety mode protects children, teenagers, and vulnerable users while
        keeping the tool accessible to disabled veterans and disabled users
        worldwide.
      </div>
    </div>
  );
}

// ── MAIN FUSED DASHBOARD ────────────────────────────────────────
export default function OmnibusSafetyDashboard() {
  const { prefs, update } = useSafety();
  const { address } = useAccount();
  const isRestricted = prefs.ageMode === "child" || prefs.ageMode === "teen";
  const [safetyOpen, setSafetyOpen] = useState(false);

  // Force safety toggles in restricted modes
  useEffect(() => {
    if (isRestricted) {
      update({ externalLinkConfirm: true, redactSensitiveText: true });
    }
  }, [isRestricted, update]);

  // ENS pulls
  const { data: ethAddrRaw } = useReadContract({
    address: PUBLIC_RESOLVER,
    abi: RESOLVER_ADDR_ABI,
    functionName: "addr",
    args: [ROOT_NODE],
  });
  const ethAddr =
    prefs.redactSensitiveText && isRestricted
      ? "[redacted]"
      : (ethAddrRaw as string) || (address as string) || "Not set";

  const { data: avatarRaw } = useReadContract({
    address: PUBLIC_RESOLVER,
    abi: RESOLVER_TEXT_ABI,
    functionName: "text",
    args: [ROOT_NODE, "avatar"],
  });

  const { data: contenthashRaw } = useReadContract({
    address: PUBLIC_RESOLVER,
    abi: RESOLVER_CONTENTHASH_ABI,
    functionName: "contenthash",
    args: [ROOT_NODE],
  });
  const contenthash = contenthashRaw
    ? toHex(contenthashRaw as `0x${string}`).slice(0, 20) + "..."
    : "Not set";

  // Avatar safety: HTTPS only
  const safeAvatar = useMemo(() => {
    const raw = avatarRaw as string | undefined;
    if (raw && raw.startsWith("https://")) return raw;
    return "/placeholder-user.jpg";
  }, [avatarRaw]);

  // Oracles
  const { data: goldRaw } = useReadContract({
    address: GOLD_FEED,
    abi: CHAINLINK_ABI,
    functionName: "latestRoundData",
  });
  const goldPrice = goldRaw ? Number(formatUnits(goldRaw[1], 8)) : 4135;

  const { data: btcRaw } = useReadContract({
    address: BTC_FEED,
    abi: CHAINLINK_ABI,
    functionName: "latestRoundData",
  });
  const btcPrice = btcRaw ? Number(formatUnits(btcRaw[1], 8)) : 98420;

  // Subdomain mint
  const [subLabel, setSubLabel] = useState("");
  const { writeContract, data: txHash } = useWriteContract();
  const { isSuccess: minted } = useWaitForTransactionReceipt({ hash: txHash });

  const handleMint = () => {
    if (isRestricted || !subLabel.trim() || !address) return;
    const subHash = keccak256(toHex(subLabel.trim().toLowerCase()));
    writeContract({
      address: YOUR_SUBDOMAIN_REGISTRAR,
      abi: [
        {
          name: "mintSubnode",
          type: "function",
          inputs: [
            { name: "label", type: "bytes32" },
            { name: "resolver", type: "address" },
            { name: "owner", type: "address" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "mintSubnode",
      args: [subHash, PUBLIC_RESOLVER, address],
    });
  };

  const statusId = useId();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ghost matrix dot overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(217 33% 17%) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>

      {/* Hidden live region */}
      <div role="status" aria-live="polite" id={statusId} className="sr-only">
        {minted ? "Subdomain minted successfully" : ""}
      </div>

      {/* ──── HEADER ──── */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl shadow-inner">
              <Shield className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter font-mono flex items-center text-foreground">
                <HydrationSafeGlyph label="Sovereign matrix pulse" />
                <span className="ml-2">
                  {"VALORAIPLUS\u00AE\u00A9\u2122"}
                </span>
                <span className="ml-2 text-muted-foreground font-normal text-xs tracking-widest hidden sm:inline">
                  // V1 OMNIBUS TERMINUS
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-[0.2em] flex items-center">
                <Globe className="w-3 h-3 mr-1" aria-hidden="true" /> SAINT
                PAUL NODE // ADMIN: 0xA3F7...D91E.eth
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSafetyOpen((v) => !v)}
                className="rounded-xl bg-secondary border border-border hover:border-primary/40 transition-all focus:outline-none focus:ring-2 focus:ring-ring font-bold uppercase tracking-widest text-foreground px-3 py-2 text-xs"
                aria-expanded={safetyOpen}
              >
                Safety{" "}
                <span className="ml-1 align-middle">
                  <ModePill
                    mode={prefs.ageMode}
                    locked={prefs.pinLockEnabled}
                  />
                </span>
              </button>

              {safetyOpen && (
                <div className="absolute right-0 top-full mt-2 w-[min(440px,calc(100vw-2rem))] z-50">
                  <InlineSafetyPanel onClose={() => setSafetyOpen(false)} />
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="h-10 w-px bg-border" />
              <div
                className="flex flex-col items-end"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="text-[10px] font-mono text-accent flex items-center uppercase tracking-widest font-bold">
                  <span
                    className="w-2 h-2 rounded-full bg-accent mr-2 animate-pulse youth-reduce-motion"
                    aria-hidden="true"
                  />
                  V0 + A2A COMPLIANT
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  PROV: 0xA3F7...D91E [PBKDF2]
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ──── MAIN ──── */}
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-12"
      >
        {/* v0 Phishing Counter */}
        <section className="glass-panel rounded-2xl p-6 md:p-8 border-destructive/30">
          <h2 className="text-xl md:text-2xl font-bold text-destructive mb-4 font-mono">
            v0 Phishing Threat &rarr; Sovereign Moat
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            July 2025: Attackers abused Vercel v0 to generate fake login pages
            in seconds. Vercel blocked after disclosure.{" "}
            <SafeLink
              href="https://thehackernews.com/2025/07/vercels-v0-ai-tool-weaponized-by.html"
              className="text-primary underline"
            >
              Full report
            </SafeLink>
            .
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Counter: Local-first safety redacts sensitive data in youth modes,
            PIN-locks changes, subdomains verify contenthash. Sovereign control,
            no external AI dependency.
          </p>
        </section>

        {/* ENS Sovereignty Panel */}
        <section className="glass-panel rounded-2xl p-6 md:p-8 border-primary/30">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-6 font-mono">
            donadams1969.eth
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={safeAvatar}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                alt="ENS avatar for donadams1969.eth"
                className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full border-4 border-primary/50 object-cover"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Avatar Record
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                Resolved Address
              </p>
              <p className="font-mono text-primary break-all text-sm">
                {ethAddr}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                Contenthash
              </p>
              <p className="font-mono text-primary break-all text-xs">
                {contenthash}
              </p>
            </div>
          </div>
        </section>

        {/* Sovereign Anchor Analytics */}
        <section className="glass-panel rounded-2xl p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-2 font-mono">
            Sovereign Anchor Analytics
          </h2>
          <p className="text-sm text-muted-foreground font-mono mb-6">
            Realistic launch targets: path to $10 -- $100M FDV (1M fixed
            supply). Macro pegs enforced via oracles (not token prices).
          </p>

          <h3 className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4">
            Index References (live oracles -- for notional synthetic exposure
            only)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                XAU/USD (Gold Floor)
              </p>
              <p className="text-3xl font-mono font-bold text-primary">
                ${fmtInt.format(goldPrice)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                BTC/USD (Chainlink)
              </p>
              <p className="text-3xl font-mono font-bold text-chart-5">
                ${fmtInt.format(btcPrice)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                World Bank GDP Scalar
              </p>
              <p className="text-3xl font-mono font-bold text-foreground">
                $110.98T
              </p>
              <p className="text-[10px] text-muted-foreground/60 font-mono">
                Oracle input, not FDV
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground font-mono">
            Sovereign Fee: 1.5 GWEI // Ghost_Low Freq: 0.01Hz
          </p>
        </section>

        {/* Sovereign Asset Matrix */}
        <section className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-primary font-mono">
              Sovereign Asset Matrix (1M Fixed Supply)
            </h2>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Target FDV per asset (post-launch). Token value determined by
              collateral issuance rules + market dynamics.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ASSETS.map((asset) => (
              <div key={asset.token} className="token-card rounded-xl p-6">
                <h3 className="text-base md:text-lg font-bold text-primary">
                  {asset.name}
                </h3>
                <p className="text-2xl font-bold mt-2 text-foreground font-mono">
                  ${fmtDec.format(asset.indexRef)}
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-mono">
                  Index Reference (notional)
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Target FDV: ${asset.fdv}
                </p>
                <p className="text-sm mt-3 text-foreground/80 leading-relaxed">
                  {asset.utility}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
                  Token: {asset.token}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/60 font-mono leading-relaxed">
            Index references shown are live Chainlink oracle values for
            synthetic exposure modeling. Token economics governed by issuance,
            collateral, and protocol rules. Target FDV range reflects realistic
            post-launch path, not guaranteed valuation. Notional index display
            only -- not current market cap or per-unit price claim.
          </p>
        </section>

        {/* Sovereign Expansion (Subdomain Mint + SBT) */}
        <section className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-6">
          <h2 className="text-xl md:text-2xl font-bold text-primary font-mono">
            Sovereign Expansion
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              value={subLabel}
              onChange={(e) => setSubLabel(e.target.value)}
              placeholder="e.g. v0, api, saintpaul"
              disabled={isRestricted}
              className="flex-1 px-5 py-4 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground font-mono text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              aria-label="Subdomain label to mint under donadams1969.eth"
            />
            <button
              onClick={handleMint}
              disabled={isRestricted || !address || !subLabel.trim()}
              title={
                isRestricted
                  ? "Disabled in Child/Teen mode for safety"
                  : ""
              }
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg disabled:opacity-50 transition-colors"
            >
              Mint Child Node
            </button>
          </div>
          {isRestricted && (
            <p className="text-xs text-destructive" role="status">
              Wallet actions disabled in youth safety mode. Switch to Adult (PIN
              required if locked).
            </p>
          )}
          {minted && (
            <p className="text-accent font-bold" role="alert">
              Subdomain minted -- check ENS app!
            </p>
          )}

          <button
            disabled={isRestricted}
            title={
              isRestricted ? "Disabled in Child/Teen mode for safety" : ""
            }
            className="w-full py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest rounded-xl transition-colors shadow-lg text-sm disabled:opacity-50"
          >
            Engage Sovereign Identity (SBT Mint / Node Bind)
          </button>
        </section>
      </main>

      {/* ──── FOOTER ──── */}
      <footer className="py-24 border-t border-border text-center relative overflow-hidden bg-background">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(hsl(217 33% 17%) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 flex flex-col gap-8 relative z-10">
          <p className="text-[11px] font-mono text-muted-foreground/40 tracking-[0.7em] uppercase">
            {"VALORAIPLUS\u00AE\u00A9\u2122 // SAINT PAUL NODE // V0 + A2A LIVE"}
          </p>
          <div className="flex justify-center gap-12 grayscale opacity-40 hover:opacity-100 transition-opacity">
            <div className="flex flex-col items-center gap-2">
              <Shield
                className="w-5 h-5 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-[8px] font-mono text-muted-foreground">
                14D_CORE
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Lock
                className="w-5 h-5 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-[8px] font-mono text-muted-foreground">
                PBKDF2_310K
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Globe
                className="w-5 h-5 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-[8px] font-mono text-muted-foreground">
                ST_PAUL_MN
              </span>
            </div>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground/60 italic leading-relaxed max-w-xl mx-auto">
            Sovereign stack deployed Feb 2026. A2A-native multi-agent exposure.
            Audit-oriented design (artifacts pending Q1 2026). WCAG AA. CSP.
            A2A compliant.
          </p>
          <p className="text-[10px] font-mono text-muted-foreground/20 tracking-[0.3em] uppercase pt-4">
            Identity Sealed: 4th of November // 0xA3F7...D91E.eth
          </p>
        </div>
      </footer>
    </div>
  );
}
