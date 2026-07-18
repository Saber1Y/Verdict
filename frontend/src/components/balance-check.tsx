"use client";

import { useEffect, useState } from "react";

type BalanceData = {
  tNight: string;
  tNightFormatted: string;
  dust: string;
};

const API_URL = process.env.NEXT_PUBLIC_VERDICT_API ?? "http://localhost:3456";

export function BalanceCheck() {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/balance`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBalance(); }, []);

  return (
    <section id="balance" className="border-t border-card-border py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 data-aos="fade-up" className="font-heading text-3xl font-bold md:text-4xl">
            Check what the proving wallet holds
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="mt-4 text-muted">
            The wallet used to generate on-chain verdicts has a real tNight
            balance backing its proofs.
          </p>
        </div>

        <div data-aos="fade-up" data-aos-delay="200" className="mx-auto mt-12 max-w-md">
          <div className="rounded-xl border border-teal/20 bg-teal/[0.02] p-8 text-center">
            {loading ? (
              <div className="text-sm text-muted">Reading wallet state...</div>
            ) : error ? (
              <div className="text-sm text-red-400">
                {error}
                <button onClick={fetchBalance} className="ml-2 underline hover:no-underline">
                  Retry
                </button>
              </div>
            ) : data ? (
              <>
                <div className="font-heading text-4xl font-bold text-teal">
                  {data.tNightFormatted}
                </div>
                <div className="mt-1 font-mono text-xs text-muted">tNight</div>
                <div className="mt-6 text-xs text-muted">
                  Dust balance:{" "}
                  <span className="font-mono text-foreground">{data.dust}</span>
                </div>
              </>
            ) : null}
          </div>

          <p data-aos="fade-up" data-aos-delay="300" className="mt-6 text-center text-xs text-muted">
            This balance is read from the local wallet state. It is never
            transmitted to the ledger or shared with any counterparty.
          </p>
        </div>
      </div>
    </section>
  );
}
