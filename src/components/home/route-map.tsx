"use client";

import { useId } from "react";

/**
 * Stylized route map — China to the world (spec §12, §107).
 * Pure SVG, no heavy map libraries. Origin Shanghai, arcs to destinations.
 */
const DESTINATIONS = [
  { label: "United States", cx: 210, cy: 60 },
  { label: "Canada", cx: 185, cy: 42 },
  { label: "Mexico", cx: 215, cy: 105 },
  { label: "Brazil", cx: 300, cy: 175 },
  { label: "United Kingdom", cx: 310, cy: 62 },
  { label: "France", cx: 335, cy: 78 },
  { label: "Germany", cx: 360, cy: 66 },
  { label: "Italy", cx: 355, cy: 98 },
  { label: "Spain", cx: 315, cy: 95 },
  { label: "Japan", cx: 380, cy: 240 },
  { label: "Australia", cx: 355, cy: 290 },
];

const ORIGIN = { cx: 52, cy: 175 }; // China

function useRoutePath(dest: { cx: number; cy: number }) {
  const mx = (ORIGIN.cx + dest.cx) / 2;
  const my = Math.min(ORIGIN.cy, dest.cy) - 42;
  return `M ${ORIGIN.cx} ${ORIGIN.cy} Q ${mx} ${my} ${dest.cx} ${dest.cy}`;
}

export function RouteMap({ className }: { className?: string }) {
  const id = useId();
  return (
    <div className={className} role="img" aria-label="Logistics routes from China to the world">
      <svg viewBox="0 0 420 320" fill="none" className="w-full">
        {/* subtle background grid */}
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#146EF5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="420" height="320" rx="20" fill="url(#${id}-g)" />

        {/* dotted landmass hints */}
        {[
          [90, 60], [400, 50], [120, 240], [340, 180], [260, 290],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.5" fill="#3B82F6" opacity="0.3" />
        ))}

        {/* routes */}
        {DESTINATIONS.map((d, i) => {
          const dPath = useRoutePath(d);
          const len = 210 + i * 7;
          return (
            <g key={i}>
              <path d={dPath} stroke="#3B82F6" strokeOpacity="0.28" strokeWidth="1.25" fill="none" />
              <path
                d={dPath}
                stroke="#3B82F6"
                strokeOpacity="0.75"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray={`${len / 3} ${len / 3}`}
                className="animate-route-dash"
                style={{ animationDuration: `${4 + (i % 5)}s`, filter: `url(#${id}-glow)` }}
              />
              <circle cx={d.cx} cy={d.cy} r="4" fill="#3B82F6" />
            </g>
          );
        })}

        {/* origin — China */}
        <circle cx={ORIGIN.cx} cy={ORIGIN.cy} r="8" fill="#146EF5" stroke="#fff" strokeWidth="2" />
        <circle cx={ORIGIN.cx} cy={ORIGIN.cy} r="13" stroke="#146EF5" strokeOpacity="0.35" strokeWidth="1.5" />
      </svg>
    </div>
  );
}