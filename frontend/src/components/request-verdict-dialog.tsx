"use client";

import { useState, useEffect, useCallback } from "react";
import { useMidnightWallet } from "@/hooks/use-midnight-wallet";
import { useVerdict, type VerdictStep } from "@/hooks/use-verdict";

const STEP_MESSAGES: Record<VerdictStep, string> = {
  idle: "",
  preparing: "Preparing circuit...",
  proving: "Generating zero-knowledge proof...",
  balancing: "Balancing transaction with wallet...",
  submitting: "Submitting to the Midnight Network...",
  done: "",
  error: "",
};

export function RequestVerdictDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { status: walletStatus, address, connect } = useMidnightWallet();
  const { step, result, error, submitVerdict, reset: resetVerdict } = useVerdict();
  const [dealId, setDealId] = useState(`#${Math.floor(Math.random() * 9000 + 1000)}`);
  const [threshold, setThreshold] = useState("50000");
  const [counterparty, setCounterparty] = useState("0x3c1d...9a4f");
  const [description, setDescription] = useState("Solvency verification for Q3 settlement");

  const reset = useCallback(() => {
    resetVerdict();
  }, [resetVerdict]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handleSubmit = async () => {
    await submitVerdict({
      dealId,
      threshold,
      counterparty,
      descriptionHash: description,
    });
  };

  if (!open) return null;

  const isForm = step === "idle" || step === "error";
  const isDone = step === "done";
  const isActive = step !== "idle" && step !== "done" && step !== "error";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-xl rounded-xl border border-card-border bg-card p-8 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted transition-colors hover:text-foreground"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 15L15 5M15 15L5 5" />
          </svg>
        </button>

        {/* ===== FORM STEP ===== */}
        {isForm && (
          <>
            <h2 className="font-heading text-xl font-bold">Request a Verdict</h2>
            <p className="mt-1 text-sm text-muted">
              Submit a zero-knowledge solvency proof to the Midnight Network.
            </p>

            {walletStatus !== "connected" && (
              <div className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-400">
                Connect your Midnight wallet to request a verdict.
                <button onClick={() => connect()} className="ml-2 underline hover:no-underline">
                  Connect
                </button>
              </div>
            )}

            <div className="mt-6 grid gap-4">
              <div>
                <label className="text-xs font-medium text-muted">Deal ID</label>
                <input
                  value={dealId}
                  onChange={(e) => setDealId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 font-mono text-sm outline-none transition-colors focus:border-violet"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Threshold (USD)</label>
                <input
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 font-mono text-sm outline-none transition-colors focus:border-violet"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Counterparty address</label>
                <input
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 font-mono text-sm outline-none transition-colors focus:border-violet"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-violet"
                />
              </div>
            </div>

            {walletStatus === "connected" && address && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-teal/30 bg-teal/5 px-3 py-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]" />
                <span className="font-mono text-xs text-teal">
                  Proving as {address.slice(0, 10)}...{address.slice(-6)}
                </span>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={walletStatus !== "connected"}
                className="flex-1 rounded-lg bg-violet px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit verdict request
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-card-border px-4 py-2.5 text-sm transition-colors hover:border-muted"
              >
                Cancel
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-muted">
              Your actual balance never leaves this device.
            </p>
          </>
        )}

        {/* ===== PROGRESS STEPS ===== */}
        {isActive && (
          <>
            <h2 className="font-heading text-xl font-bold">Processing Verdict</h2>
            <p className="mt-1 text-sm text-muted">
              Your deal &mdash; {dealId} &mdash; is being proven through the ZK circuit.
            </p>

            <div className="mt-8 grid gap-3">
              {(["preparing", "proving", "balancing", "submitting"] as VerdictStep[]).map((s) => {
                const order = ["preparing", "proving", "balancing", "submitting"];
                const idx = order.indexOf(s);
                const currentIdx = order.indexOf(step);
                const done = idx < currentIdx;
                const active = idx === currentIdx;

                return (
                  <div
                    key={s}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
                      active
                        ? "border-violet/30 bg-violet/5"
                        : done
                          ? "border-teal/20 bg-teal/5"
                          : "border-card-border opacity-30"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? "bg-teal/20 text-teal"
                          : active
                            ? "bg-violet/20 text-violet"
                            : "bg-card-border text-muted"
                      }`}
                    >
                      {done ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 7l3 3 5-5" />
                        </svg>
                      ) : active ? (
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-violet border-t-transparent" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          done ? "text-teal" : active ? "text-foreground" : "text-muted"
                        }`}
                      >
                        {STEP_MESSAGES[s]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== RESULT ===== */}
        {isDone && result && (
          <>
            <h2 className="font-heading text-xl font-bold">Verdict Issued</h2>
            <p className="mt-1 text-sm text-muted">
              The zk-proof was verified on-chain. The balance that backs it never was.
            </p>

            <div className={`mt-6 rounded-xl border p-6 ${
              result.verdictPassed === true
                ? "border-teal/30 bg-teal/[0.03]"
                : result.verdictPassed === false
                  ? "border-red-500/20 bg-red-500/[0.03]"
                  : "border-teal/30 bg-teal/[0.03]"
            }`}>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-card-border bg-background px-3 py-1 font-mono text-xs text-muted">
                  {result.dealId}
                </span>
                <span className={`flex items-center gap-2 font-mono text-xs ${
                  result.verdictPassed === true
                    ? "text-teal"
                    : result.verdictPassed === false
                      ? "text-red-400"
                      : "text-teal"
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    result.verdictPassed === true
                      ? "bg-teal shadow-[0_0_6px_#00D4B5]"
                      : result.verdictPassed === false
                        ? "bg-red-400 shadow-[0_0_6px_#ef4444]"
                        : "bg-teal shadow-[0_0_6px_#00D4B5]"
                  }`}></span>
                  {result.verdictPassed === true ? "SOLVENT" : result.verdictPassed === false ? "INSUFFICIENT" : "SUBMITTED"}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <Field label="Threshold" value={`$${Number(threshold).toLocaleString()}`} />
                <Field label="Counterparty" value={counterparty} />
                <Field label="Transaction ID" value={result.txId ?? "pending"} mono copyable />
                <Field label="Block height" value={result.blockHeight ? `#${result.blockHeight}` : "pending"} />
              </div>

              <div className="mt-4 border-t border-card-border pt-4">
                <p className="text-center text-xs leading-relaxed text-muted">
                  Balance never disclosed &middot; never transmitted &middot; never logged
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => reset()}
                className="flex-1 rounded-lg bg-violet px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                Request another
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-card-border px-4 py-2.5 text-sm transition-colors hover:border-muted"
              >
                Close
              </button>
            </div>
          </>
        )}

        {step === "error" && (
          <>
            <h2 className="font-heading text-xl font-bold text-red-400">Submission Failed</h2>
            <p className="mt-1 text-sm text-muted">
              {error || "An unknown error occurred during verification."}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-violet px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-card-border px-4 py-2.5 text-sm transition-colors hover:border-muted"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  copyable,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);
  return (
    <div className="flex items-center justify-between border-b border-card-border pb-2">
      <span className="text-xs text-muted">{label}</span>
      <span className={`flex items-center gap-1.5 break-all text-right text-xs ${mono ? "font-mono" : ""}`}>
        {value}
        {copyable && (
          <button onClick={handleCopy} className="shrink-0 text-muted transition-colors hover:text-teal" title="Copy">
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7l3 3 5-5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="8" height="8" rx="1" />
                <path d="M10 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v6a1 1 0 001 1h1" />
              </svg>
            )}
          </button>
        )}
      </span>
    </div>
  );
}
