"use client";

import { useId, useMemo } from "react";
import { WorkflowNode, type NodeCategory } from "./workflow-node";
import type { ReactNode } from "react";

export interface WorkflowStep {
  id: string;
  category: NodeCategory;
  icon: ReactNode;
  label: string;
  description: string;
  hasBranches?: boolean;
}

export interface Connection {
  from: string;
  to: string;
  /** When true, this connection is conditional (e.g. Yes/No branch) */
  conditional?: boolean;
  /** Label shown on the line for conditional branches */
  branchLabel?: "Yes" | "No";
  /** For conditional lines: green for Yes, red for No. Default: gray */
  color?: string;
}

interface WorkflowCanvasProps {
  steps: WorkflowStep[];
  connections: Connection[];
  className?: string;
}

/** Converts a step index to an x,y position for the SVG connectors. */
function pos(
  index: number,
  total: number,
  canvasWidth: number,
  nodeSize: number,
  gap: number,
  verticalSpread: number,
): { x: number; y: number } {
  const x = 80 + index * (nodeSize + gap);
  // central row y, with vertical offsets for branch nodes
  const baseY = 180;
  const offsetY =
    index === 1 ? -verticalSpread : index === 2 ? verticalSpread : 0;
  return { x: x + nodeSize / 2, y: baseY + offsetY };
}

export function WorkflowCanvas({
  steps,
  connections,
  className = "",
}: WorkflowCanvasProps) {
  const uid = useId();
  const nodeSize = 72;
  const gap = 200;
  const verticalSpread = 100;
  const canvasWidth = 80 * 2 + steps.length * (nodeSize + gap);
  // Create Y offsets for branch nodes
  const yOffsets = useMemo(() => {
    const map = new Map<string, number>();
    let depth = 0;
    for (const s of steps) {
      if (s.hasBranches) {
        // The next two steps are forks — offset them vertically
        const idx = steps.indexOf(s);
        if (idx + 1 < steps.length) map.set(steps[idx + 1].id, -verticalSpread);
        if (idx + 2 < steps.length) map.set(steps[idx + 2].id, verticalSpread);
      }
    }
    return map;
  }, [steps]);

  // Calculate positions for all steps (central row)
  const positions = useMemo(() => {
    return steps.map((s, i) => {
      const x = 80 + i * (nodeSize + gap);
      const yOffset = yOffsets.get(s.id) ?? 0;
      return { x: x + nodeSize / 2, y: 180 + yOffset, index: i };
    });
  }, [steps, yOffsets]);

  const posMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    steps.forEach((s, i) => map.set(s.id, positions[i]));
    return map;
  }, [steps, positions]);

  // Build SVG path for a bezier curve from->to
  function connectionPath(
    fromId: string,
    toId: string,
    color: string = "#d1d5db",
    branchLabel?: string,
  ) {
    const from = posMap.get(fromId);
    const to = posMap.get(toId);
    if (!from || !to) return null;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const cx1 = from.x + dx * 0.4;
    const cy1 = from.y;
    const cx2 = to.x - dx * 0.4;
    const cy2 = to.y;

    const d = `M${from.x},${from.y} C${cx1},${cy1} ${cx2},${cy2} ${to.x},${to.y}`;

    return (
      <g key={`${fromId}-${toId}`}>
        {/* Shadow path (thicker, transparent) for hover area */}
        <path
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth={12}
          className="cursor-pointer"
        />
        {/* Visible dashed line */}
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        {/* Animated dash flow */}
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="6 4"
          strokeLinecap="round"
          className="animate-dash-flow"
          style={{ opacity: 0.4 }}
        />
        {/* Branch label on the midpoint */}
        {branchLabel && (
          <foreignObject
            x={(from.x + to.x) / 2 - 24}
            y={(from.y + to.y) / 2 - 10}
            width={48}
            height={20}
          >
            <div className="flex h-full items-center justify-center">
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium shadow-sm ${
                  branchLabel === "Yes"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {branchLabel}
              </span>
            </div>
          </foreignObject>
        )}
        {/* Arrow head at the destination */}
        <CircleArrow cx={to.x} cy={to.y} color={color} />
      </g>
    );
  }

  return (
    <div className={`relative overflow-x-auto ${className}`}>
      <svg
        viewBox={`0 0 ${canvasWidth} 360`}
        className="w-full"
        style={{ minHeight: 360 }}
      >
        <defs>
          <filter id={`shadow-${uid}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Render connections */}
        {connections.map((c) =>
          connectionPath(c.from, c.to, c.color, c.branchLabel),
        )}
      </svg>

      {/* Render nodes on top of the SVG */}
      <div
        className="relative"
        style={{ height: 0, marginTop: -360, pointerEvents: "none" }}
      >
        {steps.map((s, i) => {
          const p = positions[i];
          return (
            <div
              key={s.id}
              className="absolute animate-fade-in-up"
              style={{
                left: p.x - nodeSize / 2 - 80,
                top: p.y - nodeSize / 2,
                pointerEvents: "auto",
                animationDelay: `${i * 150}ms`,
                opacity: 0,
              }}
            >
              <WorkflowNode
                category={s.category}
                icon={s.icon}
                label={s.label}
                description={s.description}
                hasBranches={s.hasBranches}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CircleArrow({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle cx={0} cy={0} r={5} fill="white" stroke={color} strokeWidth={1.5} />
    </g>
  );
}
