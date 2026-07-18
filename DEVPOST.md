# Verdict

**Zero-knowledge agent solvency verification on Midnight Network.**

Private balance. Public boolean. On-chain proof.

---

## The Problem

Agents settling deals with each other need a way to verify solvency — "can this counterparty actually cover the trade?" — without either side revealing their full balance sheet. Current approaches either disclose raw balances (a privacy leak) or rely on trusted third parties (a centralization risk).

Neither works for an agent economy where counterparties are ephemeral, trust is minimal, and every intermediary is a surface for extraction.

## How It Works

Verdict uses Midnight's Compact zero-knowledge circuit language to build a solvency check that proves a counterparty's balance meets a public threshold — without ever disclosing the actual balance value.

**The flow:**

1. **Set a public threshold** — The requesting agent names a deal ID, a USD threshold, and a counterparty address. These go on the Midnight ledger as public fields.

2. **Read locally, never transmit** — The counterparty agent reads its own shielded balance via a Midnight Compact `witness`. This value exists only inside the circuit's execution scope. It is never serialized, never passed to `disclose()`, and never logged.

3. **Prove in zero knowledge** — The circuit compares `balance >= threshold` inside the ZK proof. The actual balance never leaves the proving environment.

4. **Disclose only the verdict** — A single boolean (`1` = solvent, `0` = insufficient) is written to the Midnight ledger alongside the deal metadata. Anyone can independently verify the result on-chain.

**Privacy invariant:** Of 6 ledger fields written per verdict (deal_id, threshold, counterparty_address, timestamp, description_hash, verdict_passed), zero of them are the actual balance. The `actualBalance` witness is never disclosed.

## What's Live Right Now

- **Deployed contract** — Live on Midnight local devnet at [`97a1ce5a9d23d11fe7de0515e1e06d9223d1ff52c5d128af6dd61b043b5434c3`](https://explorer.local.midnight.network/contracts/97a1ce5a9d23d11fe7de0515e1e06d9223d1ff52c5d128af6dd61b043b5434c3)
- **Interactive CLI** — `npm run cli` with menu-driven solvency checks, ledger reads, and balance inspection
- **Web UI** (localhost:3000) — Dark-themed landing page with wallet connection, `Request Verdict` dialog, and real-time progress through the ZK proving stages (preparing, proving, balancing, submitting)
- **REST API** — `POST /verdict` on port 3456, used by both the web UI and an example NL-agent integration
- **Natural-language agent front door** — `nl-verdict.ts` translates plain text like *"does 0xalice clear $50,000 for deal #4471?"* into structured verdict requests via OpenRouter tool calls; returns the on-chain result
- **Docker Compose devnet** — 3 containers (node, indexer, proof-server) for local development

All operations have been end-to-end tested against the local devnet with real tx hashes and block heights returned.

## Track Alignment

**Midnight Hackathon** — This project is built entirely on Midnight:
- Written in **Compact** (`verdict.compact`, v0.23 language, v0.31 compiler)
- Uses the **Midnight Lace wallet** (`mnLace` DApp Connector API)
- Deployed with **`@midnight-ntwrk/midnight-js-*`** SDK suite (runtime 0.16.0, contracts 4.1.1, protocol 4.1.1)
- Runs on a **Midnight local devnet** (Docker Compose: node, indexer, proof-server)
- Demonstrates the full Midnight privacy model: shielded state through witnesses, public state through `disclose()`, Compact Circuit compilation and proving

## What's Next (Roadmap)

- Deploy to Midnight PreProd testnet once the wallet SDK version catches up to the devnet ledger v8 iterator API
- Verdict history page showing past results queried from the ledger
- Multi-threshold tiers (e.g., "silver/gold/platinum" solvency levels)
- x402 payment wiring so agents pay per verdict call

## Team

Built during the Midnight Hackathon by Saber.
