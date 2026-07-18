"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HistoryEntry = {
  dealId: string;
  threshold: number;
  counterparty: string;
  verdictPassed: boolean | null;
  txId: string | null;
  blockHeight: number | null;
  timestamp: number;
};

const API_URL = process.env.NEXT_PUBLIC_VERDICT_API ?? "http://localhost:3456";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/history`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setEntries(data.reverse());
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <Link href="/" className="font-heading text-lg font-bold tracking-tight">
          Verdict
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-card-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-muted"
        >
          Back to home
        </Link>
      </nav>

      <main className="mx-auto max-w-5xl px-4 pb-20">
        <h1 className="font-heading text-2xl font-bold">Verdict History</h1>
        <p className="mt-1 text-sm text-muted">
          Past solvency checks submitted through the network.
        </p>

        {loading && (
          <div className="mt-12 text-center text-sm text-muted">Loading history...</div>
        )}

        {error && (
          <div className="mt-12 text-center text-sm text-red-400">
            Failed to load history: {error}
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="mt-12 text-center text-sm text-muted">
            No verdicts have been submitted yet.
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-card-border text-xs uppercase text-muted">
                  <th className="pb-3 pr-4 font-medium">Deal</th>
                  <th className="pb-3 pr-4 font-medium">Threshold</th>
                  <th className="pb-3 pr-4 font-medium">Counterparty</th>
                  <th className="pb-3 pr-4 font-medium">Verdict</th>
                  <th className="pb-3 pr-4 font-medium">Block</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={i} className="border-b border-card-border/50 transition-colors hover:bg-card/50">
                    <td className="py-3 pr-4 font-mono text-xs">{e.dealId}</td>
                    <td className="py-3 pr-4">${e.threshold.toLocaleString()}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted">{e.counterparty}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs ${
                          e.verdictPassed === true
                            ? "bg-teal/10 text-teal"
                            : e.verdictPassed === false
                              ? "bg-red-500/10 text-red-400"
                              : "bg-muted/10 text-muted"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            e.verdictPassed === true
                              ? "bg-teal"
                              : e.verdictPassed === false
                                ? "bg-red-400"
                                : "bg-muted"
                          }`}
                        />
                        {e.verdictPassed === true ? "SOLVENT" : e.verdictPassed === false ? "INSUFFICIENT" : "UNKNOWN"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted">
                      {e.blockHeight ? `#${e.blockHeight}` : "-"}
                    </td>
                    <td className="py-3 text-xs text-muted">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
