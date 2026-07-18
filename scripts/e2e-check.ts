/**
 * End-to-end smoke check for verdict.
 *
 * Reconnects to the deployed contract, reads its ledger state, and exits 0
 * on success. Used by `npm run test:e2e` and by the project's CI workflows.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from '../src/network';
import { createWallet, persistWalletState } from '../src/wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// @ts-expect-error wallet sync requires WebSocket
globalThis.WebSocket = WebSocket;

// Must match the privateStateId used at deploy time.
const PRIVATE_STATE_ID = 'verdictPrivateState';

type VerdictPrivateState = {
  readonly balance: bigint;
};

// ─── Network configuration ─────────────────────────────────────────────────────

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

function fail(msg: string): never {
  console.error(`❌ e2e-check failed: ${msg}`);
  process.exit(1);
}

function isHexAddress(s: unknown): s is string {
  return typeof s === 'string' && /^[0-9a-fA-F]+$/.test(s) && s.length >= 32;
}

async function main() {
  // 1. Deployment sanity
  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No deploy on file for network ${network}.`);
    process.exit(1);
  }
  if (!isHexAddress(deployment.address)) {
    fail(`Deployment address missing or invalid: ${JSON.stringify(deployment, null, 2)}`);
  }

  // 2. Build wallet and providers
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'verdict');
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) fail('Compiled contract missing — run `npm run compile`.');

  const VerdictContract = await import(pathToFileURL(contractPath).href);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withWitnesses: any = CompiledContract.withWitnesses;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withAssets: any = CompiledContract.withCompiledFileAssets;

  const step0 = CompiledContract.make('verdict', VerdictContract.Contract);
  const step1 = withWitnesses(step0, {
    actualBalance(context: any, threshold: bigint): [VerdictPrivateState, bigint] {
      return [context.privateState, context.privateState.balance];
    },
  });
  const compiledContract: any = withAssets(step1, zkConfigPath);

  const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
  await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx() {
      throw new Error('e2e-check is read-only and should not balance transactions');
    },
    submitTx() {
      throw new Error('e2e-check is read-only and should not submit transactions');
    },
  } as any;

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'verdict-state',
      accountId: walletCtx.unshieldedKeystore.getBech32Address().toString(),
      privateStoragePasswordProvider: () => 'Local-Devnet-Development-Placeholder-1',
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  // 3. Reconnect to the deployed contract — proves callTx interface is wired
  try {
    await findDeployedContract(providers, {
      contractAddress: deployment.address,
      compiledContract,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: { balance: 0n },
    });
  } catch (err: any) {
    await walletCtx.wallet.stop();
    fail(`findDeployedContract threw: ${err?.message ?? err}`);
  }

  // 4. Read the on-chain contract state via the public data provider.
  const onChainState = await providers.publicDataProvider.queryContractState(deployment.address);
  if (!onChainState) {
    await walletCtx.wallet.stop();
    fail(`queryContractState returned null for ${deployment.address}`);
  }

  // 5. Decode and validate the ledger state.
  const ledgerState = VerdictContract.ledger(onChainState.data);
  const validThreshold = typeof ledgerState.threshold === 'bigint';
  const validVerdict = ledgerState.verdict_passed === 0n || ledgerState.verdict_passed === 1n;

  console.log(`✅ e2e-check passed`);
  console.log(`   contractAddress: ${deployment.address}`);
  console.log(`   network:         ${network}`);
  console.log(`   ledger.deal_id:            ${ledgerState.deal_id}`);
  console.log(`   ledger.threshold:          ${ledgerState.threshold.toString()}`);
  console.log(`   ledger.counterparty:       ${ledgerState.counterparty_address}`);
  console.log(`   ledger.timestamp:          ${new Date(Number(ledgerState.timestamp)).toISOString()}`);
  console.log(`   ledger.description_hash:   ${ledgerState.description_hash}`);
  console.log(`   ledger.verdict_passed:     ${ledgerState.verdict_passed === 1n ? 'YES' : 'NO'}`);
  if (!validThreshold) fail('ledger.threshold is not a bigint');
  if (!validVerdict) fail('ledger.verdict_passed has unexpected value');

  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
