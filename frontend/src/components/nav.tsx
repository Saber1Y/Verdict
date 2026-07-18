"use client";

import { useState } from "react";
import { useMidnightWallet } from "@/hooks/use-midnight-wallet";
import { useVerdictDialog } from "@/lib/verdict-context";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Architecture", href: "#architecture" },
  { label: "Proof", href: "#proof" },
  { label: "History", href: "/history" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const { status, address, walletName, networkId, error, isConnecting, walletDetected, connect, disconnect, truncateAddress } =
    useMidnightWallet();
  const { setDialogOpen } = useVerdictDialog();

  const walletPill = () => {
    if (status === "connected" && address) {
      return (
        <button
          onClick={disconnect}
          className="inline-flex items-center gap-2 rounded-lg border border-teal/30 bg-teal/5 px-3 py-2 text-sm transition-colors hover:bg-teal/10"
        >
          <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]" />
          <span className="font-mono text-teal">{truncateAddress(address)}</span>
          {networkId && networkId !== "mainnet" && (
            <span className="rounded border border-card-border bg-card px-1.5 py-0.5 text-[10px] uppercase text-muted">
              {networkId}
            </span>
          )}
        </button>
      );
    }

    if (isConnecting || status === "connecting") {
      return (
        <button
          disabled
          className="inline-flex cursor-wait items-center gap-2 rounded-lg border border-card-border px-4 py-2 text-sm text-muted"
        >
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-muted border-t-transparent" />
          Connecting
        </button>
      );
    }

    return (
      <button
        onClick={() => connect()}
        className="rounded-lg border border-card-border px-4 py-2 text-sm transition-colors hover:border-muted"
      >
        Connect wallet
      </button>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="font-heading text-xl font-semibold tracking-tight">
          Verdict
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {walletPill()}
          <button
            onClick={() => setDialogOpen(true)}
            className="rounded-lg bg-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110"
          >
            Request a verdict
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-card-border px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr className="border-card-border" />
            {status === "connected" && address && (
              <div className="flex items-center gap-2 rounded-lg border border-teal/30 bg-teal/5 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]" />
                <span className="font-mono text-sm text-teal">{truncateAddress(address)}</span>
                {networkId && networkId !== "mainnet" && (
                  <span className="ml-auto rounded border border-card-border bg-card px-1.5 py-0.5 text-[10px] uppercase text-muted">
                    {networkId}
                  </span>
                )}
              </div>
            )}
            {status === "connected" ? (
              <button
                onClick={() => { disconnect(); setOpen(false); }}
                className="rounded-lg border border-card-border px-4 py-2 text-sm text-red-400 transition-colors hover:border-red-400/30"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => { connect(); setOpen(false); }}
                disabled={isConnecting || status === "connecting"}
                className="rounded-lg border border-card-border px-4 py-2 text-sm transition-colors hover:border-muted disabled:cursor-wait disabled:text-muted"
              >
                {isConnecting || status === "connecting" ? "Connecting..." : "Connect wallet"}
              </button>
            )}
            <button
              onClick={() => { setDialogOpen(true); setOpen(false); }}
              className="rounded-lg bg-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110"
            >
              Request a verdict
            </button>
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && status !== "connected" && (
        <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs text-red-400 backdrop-blur-xl">
          {error}
        </div>
      )}
    </nav>
  );
}
