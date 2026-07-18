const STEPS = [
  {
    num: 1,
    title: "Set a public threshold",
    body: 'A deal sets a public threshold — e.g. "counterparty must hold at least $50,000". The threshold is visible on-chain.',
  },
  {
    num: 2,
    title: "Read locally, never transmit",
    body: "The counterparty agent reads its real balance from a local witness. The value never leaves that environment.",
  },
  {
    num: 3,
    title: "Prove in zero knowledge",
    body: "A Compact circuit compares the private balance against the public threshold inside a ZK proof. The circuit enforces what can be disclosed.",
  },
  {
    num: 4,
    title: "Disclose only the verdict",
    body: "Only the boolean verdict and the deal ID reach the Midnight ledger. No raw values, no PII, no surplus data.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-card-border py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 data-aos="fade-up" className="font-heading text-3xl font-bold md:text-4xl">How it works</h2>
          <p data-aos="fade-up" data-aos-delay="100" className="mt-4 text-muted">
            Four steps from deal creation to on-chain verdict — with the privacy boundary intact at every stage.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.num} data-aos="fade-up" data-aos-delay={i * 150} className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-card-border bg-card font-mono text-lg font-semibold text-violet">
                {step.num}
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
