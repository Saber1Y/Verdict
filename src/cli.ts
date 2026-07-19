/**
 * CLI for interacting with verdict contract
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

// Midnight SDK imports
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// Enable WebSocket for GraphQL subscriptions
// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

// Must match the privateStateId used at deploy time.
const PRIVATE_STATE_ID = 'verdictPrivateState';

// Private-state type: the witness needs access to the actual balance.
type VerdictPrivateState = {
  readonly balance: bigint;
};

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'verdict');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

// Check if contract is compiled
if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Contract not compiled! Run: npm run compile\n');
  process.exit(1);
}

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

// ─── Providers ─────────────────────────────────────────────────────────────────

async function createProviders(walletCtx: WalletContext) {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

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
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'verdict-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

// ─── Main CLI ──────────────────────────────────────────────────────────────────

async function runAutoDemo(walletCtx: any, providers: any, deployed: any, contractAddress: string) {
  const dealId = 'e2e-demo-001';
  const threshold = 100_000n;
  const counterparty = '0x0000000000000000000000000000000000000000';
  const descHash = '0x0000';
  const timestamp = BigInt(Date.now());

  console.log(`─── Auto Demo: verifySolvency ──────────────────────────`);
  console.log(`  Deal ID:       ${dealId}`);
  console.log(`  Threshold:     ${Number(threshold).toLocaleString()} tNight`);
  console.log(`  Counterparty:  ${counterparty}`);
  console.log(`  Actual:        250,000,000,000,000 tNight (>> threshold → SOLVENT)\n`);

  console.log('  Submitting...');
  const tx = await deployed.callTx.verifySolvency(dealId, threshold, counterparty, timestamp, descHash);
  console.log(`  ✅ Transaction submitted!`);
  console.log(`  Tx ID:     ${tx.public.txId}`);
  console.log(`  Block:     ${tx.public.blockHeight}\n`);

  console.log('  Reading verdict from blockchain...');
  const contractState = await providers.publicDataProvider.queryContractState(contractAddress);
  if (contractState) {
    const ledgerState = VerdictContract.ledger(contractState.data);
    console.log(`  Deal ID:            ${ledgerState.deal_id}`);
    console.log(`  Threshold:          ${ledgerState.threshold.toString()}`);
    console.log(`  Verdict:            ${ledgerState.verdict_passed === 1n ? '✅ SOLVENT' : '❌ INSUFFICIENT'}`);
    console.log(`  Counterparty:       ${ledgerState.counterparty_address}`);
    console.log(`  Timestamp:          ${new Date(Number(ledgerState.timestamp)).toISOString()}`);
    console.log(`  Description Hash:   ${ledgerState.description_hash}`);
    console.log(`\n  Privacy guarantee:  Only boolean verdict_passed is stored on-chain.`);
    console.log(`                      Actual balance is never disclosed.\n`);
  }
}

async function main() {
  const isAuto = process.argv.includes('--auto');

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                   Verdict CLI                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const rl = isAuto ? null : createInterface({ input: stdin, output: stdout });

  // Check for deployment
  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No deploy on file for network ${network}. Run \`npm run setup -- --network ${network}\` first.`);
    process.exit(1);
  }
  console.log(`  Contract: ${deployment.address}`);
  console.log(`  Network: ${network}\n`);

  try {
    const seed = SEED;

    console.log('  Connecting to wallet...');
    const walletCtx = await createWallet({ network, networkConfig, seed });
    const restoredCount = Object.values(walletCtx.restored).filter(Boolean).length;
    if (restoredCount > 0) {
      console.log(`  Restored ${restoredCount}/3 child wallets from .midnight-wallet-state — sync will resume from saved point.`);
    }

    console.log('  Syncing with network...');
    console.log('  ℹ  This may take several minutes depending on network size.');
    console.log('     RPC disconnection messages during sync are normal and can be safely ignored.\n');
    const syncStart = Date.now();
    const syncInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - syncStart) / 1000);
      process.stdout.write(`\r  ⏳ Still syncing... (${elapsed}s elapsed)   `);
    }, 5000);
    const state = await walletCtx.wallet.waitForSyncedState();
    clearInterval(syncInterval);
    process.stdout.write('\r  ✓ Synced with network.                                      \n');

    // Persist sync state so the next run doesn't have to redo this work.
    await persistWalletState(network, walletCtx);
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    console.log(`  Balance: ${balance.toLocaleString()} tNight\n`);

    // Surface a faucet hint when a public-network wallet has 0 tNIGHT.
    if (balance === 0n && network !== 'undeployed' && networkConfig.faucet) {
      const address = walletCtx.unshieldedKeystore.getBech32Address();
      console.log('  ⚠ Wallet has no tNight. Fund it from the faucet to send transactions:');
      console.log(`     ${networkConfig.faucet}`);
      console.log(`     Wallet address: ${address}\n`);
    }

    // Setup providers and connect to contract
    console.log('  Connecting to contract...');
    const providers = await createProviders(walletCtx);

    const deployed: any = await findDeployedContract(providers, {
      compiledContract,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: { balance },
    });

    console.log('  ✅ Connected!\n');

    if (isAuto) {
      await runAutoDemo(walletCtx, providers, deployed, deployment.address);
      await persistWalletState(network, walletCtx);
      await walletCtx.wallet.stop();
      console.log('  Done.');
      return;
    }

    // Interactive CLI loop
    let running = true;
    while (running) {
      console.log('─── Menu ───────────────────────────────────────────────────────');
      console.log('  1. Run verifySolvency');
      console.log('  2. Read current verdict');
      console.log('  3. Check wallet balance');
      console.log('  4. Exit\n');

      const choice = await rl!.question('  Your choice: ');

      switch (choice.trim()) {
        case '1': {
          const dealId = await rl!.question('  Deal ID: ');
          const thresholdStr = await rl!.question('  Threshold (balance in tNight): ');
          const counterparty = await rl!.question('  Counterparty address: ');
          const descHash = await rl!.question('  Description hash: ');

          const threshold = BigInt(thresholdStr);
          const timestamp = BigInt(Date.now());
          const privateState = { balance: 0n };

          console.log('\n  Submitting verifySolvency transaction (this may take 30-60 seconds)...');
          try {
            const tx = await deployed.callTx.verifySolvency(
              dealId,
              threshold,
              counterparty,
              timestamp,
              descHash,
            );
            console.log(`\n  ✅ verifySolvency submitted!`);
            console.log(`  Transaction ID: ${tx.public.txId}`);
            console.log(`  Block height: ${tx.public.blockHeight}\n`);
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '2': {
          console.log('\n  Reading verdict from blockchain...');
          try {
            const contractState = await providers.publicDataProvider.queryContractState(contractAddress);
            if (contractState) {
              const ledgerState = VerdictContract.ledger(contractState.data);
              console.log(`\n  Deal ID:            ${ledgerState.deal_id}`);
              console.log(`  Threshold:          ${ledgerState.threshold.toString()}`);
              console.log(`  Counterparty:       ${ledgerState.counterparty_address}`);
              console.log(`  Timestamp:          ${new Date(Number(ledgerState.timestamp)).toISOString()}`);
              console.log(`  Description Hash:   ${ledgerState.description_hash}`);
              console.log(`  Verdict Passed:     ${ledgerState.verdict_passed === 1n ? 'YES' : 'NO'}\n`);
            } else {
              console.log('\n  No verdict state found (contract state empty)\n');
            }
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }

        case '3': {
          console.log('\n  Checking balance...');
          const currentState = await walletCtx.wallet.waitForSyncedState();
          const currentBalance = currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;
          const dustBalance = currentState.dust.balance(new Date());
          console.log(`\n  tNight: ${currentBalance.toLocaleString()}`);
          console.log(`  DUST: ${dustBalance.toLocaleString()}\n`);
          break;
        }

        case '4':
          running = false;
          console.log('\n  Goodbye!\n');
          break;

        default:
          console.log('\n  ❌ Invalid choice. Please enter 1-4.\n');
      }
    }

    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    rl?.close();
  }
}

main().catch(console.error);
