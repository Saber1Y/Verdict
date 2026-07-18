const CONTRACT_ADDRESS = "97a1ce5a9d23d11fe7de0515e1e06d9223d1ff52c5d128af6dd61b043b5434c3";

const LINKS = [
  {
    title: "Deployed contract",
    desc: "Midnight local devnet",
    href: `https://explorer.local.midnight.network/contracts/${CONTRACT_ADDRESS}`,
  },
  {
    title: "Sample verdict",
    desc: "Verify any tx hash on the Midnight explorer",
    href: `https://explorer.local.midnight.network/transactions`,
  },
  {
    title: "GitHub repo",
    desc: "Source, circuit, and proof server",
    href: "https://github.com/0xSaber/verdict",
  },
];

export function Transparency() {
  return (
    <section className="border-t border-card-border py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 data-aos="fade-up" className="font-heading text-3xl font-bold md:text-4xl">Verify it yourself</h2>
          <p data-aos="fade-up" data-aos-delay="100" className="mt-4 text-muted">
            Every verdict is a real on-chain transaction. Pull any of them and confirm
            — structurally — that no raw value was ever disclosed.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {LINKS.map((link, i) => (
            <a
              key={link.title}
              href={link.href}
              data-aos="fade-up"
              data-aos-delay={i * 150}
              className="group rounded-xl border border-card-border bg-card p-6 transition-colors hover:border-violet/30"
            >
              <h3 className="font-heading text-lg font-semibold group-hover:text-violet">
                {link.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
