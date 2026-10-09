"use client";

import { fd } from "@/lib/fmt";
import { useMemo, useState } from "react";

type TrackId = "dsa" | "systems" | "ai";
type Stop = { name: string; phase: number; status: string };
type PhaseTrack = { track: string; topics: string; where: string; doneWhen: string };
type Phase = { id: number; name: string; start: string; end: string; goal: string; project: string; tracks: PhaseTrack[] };
type Gate = { date: string; label: string; short: string };
export type GroupProgress = { name: string; problems: { name: string; url: string; state: string }[]; total: number; done: number };

type Props = {
  today: string;
  phases: Phase[];
  tracks: Record<TrackId, { label: string; stops: Stop[] }>;
  gates: Gate[];
  groups: Record<string, GroupProgress>;
};

const W = 1000;
const H = 470;
const LEFT = 120;
const RIGHT = 990;
const ROWS: { id: TrackId; label: string; y: number }[] = [
  { id: "dsa", label: "DSA", y: 165 },
  { id: "systems", label: "Systems", y: 285 },
  { id: "ai", label: "AI", y: 405 },
];
const TRACK_NAME: Record<TrackId, string> = { dsa: "DSA", systems: "Databases & system design", ai: "AI engineering" };
const GROUP_ALIAS: Record<string, string> = {
  Heaps: "Heap / priority queue",
  "1-D DP": "1-D dynamic programming",
  "2-D DP": "2-D dynamic programming",
};
const STATUS_LABEL: Record<string, string> = { done: "Done", current: "Working on it now", next: "Coming up" };

const DAY = 86_400_000;
const t = (d: string) => Date.parse(d + "T00:00:00Z");
const fmtMonth = (d: string) => fd(d, "my");

type Sel = { kind: "stop"; track: TrackId; stop: Stop } | { kind: "phase"; phase: Phase } | null;

