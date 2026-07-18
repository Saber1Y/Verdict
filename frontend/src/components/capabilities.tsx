const CAPABILITIES = [
  {
    num: "01",
    title: "Private by construction",
    body: "The real value is a witness — supplied locally, never serialized, never logged, never transmitted.",
    badge: "Compact witness · local only",
  },
  {
    num: "02",
    title: "Provable, not promised",
    body: "A ZK circuit computes the comparison; the compiler physically prevents anything but the disclosed result from reaching public state.",
    badge: "disclose() enforced",
  },
  {
    num: "03",
    title: "One boolean, permanently",
    body: "The Midnight ledger records exactly one thing per verdict: pass/fail against a deal's threshold, tied to a deal ID.",
    badge: "Midnight testnet",
  },
  {
    num: "04",
    title: "Verifiable by anyone",
    body: "Any counterparty, sponsor, or judge can pull the transaction and confirm structurally that no raw value was ever disclosed.",
    badge: "On-chain · verifiable",
  },
];

export function Capabilities() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <div
              key={c.num}
              className="group rounded-xl border border-card-border bg-card p-8 transition-colors hover:border-violet/30"
            >
              <span className="font-mono text-3xl font-semibold text-violet/40 md:text-4xl">
                {c.num}
              </span>
              <h3 className="mt-4 font-heading text-xl font-semibold">{c.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{c.body}</p>
              <span className="mt-5 inline-block rounded-full border border-card-border bg-background px-3 py-1 font-mono text-xs text-muted">
                {c.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
