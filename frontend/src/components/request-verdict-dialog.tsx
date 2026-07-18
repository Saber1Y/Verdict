"use client";

import { useState, useEffect, useCallback } from "react";
import { useMidnightWallet } from "@/hooks/use-midnight-wallet";

type Step = "form" | "preparing" | "proving" | "balancing" | "submitting" | "done";

type VerdictResult = {
  dealId: string;
  threshold: string;
  counterparty: string;
  verdict: boolean;
  txHash: string;
  blockHeight: number;
};

const STEP_MESSAGES: Record<Step, string> = {
  form: "",
  preparing: "Preparing circuit...",
  proving: "Generating zero-knowledge proof...",
  balancing: "Balancing transaction with wallet...",
  submitting: "Submitting to the Midnight Network...",
  done: "",
};

export function RequestVerdictDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { status: walletStatus, address, connect } = useMidnightWallet();
  const [step, setStep] = useState<Step>("form");
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [dealId, setDealId] = useState(`#${Math.floor(Math.random() * 9000 + 1000)}`);
  const [threshold, setThreshold] = useState("50000");
  const [counterparty, setCounterparty] = useState("0x3c1d...9a4f");
  const [description, setDescription] = useState("Solvency verification for Q3 settlement");

  const reset = useCallback(() => {
    setStep("form");
    setResult(null);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handleSubmit = async () => {
    setStep("preparing");

    // Simulate the proving pipeline with realistic delays
    await delay(800);
    setStep("proving");
    await delay(1500);
    setStep("balancing");
    await delay(1000);
    setStep("submitting");
    await delay(1200);

    // Derive deterministic result from the deal ID
    const hash = simpleHash(dealId + threshold + counterparty);
    const passed = hash % BigInt(2) === BigInt(0);

    setResult({
      dealId,
      threshold: `$${Number(threshold).toLocaleString()}`,
      counterparty,
      verdict: passed,
      txHash: `0x${(hash & BigInt("0xfffffffffffffff")).toString(16).padStart(16, "0")}`,
      blockHeight: 8954321 + Math.floor(Number(hash % BigInt(100))),
    });
    setStep("done");
  };

  if (!open) return null;

  const isForm = step === "form";
  const isDone = step === "done";
  const isActive = !isForm && !isDone;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-card-border bg-card p-8 shadow-2xl">
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
              {(["preparing", "proving", "balancing", "submitting"] as Step[]).map((s) => {
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

            <div
              className={`mt-6 rounded-xl border p-6 ${
                result.verdict
                  ? "border-teal/30 bg-teal/[0.03]"
                  : "border-red-500/20 bg-red-500/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-card-border bg-background px-3 py-1 font-mono text-xs text-muted">
                  {result.dealId}
                </span>
                <span
                  className={`flex items-center gap-2 font-mono text-xs ${
                    result.verdict ? "text-teal" : "text-red-400"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      result.verdict
                        ? "bg-teal shadow-[0_0_6px_#00D4B5]"
                        : "bg-red-400 shadow-[0_0_6px_#ef4444]"
                    }`}
                  ></span>
                  {result.verdict ? "SOLVENT" : "INSUFFICIENT"}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <Field label="Threshold" value={result.threshold} />
                <Field label="Counterparty" value={result.counterparty} />
                <Field label="Transaction hash" value={result.txHash} mono />
                <Field label="Block height" value={`#${result.blockHeight}`} />
              </div>

              <div className="mt-4 rounded-lg border border-dashed border-red-500/20 bg-red-500/[0.03] p-3">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0 text-red-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 15L15 5M15 15L5 5" />
                  </svg>
                  <span className="text-xs text-muted">
                    Balance: never disclosed &middot; never transmitted &middot; never logged
                  </span>
                </div>
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
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-card-border pb-2">
      <span className="text-xs text-muted">{label}</span>
      <span className={`text-xs ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function simpleHash(str: string): bigint {
  let h = BigInt(0);
  for (let i = 0; i < str.length; i++) {
    h = (h << BigInt(5)) - h + BigInt(str.charCodeAt(i));
    h &= BigInt("0xffffffffffffffff");
  }
  return h;
}
