export function Footer() {
  return (
    <footer className="border-t border-card-border py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <span className="font-heading text-lg font-semibold">Verdict</span>
            <p className="mt-1 text-xs text-muted">
              Prove the number. Hide the number.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted">
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#architecture" className="transition-colors hover:text-foreground">
              Architecture
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              GitHub
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_#00D4B5]"></span>
            <span className="font-mono text-xs text-muted">Network: Midnight testnet</span>
          </div>
        </div>

        <div className="mt-8 border-t border-card-border pt-6 text-center">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Verdict. Hackathon build — all transactions use test tokens.
          </p>
        </div>
      </div>
    </footer>
  );
}
