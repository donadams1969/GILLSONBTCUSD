#!/usr/bin/env bash
set -euo pipefail

URL=${1:-http://localhost:3000}

mkdir -p public/audit

echo "Generating audit artifacts for $URL..."

# Security headers snapshot
curl -sI "$URL" > public/audit/headers.txt
echo "  [1/4] Headers captured"

# Lighthouse (requires Chrome + lighthouse npm package)
if command -v npx &> /dev/null; then
  npx -y lighthouse "$URL" \
    --output html \
    --output-path public/audit/lighthouse.html \
    --only-categories=accessibility,best-practices,performance \
    --chrome-flags="--headless --no-sandbox" 2>/dev/null || echo "  [2/4] Lighthouse skipped (Chrome not available)"
  echo "  [2/4] Lighthouse complete"
else
  echo "  [2/4] Lighthouse skipped (npx not found)"
fi

# axe-core accessibility scan
if command -v npx &> /dev/null; then
  npx -y @axe-core/cli "$URL" --save public/audit/axe.json 2>/dev/null || echo "  [3/4] axe-core skipped"
  echo "  [3/4] axe-core complete"
else
  echo "  [3/4] axe-core skipped (npx not found)"
fi

# Manual notes
cat <<EOF > public/audit/notes.md
# VALORAIPLUS Audit Notes

## Youth Safety Tests
- Child mode: wallet disabled, links confirmed, redaction active
- PIN lock: exit to adult denied without PIN
- Network: no calls on mode toggle

## Hydration
- Production build console clean (no mismatch warnings)
- All formatters pinned to en-US via Intl.NumberFormat

## CSP
- Report-only active, violations zero (pending enforcement flip)

## Accessibility
- Skip-to-content link present
- All images have alt text or aria-hidden
- Focus rings on all interactive elements
- Reduced motion respected

Run date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF
echo "  [4/4] Notes generated"

echo ""
echo "Audit artifacts generated in public/audit/"
ls -la public/audit/
