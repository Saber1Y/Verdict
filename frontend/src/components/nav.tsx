"use client";

import { useState } from "react";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Architecture", href: "#architecture" },
  { label: "Proof", href: "#proof" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="font-heading text-xl font-semibold tracking-tight">
          Verdict
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-lg border border-card-border px-4 py-2 text-sm transition-colors hover:border-muted">
            Connect wallet
          </button>
          <button className="rounded-lg bg-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110">
            Request a verdict
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-card-border px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr className="border-card-border" />
            <button className="rounded-lg border border-card-border px-4 py-2 text-sm transition-colors hover:border-muted">
              Connect wallet
            </button>
            <button className="rounded-lg bg-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110">
              Request a verdict
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
