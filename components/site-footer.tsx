export function SiteFooter() {
  return (
    <footer className="py-12 border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-6">
        {/* Top rule */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[9px] font-mono text-muted-foreground tracking-[0.5em] uppercase">
            VALORAIPLUS
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Data row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          <div className="bg-background p-4 text-center">
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">
              Protocol
            </span>
            <span className="text-xs font-mono font-bold text-foreground">14D CORE</span>
          </div>
          <div className="bg-background p-4 text-center">
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">
              Encryption
            </span>
            <span className="text-xs font-mono font-bold text-foreground">AES-256</span>
          </div>
          <div className="bg-background p-4 text-center">
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">
              Node
            </span>
            <span className="text-xs font-mono font-bold text-foreground">Saint Paul, MN</span>
          </div>
          <div className="bg-background p-4 text-center">
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">
              Deployed
            </span>
            <span className="text-xs font-mono font-bold text-foreground">Feb 2026</span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] font-serif text-muted-foreground/60 italic leading-relaxed max-w-2xl mx-auto text-center">
          Sovereign stack deployed Feb 2026. A2A-native multi-agent exposure.
          No trillions. No vapor. Just the hardest money possible.
        </p>

        <p className="text-[9px] font-mono text-muted-foreground/30 tracking-[0.3em] uppercase text-center">
          Identity Sealed: 4th of November // 0xA3F7...D91E.eth
        </p>
        <p className="text-[8px] font-mono text-muted-foreground/20 tracking-wider text-center mt-2 break-all">
          ParentCID: bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku
        </p>
      </div>
    </footer>
  )
}
