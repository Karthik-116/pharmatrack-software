import React from 'react';

const CLUSTERS = [
  { cx: 300, cy: 350, rx: 1, ry: 0.7, rings: [160, 210, 260, 310, 360, 410, 460] },
  { cx: 750, cy: 250, rx: 1, ry: 0.55, rings: [120, 170, 220, 270, 320, 370] },
  { cx: 500, cy: 700, rx: 1, ry: 0.8, rings: [100, 150, 200, 250, 300] },
];

const CLUSTERS_2 = [
  { cx: 600, cy: 400, rx: 1, ry: 0.65, rings: [180, 240, 300, 360, 420] },
  { cx: 200, cy: 600, rx: 1, ry: 0.75, rings: [130, 190, 250, 310] },
];

export default function ContourField({ variant = 'dark' }) {
  const stroke = variant === 'dark' ? '#CDFF00' : '#D4E4D0';
  const baseOpacity = variant === 'dark' ? 0.06 : 0.2;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Layer 1 */}
      <svg
        className="absolute w-[140%] h-[140%] -left-[20%] -top-[20%] animate-contour-drift"
        viewBox="0 0 1000 1000"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {CLUSTERS.map((cluster, ci) =>
          cluster.rings.map((r, ri) => (
            <ellipse
              key={`a-${ci}-${ri}`}
              cx={cluster.cx}
              cy={cluster.cy}
              rx={r * cluster.rx}
              ry={r * cluster.ry}
              stroke={stroke}
              strokeWidth="0.6"
              opacity={Math.max(baseOpacity - ri * 0.008, 0.01)}
            />
          ))
        )}
      </svg>

      {/* Layer 2 — counter-drift for parallax */}
      <svg
        className="absolute w-[120%] h-[120%] -left-[10%] -top-[10%] animate-contour-drift-slow"
        viewBox="0 0 1000 1000"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {CLUSTERS_2.map((cluster, ci) =>
          cluster.rings.map((r, ri) => (
            <ellipse
              key={`b-${ci}-${ri}`}
              cx={cluster.cx}
              cy={cluster.cy}
              rx={r * cluster.rx}
              ry={r * cluster.ry}
              stroke={stroke}
              strokeWidth="0.4"
              opacity={Math.max(baseOpacity * 0.7 - ri * 0.008, 0.01)}
            />
          ))
        )}
      </svg>
    </div>
  );
}
