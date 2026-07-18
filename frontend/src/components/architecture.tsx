"use client";

export function Architecture() {
  return (
    <section id="architecture" className="border-t border-card-border py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">Architecture</h2>
          <p className="mt-4 text-muted">
            The privacy boundary is the single most important line in the system — everything before it is local, everything after it is public.
          </p>
        </div>

        {/* Stack diagram */}
        <div className="mt-16 grid gap-4 md:grid-cols-4">
          {/* Requesting agent */}
          <div className="rounded-xl border border-card-border bg-card p-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]"></span>
              <span className="font-mono text-xs text-teal">live</span>
            </div>
            <h3 className="mt-4 font-heading text-sm font-semibold">Requesting agent</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Sets deal + threshold
            </p>
          </div>

          {/* Verdict agent */}
          <div className="rounded-xl border border-card-border bg-card p-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]"></span>
              <span className="font-mono text-xs text-teal">live</span>
            </div>
            <h3 className="mt-4 font-heading text-sm font-semibold">Verdict agent</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Builds witness from local balance
            </p>
          </div>

          {/* Circuit column — spans 2 cols */}
          <div className="rounded-xl border border-violet/30 bg-card p-6 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]"></span>
              <span className="font-mono text-xs text-teal">live</span>
            </div>
            <h3 className="mt-4 font-heading text-sm font-semibold">Compact circuit</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Witness in · <span className="text-violet">disclose()</span> boundary · boolean out
            </p>

            {/* Privacy boundary visual */}
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-dashed border-violet/40 bg-violet/[0.03] px-4 py-3">
              <svg className="h-5 w-5 shrink-0 text-violet" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="14" height="10" rx="1" />
                <path d="M10 8v4M8 10h4" />
              </svg>
              <span className="font-mono text-xs text-violet">
                Privacy boundary — no raw value crosses this line
              </span>
            </div>
          </div>

          {/* Midnight ledger — full width */}
          <div className="rounded-xl border border-teal/20 bg-teal/[0.03] p-6 md:col-span-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]"></span>
              <span className="font-mono text-xs text-teal">live</span>
            </div>
            <h3 className="mt-4 font-heading text-sm font-semibold">Midnight ledger</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Public verdict · zero PII · independently verifiable
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
