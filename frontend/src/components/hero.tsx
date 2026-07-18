"use client";

import { useVerdictDialog } from "@/lib/verdict-context";

export function Hero() {
  const { setDialogOpen } = useVerdictDialog();
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1A1040_0%,_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#031A16_0%,_transparent_50%)]" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet/5 blur-[120px]" />

      {/* Floating atom particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full"
            style={{
              background: i % 3 === 0 ? "#6E5BFF" : i % 3 === 1 ? "#00D4B5" : "#7A7F8E",
              top: `${(i * 7 + 13) % 100}%`,
              left: `${(i * 11 + 5) % 100}%`,
              animation: `atom-float ${4 + (i % 3) * 2}s ease-in-out ${i * 0.4}s infinite`,
              opacity: 0.5 + (i % 3) * 0.15,
            }}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`orbit-${i}`}
            className="absolute h-2 w-2 rounded-full"
            style={{
              background: i % 2 === 0 ? "#6E5BFF" : "#00D4B5",
              top: `${45 + i * 2}%`,
              left: `${30 + i * 7}%`,
              animation: `atom-orbit-${i % 3} ${8 + i * 1.5}s linear infinite`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

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
            <button
              onClick={() => setDialogOpen(true)}
              className="rounded-lg bg-violet px-8 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
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
