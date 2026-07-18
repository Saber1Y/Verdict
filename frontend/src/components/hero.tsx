"use client";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1A1040_0%,_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#031A16_0%,_transparent_50%)]" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          <span
            data-aos="fade-down"
            data-aos-delay="100"
            className="mb-6 inline-block rounded-full border border-violet/20 bg-violet/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-violet"
          >
            Zero-knowledge agent verification
          </span>

          <h1
            data-aos="fade-up"
            data-aos-delay="200"
            className="font-heading text-5xl font-bold leading-tight md:text-7xl"
          >
            Prove the number.
            <br />
            <span className="text-violet">Hide the number.</span>
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
          >
            One agent proves it clears another agent&apos;s threshold — solvency, eligibility, whatever the deal requires — without either side, or the chain, ever seeing the real value.
          </p>

          {/* Live-status pills */}
          <div data-aos="fade-up" data-aos-delay="400" className="mt-10 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card/60 px-3 py-1.5 font-mono text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]"></span>
              Compact ZK circuits
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card/60 px-3 py-1.5 font-mono text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]"></span>
              Witness never leaves the device
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card/60 px-3 py-1.5 font-mono text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]"></span>
              Verdict on-chain, balance never
            </span>
          </div>

          {/* CTAs */}
          <div data-aos="fade-up" data-aos-delay="500" className="mt-10 flex flex-wrap justify-center gap-4">
            <button className="rounded-lg bg-violet px-8 py-3 text-sm font-semibold text-white transition-all hover:brightness-110">
              Request a verdict
            </button>
            <button className="rounded-lg border border-card-border px-8 py-3 text-sm font-semibold transition-colors hover:border-muted">
              See how it proves
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