export default function MetroMap({ today, phases, tracks, gates, groups }: Props) {
  const PW = (RIGHT - LEFT) / phases.length;
  const [shown, setShown] = useState<Record<TrackId, boolean>>({ dsa: true, systems: true, ai: true });
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);
  const [sel, setSel] = useState<Sel>(null);

  const xOf = (date: string) => {
    const v = t(date);
    for (let i = 0; i < phases.length; i++) {
      const a = t(phases[i].start);
      const b = t(phases[i].end) + DAY;
      if (v >= a && v < b) return LEFT + i * PW + ((v - a) / (b - a)) * PW;
    }
    return v < t(phases[0].start) ? LEFT : RIGHT;
  };
  const tx = xOf(today);

  const positions = useMemo(() => {
    const out: { track: TrackId; stop: Stop; x: number; y: number }[] = [];
    for (const row of ROWS) {
      const stops = tracks[row.id].stops;
      phases.forEach((ph, pi) => {
        const inPhase = stops.filter((s) => s.phase === ph.id);
        const pad = 18;
        const step = (PW - pad * 2) / Math.max(1, inPhase.length);
        inPhase.forEach((s, si) => out.push({ track: row.id, stop: s, x: LEFT + pi * PW + pad + step * (si + 0.5), y: row.y }));
      });
    }
    return out;
  }, [tracks, phases, PW]);

  const selPhaseId = sel?.kind === "phase" ? sel.phase.id : null;
  const isSelStop = (track: TrackId, s: Stop) => sel?.kind === "stop" && sel.track === track && sel.stop.name === s.name;
  const togglePhase = (p: Phase) => setSel(selPhaseId === p.id ? null : { kind: "phase", phase: p });
  const pickStop = (track: TrackId, stop: Stop) => setSel(isSelStop(track, stop) ? null : { kind: "stop", track, stop });
  const onKey = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  return (
    <figure className="metro" style={{ margin: "32px 0 0" }}>
      <div className="metro-head">
        <div className="chips" role="group" aria-label="Show tracks">
          {ROWS.map((r) => (
            <button key={r.id} className="chip" aria-pressed={shown[r.id]} onClick={() => setShown((s) => ({ ...s, [r.id]: !s[r.id] }))}>
              <span className={`dot ${r.id}`} />
              {TRACK_NAME[r.id]}
            </button>
          ))}
        </div>
        <span className="metro-hint">Click a stop or a phase to see what&apos;s in it.</span>
      </div>

      <div className="metro-scroll">
        <div className="metro-inner">
          <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Map of the plan from October 2026 to December 2027">
            {phases.map((p, i) => {
              const x0 = LEFT + i * PW;
              const on = selPhaseId === p.id;
              return (
                <g key={p.id}>
                  <rect
                    className="phase-hit"
                    x={x0 + 2}
                    y={14}
                    width={PW - 4}
                    height={H - 40}
                    rx={12}
                    fill={on ? "var(--surface)" : "transparent"}
                    stroke={on ? "var(--line)" : "none"}
                    onClick={() => togglePhase(p)}
                  />
                  {i > 0 && <line x1={x0} x2={x0} y1={20} y2={H - 30} stroke="var(--line)" strokeDasharray="4 6" pointerEvents="none" />}
                  <g
                    className="phase-hit"
                    tabIndex={0}
                    role="button"
                    aria-label={`Phase ${p.id}: ${p.name}`}
                    aria-pressed={on}
                    onClick={() => togglePhase(p)}
                    onKeyDown={onKey(() => togglePhase(p))}
                    opacity={selPhaseId !== null && !on ? 0.4 : 1}
                  >
                    <text x={x0 + 12} y={38} fontSize="15" fontWeight="650" fill="var(--text)">
                      {p.id}. {p.name}
                    </text>
                    <text x={x0 + 12} y={56} fontSize="12" fill="var(--muted)">
                      {fmtMonth(p.start)} – {fmtMonth(p.end)}
                    </text>
                  </g>
                </g>
              );
            })}

            {ROWS.map((row) => {
              const on = shown[row.id];
              const color = `var(--${row.id})`;
              return (
                <g key={row.id} opacity={on ? 1 : 0.12} style={{ transition: "opacity .2s" }} pointerEvents={on ? "auto" : "none"}>
                  <text x={0} y={row.y + 5} fontSize="15" fontWeight="650" fill={color}>
                    {row.label}
                  </text>
                  <line x1={LEFT} x2={RIGHT} y1={row.y} y2={row.y} stroke={color} strokeOpacity="0.22" strokeWidth="6" strokeLinecap="round" />
                  <line x1={LEFT} x2={tx} y1={row.y} y2={row.y} stroke={color} strokeWidth="6" strokeLinecap="round" />
                  {positions
                    .filter((p) => p.track === row.id)
                    .map(({ stop: s, x, y }) => {
                      const selected = isSelStop(row.id, s);
                      const dim = selPhaseId !== null && selPhaseId !== s.phase;
                      const label = `${s.name}: ${STATUS_LABEL[s.status]}`;
                      return (
                        <g
                          key={s.name}
                          className="stop"
                          tabIndex={on ? 0 : -1}
                          role="button"
                          aria-label={label}
                          aria-pressed={selected}
                          opacity={dim ? 0.35 : 1}
                          onClick={() => pickStop(row.id, s)}
                          onKeyDown={onKey(() => pickStop(row.id, s))}
                          onMouseEnter={() => setHover({ x, y, text: label })}
                          onMouseLeave={() => setHover(null)}
                          onFocus={() => setHover({ x, y, text: label })}
                          onBlur={() => setHover(null)}
                        >
                          <circle cx={x} cy={y} r={16} fill="transparent" />
                          {selected && <circle cx={x} cy={y} r={13} fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="4" />}
                          <circle
                            className="ring"
                            cx={x}
                            cy={y}
                            r={s.status === "current" || selected ? 8 : 6}
                            fill={s.status === "next" ? "var(--bg)" : color}
                            stroke={s.status === "current" ? "var(--amber-line)" : color}
                            strokeWidth={s.status === "current" ? 3.5 : 2.5}
                          />
                          <text
                            x={x + 3}
                            y={y - 16}
                            fontSize="12.5"
                            fill={s.status === "next" && !selected ? "var(--muted)" : "var(--text)"}
                            fontWeight={s.status === "current" || selected ? 700 : 450}
                            transform={`rotate(-38 ${x + 3} ${y - 16})`}
                          >
                            {s.name}
                          </text>
                        </g>
                      );
                    })}
                </g>
              );
            })}

            {gates.map((g) => {
              const x = xOf(g.date);
              return (
                <g key={g.date} onMouseEnter={() => setHover({ x, y: H - 44, text: g.label })} onMouseLeave={() => setHover(null)}>
                  <rect x={x - 4} y={H - 50} width={110} height={44} fill="transparent" />
                  <path d={`M${x} ${H - 34} l0 -10 l9 4 l-9 4`} fill="var(--muted)" stroke="var(--muted)" strokeWidth="1.5" strokeLinejoin="round" />
                  <text x={x + 2} y={H - 14} fontSize="11.5" fill="var(--muted)">
                    {g.short}
                  </text>
                </g>
              );
            })}

            <g pointerEvents="none">
              <line x1={tx} x2={tx} y1={68} y2={H - 44} stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="2 4" />
              <rect x={tx - 30} y={66} width={60} height={22} rx={11} fill="var(--amber)" />
              <text x={tx} y={81} fontSize="12.5" fontWeight="650" fill="var(--amber-text)" textAnchor="middle">
                Today
              </text>
            </g>
          </svg>
          {hover && (
            <div className="tip" style={{ left: `${(hover.x / W) * 100}%`, top: `${(hover.y / H) * 100}%` }}>
              {hover.text}
            </div>
          )}
        </div>
      </div>

      {sel && <Detail sel={sel} phases={phases} groups={groups} onClose={() => setSel(null)} />}
    </figure>
  );
}

