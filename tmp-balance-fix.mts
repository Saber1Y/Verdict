import { WebSocket } from 'ws';
globalThis.WebSocket = WebSocket;
import { createWallet, unshieldedToken } from './src/wallet';
import { resolveNetwork, getOrCreateSeed } from './src/network';

const { network, config } = resolveNetwork();
const seed = getOrCreateSeed(network);
const walletCtx = await createWallet({ network, networkConfig: config, seed });

console.log('tok raw:', unshieldedToken().raw);
console.log('tok type:', unshieldedToken().tokenType);

walletCtx.wallet.state().subscribe({
  next: (s) => {
    const tok = unshieldedToken().raw;
    const allKeys = Object.keys(s.unshielded.balances);
    const keysWithVals = allKeys.map(k => k + '=' + s.unshielded.balances[k].toString());
    console.log('isSynced=%s keys=%j', s.isSynced, keysWithVals);
  },
});

setTimeout(async () => {
  await walletCtx.wallet.stop();
  process.exit(0);
}, 10000);
