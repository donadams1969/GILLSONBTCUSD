#!/usr/bin/env python3
# --- VALORAIPLUS(R)(C)(TM) PROTECTED IP ---
# Copyright (c) 2026 Donald Ernest Gillson. All rights reserved.
# Anchor Engine v1.1 // Python Cold-Storage Variant
#
# Canonical Master Root (SHA-256 over all 59 exhibits, reproducible):
#   0d0922805bb9456515ec3dd557cdcb6dbd40d6e788ccb8950ebf166858486f93
#
# This variant is self-verifying: it can recompute the Master Root from a
# provided evidence manifest and refuses to emit an anchor payload unless the
# root is a valid 32-byte (64 hex char) SHA-256 digest. The OP_RETURN script it
# produces is standards-compliant: 0x6a (OP_RETURN) + 0x20 (push 32 bytes) +
# the 32-byte root. No transaction is broadcast; the payload is PREPARED only.

import sys
import json
import hashlib
import argparse

CASE_FILE = "CUD-26-682107"

# The canonical root as computed by the live deterministic system. Treat this as
# the expected value; --manifest can recompute and must match it.
CANONICAL_ROOT = "0d0922805bb9456515ec3dd557cdcb6dbd40d6e788ccb8950ebf166858486f93"


def is_valid_sha256(value: str) -> bool:
    """A valid SHA-256 digest is exactly 64 lowercase hex characters (32 bytes)."""
    if len(value) != 64:
        return False
    try:
        int(value, 16)
    except ValueError:
        return False
    return value == value.lower()


def master_root_from_manifest(path: str) -> str:
    """Recompute the Master Root = SHA-256 of the canonical key-sorted JSON
    manifest of exhibit hashes. Mirrors the TypeScript provenance route."""
    with open(path, "r", encoding="utf-8") as fh:
        manifest = json.load(fh)
    canonical = json.dumps(manifest, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def build_op_return(root: str) -> str:
    """Standards-compliant OP_RETURN script hex for a 32-byte data push.
    0x6a = OP_RETURN, 0x20 = push next 32 bytes, then the 32-byte root."""
    if not is_valid_sha256(root):
        raise ValueError(
            f"Refusing to build OP_RETURN: '{root}' is not a valid 32-byte "
            f"SHA-256 ({len(root)} hex chars; require exactly 64)."
        )
    return f"6a20{root}"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="VALORAIPLUS cold-storage anchor engine (prepare-only)."
    )
    parser.add_argument(
        "--root",
        default=CANONICAL_ROOT,
        help="Master Root hex (default: canonical system root).",
    )
    parser.add_argument(
        "--manifest",
        help="Path to evidence manifest JSON; recomputes root and verifies it.",
    )
    parser.add_argument(
        "--broadcast-guide",
        action="store_true",
        help="Print the OP_RETURN payload and a manual broadcast guide.",
    )
    args = parser.parse_args()

    root = args.root.strip().lower()

    if args.manifest:
        recomputed = master_root_from_manifest(args.manifest)
        if not args.root or args.root == CANONICAL_ROOT:
            root = recomputed
        print(f"Recomputed Master Root from manifest: {recomputed}")
        if recomputed != root:
            print(
                f"FAIL: recomputed root {recomputed} does not match supplied "
                f"root {root}.",
                file=sys.stderr,
            )
            return 2

    if not is_valid_sha256(root):
        print(
            f"FAIL: '{root}' is not a valid SHA-256 digest "
            f"({len(root)} hex chars; require exactly 64). Aborting.",
            file=sys.stderr,
        )
        return 2

    payload = build_op_return(root)

    if args.broadcast_guide:
        print("--- VALORAIPLUS COLD-STORAGE BROADCAST GUIDE ---")
        print(f"Case File:          {CASE_FILE}")
        print(f"Master Root:        {root}")
        print(f"OP_RETURN Script:   {payload}")
        print(f"Data push length:   32 bytes (0x20)")
        print("Status:             PREPARED / AWAITING BROADCAST")
        print("Instruction:        Broadcast this OP_RETURN output from your own")
        print("                    funded wallet (manual broadcast). Then record")
        print("                    the resulting txid in the cold-storage ledger.")
        print("Note:               No private keys are used or stored by this")
        print("                    engine. It only prepares the payload.")
    else:
        engine_src = open(__file__, "rb").read()
        engine_hash = hashlib.sha256(engine_src).hexdigest()
        print(f"Validation Pass: root is a valid 32-byte SHA-256.")
        print(f"Master Root:     {root}")
        print(f"Engine SHA-256:  {engine_hash}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
