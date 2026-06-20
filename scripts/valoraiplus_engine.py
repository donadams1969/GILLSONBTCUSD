# VALORAIPLUS //e - Engine Integration Module (deterministic, court-grade)
# Developed by: Donny Gillson (Poppa) & VALORAIENGINEPLUS(TM)
# Copyright (c) 2026 That's Edutainment LLC / 32D LLC. All Rights Reserved.
# Patent Pending: USPO_VALORAIPLUS2025.sol
#
# INTEGRITY NOTE
# --------------
# The original prototype seeded the node Merkleroot with time.time(), which made
# the root change on every execution and therefore impossible to reproduce or
# verify in evidence. This version is fully DETERMINISTIC: identical inputs
# always produce identical roots. Folding is order-deterministic and the node
# binds to the canonical system Master Root computed over the 59 court exhibits.

import hashlib
import json

# Canonical Master Root produced by the live cold-storage system over all 59
# exhibits (see /api/court/cold-storage). 64-char SHA-256. Single source of truth.
CANONICAL_MASTER_ROOT = "0d0922805bb9456515ec3dd557cdcb6dbd40d6e788ccb8950ebf166858486f93"


def _is_sha256(value: str) -> bool:
    """A valid SHA-256 digest is exactly 64 lowercase hex characters."""
    if not isinstance(value, str) or len(value) != 64:
        return False
    try:
        int(value, 16)
    except ValueError:
        return False
    return value == value.lower()


def _canonical_json(obj) -> str:
    """Stable serialization: sorted keys, no incidental whitespace."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"))


class VALORAIPLUS_Engine:
    """
    Core engine for VALORAIPLUS //e compliant operations within the Saint Paul
    Node. Deterministic by construction: no wall-clock or random seeding.
    """

    def __init__(self, poppa_id, base_root: str = CANONICAL_MASTER_ROOT):
        self.system_id = "VALORAIENGINEPLUS_SECURE_NODE_SP"
        self.poppa_id = poppa_id  # opaque identifier; never logged in the clear
        if not _is_sha256(base_root):
            raise ValueError(
                f"refusing non-SHA-256 base root (got {len(base_root)} chars; "
                "expected exactly 64 hex characters)"
            )
        self.base_root = base_root
        # Deterministic node root: derived only from fixed, reproducible inputs.
        self.merkleroot = hashlib.sha256(
            f"{self.system_id}:{self.base_root}".encode()
        ).hexdigest()
        self.status = "OPERATIONAL_STABLE"
        self.fold_log = []

    def get_merkleroot(self) -> str:
        return self.merkleroot

    def integrate_project_chimera(self, data_manifest: dict) -> dict:
        """
        Fold a Project Chimera (Project Cinema) data manifest into the node root.
        Deterministic: the same manifest always yields the same resulting root.
        """
        if not data_manifest:
            return {"error": "Manifest empty"}

        manifest_hash = hashlib.sha256(
            _canonical_json(data_manifest).encode()
        ).hexdigest()

        # If the manifest declares its own Anchor, it must be a real SHA-256.
        declared = data_manifest.get("Anchor")
        if declared is not None and not _is_sha256(declared):
            return {
                "error": "invalid Anchor in manifest: not a 64-char SHA-256",
                "anchor_received": declared,
            }

        previous = self.merkleroot
        # Order-deterministic fold: H(previous || manifest_hash).
        self.merkleroot = hashlib.sha256(
            (previous + manifest_hash).encode()
        ).hexdigest()
        self.fold_log.append(
            {
                "previous_root": previous,
                "manifest_hash": manifest_hash,
                "declared_anchor": declared,
                "resulting_root": self.merkleroot,
            }
        )

        return {
            "status": "CHIMERA_INTEGRATED",
            "manifest_hash": manifest_hash,
            "new_merkleroot": self.merkleroot,
            "system": "VALORAIENGINEPLUS",
        }


if __name__ == "__main__":
    engine = VALORAIPLUS_Engine(poppa_id="ENCRYPTED_ID_PO")

    chimera_data = {
        "Project": "Project Cinema",
        "Compliance": "USPO_VALORAIPLUS2025.sol",
        "Anchor": "7595f1166eb0a36d09a59fad2a224f3d6ffd39acbf133571d4a8a22dff452696",
    }

    result = engine.integrate_project_chimera(chimera_data)

    print(f"VALORAIPLUS //e Engine Node : {engine.system_id}")
    print(f"Canonical Master Root       : {engine.base_root}")
    print(f"Deterministic Node Root     : {engine.get_merkleroot()}")
    print(json.dumps(result, indent=4))
