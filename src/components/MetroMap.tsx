import { plan, toTime, fmt } from "@/lib/data";

const W = 1000;
const H = 470;
const LEFT = 120;
const RIGHT = 990;
const PW = (RIGHT - LEFT) / plan.phases.length;
const ROWS: { id: "dsa" | "systems" | "ai"; label: string; y: number; color: string }[] = [
  { id: "dsa", label: "DSA", y: 165, color: "var(--dsa)" },
  { id: "systems", label: "Systems", y: 285, color: "var(--systems)" },
  { id: "ai", label: "AI", y: 405, color: "var(--ai)" },
];

/** x position of a date: each phase gets an equal slice, dates are spread within it. */
function xOf(date: string): number {
  const t = toTime(date);
  for (let i = 0; i < plan.phases.length; i++) {
    const p = plan.phases[i];
    const a = toTime(p.start);
    const b = toTime(p.end) + 86_400_000;
    if (t >= a && t < b) return LEFT + i * PW + ((t - a) / (b - a)) * PW;
  }
  return t < toTime(plan.phases[0].start) ? LEFT : RIGHT;
}

export default function MetroMap({ today }: { today: string }) {
  const tx = xOf(today);

  return (
    <figure className="metro" style={{ margin: "32px 0 0" }}>
      <div className="metro-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="metro-title">
          <title id="metro-title">
            Map of the plan: three tracks (DSA, databases and system design, AI engineering) running through four phases
            from October 2026 to December 2027, with today marked.
          </title>

          {/* phases */}
          {plan.phases.map((p, i) => {
            const x0 = LEFT + i * PW;
            return (
              <g key={p.id}>
                {i > 0 && <line x1={x0} x2={x0} y1={20} y2={H - 30} stroke="var(--line)" strokeDasharray="4 5" />}
                <text x={x0 + 10} y={34} fontSize="15" fontWeight="650" fill="var(--text)">
                  {p.id}. {p.name}
                </text>
                <text x={x0 + 10} y={52} fontSize="12" fill="var(--muted)">
                  {fmt(p.start, { month: "short", year: "numeric" })} – {fmt(p.end, { month: "short", year: "numeric" })}
                </text>
              </g>
            );
          })}

          {/* tracks */}
          {ROWS.map((row) => {
            const stops = plan.tracks[row.id].stops;
            return (
              <g key={row.id}>
                <text x={0} y={row.y + 5} fontSize="15" fontWeight="650" fill={row.color}>
                  {row.label}
                </text>
                <line x1={LEFT} x2={RIGHT} y1={row.y} y2={row.y} stroke={row.color} strokeOpacity="0.28" strokeWidth="6" strokeLinecap="round" />
                <line x1={LEFT} x2={tx} y1={row.y} y2={row.y} stroke={row.color} strokeWidth="6" strokeLinecap="round" />
                {plan.phases.map((ph, pi) => {
                  const inPhase = stops.filter((s) => s.phase === ph.id);
                  const pad = 18;
                  const step = (PW - pad * 2) / inPhase.length;
                  return inPhase.map((s, si) => {
                    const x = LEFT + pi * PW + pad + step * (si + 0.5);
                    const r = s.status === "current" ? 8 : 6;
                    return (
                      <g key={s.name}>
                        <circle
                          cx={x}
                          cy={row.y}
                          r={r}
                          fill={s.status === "next" ? "var(--sheet)" : row.color}
                          stroke={s.status === "current" ? "var(--mark)" : row.color}
                          strokeWidth={s.status === "current" ? 4 : 3}
                        />
                        <text
                          x={x + 3}
                          y={row.y - 15}
                          fontSize="12.5"
                          fill={s.status === "next" ? "var(--muted)" : "var(--text)"}
                          fontWeight={s.status === "current" ? 700 : 450}
                          transform={`rotate(-38 ${x + 3} ${row.y - 15})`}
                        >
                          {s.name}
                        </text>
                      </g>
                    );
                  });
                })}
              </g>
            );
          })}

          {/* job gates */}
          {plan.jobGates.map((g) => {
            const x = xOf(g.date);
            return (
              <g key={g.date}>
                <path d={`M${x} ${H - 34} l0 -10 l9 4 l-9 4`} fill="var(--text)" stroke="var(--text)" strokeWidth="1.5" strokeLinejoin="round" />
                <text x={x + 2} y={H - 14} fontSize="11.5" fill="var(--muted)">
                  {g.short}
                </text>
              </g>
            );
          })}

          {/* today */}
          <g>
            <line x1={tx} x2={tx} y1={66} y2={H - 44} stroke="var(--text)" strokeWidth="1.5" strokeDasharray="2 4" />
            <rect className="you-are-here" x={tx - 34} y={64} width={68} height={22} rx={4} fill="var(--mark)" />
            <text x={tx} y={79} fontSize="12.5" fontWeight="700" fill="var(--mark-text)" textAnchor="middle">
              Today
            </text>
          </g>
        </svg>
      </div>
      <figcaption className="legend">
        <span><i style={{ background: "var(--dsa)" }} />DSA</span>
        <span><i style={{ background: "var(--systems)" }} />Databases &amp; system design</span>
        <span><i style={{ background: "var(--ai)" }} />AI engineering</span>
        <span>Filled stop: done. Ringed stop: working on it now. Flag: job search widens.</span>
      </figcaption>
    </figure>
  );
}
