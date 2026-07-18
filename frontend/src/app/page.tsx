import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Capabilities } from "@/components/capabilities";
import { HowItWorks } from "@/components/how-it-works";
import { Architecture } from "@/components/architecture";
import { Stats } from "@/components/stats";
import { BalanceCheck } from "@/components/balance-check";
import { Proof } from "@/components/proof";
import { Transparency } from "@/components/transparency";
import { Footer } from "@/components/footer";
import { PageShell } from "@/components/page-shell";

export default function Home() {
  return (
    <PageShell>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Capabilities />
        <HowItWorks />
        <Architecture />
        <Stats />
        <BalanceCheck />
        <Proof />
        <Transparency />
      </main>
      <Footer />
    </PageShell>
  );
}
