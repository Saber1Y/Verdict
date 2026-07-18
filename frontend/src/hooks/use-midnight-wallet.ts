"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import "@midnight-ntwrk/dapp-connector-api";
import type { InitialAPI, ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";

type WalletState = {
  status: "disconnected" | "connecting" | "connected";
  connectedApi: ConnectedAPI | null;
  address: string | null;
  shieldedAddress: string | null;
  networkId: string | null;
  walletName: string | null;
  error: string | null;
};

const POLL_INTERVAL = 300;
const POLL_TIMEOUT = 6000;

/**
 * Resolve the first available Midnight wallet.
 * Per the official docs, Lace injects at `window.midnight?.mnLace`.
 * We try that first, then fall back to enumerating all injected wallets.
 */
function resolveWallet(): InitialAPI | undefined {
  if (typeof window === "undefined") return undefined;
  // Prefer Lace (official Midnight wallet)
  if (window.midnight?.mnLace) return window.midnight.mnLace;
  // Fall back to any other injected wallet
  const wallets = Object.values(window.midnight ?? {});
  return wallets[0];
}

export function useMidnightWallet() {
  const [state, setState] = useState<WalletState>({
    status: "disconnected",
    connectedApi: null,
    address: null,
    shieldedAddress: null,
    networkId: null,
    walletName: null,
    error: null,
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [walletDetected, setWalletDetected] = useState(false);
  const connectedApiRef = useRef<ConnectedAPI | null>(null);

  // Poll for wallet injection (extensions may load after the page)
  useEffect(() => {
    if (resolveWallet()) {
      setWalletDetected(true);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      if (resolveWallet()) {
        setWalletDetected(true);
        clearInterval(id);
      } else if (Date.now() - start > POLL_TIMEOUT) {
        clearInterval(id);
      }
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const connect = useCallback(async (networkId = "preprod") => {
    setIsConnecting(true);
    setState((s) => ({ ...s, error: null, status: "connecting" }));

    try {
      const wallet = resolveWallet();
      if (!wallet) {
        throw new Error(
          "No Midnight wallet found. Please install Midnight Lace or another compatible wallet."
        );
      }

      const api = await wallet.connect(networkId);

      const connectionStatus = await api.getConnectionStatus();
      if (connectionStatus.status !== "connected") {
        throw new Error("Wallet connection rejected by user.");
      }

      const { unshieldedAddress } = await api.getUnshieldedAddress();
      const shielded = await api.getShieldedAddresses();

      connectedApiRef.current = api;

      setState({
        status: "connected",
        connectedApi: api,
        address: unshieldedAddress,
        shieldedAddress: shielded.shieldedAddress,
        networkId: connectionStatus.networkId,
        walletName: wallet.name,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet";
      setState((s) => ({ ...s, status: "disconnected", error: message }));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    connectedApiRef.current = null;
    setState({
      status: "disconnected",
      connectedApi: null,
      address: null,
      shieldedAddress: null,
      networkId: null,
      walletName: null,
      error: null,
    });
  }, []);

  const truncateAddress = useCallback((addr: string) => {
    if (addr.length <= 14) return addr;
    return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
  }, []);

  return {
    ...state,
    isConnecting,
    walletDetected,
    connect,
    disconnect,
    truncateAddress,
  };
}
