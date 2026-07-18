"use client";

import { WorkflowCanvas, type WorkflowStep, type Connection } from "./workflow-canvas";
import { FiGlobe, FiShield, FiCpu, FiArrowRight, FiCheckCircle } from "react-icons/fi";

const STEPS: WorkflowStep[] = [
  {
    id: "requestor",
    category: "trigger",
    icon: <FiGlobe className="text-emerald-600" />,
    label: "Requesting agent",
    description: "Sets deal + threshold",
  },
  {
    id: "verdict-agent",
    category: "logic",
    icon: <FiShield className="text-amber-600" />,
    label: "Verdict agent",
    description: "Reads balance from local witness",
    hasBranches: true,
  },
  {
    id: "circuit-yes",
    category: "action",
    icon: <FiCpu className="text-sky-600" />,
    label: "ZK Circuit",
    description: "Pass: balance ≥ threshold",
  },
  {
    id: "circuit-no",
    category: "action",
    icon: <FiCpu className="text-sky-600" />,
    label: "ZK Circuit",
    description: "Fail: below threshold",
  },
  {
    id: "merge",
    category: "logic",
    icon: <FiArrowRight className="text-amber-600" />,
    label: "disclose() boundary",
    description: "Only boolean + deal ID cross",
  },
  {
    id: "ledger",
    category: "output",
    icon: <FiCheckCircle className="text-indigo-600" />,
    label: "Midnight ledger",
    description: "Public verdict, zero PII",
  },
];

const CONNECTIONS: Connection[] = [
  { from: "requestor", to: "verdict-agent" },
  { from: "verdict-agent", to: "circuit-yes", conditional: true, branchLabel: "Yes", color: "#10b981" },
  { from: "verdict-agent", to: "circuit-no", conditional: true, branchLabel: "No", color: "#ef4444" },
  { from: "circuit-yes", to: "merge" },
  { from: "circuit-no", to: "merge" },
  { from: "merge", to: "ledger" },
];

export function Architecture() {
  return (
    <section id="architecture" className="border-t border-card-border py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 data-aos="fade-up" className="font-heading text-3xl font-bold md:text-4xl">Architecture</h2>
          <p data-aos="fade-up" data-aos-delay="100" className="mt-4 text-muted">
            The privacy boundary is the single most important line in the system —
            everything before it is local, everything after it is public.
          </p>
        </div>

        {/* Workflow canvas */}
        <div data-aos="fade-up" data-aos-delay="200" className="mt-16">
          <WorkflowCanvas steps={STEPS} connections={CONNECTIONS} />

          {/* Privacy boundary callout */}
          <div className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-xl border border-dashed border-violet/40 bg-violet/[0.03] px-5 py-4">
            <svg className="h-5 w-5 shrink-0 text-violet" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="14" height="10" rx="1" />
              <path d="M10 8v4M8 10h4" />
            </svg>
            <span className="font-mono text-xs text-violet">
              Privacy boundary — no raw value crosses this line
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