function Detail({ sel, phases, groups, onClose }: { sel: NonNullable<Sel>; phases: Phase[]; groups: Record<string, GroupProgress>; onClose: () => void }) {
  if (sel.kind === "phase") {
    const p = sel.phase;
    return (
      <div className="panel detail" aria-live="polite">
        <div>
          <div className="meta">
            Phase {p.id}, {fmtMonth(p.start)} – {fmtMonth(p.end)}
          </div>
          <h3 style={{ marginTop: 2 }}>{p.name}</h3>
          <p>{p.goal}</p>
          <p className="small">Project: {p.project}</p>
        </div>
        <button className="close" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }
  const { stop, track } = sel;
  const phase = phases.find((p) => p.id === stop.phase)!;
  const info = phase.tracks.find((x) => x.track === track);
  const group = track === "dsa" ? groups[GROUP_ALIAS[stop.name] ?? stop.name] : undefined;
  return (
    <div className="panel detail" aria-live="polite">
      <div>
        <div className="meta" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className={`dot ${track}`} />
          {TRACK_NAME[track]}, phase {phase.id} ({phase.name})
        </div>
        <h3 style={{ marginTop: 2 }}>
          {stop.name}{" "}
          {stop.status === "current" ? (
            <span className="due-pill">Now</span>
          ) : (
            <span className="small" style={{ fontWeight: 500 }}>
              {STATUS_LABEL[stop.status]}
            </span>
          )}
        </h3>
        {group && (
          <>
            <p>
              {group.done} of {group.total} solved.
              {group.problems.length === 0 && " The problem list shows up here once this group starts."}
            </p>
            {group.problems.length > 0 && (
              <div className="plist">
                {group.problems.map((pr) => (
                  <a key={pr.name} href={pr.url} className={pr.state}>
                    {pr.name}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
        {info && (
          <>
            <p className="small" style={{ marginTop: 10 }}>
              This phase: {info.topics}.
            </p>
            <p className="small" style={{ marginTop: 4 }}>
              Learn from: {info.where}. Done when: {info.doneWhen}.
            </p>
          </>
        )}
      </div>
      <button className="close" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
