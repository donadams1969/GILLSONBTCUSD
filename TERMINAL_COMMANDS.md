# VALORAIPLUS OMEGA v2.4 SUPREME - Terminal Command Reference

## 🔐 Intelligence Reporting in Your Terminal

This document contains ready-to-run terminal commands for interacting with the VALORAIPLUS Banking Port.hole Dashboard from your local environment.

---

## Prerequisites

```bash
# Ensure you have curl installed (macOS/Linux)
# Windows users can use PowerShell's Invoke-WebRequest or install Windows Subsystem for Linux

# Verify curl is available
curl --version
```

---

## Environment Setup

```bash
# Set your local API endpoint (replace with your deployed URL)
export VALORAI_API="http://localhost:3000"
# Or for production:
# export VALORAI_API="https://your-production-url.vercel.app"

# Supabase credentials (optional for advanced integration)
export SUPABASE_URL="your-supabase-project-url"
export SUPABASE_ANON_KEY="your-anon-key"
```

---

## Core Terminal Commands

### 1. Token Registry Report

```bash
curl -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{
    "command_type": "REPORT_TOKENS"
  }'
```

**Output**: Complete listing of all active VALORAIPLUS sovereign tokens, supply caps, and status.

---

### 2. Real-Time Intelligence Summary

```bash
curl -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{
    "command_type": "INTELLIGENCE_SUMMARY"
  }'
```

**Output**: Latest 10 intelligence reports with severity levels and risk scores.

---

### 3. Node Health Check

```bash
curl -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{
    "command_type": "NODE_HEALTH"
  }'
```

**Output**: Status of all authorized sovereign validator nodes and their heartbeats.

---

### 4. Federal Compliance Report

```bash
curl -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{
    "command_type": "FEDERAL_COMPLIANCE"
  }'
```

**Output**: Multi-agency compliance status and evidence hash verification.

---

### 5. Quantum Seal Status

```bash
curl -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{
    "command_type": "QUANTUM_SEAL_STATUS"
  }'
```

**Output**: Post-quantum cryptography seal operational status and encryption power metrics.

---

## NFT Minting Commands

### Mint Hardware-Anchored NFT

```bash
curl -X POST $VALORAI_API/api/nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "owner_wallet": "donadams1969.eth",
    "hardware_signature": "0UAK57S1BT",
    "asset_name": "VALORAIPLUS® Omega NFT",
    "value_complexity_index": 10.45,
    "provenance": "SAINT_PAUL_NODE_2207"
  }'
```

**Response**: 
- `token_id`: Unique identifier for the minted NFT
- `tx_hash`: Blockchain transaction hash
- `waterfall_verified`: Verification status
- `mint_status`: MINTED_CLOSED_LOOP

---

### Fetch All Minted NFTs

```bash
curl -X GET $VALORAI_API/api/nft/mint \
  -H "Content-Type: application/json"
```

**Output**: Complete list of minted hardware-anchored NFTs with metadata.

---

## Advanced Batch Operations

### Generate Comprehensive Intelligence Report

```bash
# Create a comprehensive report with all data points
bash << 'EOF'
echo "=== VALORAIPLUS INTELLIGENCE REPORT ==="
echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

echo "1. Token Registry:"
curl -s -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"REPORT_TOKENS"}' | jq '.output'

echo ""
echo "2. Intelligence Feed:"
curl -s -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"INTELLIGENCE_SUMMARY"}' | jq '.output'

echo ""
echo "3. Node Status:"
curl -s -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"NODE_HEALTH"}' | jq '.output'

echo ""
echo "4. Federal Compliance:"
curl -s -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"FEDERAL_COMPLIANCE"}' | jq '.output'

echo ""
echo "5. Quantum Seal:"
curl -s -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"QUANTUM_SEAL_STATUS"}' | jq '.output'

echo ""
echo "Report Complete"
EOF
```

---

### Poll Intelligence Every 30 Seconds

```bash
# Continuous monitoring mode
while true; do
  clear
  echo "VALORAIPLUS Intelligence Stream - $(date)"
  echo "========================================"
  curl -s -X POST $VALORAI_API/api/intelligence/execute \
    -H "Content-Type: application/json" \
    -d '{"command_type":"INTELLIGENCE_SUMMARY"}' | jq '.output'
  echo ""
  echo "Press Ctrl+C to exit. Refreshing in 30 seconds..."
  sleep 30
done
```

---

## PowerShell Commands (Windows)

### Token Report (PowerShell)

```powershell
$body = @{
    command_type = "REPORT_TOKENS"
} | ConvertTo-Json

Invoke-WebRequest -Uri "$env:VALORAI_API/api/intelligence/execute" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json
```

---

### NFT Minting (PowerShell)

```powershell
$body = @{
    owner_wallet = "donadams1969.eth"
    hardware_signature = "0UAK57S1BT"
    asset_name = "VALORAIPLUS® NFT"
    value_complexity_index = 10.45
    provenance = "SAINT_PAUL_NODE_2207"
} | ConvertTo-Json

Invoke-WebRequest -Uri "$env:VALORAI_API/api/nft/mint" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json
```

---

## Integration with Cron Jobs

### Daily Intelligence Report (Linux/macOS)

```bash
# Add to crontab with: crontab -e
# Run daily at 9 AM local time

0 9 * * * bash << 'EOF'
REPORT=$(curl -s -X POST http://localhost:3000/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"REPORT_TOKENS"}')

# Save to file with timestamp
echo "$(date): $REPORT" >> ~/valoraiplus_reports.log

# Optional: Send email notification
# echo "$REPORT" | mail -s "VALORAIPLUS Daily Report" your-email@example.com
EOF
```

---

## Response Format

All commands return JSON with this structure:

```json
{
  "status": "EXECUTED",
  "timestamp": "2026-05-15T14:30:00.000Z",
  "command": "COMMAND_NAME",
  "output": "Command output text...",
  "error": null
}
```

---

## Error Handling

```bash
# Check for errors in response
curl -s -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"REPORT_TOKENS"}' | jq '
    if .error then
      "ERROR: " + .error
    else
      .output
    end
  '
```

---

## Troubleshooting

### Connection Refused
```bash
# Verify the API is running
curl -s http://localhost:3000/api/tokens
# Should return 200 OK
```

### Authentication Issues
```bash
# Verify environment variables
echo "SUPABASE_URL: $SUPABASE_URL"
echo "SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..."
```

### Timeout Issues
```bash
# Add timeout to curl request
curl -m 30 -X POST $VALORAI_API/api/intelligence/execute \
  -H "Content-Type: application/json" \
  -d '{"command_type":"REPORT_TOKENS"}'
```

---

## Performance Tips

- Use `jq` for JSON parsing: `curl ... | jq '.output'`
- Filter large responses: `curl ... | jq '.nfts[] | select(.status=="ACTIVE")'`
- Save responses for batch processing: `curl ... > report_$(date +%s).json`
- Use `parallel` for concurrent requests on large datasets

---

## Support & Documentation

- **Dashboard**: http://localhost:3000
- **Supabase Console**: https://app.supabase.com
- **GitHub Repository**: https://github.com/18fu-ai/HUD-OIG-Valoraiplus_authorizedNodes-

---

*VALORAIPLUS OMEGA v2.4 SUPREME | Banking Port.hole Dashboard | Sovereign Financial Intelligence System*
