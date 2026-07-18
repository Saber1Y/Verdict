export function Proof() {
  return (
    <section id="proof" className="border-t border-card-border py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 data-aos="fade-up" className="font-heading text-3xl font-bold md:text-4xl">
            See exactly what&apos;s disclosed — and what isn&apos;t.
          </h2>
          <p data-aos="fade-up" data-aos-delay="100" className="mt-4 text-muted">
            Every verdict is a real transaction. Here&apos;s what a proof looks like on-chain:
            the verdict and metadata are public; the balance that backs it never is.
          </p>
        </div>

        {/* Transaction proof card */}
        <div data-aos="fade-up" data-aos-delay="200" className="mx-auto mt-12 max-w-2xl rounded-xl border border-card-border bg-card p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-card-border bg-background px-3 py-1 font-mono text-xs text-muted">
              tx #4471
            </span>
            <span className="flex items-center gap-2 font-mono text-xs text-teal">
              <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]"></span>
              verified
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            <Field label="Deal ID" value="#4471" mono />
            <Field label="Threshold" value="$50,000" mono />
            <Field label="Verdict" value="TRUE" mono teal />
            <Field label="Transaction hash" value="0x8f7a...b3e2" mono />
            <Field label="Contract address" value="0x3c1d...9a4f" mono />
          </div>

          {/* Crossed-out balance */}
          <div className="mt-6 rounded-lg border border-dashed border-red-500/20 bg-red-500/[0.03] p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 shrink-0 text-red-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 15L15 5M15 15L5 5" />
              </svg>
              <div>
                <span className="font-mono text-sm text-red-400 line-through decoration-2">
                  Balance: $84,650
                </span>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  Never disclosed. Never transmitted. Never logged.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-muted">
          Hackathon build — Midnight testnet only. No real economic value moves;
          tDUST test tokens cover transaction costs. Every proof shown is a real
          testnet transaction, not a mock.
        </p>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  mono,
  teal,
}: {
  label: string;
  value: string;
  mono?: boolean;
  teal?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-card-border pb-3">
      <span className="text-sm text-muted">{label}</span>
      <span
        className={`text-sm ${mono ? "font-mono" : ""} ${teal ? "font-semibold text-teal" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
