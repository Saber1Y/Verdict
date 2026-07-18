const STATS = [
  {
    value: "0",
    label: "raw values ever cross the privacy boundary",
  },
  {
    value: "1",
    label: "boolean disclosed per verdict",
  },
  {
    value: "100%",
    label: "of verdicts independently verifiable on-chain",
  },
];

export function Stats() {
  return (
    <section className="border-t border-card-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 text-center md:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label}>
              <span className="font-heading text-5xl font-bold text-teal md:text-6xl">
                {s.value}
              </span>
              <p className="mt-3 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
