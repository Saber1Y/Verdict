"use client";

import { useState, useCallback, useEffect } from "react";

export type VerdictRequest = {
  dealId: string;
  threshold: string;
  counterparty: string;
  descriptionHash?: string;
};

export type VerdictResult = {
  success: boolean;
  verdictPassed: boolean | null;
  threshold?: number;
  counterparty?: string;
  txId: string | null;
  blockHeight: number | null;
  dealId: string;
};

export type VerdictStep =
  | "idle"
  | "preparing"
  | "proving"
  | "balancing"
  | "submitting"
  | "done"
  | "error";

export function useVerdict() {
  const [step, setStep] = useState<VerdictStep>("idle");
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitVerdict = useCallback(async (req: VerdictRequest) => {
    setStep("preparing");
    setError(null);
    setResult(null);

    try {
      await delay(600);
      setStep("proving");
      await delay(400);
      setStep("balancing");
      await delay(400);
      setStep("submitting");

      const VERDICT_API = process.env.NEXT_PUBLIC_VERDICT_API || "http://localhost:3456";

      const response = await fetch(`${VERDICT_API}/verdict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: req.dealId,
          threshold: req.threshold,
          counterparty: req.counterparty,
          descriptionHash: req.descriptionHash ?? "",
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(err.error || `Request failed (${response.status})`);
      }

      const data: VerdictResult = await response.json();
      setResult(data);
      setStep("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStep("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStep("idle");
    setResult(null);
    setError(null);
  }, []);

  return { step, result, error, submitVerdict, reset };
}

export function useLatestVerdict() {
  const [latest, setLatest] = useState<VerdictResult | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const VERDICT_API = process.env.NEXT_PUBLIC_VERDICT_API || "http://localhost:3456";
      const res = await fetch(`${VERDICT_API}/history`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const entries: VerdictResult[] = await res.json();
      setLatest(entries.length > 0 ? entries[entries.length - 1] : null);
    } catch {
      setLatest(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { latest, loading, refresh };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
