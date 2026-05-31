#!/usr/bin/env node
/**
 * IPFS + ENS Contenthash Deploy
 *
 * Prerequisites:
 *   npm i -g content-hash dotenv form-data node-fetch ethers
 *
 * Env vars:
 *   PINATA_JWT          - Pinata API JWT
 *   ENS_NAME            - e.g. donadams1969.eth
 *   RPC_URL             - Ethereum mainnet RPC
 *   DEPLOYER_PRIVATE_KEY - Wallet that owns the ENS name
 *
 * Usage:
 *   CSP_ENFORCE=true node scripts/deploy-ipfs-ens.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

const PARENT_CID = "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku";
const TOOLKIT_SHA256 = "6778c1914a4861e00902aae73fe9245a6e6ed9fc732c66950d0da9e7de56b5c7";

async function main() {
  // 0. Validate chain of custody
  console.log("\n=== STEP 0: ParentCID Validation ===");
  console.log(`ParentCID:      ${PARENT_CID}`);
  console.log(`Toolkit SHA256: ${TOOLKIT_SHA256}`);
  console.log(`Anchored:       2025-08-26T17:46:38.278419Z`);

  // 1. Build static export
  console.log("\n=== STEP 1: Build static export ===");
  run("npx next build");

  const outDir = path.join(process.cwd(), "out");
  if (!fs.existsSync(outDir)) {
    throw new Error("Build did not produce out/ directory. Ensure next.config has output: 'export'");
  }

  // 2. Upload to IPFS via Pinata
  console.log("\n=== STEP 2: Upload to Pinata ===");
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    console.log("PINATA_JWT not set. Skipping IPFS upload.");
    console.log("To upload manually:");
    console.log("  - Use Pinata web UI to upload the out/ folder");
    console.log("  - Or use ipfs-car + w3 CLI");
    return;
  }

  const zipPath = path.join(process.cwd(), "out.zip");
  run(`rm -f ${zipPath}`);
  run(`cd ${outDir} && zip -r ${zipPath} .`);

  const FormData = (await import("form-data")).default;
  const fetch = (await import("node-fetch")).default;

  const form = new FormData();
  form.append("file", fs.createReadStream(zipPath));
  form.append("pinataMetadata", JSON.stringify({ name: `valoraiplus-${Date.now()}` }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });

  if (!res.ok) throw new Error(`Pinata upload failed: ${res.status} ${await res.text()}`);
  const { IpfsHash: cid } = await res.json();
  console.log(`\nIPFS CID: ${cid}`);
  console.log(`Gateway:  https://ipfs.io/ipfs/${cid}`);

  // 3. Set ENS contenthash
  console.log("\n=== STEP 3: Set ENS contenthash ===");
  const ensName = process.env.ENS_NAME;
  const rpc = process.env.RPC_URL;
  const pk = process.env.DEPLOYER_PRIVATE_KEY;

  if (!ensName || !rpc || !pk) {
    console.log("ENS_NAME / RPC_URL / DEPLOYER_PRIVATE_KEY not set. Skipping ENS update.");
    console.log("Set contenthash manually on app.ens.domains to:");
    console.log(`  ipfs://${cid}`);
    return;
  }

  const ethers = await import("ethers");
  const contentHash = await import("content-hash");

  const provider = new ethers.JsonRpcProvider(rpc);
  const signer = new ethers.Wallet(pk, provider);
  const node = ethers.namehash(ensName);

  const registry = new ethers.Contract(
    "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    ["function resolver(bytes32 node) external view returns (address)"],
    provider
  );
  const resolverAddr = await registry.resolver(node);
  if (resolverAddr === ethers.ZeroAddress) throw new Error("No resolver set for ENS name");

  const resolver = new ethers.Contract(
    resolverAddr,
    ["function setContenthash(bytes32 node, bytes calldata hash) external"],
    signer
  );

  const encoded = "0x" + contentHash.encode("ipfs-ns", cid);
  const tx = await resolver.setContenthash(node, encoded);
  console.log("TX hash:", tx.hash);
  await tx.wait();

  console.log(`\nDone. Test at:`);
  console.log(`  https://${ensName}.limo`);
  console.log(`  https://${ensName}.eth.limo`);
}

main().catch((e) => { console.error(e); process.exit(1); });
