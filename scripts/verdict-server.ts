/**
 * Standalone HTTP server that wraps the Verdict CLI contract interaction.
 * Runs alongside the frontend dev server:
 *   npm run verdict-server   (serves on http://localhost:3456)
 *
 * POST /verdict
 *   { dealId, threshold, counterparty, descriptionHash }
 *   → { success, txId, blockHeight, dealId }
 */

import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'verdictPrivateState';

type VerdictPrivateState = { readonly balance: bigint };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

import * as Rx from 'rxjs';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from '../src/wallet';
import { resolveNetwork, getOrCreateSeed, getDeployment } from '../src/network';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

const zkConfigPath = path.resolve(root, 'contracts', 'managed', 'verdict');
const contractPath = path.resolve(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Contract not compiled! Run: npm run compile\n');
  process.exit(1);
}

const VerdictContract = await import(pathToFileURL(contractPath).href);

const withWitnesses: any = CompiledContract.withWitnesses;
const withAssets: any = CompiledContract.withCompiledFileAssets;

const step0 = CompiledContract.make('verdict', VerdictContract.Contract);
const step1 = withWitnesses(step0, {
  actualBalance(context: any, _threshold: bigint): [VerdictPrivateState, bigint] {
    return [context.privateState, context.privateState.balance];
  },
});
const compiledContract: any = withAssets(step1, zkConfigPath);

const deployment = getDeployment(network);
if (!deployment) {
  console.error(`\n❌ No deployment found for network "${network}". Deploy first.\n`);
  process.exit(1);
}

console.log(`\n  Contract: ${deployment.address}`);
console.log(`  Network: ${network}\n`);

// ─── Providers ──────────────────────────────────────────────────

async function createProviders(walletCtx: WalletContext) {
  const password = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'verdict-server',
      accountId,
      privateStoragePasswordProvider: () => password,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

// ─── Server ──────────────────────────────────────────────────────

const PORT = parseInt(process.env.VERDICT_API_PORT || '3456', 10);

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST' || !req.url?.startsWith('/verdict')) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Read body
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString());

  const { dealId, threshold, counterparty, descriptionHash } = body;

  if (!dealId || threshold === undefined || !counterparty) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Missing required fields: dealId, threshold, counterparty' }));
    return;
  }

  try {
    console.log(`  Verdict request: dealId=${dealId} threshold=${threshold} counterparty=${counterparty}`);

    const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
    const state = await walletCtx.wallet.waitForSyncedState();
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    console.log(`  Wallet balance: ${balance.toLocaleString()} tNight`);

    const providers = await createProviders(walletCtx);

    const deployed: any = await findDeployedContract(providers, {
      compiledContract,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: { balance },
    });

    const tx = await deployed.callTx.verifySolvency(
      dealId,
      BigInt(threshold),
      counterparty,
      BigInt(Date.now()),
      descriptionHash ?? '',
    );

    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();

    const verdictPassed = (() => {
      try {
        const ledgerState = VerdictContract.ledger(tx.public?.contractState?.data);
        return ledgerState.verdict_passed === 1n;
      } catch {
        return null;
      }
    })();

    console.log(`  ✅ Verdict submitted: txId=${tx.public?.txId} verdict_passed=${verdictPassed}`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      verdictPassed,
      txId: tx.public?.txId ?? null,
      blockHeight: tx.public?.blockHeight ?? null,
      dealId,
    }));
  } catch (err: any) {
    console.error('  ❌ Verdict error:', err);
    const message = err instanceof Error ? err.message : String(err);
    const cause = err?.cause?.message ?? undefined;
    res.writeHead(500);
    res.end(JSON.stringify({ error: message, details: cause }));
  }
});

server.listen(PORT, () => {
  console.log(`  Verdict API server running on http://localhost:${PORT}`);
  console.log(`  POST /verdict with { dealId, threshold, counterparty, descriptionHash? }\n`);
});
