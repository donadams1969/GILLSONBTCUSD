# VALORAIPLUS//e — FORENSIC CODEX & COLD-STORAGE ATTESTATION
## Evidence Provenance, Off-Disk Preservation & Blockchain Anchor Record

**Intelligence / Forensic Record — Prepared for Lodging**
**Case No.:** CUD-26-682107
**Court:** Superior Court of California, County of San Francisco — Department 12
**Related Case:** CCH-28-589086
**Declarant / Defendant:** Donald Ernest Gillson, In Pro Per
**Codex Date:** June 17, 2026
**System Identifier:** VALORAIPLUS//e
**Repository:** donadams1969/GILLSONBTCUSD

---

> **MANDATORY DISCLAIMER.** This is a technical demonstration and forensic-integrity
> artifact. It is **not** bank approval, regulatory certification, financial-solvency
> verification, or an independent audit opinion. Every cryptographic value in this
> Codex is independently reproducible from the deterministic source documents using
> the standard `sha256sum` utility.

---

## 1. CANONICAL MASTER ROOT (VERIFIED)

There is exactly **one** canonical integrity commitment for this matter. Any other
"root" value appearing in prior drafts is superseded and must be disregarded.

| Field | Value |
|---|---|
| **Master Root Hash (SHA-256)** | `0d0922805bb9456515ec3dd557cdcb6dbd40d6e788ccb8950ebf166858486f93` |
| Hash length | 64 hex characters (256-bit) — valid |
| Exhibits committed | 59 deterministic court documents (Stacks A–K) |
| Derivation | SHA-256 of the canonical key-sorted JSON manifest of all 59 exhibit SHA-256 digests |
| Reproducibility | Fully reproducible; documents are byte-deterministic (pinned timestamps) |

**Superseded values (DO NOT USE):** two earlier draft roots circulated during
preparation (`7a2f8d3c…a5b4c`, which was only 62 characters and therefore not a
valid SHA-256, and `82c1e6e7…979f6d`, which was not produced by this system).
Neither is reproducible from the evidence and neither is used in this Codex.

---

## 2. TIERED COLD-STORAGE ARCHITECTURE

Evidence is preserved off the application disk across three independent tiers, so
that the integrity of the record does not depend on any single store.

### Tier 0 — Deterministic Regeneration (source of truth)
All 59 PDFs are byte-deterministic (filing date and PDF Creation/Modification
timestamps pinned to a canonical epoch). The documents themselves can therefore be
regenerated identically at any time, and each carries a fixed SHA-256.

### Tier 1 — Bitcoin OP_RETURN Anchor (immutable, off all controlled disk)
| Field | Value |
|---|---|
| Anchor network | Bitcoin mainnet |
| OP_RETURN payload | `0d0922805bb9456515ec3dd557cdcb6dbd40d6e788ccb8950ebf166858486f93` |
| Payload size | 32 bytes (the raw 256-bit Master Root) |
| Broadcast method | **Manual** — payload prepared by the system; defendant broadcasts from own wallet |
| **Current status** | **PAYLOAD PREPARED — AWAITING BROADCAST.** No txid has been recorded yet. |

> **Honest status note.** The Bitcoin anchor payload has been generated and is ready
> for broadcast. As of the Codex date it has **not** yet been broadcast, so no
> transaction id is asserted. Once broadcast, the txid is written exactly once into
> the immutable ledger (Section 3) and this Codex is reissued with the confirmed txid.

### Tier 2 — Off-Disk Object Storage (private archive)
| Field | Value |
|---|---|
| Store | Vercel Blob (private access) |
| Contents | Full evidence bundle (all 59 PDFs + hash register) |
| Access | Server-side authenticated retrieval only; private blob URLs never exposed to clients |
| Purpose | Preserve the actual document bytes off the application disk |

### Tier 3 — Immutable Ledger (tamper-evident)
| Field | Value |
|---|---|
| Store | Supabase PostgreSQL — `valoraiplus_cold_storage_seals` |
| Write model | Append-only; one row per sealing event |
| Guard | Database trigger blocks DELETE and blocks UPDATE of integrity fields |
| Anchor txid | Write-once (null → value); cannot be overwritten once set |
| Access control | Row Level Security enabled; service-role server access only |

---

## 3. INDEPENDENT VERIFICATION PROCEDURE (FOR THE COURT)

Any party may verify the record without trusting the defendant or this system:

1. **Regenerate any exhibit** from the deterministic generator (`/api/court/generate-pdf?id=N`).
2. **Hash it:** `sha256sum "<filename>.pdf"` — the digest matches the Evidence Manifest.
3. **Recompute the Master Root:** SHA-256 of the canonical key-sorted JSON manifest of
   all 59 exhibit digests equals
   `0d0922805bb9456515ec3dd557cdcb6dbd40d6e788ccb8950ebf166858486f93`.
4. **(After broadcast) Confirm the anchor:** look up the recorded Bitcoin txid and
   confirm its OP_RETURN output contains the 32-byte Master Root above.

Altering a single byte of any exhibit changes that exhibit's hash, which changes the
manifest, which changes the Master Root — making any tampering cryptographically
detectable.

---

## 4. ITEMS EXPLICITLY EXCLUDED (FOR CANDOR)

To keep this record defensible, the following are **not** claimed:

- **No EVM/Base anchor is asserted.** A Base mainnet transaction
  (`0xb7f701e1…f13fab1`) was reviewed and found to be an ordinary value transfer
  (empty `input` data, 21,000 gas, zero logs). It contains **no evidence hash** and
  is therefore **not** an anchor of this record. It is excluded.
- **No deployed smart contract, role grant, or Hardhat distribution** is part of this
  record. No such contract exists in the repository.
- **No solvency, valuation, or financial certification** is made.

---

## 5. ATTESTATION

I declare under penalty of perjury under the laws of the State of California that the
cryptographic facts stated in this Codex — the canonical Master Root, the exhibit
count, the prepared (and as-yet-unbroadcast) Bitcoin OP_RETURN payload, the off-disk
archive, and the immutable ledger — are true and correct to the best of my knowledge
and were derived from direct inspection of the operative system, and that the values
excluded in Section 4 were excluded because they are not supported by the evidence.

Executed on June 17, 2026, at San Francisco, California.

_________________________________
Donald Ernest Gillson
Defendant, In Pro Per

---

*End of Codex — VALORAIPLUS//e Forensic Codex & Cold-Storage Attestation, Case CUD-26-682107.*
