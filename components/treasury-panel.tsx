"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Anchor, RefreshCw, Lock } from "lucide-react";
import { useSafety } from "@/components/safety/SafetyProvider";

type Asset = { symbol: string; amount: number; unit: string; vintage: string };
type NodeStatus = { status: string; node: string; services: Record<string, string> };
type AnchorResult = { status: string; merkleRoot: string; timestamp: string };

const fmt = new Intl.NumberFormat("en-US");

export default function TreasuryPanel() {
  const { prefs } = useSafety();
  const isAdult = prefs.ageMode === "adult";

  const [assets, setAssets] = useState<Asset[]>([]);
  const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null);
  const [anchorResult, setAnchorResult] = useState<AnchorResult | null>(null);
  const [anchoring, setAnchoring] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [statusRes, balancesRes] = await Promise.all([
          fetch("/api/lodge/status"),
          fetch("/api/lodge/balances"),
        ]);
        const status = await statusRes.json();
        const balances = await balancesRes.json();
        if (alive) {
          setNodeStatus(status);
          setAssets(balances.assets ?? []);
          setLoading(false);
        }
      } catch {
        if (alive) setLoading(false);
      }
    }
    load();
    const iv = setInterval(load, 15000);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  const handleAnchor = useCallback(async () => {
    if (anchoring) return;
    setAnchoring(true);
    setAnchorResult(null);
    try {
      const res = await fetch("/api/lodge/anchor", { method: "POST" });
      const data = await res.json();
      setAnchorResult(data);
    } catch {
      setAnchorResult({ status: "ERROR", merkleRoot: "---", timestamp: new Date().toISOString() });
    } finally {
      setAnchoring(false);
    }
  }, [anchoring]);

  // Youth mode gate
  if (!isAdult) {
    return (
      <section className="border border-border bg-card p-5" aria-label="Treasury Oversight">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Lock className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs font-mono uppercase tracking-widest">
            Treasury oversight requires adult mode
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="border border-border bg-card" aria-label="Saint Paul Node Treasury">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-serif font-bold uppercase tracking-wide text-foreground">
            Saint Paul Node Treasury
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {nodeStatus && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  nodeStatus.status === "ONLINE" ? "bg-accent" : "bg-destructive"
                }`}
                aria-hidden="true"
              />
              <span className={nodeStatus.status === "ONLINE" ? "text-accent" : "text-destructive"}>
                {nodeStatus.status}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Balance grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-px bg-border">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card p-4 animate-pulse">
                <div className="h-3 bg-muted rounded w-16 mb-2" />
                <div className="h-5 bg-muted rounded w-24" />
              </div>
            ))
          : assets.map((asset) => (
              <div key={asset.symbol} className="bg-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    {asset.symbol}
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground/50">
                    {asset.vintage}
                  </span>
                </div>
                <span className="text-lg font-mono font-bold text-foreground tabular-nums">
                  {fmt.format(asset.amount)}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground ml-1">
                  {asset.unit}
                </span>
              </div>
            ))}
      </div>

      {/* Anchor + Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border border-t border-border">
        {/* OTS Anchor */}
        <div className="bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Anchor className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              OTS State Anchor
            </h3>
            <button
              onClick={handleAnchor}
              disabled={anchoring}
              className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-primary/30 bg-primary/5 text-primary hover:bg-primary/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              aria-label="Initiate One-Time Signature state anchor"
            >
              {anchoring ? (
                <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" />
              ) : (
                <Anchor className="w-3 h-3" aria-hidden="true" />
              )}
              {anchoring ? "Anchoring..." : "Initiate Anchor"}
            </button>
          </div>

          {anchorResult && (
            <div
              className={`border p-3 font-mono text-[11px] ${
                anchorResult.status === "ANCHORED"
                  ? "border-accent/30 bg-accent/5"
                  : "border-destructive/30 bg-destructive/5"
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  anchorResult.status === "ANCHORED" ? "text-accent" : "text-destructive"
                }`}>
                  {anchorResult.status}
                </span>
                <span className="text-muted-foreground/50 text-[9px]">
                  {anchorResult.timestamp}
                </span>
              </div>
              <div className="text-muted-foreground break-all leading-relaxed">
                <span className="text-[9px] text-muted-foreground/60 uppercase">Merkle Root: </span>
                {anchorResult.merkleRoot}
              </div>
            </div>
          )}

          {!anchorResult && (
            <p className="text-[10px] font-mono text-muted-foreground/60 italic">
              Generates a SHA-256 Merkle root from the current treasury state. Verifiable on-demand.
            </p>
          )}
        </div>

        {/* Service status */}
        <div className="bg-card p-5">
          <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-foreground mb-4">
            Service Status
          </h3>
          {nodeStatus?.services ? (
            <div className="flex flex-col gap-2">
              {Object.entries(nodeStatus.services).map(([name, status]) => (
                <div key={name} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    {name}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                    status === "ACTIVE" ? "text-accent" : "text-primary"
                  }`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] font-mono text-muted-foreground/60 italic">Loading services...</p>
          )}
        </div>
      </div>
    </section>
  );
}
