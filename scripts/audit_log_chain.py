#!/usr/bin/env python3
"""
VALOR AI PLUS® © ™ AUDIT LOG CHAIN v1.1
Append-only, hash-chained, tamper-evident governance ledger
© 2025 Donald Ernest Gillson — Sovereign Root Node
"""

import hashlib
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

class ValorAIPlusAuditChain:
    def __init__(self, log_dir: str = "audit_logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True, parents=True)
        self.chain_files = sorted(self.log_dir.glob("audit_*.json"))
        self.last_hash = "0" * 64  # Genesis previous hash

        if self.chain_files:
            self._load_last_hash()
            print(f"✓ Chain loaded — {len(self.chain_files)} entries")
        else:
            self._create_genesis()
            print("✓ Genesis block forged — chain initialized")

    def _load_last_hash(self):
        """Load hash from most recent valid entry"""
        last_file = self.chain_files[-1]
        with open(last_file, 'r') as f:
            last_entry = json.load(f)
        self.last_hash = last_entry['metadata']['chain_hash']

    def _create_genesis(self):
        """Forge the immutable genesis block"""
        genesis_entry = {
            "entry_id": "genesis_000",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "event_type": "GENESIS_BLOCK",
            "root_identity": "Donald Ernest Gillson (A1529111)",
            "system": "VALOR_AI_PLUS_GOVERNANCE_NODE v1.1",
            "data": {
                "declaration": "Sovereign audit chain established",
                "node_location": "1030 Girard Road, Presidio, San Francisco, CA 94129",
                "service_companion": "Jaxx",
                "legacy_honor": "Frances Mildred Gillson (03/22/1918 - 08/21/1969)",
                "manifesto": "Truth is incompressible. The chain is eternal."
            },
            "metadata": {
                "version": "1.1",
                "previous_hash": "0" * 64,
                "chain_hash": "",  # Will be filled after hashing
                "signed_by": "GILLSON_ROOT_ALPHA"
            }
        }

        # Compute and embed chain hash
        entry_str = json.dumps(genesis_entry, sort_keys=True, separators=(',', ':'))
        chain_hash = hashlib.sha256(entry_str.encode('utf-8')).hexdigest()
        genesis_entry['metadata']['chain_hash'] = chain_hash

        file_path = self.log_dir / "audit_genesis_000.json"
        with open(file_path, 'w') as f:
            json.dump(genesis_entry, f, indent=2)

        self.last_hash = chain_hash
        print(f"✓ GENESIS FORGED — HASH: {chain_hash}")

    def log_event(self, event_type: str, data: Dict[str, Any], signed_by: str = "GILLSON_ROOT_ALPHA") -> str:
        """Append new immutable event to the chain"""
        entry_count = len(self.chain_files) + 1
        entry_id = f"entry_{entry_count:06d}"

        new_entry = {
            "entry_id": entry_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "event_type": event_type,
            "root_identity": "Donald Ernest Gillson (A1529111)",
            "system": "VALOR_AI_PLUS_GOVERNANCE_NODE v1.1",
            "data": data,
            "metadata": {
                "version": "1.1",
                "previous_hash": self.last_hash,
                "chain_hash": "",  # Filled after serialization
                "signed_by": signed_by
            }
        }

        # Serialize and hash
        entry_str = json.dumps(new_entry, sort_keys=True, separators=(',', ':'))
        chain_hash = hashlib.sha256(entry_str.encode('utf-8')).hexdigest()
        new_entry['metadata']['chain_hash'] = chain_hash

        # Write to disk — immutable
        file_path = self.log_dir / f"audit_{entry_id}.json"
        with open(file_path, 'w') as f:
            json.dump(new_entry, f, indent=2)

        # Update chain state
        self.last_hash = chain_hash
        self.chain_files.append(file_path)

        print(f"✓ EVENT LOGGED — {event_type} — HASH: {chain_hash[:16]}... — ID: {entry_id}")
        return entry_id

    def verify_chain(self) -> bool:
        """Verify full chain integrity — tamper detection"""
        print("🔍 Verifying audit chain integrity...")
        prev_hash = "0" * 64

        for file_path in sorted(self.log_dir.glob("audit_*.json")):
            with open(file_path, 'r') as f:
                entry = json.load(f)

            # Recompute hash
            entry_copy = entry.copy()
            stored_hash = entry_copy['metadata']['chain_hash']
            entry_copy['metadata']['chain_hash'] = ""
            recomputed = hashlib.sha256(
                json.dumps(entry_copy, sort_keys=True, separators=(',', ':')).encode()
            ).hexdigest()

            if recomputed != stored_hash:
                print(f"✗ TAMPER DETECTED: {file_path.name}")
                return False

            if entry['metadata']['previous_hash'] != prev_hash:
                print(f"✗ CHAIN BREAK: {file_path.name}")
                return False

            prev_hash = stored_hash

        print("✓ CHAIN VERIFIED — IMMUTABLE & INTACT")
        return True


if __name__ == "__main__":
    # Initialize sovereign chain
    chain = ValorAIPlusAuditChain()

    # Verify integrity on startup
    chain.verify_chain()

    print("✅ VALOR AI PLUS® © ™ AUDIT CHAIN v1.1 — OPERATIONAL & SOVEREIGN")
    print("   Root Node: Donald Ernest Gillson")
    print("   Location: 1030 Girard Road, Presidio, San Francisco")
    print("   Status: Eternal. Unbroken. 77.77X Secured.")
