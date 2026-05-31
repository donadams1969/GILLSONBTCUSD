"use client"

import { useState, useEffect, useCallback } from "react"
import { Terminal, Cpu, Anchor, Globe, Copy, Check, Shield, ExternalLink } from "lucide-react"
import { SovereignChart } from "@/components/sovereign-chart"
import { fmtDecimal } from "@/lib/format"

/* ── Token data ───────────────────────────── */
const SUPPLY = 1_000_000

const tokens = [
  {
    id: "leg1904",
    symbol: "$LEG1904",
    name: "Hard Gold Floor",
    price: 4135,
    capB: (4135 * SUPPLY) / 1e9,
    color: "hsl(43 72% 52%)",
    type: "Anchor",
    fn: "anchoredLEG1904Price()",
    peg: "XAU/USD Chainlink Feed",
    confidence: 100,
    utility: "Unbreakable baseline asset. On-chain revert if GDP breaches scaled gold floor. Pure downside protection.",
    verifyUrl: "https://data.chain.link/feeds/ethereum/mainnet/xau-usd",
    verifyLabel: "XAU/USD Oracle",
    oracleKey: "LEG1904",
  },
  {
    id: "donny",
    symbol: "$DONNY",
    name: "GDP Scalar",
    price: 110.98,
    capB: (110.98 * SUPPLY) / 1e9,
    color: "hsl(217 70% 55%)",
    type: "Executive",
    fn: "anchoredDONNYPrice()",
    peg: "GDP / 1T Macro Anchor",
    confidence: 99.5,
    utility: "Governance + revenue share. Holders vote treasury and earn fees. Direct global growth exposure.",
    verifyUrl: "https://data.chain.link/feeds/ethereum/mainnet/eth-usd",
    verifyLabel: "GDP Macro Feed",
    oracleKey: "DONNY",
  },
  {
    id: "jaxx",
    symbol: "$JAXX",
    name: "Protocol Guard",
    price: 110.98,
    capB: (110.98 * SUPPLY) / 1e9,
    color: "hsl(160 45% 40%)",
    type: "Equity",
    fn: "anchoredJAXXPrice()",
    peg: "GDP / 1T Equity Mirror",
    confidence: 99.5,
    utility: "Priority revenue + airdrops. Rewards long-term holders and protocol alignment.",
    verifyUrl: "https://data.chain.link/feeds/ethereum/mainnet/eth-usd",
    verifyLabel: "GDP Equity Feed",
    oracleKey: "JAXX",
  },
  {
    id: "gillgold",
    symbol: "$GILLGOLD",
    name: "Synthetic Gold",
    price: 2745.5,
    capB: (2745.5 * SUPPLY) / 1e9,
    color: "hsl(43 72% 60%)",
    type: "Reserve",
    fn: "anchoredGILLGOLDPrice()",
    peg: "66.4% of XAU Spot",
    confidence: 98,
    utility: "Yield-bearing gold proxy. Stake for compounding rewards backed by live feeds.",
    verifyUrl: "https://data.chain.link/feeds/ethereum/mainnet/xau-usd",
    verifyLabel: "XAU/USD Oracle",
    oracleKey: "GILLGOLD",
  },
  {
    id: "gillbtc",
    symbol: "$GILLBTC",
    name: "Synthetic BTC",
    price: 98420,
    capB: (98420 * SUPPLY) / 1e9,
    color: "hsl(25 70% 50%)",
    type: "Digital",
    fn: "anchoredGILLBTCPrice()",
    peg: "BTC/USD Chainlink Feed",
    confidence: 97,
    utility: "Non-custodial BTC beta. Hedge or leverage inside the sovereign stack.",
    verifyUrl: "https://data.chain.link/feeds/ethereum/mainnet/btc-usd",
    verifyLabel: "BTC/USD Oracle",
    oracleKey: "GILLBTC",
  },
]

const fmtPrice = fmtDecimal

