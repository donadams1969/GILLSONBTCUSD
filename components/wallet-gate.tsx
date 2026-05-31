"use client";

import { useSafety } from "@/components/safety/SafetyProvider";
import { Shield } from "lucide-react";

export default function WalletGate({ children }: { children: React.ReactNode }) {
  const { prefs } = useSafety();
  const isRestricted = prefs.ageMode === "child" || prefs.ageMode === "teen";

  if (!isRestricted) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-20 pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
        <div className="flex flex-col items-center gap-3 p-6 border border-destructive/30 bg-card max-w-xs text-center">
          <Shield className="w-6 h-6 text-destructive" aria-hidden="true" />
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-destructive" role="status">
            Wallet actions restricted
          </p>
          <p className="text-[10px] text-muted-foreground font-serif leading-relaxed">
            Financial operations are disabled in {prefs.ageMode} mode. Switch to Adult mode in Safety settings (PIN required if locked).
          </p>
        </div>
      </div>
    </div>
  );
}
