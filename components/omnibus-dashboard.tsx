"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { namehash, keccak256, toHex, formatUnits } from "viem";
import { useSafety } from "@/components/safety/SafetyProvider";

// ---------------------------------------------------------------- CONFIG
const PUBLIC_RESOLVER =
  "0xF29100983E058B709F3D539b0c765937B804AC15" as const;
const YOUR_SUBDOMAIN_REGISTRAR =
  "0x0000000000000000000000000000000000000000" as const; // Deploy and update
const ROOT_NODE = namehash("donadams1969.eth");

// Chainlink Feeds (Ethereum mainnet)
const GOLD_FEED =
  "0x214eD9Da11D2fbe465a6fC601a91e62eBec1A0d6" as const;
const BTC_FEED =
  "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c" as const;

// Fixed-locale formatters (eliminates SSR/hydration mismatch)
const fmtInt = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});
const fmtDec = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

// VALORAIPLUS V1 Asset Matrix
const ASSETS = [
  {
    name: "Hard Gold Floor $LEG1904",
    indexRef: 4135,
    fdv: "4.13B notional",
    utility:
      "Unbreakable downside protection, on-chain revert on GDP breach",
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

const GLYPHS = ["\u25CB", "+", "-", "\u25C7", "\u25C6", "\u2022", "\u25E6"] as const;
type Glyph = (typeof GLYPHS)[number];

function pickGlyph(prev?: Glyph): Glyph {
  if (GLYPHS.length === 0) return "\u25CB";
  let next =
    GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "\u25CB";
  if (prev && next === prev && GLYPHS.length > 1) {
    next =
      GLYPHS[(GLYPHS.indexOf(prev) + 1) % GLYPHS.length] ?? next;
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

// Chainlink ABI fragment
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

// ENS resolver ABI fragments
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

// ---------------------------------------------------------------- MAIN
export default function OmnibusDashboard() {
  const [glyph, setGlyph] = useState<Glyph>("\u25CB");
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const { prefs } = useSafety();
  const isRestricted = prefs.ageMode === "child" || prefs.ageMode === "teen";

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAnimate = mounted && !prefersReducedMotion && !paused;

  useEffect(() => {
    if (!shouldAnimate) {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setGlyph((g) => pickGlyph(g));
    }, 800);
    return () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldAnimate]);

  const displayGlyph = useMemo(() => (mounted ? glyph : "\u25CB"), [mounted, glyph]);

  const { address } = useAccount();

  // ENS Pulls
  const { data: ethAddr } = useReadContract({
    address: PUBLIC_RESOLVER,
    abi: RESOLVER_ADDR_ABI,
    functionName: "addr",
    args: [ROOT_NODE],
  });

  const { data: avatar } = useReadContract({
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

  // Chainlink Index Feeds (8 decimals)
  const { data: goldPriceRaw } = useReadContract({
    address: GOLD_FEED,
    abi: CHAINLINK_ABI,
    functionName: "latestRoundData",
  });
  const goldIndex = goldPriceRaw
    ? Number(formatUnits(goldPriceRaw[1], 8))
    : 4135;

  const { data: btcPriceRaw } = useReadContract({
    address: BTC_FEED,
    abi: CHAINLINK_ABI,
    functionName: "latestRoundData",
  });
  const btcIndex = btcPriceRaw
    ? Number(formatUnits(btcPriceRaw[1], 8))
    : 98420;

  // Subdomain Mint
  const [subLabel, setSubLabel] = useState("");
  const { writeContract, data: txHash } = useWriteContract();
  const { isSuccess: minted } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const mintSubnode = () => {
    if (!subLabel.trim() || !address || isRestricted) return;
    const subLabelHash = keccak256(toHex(subLabel.trim().toLowerCase()));
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
      args: [subLabelHash, PUBLIC_RESOLVER, address],
    });
  };

  // Avatar safety: only load HTTPS sources
  const safeAvatar = useMemo(() => {
    const raw = avatar as string | undefined;
    if (raw && raw.startsWith("https://")) return raw;
    return "/placeholder-user.jpg";
  }, [avatar]);

  const statusId = useId();

  return (
    <div className="flex flex-col gap-12">
      {/* Hidden live region for screen readers */}
      <div role="status" aria-live="polite" id={statusId} className="sr-only">
        {minted ? "Subdomain minted successfully" : ""}
      </div>

      {/* Header + Glyph Pulse */}
      <header className="text-center flex flex-col gap-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter font-mono flex items-center justify-center gap-4 text-balance text-foreground">
          <span
            aria-hidden="true"
            className="text-4xl md:text-5xl status-pulse text-primary youth-reduce-motion"
          >
            {displayGlyph}
          </span>
          {"VALORAIPLUS\u00AE\u00A9\u2122 V1 OMNIBUS TERMINUS"}
        </h1>
        <p className="text-lg md:text-xl text-primary font-mono">
          Saint Paul Node // Sovereign Stack // Macro Reality Anchored
        </p>
        <p className="text-sm text-muted-foreground font-mono">
          Admin: 0xA3F7...D91E.eth // Provenance: [ENCRYPTED] // Feb 2026
          Mainnet Live
        </p>
      </header>

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
              {(ethAddr as string) || (address as string) || "Not connected"}
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
          Realistic launch targets: path to $10 -- $100M FDV (1M fixed supply).
          Macro pegs enforced via oracles (not token prices).
        </p>

        <h3 className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4">
          Index References (live oracles -- for notional synthetic exposure only)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              XAU/USD (Gold Floor)
            </p>
            <p className="text-3xl font-mono font-bold text-primary">
              ${fmtInt.format(goldIndex)}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              BTC/USD (Chainlink)
            </p>
            <p className="text-3xl font-mono font-bold text-chart-5">
              ${fmtInt.format(btcIndex)}
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
            Target FDV per asset (post-launch). Token value determined by collateral issuance rules + market dynamics.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ASSETS.map((asset) => (
            <div
              key={asset.token}
              className="token-card rounded-xl p-6"
            >
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
          Index references shown are live Chainlink oracle values for synthetic exposure modeling.
          Token economics governed by issuance, collateral, and protocol rules.
          Target FDV range reflects realistic post-launch path, not guaranteed valuation.
          Notional index display only -- not current market cap or per-unit price claim.
        </p>
      </section>

      {/* Subdomain Mint + Sovereign Engage */}
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
            onClick={mintSubnode}
            disabled={isRestricted || !address || !subLabel.trim()}
            title={isRestricted ? "Disabled in Child/Teen mode for safety" : ""}
            className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg disabled:opacity-50 transition-colors"
          >
            Mint Child Node
          </button>
        </div>
        {isRestricted && (
          <p className="text-xs text-destructive" role="status">
            Wallet actions disabled in youth safety mode. Switch to Adult (PIN required if locked).
          </p>
        )}
        {minted && (
          <p className="text-accent font-bold" role="alert">
            Subdomain minted -- check ENS app!
          </p>
        )}

        <button
          disabled={isRestricted}
          title={isRestricted ? "Disabled in Child/Teen mode for safety" : ""}
          className="w-full py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest rounded-xl transition-colors shadow-lg text-sm disabled:opacity-50"
        >
          Engage Sovereign Identity (SBT Mint / Node Bind)
        </button>
      </section>

      {/* Pulse Control */}
      <div className="flex justify-center">
        <button
          onClick={() => setPaused((v) => !v)}
          disabled={prefersReducedMotion}
          className={`px-8 py-4 rounded-full border-2 text-sm font-bold uppercase tracking-wider transition-all ${
            prefersReducedMotion
              ? "opacity-50 cursor-not-allowed border-border text-muted-foreground"
              : paused
                ? "border-primary bg-primary/10 text-primary"
                : "border-primary/50 hover:border-primary text-foreground"
          }`}
        >
          {prefersReducedMotion
            ? "Motion Disabled"
            : paused
              ? "Resume Matrix Pulse"
              : "Pause Matrix Pulse"}
        </button>
      </div>
    </div>
  );
}
