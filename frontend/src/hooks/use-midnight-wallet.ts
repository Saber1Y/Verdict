"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import "@midnight-ntwrk/dapp-connector-api";
import type { InitialAPI, ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";

type WalletState = {
  status: "disconnected" | "connecting" | "connected";
  wallets: InitialAPI[];
  connectedApi: ConnectedAPI | null;
  address: string | null;
  networkId: string | null;
  walletName: string | null;
  error: string | null;
};

const POLL_INTERVAL = 200;
const POLL_TIMEOUT = 8000;

function enumerateWallets(): InitialAPI[] {
  if (typeof window === "undefined") return [];
  return Object.values(window.midnight ?? {});
}

export function useMidnightWallet() {
  const [state, setState] = useState<WalletState>({
    status: "disconnected",
    wallets: [],
    connectedApi: null,
    address: null,
    networkId: null,
    walletName: null,
    error: null,
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const connectedApiRef = useRef<ConnectedAPI | null>(null);

  useEffect(() => {
    const wallets = enumerateWallets();
    if (wallets.length > 0) {
      setState((s) => ({ ...s, wallets }));
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const found = enumerateWallets();
      if (found.length > 0 || Date.now() - start > POLL_TIMEOUT) {
        clearInterval(interval);
        setState((s) => ({ ...s, wallets: found }));
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(async (networkId = "preprod") => {
    setIsConnecting(true);
    setState((s) => ({ ...s, error: null, status: "connecting" }));

    try {
      const wallets = enumerateWallets();
      if (wallets.length === 0) {
        throw new Error("No Midnight wallet found. Install Midnight Lace or another compatible wallet.");
      }

      const wallet = wallets[0];
      const api = await wallet.connect(networkId);

      const { unshieldedAddress } = await api.getUnshieldedAddress();
      const status = await api.getConnectionStatus();

      if (status.status !== "connected") {
        throw new Error("Wallet connection rejected.");
      }

      connectedApiRef.current = api;

      setState({
        status: "connected",
        wallets,
        connectedApi: api,
        address: unshieldedAddress,
        networkId: status.networkId,
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
      wallets: state.wallets,
      connectedApi: null,
      address: null,
      networkId: null,
      walletName: null,
      error: null,
    });
  }, [state.wallets]);

  const truncate = useCallback((addr: string) => {
    if (addr.length <= 14) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  }, []);

  return {
    ...state,
    isConnecting,
    connect,
    disconnect,
    truncate,
  };
}
