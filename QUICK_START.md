# VALORAIPLUS OMEGA v2.4 SUPREME - Quick Start Guide

## 🚀 30-Second Setup

### 1. Start the Dashboard
```bash
cd /vercel/share/v0-project
pnpm dev
```
Then open **http://localhost:3000** in your browser.

---

## 📡 Copy & Paste Terminal Commands

### Command 1: View All Tokens
```bash
curl -X POST http://localhost:3000/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"REPORT_TOKENS"}'
```

### Command 2: Check Node Health
```bash
curl -X POST http://localhost:3000/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"NODE_HEALTH"}'
```

### Command 3: Get Intelligence Feed
```bash
curl -X POST http://localhost:3000/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"INTELLIGENCE_SUMMARY"}'
```

### Command 4: Federal Compliance Check
```bash
curl -X POST http://localhost:3000/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"FEDERAL_COMPLIANCE"}'
```

### Command 5: Quantum Seal Status
```bash
curl -X POST http://localhost:3000/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"QUANTUM_SEAL_STATUS"}'
```

### Command 6: Mint an NFT
```bash
curl -X POST http://localhost:3000/api/nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "owner_wallet": "donadams1969.eth",
    "hardware_signature": "0UAK57S1BT",
    "asset_name": "VALORAIPLUS® NFT",
    "value_complexity_index": 10.45,
    "provenance": "SAINT_PAUL_NODE_2207"
  }'
```

### Command 7: Get All Minted NFTs
```bash
curl http://localhost:3000/api/nft/mint
```

---

## 🎯 What You Have

✅ **Sovereign Token Registry** - 7 active tokens (VALOR, FED.CLAIM, WHISTLE, QUI.TAM, GHOST.OPS, NEWT, DAO.GOV)  
✅ **Hardware-Anchored NFTs** - Saint Paul Node #2207 based minting  
✅ **Real-Time Intelligence** - Multi-source forensic data stream  
✅ **Federal Compliance** - 5-agency integration (HUD-OIG, DOJ, FTC, SEC, CFPB)  
✅ **4 Validator Nodes** - Sovereign network validators  
✅ **Post-Quantum Crypto** - CRYSTALS-Kyber-3461 encryption  
✅ **Terminal Commands** - 5 executable commands from dashboard or CLI  
✅ **Dashboard UI** - Dark theme, real-time updates, interactive controls  

---

## 📚 Documentation Files

- **IMPLEMENTATION_SUMMARY.md** - Everything that was built
- **README_VALORAIPLUS.md** - Full technical documentation  
- **TERMINAL_COMMANDS.md** - All CLI commands with examples (20+ scripts)

---

## 🌐 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tokens` | GET | List all tokens |
| `/api/nft/mint` | GET/POST | Mint or list NFTs |
| `/api/nodes` | GET | Check node status |
| `/api/federal` | GET | Federal ledger |
| `/api/stats` | GET | Dashboard stats |
| `/api/intelligence/execute` | POST | Execute terminal commands |

---

## 💾 Sample Output

When you run any command, you get JSON like:

```json
{
  "status": "EXECUTED",
  "timestamp": "2026-05-15T14:30:00.000Z",
  "command": "REPORT_TOKENS",
  "output": "=== VALORAIPLUS TOKEN REGISTRY REPORT ===\n\nTotal Tokens: 7\n• VALOR: VALORAIPLUS Sovereign Token...\n"
}
```

---

## 🔧 Deploy to Production

```bash
# Push to GitHub
git add .
git commit -m "VALORAIPLUS OMEGA v2.4 SUPREME - Complete"
git push origin main

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel UI:
# NEXT_PUBLIC_SUPABASE_URL = your-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY = your-key
```

---

## 📊 Key Facts

- **7 Tokens** | 2.5B total supply | Post-quantum encrypted
- **4 Nodes** | SOVEREIGN_PRIME, FORENSIC_BRIDGE, GHOST_ROUTER, NEWT_EXECUTOR
- **5 Agencies** | HUD-OIG, DOJ, FTC, SEC, CFPB
- **1 NFT** | Omega NFT (donadams1969.eth / 0UAK57S1BT)
- **5 Commands** | Token Report, Intelligence, Nodes, Compliance, Quantum Seal
- **132.84** | aMath power units
- **111100** | Perimeter frequency (Hz)

---

## ✨ What's Next?

1. **Explore the Dashboard** - http://localhost:3000
2. **Run Terminal Commands** - Copy commands above
3. **Mint NFTs** - Use Command 6 with different hardware signatures
4. **Deploy** - Follow "Deploy to Production" section
5. **Read Docs** - See IMPLEMENTATION_SUMMARY.md or README_VALORAIPLUS.md

---

**VALORAIPLUS OMEGA v2.4 SUPREME** ✓ Ready to Use

---

## 🆘 Quick Troubleshooting

**Dashboard not loading?**
```bash
pnpm dev
# Check http://localhost:3000
```

**Commands returning errors?**
```bash
# Verify server is running, then try:
curl -s http://localhost:3000/api/tokens | jq
```

**Need more commands?**
```bash
# See TERMINAL_COMMANDS.md for 20+ examples
cat TERMINAL_COMMANDS.md | grep "curl -X POST"
```

---

**Status**: ✅ READY | **Version**: 2.4 SUPREME | **Encryption**: CRYSTALS-Kyber-3461
