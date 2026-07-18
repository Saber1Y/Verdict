"use client";

import type { ReactNode } from "react";

export type NodeCategory = "trigger" | "logic" | "action" | "output";

const CATEGORY_STYLES: Record<
  NodeCategory,
  { tint: string; border: string; iconBg: string; shadow: string }
> = {
  trigger: {
    tint: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    shadow: "shadow-emerald-500/5",
  },
  logic: {
    tint: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    shadow: "shadow-amber-500/5",
  },
  action: {
    tint: "bg-sky-50",
    border: "border-sky-200",
    iconBg: "bg-sky-100",
    shadow: "shadow-sky-500/5",
  },
  output: {
    tint: "bg-indigo-50",
    border: "border-indigo-200",
    iconBg: "bg-indigo-100",
    shadow: "shadow-indigo-500/5",
  },
};

interface WorkflowNodeProps {
  category: NodeCategory;
  icon: ReactNode;
  label: string;
  description: string;
  className?: string;
  /** True when this node models a fork (has Yes/No branches downstream) */
  hasBranches?: boolean;
}

export function WorkflowNode({
  category,
  icon,
  label,
  description,
  className = "",
  hasBranches,
}: WorkflowNodeProps) {
  const s = CATEGORY_STYLES[category];

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Node card */}
      <div
        className={`relative rounded-[20px] border ${s.border} ${s.tint} ${s.shadow} shadow-md transition-all duration-500 hover:shadow-lg`}
        style={{ width: 72, height: 72 }}
      >
        {/* Icon container */}
        <div
          className={`flex h-full w-full items-center justify-center rounded-[20px] ${s.iconBg}`}
        >
          <span className="text-lg">{icon}</span>
        </div>

        {/* Success badge (bottom-right overlap) */}
        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm">
          <svg
            className="h-2.5 w-2.5 text-white"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 6L5 8.5L9.5 3.5" />
          </svg>
        </div>

        {/* Port dots — top, bottom, left, right */}
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-gray-300 bg-white" />
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-gray-300 bg-white" />
        <div className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-gray-300 bg-white" />
        <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-gray-300 bg-white" />
      </div>

      {/* Label */}
      <span className="mt-3 text-center text-sm font-medium text-gray-700">
        {label}
      </span>
      <span className="mt-0.5 max-w-[120px] text-center text-[10px] leading-tight text-gray-400">
        {description}
      </span>

      {/* Branch labels (yellow/green/red small indicators below the node) */}
      {hasBranches && (
        <div className="mt-2 flex gap-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-600">
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 10V3M3 3l3 3M3 3L0 6" />
            </svg>
            Yes
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-[10px] font-medium text-red-600">
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 10V3M3 3l3 3M3 3L0 6" />
            </svg>
            No
          </span>
        </div>
      )}
    </div>
  );
}