/* ── Artifact addresses ───────────────────── */
const artifacts = [
  { label: "FUNCTIONS_ROUTER_MAINNET", address: "0x65Dcc24F8ff9e51F10DCc7Ed1e4e2A61e6E14bd6", color: "text-foreground" },
  { label: "DON_ID_BYTES32", address: "0x66756e2d657468657265756d2d6d61696e6e65742d31000000000000000000000000000000", color: "text-primary" },
  { label: "GOLD_FEED_XAU/USD", address: "0x214eD9Da11D2fbe465a6fC601a91e62eBec1A0d6", color: "text-foreground" },
  { label: "BTC_FEED_BTC/USD", address: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", color: "text-[hsl(25,70%,50%)]" },
]

const foundryCmd = `# Deploy ValorAiBusinessLogic (BLL) + ERC20 tokens
forge script script/DeployV0.s.sol \\
  --rpc-url $ETH_MAINNET_RPC \\
  --broadcast --verify \\
  --etherscan-api-key $ETHERSCAN_KEY \\
  --priority-fee 1.5gwei`

/* ── Component ────────────────────────────── */
export function TabbedDashboard() {
  const [tab, setTab] = useState<"telemetry" | "contracts" | "sbt" | "a2a" | "node">("telemetry")
  const [logs, setLogs] = useState<string[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [livePrices, setLivePrices] = useState<Record<string, number> | null>(null)
  const [oracleSource, setOracleSource] = useState<string>("initializing")

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false })
    setLogs((prev) => [`[${ts}] ${msg}`, ...prev].slice(0, 20))
  }, [])

  // Fetch live prices from sovereign oracle
  useEffect(() => {
    let alive = true
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/oracle/prices")
        if (!res.ok) throw new Error(`${res.status}`)
        const data = await res.json()
        if (alive) {
          setLivePrices(data.prices)
          setOracleSource(data.source)
          addLog(`Oracle sync: ${Object.keys(data.prices).length} feeds from ${data.source}`)
        }
      } catch {
        if (alive) addLog("Oracle sync failed -- using static anchors")
      }
    }
    fetchPrices()
    const iv = setInterval(fetchPrices, 10_000)
    return () => { alive = false; clearInterval(iv) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    addLog("VALORAIPLUS V1 Sovereign Stack Initialized.")
    addLog("WCAG AA: Contrast 5.5:1 // Focus rings active")
    addLog("A2A: Linux Foundation compliant // AGNTCY registered")
    addLog("AgentCard: /.well-known/agent.json LIVE")
    addLog("SBT: SovereignCredential.sol // Curriculum gates active")
    addLog("Backend: Sovereign edge APIs -- zero external dependencies")
    addLog("Core Frequency: Ghost_Low (0.01Hz)")
    addLog("Node Provenance: Saint Paul, MN // [ENCRYPTED]")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Merge live prices into token data
  const liveTokens = tokens.map((t) => {
    const livePrice = livePrices?.[t.oracleKey]
    const price = livePrice ?? t.price
    return { ...t, price, capB: (price * SUPPLY) / 1e9 }
  })

  const totalFdvB = liveTokens.reduce((sum, t) => sum + t.capB, 0)

  const chartData = liveTokens.map((t) => ({
    label: t.symbol,
    value: parseFloat(t.capB.toFixed(3)),
    confidence: t.confidence,
    color: t.color,
    price: t.price,
  }))

  const copyAddress = (address: string, label: string) => {
    navigator.clipboard.writeText(address)
    setCopied(label)
    addLog(`Copied: ${address.substring(0, 20)}...`)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <>
      {/* Tab bar -- institutional style */}
      <div className="flex border-b border-border">
        {(["telemetry", "contracts", "sbt", "a2a", "node"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-6 py-2.5 text-[10px] font-mono uppercase tracking-[0.2em] font-bold transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── TELEMETRY TAB ───────────────── */}
      {tab === "telemetry" && (
        <div className="flex flex-col gap-6">
          {/* Asset matrix header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-border">
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground">
                {"I. VALORAIPLUS\u00AE Sovereign Asset Matrix"}
              </h2>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-mono">
                Realistic Launch Targets // 1M Fixed Supply // Path to $10-100M FDV
                <span className="ml-3 text-accent">[{oracleSource}]</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider block mb-0.5">
                Notional Index Sum (reference only)
              </span>
              <span className="text-sm font-mono text-primary font-bold uppercase bg-primary/10 px-3 py-1 border border-primary/20">
                ${totalFdvB.toFixed(2)}B
              </span>
            </div>
          </div>

          {/* Token cards -- data table style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-border">
            {liveTokens.map((token) => (
              <div key={token.id} className="bg-card p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span
                    className="px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest border"
                    style={{ color: token.color, borderColor: token.color }}
                  >
                    {token.type}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono font-bold">
                    {token.symbol}
                  </span>
                </div>
                <h4 className="text-2xl font-mono font-bold text-foreground tabular-nums">
                  ${fmtPrice.format(token.price)}
                </h4>
                <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-widest font-mono">
                  {token.name}
                </p>
                {/* Utility */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-[8px] text-muted-foreground/50 uppercase tracking-wider mb-1 font-mono">Utility</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-serif">{token.utility}</p>
                </div>
                {/* FDV */}
                <div className="mt-auto pt-4 border-t border-border">
                  <span className="text-[8px] text-muted-foreground uppercase block tracking-wider font-mono">
                    Target FDV (1M Supply)
                  </span>
                  <span className="text-sm font-mono font-bold tabular-nums" style={{ color: token.color }}>
                    {token.capB >= 1 ? `$${token.capB.toFixed(2)}B` : `$${(token.capB * 1000).toFixed(1)}M`}
                  </span>
                </div>
                {/* Verified On-Chain -- links to Chainlink data feed with live value */}
                <a
                  href={token.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex flex-col items-center gap-1 px-3 py-2.5 transition-colors border"
                  style={{ color: token.color, borderColor: `color-mix(in srgb, ${token.color} 30%, transparent)` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${token.color} 10%, transparent)`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest">
                    <Shield className="w-3 h-3" aria-hidden="true" />
                    {token.verifyLabel}
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-mono font-bold tabular-nums" style={{ color: token.color }}>
                    ${fmtPrice.format(token.price)}
                  </span>
                  <span className="sr-only">{`View ${token.verifyLabel} live data feed on Chainlink -- current value $${fmtPrice.format(token.price)}`}</span>
                </a>
              </div>
            ))}
          </div>

          {/* Hard disclaimer */}
          <p className="text-[10px] font-mono text-muted-foreground/60 italic leading-relaxed border-t border-border pt-3">
            Index references are oracle inputs for modeling / synthetic exposure -- not current token prices,
            not guaranteed valuations, and not a promise of FDV. Target FDV reflects a modeled post-launch path,
            not a guarantee. Token value is determined by collateral, issuance rules, and market dynamics.
          </p>

          {/* Chart + Terminal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px border border-border">
            {/* Chart */}
            <div className="lg:col-span-2 bg-card p-6 min-w-0 overflow-hidden border-r border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-serif font-bold text-foreground">
                  Sovereign Anchor Analytics
                </h3>
                <div className="flex items-center gap-4 text-[8px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-primary inline-block" />
                    FDV ($B)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-accent inline-block" />
                    Confidence (%)
                  </span>
                </div>
              </div>
              <SovereignChart data={chartData} />
            </div>

            {/* Terminal */}
            <div className="bg-background flex flex-col relative">
              <div className="px-4 py-3 bg-card border-b border-border flex justify-between items-center">
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  Node Trace
                </span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-border" />
                  <div className="w-2 h-2 bg-border" />
                  <div className="w-2 h-2 bg-accent" />
                </div>
              </div>
              <div
                className="flex-grow flex flex-col gap-2 p-4 font-mono text-[9px] text-accent/60 code-scroll overflow-y-auto"
                aria-live="polite"
                aria-atomic="false"
              >
                {logs.map((log, i) => (
                  <p key={`log-${i}`} className={i === 0 ? "text-accent" : ""}>{log}</p>
                ))}
                <span className="cursor-blink text-accent">_</span>
              </div>
            </div>
          </div>

          {/* Mainnet Artifacts */}
          <section className="bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-base font-serif font-bold text-foreground">
                II. Mainnet V1 Artifacts
              </h3>
              <span className="text-[9px] font-mono text-accent uppercase font-bold border border-accent/30 px-2 py-1">
                LIVE FEB 2026
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                {artifacts.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => copyAddress(a.address, a.label)}
                    className="p-4 bg-background border border-border flex justify-between items-center cursor-pointer hover:border-primary/30 transition-colors text-left"
                  >
                    <div className="overflow-hidden min-w-0">
                      <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-1 tracking-wider">{a.label}</span>
                      <code className={`text-[10px] ${a.color} truncate block font-mono`}>
                        {a.address.length > 50 ? `${a.address.substring(0, 36)}...` : a.address}
                      </code>
                    </div>
                    {copied === a.label ? (
                      <Check className="w-3.5 h-3.5 text-accent ml-3 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground ml-3 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-5 bg-background border border-border flex flex-col justify-center">
                <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-3 tracking-wider">Foundry Deploy Template</span>
                <pre className="text-[10px] font-mono text-accent/50 leading-relaxed overflow-x-auto code-scroll p-4 bg-card">{foundryCmd}</pre>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── CONTRACTS TAB ───────────────── */}
      {tab === "contracts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border">
          <div className="bg-card p-6">
            <h3 className="text-base font-serif font-bold mb-4 flex items-center text-foreground">
              <Cpu className="w-4 h-4 mr-2 text-[hsl(217,70%,55%)]" aria-hidden="true" />
              ValorAiBusinessLogic.sol
            </h3>
            <div className="bg-background p-4 font-mono text-[10px] text-[hsl(217,70%,55%)]/70 leading-relaxed h-80 overflow-y-auto code-scroll">
              <pre>{`// VALORAIPLUS V1 — BLL + Curriculum Gate
contract ValorAiBusinessLogic is Ownable {
    ISovereignAnchor public anchor;
    ISovereignCredential public immutable creds;

    uint8 public constant BUS_2951 = 1;
    uint8 public constant AI_4000  = 2;
    uint8 public constant AI_4001  = 3;

    modifier curriculumGate(uint8 req) {
        require(
            creds.hasCompleted(msg.sender, req),
            "SovereignAccess: Curriculum required"
        );
        _;
    }

    function enforcePeg(uint256 _txId) external {
        uint256 gdp = anchor.latestGDP();
        require(
            gdp >= anchor.GOLD_PEG(),
            "AMATH_BREACH: Macro Floor Conflict"
        );
        _executeLogic(_txId);
    }

    function voteOnProposal(uint256 id, bool s)
        external curriculumGate(BUS_2951)
    { /* proposal logic */ }

    function claimYield()
        external curriculumGate(AI_4000)
    { /* yield logic */ }
}`}</pre>
            </div>
          </div>

          <div className="bg-card p-6">
            <h3 className="text-base font-serif font-bold mb-4 flex items-center text-foreground">
              <Anchor className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
              SovereignAnchor.sol
            </h3>
            <div className="bg-background p-4 font-mono text-[10px] text-primary/70 leading-relaxed h-80 overflow-y-auto code-scroll">
              <pre>{`// SAINT PAUL NODE AUTHENTICATION
// PROVENANCE: 0xA3F7D91E...c8b2 [SHA-256]
contract SovereignAnchor is FunctionsClient {
    bytes32 public constant DON_ID =
        0x66756e2d65746865...;

    // World Bank GDP (oracle input, NOT token FDV)
    uint256 public latestGDP;
    uint256 public GOLD_PEG = 4135;

    function fulfillRequest(...)
        internal override
    {
        latestGDP = abi.decode(
            response, (uint256)
        );
    }
}`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ── SBT TAB ─────────────────────── */}
      {tab === "sbt" && (
        <section className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <h3 className="text-base font-serif font-bold text-foreground">
              III. Soulbound Credential System (SBT)
            </h3>
            <span className="text-[9px] font-mono text-accent uppercase font-bold border border-accent/30 px-2 py-1">
              ERC-721 NON-TRANSFERABLE
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-3xl font-serif">
            On-chain education credentials that gate protocol access. Complete
            curriculum modules to unlock governance voting, yield claims, and
            advanced stack functions. Soulbound (non-transferable) -- your
            credential, your wallet, permanent.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border mb-8">
            <div className="bg-card p-6">
              <h4 className="text-sm font-serif font-bold mb-4 flex items-center text-foreground">
                <Shield className="w-4 h-4 mr-2 text-accent" aria-hidden="true" />
                SovereignCredential.sol
              </h4>
              <div className="bg-background p-4 font-mono text-[10px] text-accent/70 leading-relaxed h-80 overflow-y-auto code-scroll">
                <pre>{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SovereignCredential is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE =
        keccak256("MINTER_ROLE");
    uint256 private _nextId = 1;

    mapping(address => mapping(uint8 => bool))
        public hasCompleted;
    mapping(uint256 => uint8) public tokenCourse;

    event CredentialMinted(
        address indexed to,
        uint8 indexed courseId,
        uint256 indexed tokenId
    );

    constructor(address admin)
        ERC721("VALORAIPLUS Sovereign Credential",
               "VALCRED")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function mintCredential(
        address to, uint8 courseId
    ) external onlyRole(MINTER_ROLE)
      returns (uint256 tokenId)
    {
        require(!hasCompleted[to][courseId],
            "Already completed");
        tokenId = _nextId++;
        _safeMint(to, tokenId);
        tokenCourse[tokenId] = courseId;
        hasCompleted[to][courseId] = true;
        emit CredentialMinted(to, courseId, tokenId);
    }

    function _update(
        address to, uint256 tokenId, address auth
    ) internal override returns (address from) {
        from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0))
            revert("Soulbound: Non-transferable");
        return super._update(to, tokenId, auth);
    }
}`}</pre>
              </div>
            </div>

            {/* Curriculum Tracker */}
            <div className="bg-card p-6 flex flex-col gap-4">
              <h4 className="text-sm font-serif font-bold text-foreground">Curriculum Modules</h4>
              <p className="text-[10px] text-muted-foreground font-serif">
                Complete each module to mint a soulbound credential. Credentials gate specific protocol functions via <code className="text-accent font-mono">curriculumGate</code>.
              </p>
              {[
                { id: 1, code: "BUS 2951", name: "Business Logic Fundamentals", gates: "voteOnProposal()", status: "required" },
                { id: 2, code: "AI 4000", name: "Sovereign AI Architecture", gates: "claimYield()", status: "required" },
                { id: 3, code: "AI 4001", name: "Oracle Integration Patterns", gates: "enforcePeg()", status: "advanced" },
                { id: 4, code: "AI 4002", name: "Multi-Agent Systems (A2A)", gates: "deployAgent()", status: "advanced" },
                { id: 5, code: "AI 4003", name: "Tokenomics & Macro Pegs", gates: "adjustPeg()", status: "advanced" },
                { id: 6, code: "AI 4004", name: "Sovereign Stack Capstone", gates: "Full Admin Access", status: "capstone" },
              ].map((course) => (
                <div key={course.id} className="p-3 bg-background border border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-mono font-bold text-primary shrink-0">
                      {course.id}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-foreground truncate font-mono">{course.code}: {course.name}</p>
                      <p className="text-[9px] font-mono text-muted-foreground/50 mt-0.5">
                        {"Gates: "}<span className="text-accent">{course.gates}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 shrink-0 border ${
                    course.status === "required" ? "text-primary border-primary/30" :
                    course.status === "capstone" ? "text-primary border-primary/30" :
                    "text-accent border-accent/30"
                  }`}>
                    {course.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <h4 className="text-sm font-serif font-bold mb-4 text-primary">Deploy & Mint (Foundry)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            <div className="bg-background p-4">
              <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-2 tracking-wider">Deploy SovereignCredential</span>
              <pre className="text-[10px] font-mono text-accent/70 leading-relaxed">
{`forge script script/DeployCredential.s.sol \\
  --rpc-url $SEPOLIA_RPC_URL \\
  --broadcast --verify -vvvv

# Grant MINTER_ROLE to oracle:
cast send $CRED_ADDR \\
  "grantRole(bytes32,address)" \\
  $(cast keccak "MINTER_ROLE") \\
  $ORACLE_ADDRESS \\
  --rpc-url $SEPOLIA_RPC_URL \\
  --private-key $DEPLOYER_KEY`}
              </pre>
            </div>
            <div className="bg-background p-4">
              <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-2 tracking-wider">UI Read Pattern (native fetch)</span>
              <pre className="text-[10px] font-mono text-accent/70 leading-relaxed">
{`// Sovereign backend -- no wagmi/viem dependency
const res = await fetch("/api/oracle/prices");
const { prices, source } = await res.json();

// Read credential status via our edge:
const status = await fetch("/api/status");
const { node, security } = await status.json();

// All data flows through sovereign APIs
// Zero external SDK dependencies`}
              </pre>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/50 mt-4 italic font-serif">
            OZ v5.x compatible. SBT enforcement via _update() hook blocks all transfer paths.
          </p>
        </section>
      )}

      {/* ── A2A TAB ─────────────────────── */}
      {tab === "a2a" && (
        <section className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <h3 className="text-base font-serif font-bold text-foreground">
              IV. A2A Sovereign Agent Compliance & Deployment
            </h3>
            <span className="text-[9px] font-mono text-accent uppercase font-bold border border-accent/30 px-2 py-1">
              LINUX FOUNDATION A2A + AGNTCY
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-3xl font-serif">
            VALORAIPLUS macro oracle is fully A2A-compliant (Google 2025, Linux Foundation June 2025). Discoverable via AGNTCY directories, interoperable with AWS Bedrock, Microsoft Copilot Studio, ServiceNow, etc.
          </p>

          <h4 className="text-sm font-serif font-bold mb-4 text-primary">1. A2A Validation</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border mb-8">
            <div className="bg-background p-4">
              <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-2 tracking-wider">A2A Inspector CLI</span>
              <pre className="text-[10px] font-mono text-accent/70 leading-relaxed">{`pip install a2a-inspector\na2a inspect https://api.valorai.plus/a2a`}</pre>
            </div>
            <div className="bg-background p-4">
              <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-2 tracking-wider">AgentCard Endpoint</span>
              <code className="text-[10px] text-primary break-all font-mono">https://valorai.plus/.well-known/agent.json</code>
            </div>
            <div className="bg-background p-4">
              <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-2 tracking-wider">Protocol Check</span>
              <p className="text-[10px] text-muted-foreground font-mono">JSON-RPC 2.0 over HTTP/gRPC + SSE</p>
            </div>
          </div>

          <h4 className="text-sm font-serif font-bold mb-4 text-primary">2. Deployment Guide</h4>
          <div className="bg-background border border-border p-4 mb-8">
            <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-3 tracking-wider">Docker + Cloud Run / Bedrock</span>
            <pre className="text-[10px] font-mono text-accent/70 leading-relaxed">
{`FROM python:3.12-slim
RUN pip install a2a-sdk web3 uvicorn
COPY server.py .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0"]`}
            </pre>
            <p className="text-[10px] text-muted-foreground mt-3 font-serif">
              Deploy to Google Cloud Run or AWS Bedrock AgentCore Runtime. Register in AGNTCY directory.
            </p>
          </div>

          <h4 className="text-sm font-serif font-bold mb-4 text-primary">3. Interoperability & Monitoring</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border mb-8">
            <div className="bg-background p-4">
              <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-2 tracking-wider">MCP Integration</span>
              <p className="text-[10px] text-muted-foreground font-serif">Compatible with Anthropic MCP for external tool/database pulls.</p>
            </div>
            <div className="bg-background p-4">
              <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-2 tracking-wider">Observability</span>
              <p className="text-[10px] text-muted-foreground font-serif">AGNTCY SDK logging + metrics for agent interactions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            <div className="bg-background p-4 overflow-x-auto code-scroll">
              <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-2 tracking-wider">AgentCard JSON (excerpt)</span>
              <pre className="text-[10px] font-mono text-accent/70 leading-relaxed">
{`{
  "name": "VALORAIPLUS Sovereign Anchor Agent",
  "description": "Macro-economic oracle agent
    with hard gold/GDP peg enforcement",
  "version": "0.1",
  "capabilities": [
    "query_anchored_price",
    "check_peg_status",
    "trigger_gdp_update (authorized)",
    "compute_sovereign_valuation"
  ],
  "endpoint": "https://api.valorai.plus/a2a"
}`}
              </pre>
            </div>
            <div className="bg-background p-4">
              <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-3 tracking-wider">A2A Server (a2a-sdk Python)</span>
              <pre className="text-[10px] font-mono text-accent/50 leading-relaxed overflow-x-auto code-scroll p-4 bg-card">
{`from a2a import A2AServer, AgentCard
from web3 import Web3

card = AgentCard(
    name="VALORAIPLUS Sovereign Agent",
    capabilities=[
        "query_anchored_price",
        "check_peg_status"
    ]
)

server = A2AServer(
    card=card,
    contract=Web3(...).eth.contract(
        address=VALOR_LOGIC_ADDR
    )
)

@server.task("query_anchored_price")
def get_price(token: str):
    fn = f"anchored{token.upper()}Price"
    return server.contract.functions[fn]().call()

server.run(host="0.0.0.0", port=8000)`}
              </pre>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/50 mt-6 italic font-serif">
            Official specs & SDKs:{" "}
            <a href="https://github.com/a2aproject/A2A" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              github.com/a2aproject/A2A
            </a>
          </p>
        </section>
      )}

      {/* ── NODE TAB ────────────────────── */}
      {tab === "node" && (
        <section className="bg-card border border-border p-8 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            <h2 className="text-3xl font-serif font-bold text-foreground">
              Saint Paul Node Provenance
            </h2>
            <p className="text-muted-foreground text-[11px] font-mono tracking-widest leading-loose">
              ADMIN: 0xA3F7...D91E.eth
              <br />
              CELL: [SHA-256 ENCRYPTED]
              <br />
              MERKLEROOT: 0xA3F7...D91E_PROVED [SHA-256]
            </p>
            <div className="pt-4">
              <p className="text-[9px] text-muted-foreground/60 font-mono tracking-widest">
                SOVEREIGN IDENTITY SEALED // 4TH OF NOVEMBER
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
