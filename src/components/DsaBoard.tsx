"use client";

import { fd } from "@/lib/fmt";
import { useRef, useState } from "react";

type State = "todo" | "solved" | "due" | "learned";
type Group = { name: string; phase: number; problems: { name: string; url: string; state: State }[]; total: number; done: number };
type Resolve = { key: string; due: string; state: string };
type Row = { name: string; group: string; url: string; solved: string; minutes: number | null; hints: string; pattern: string; resolves: Resolve[]; state: State };

const fmt = (d: string) => fd(d);
const STATE_LABEL: Record<State, string> = { todo: "Not started", solved: "Solved, re-solves running", due: "Re-solve due", learned: "Learned" };
const FILTERS: { id: "all" | State; label: string }[] = [
  { id: "all", label: "All" },
  { id: "due", label: "Due now" },
  { id: "solved", label: "In progress" },
  { id: "learned", label: "Learned" },
];

export default function DsaBoard({ groups, rows }: { groups: Group[]; rows: Row[] }) {
  const [filter, setFilter] = useState<"all" | State>("all");
  const [picked, setPicked] = useState<string | null>(null);
  const [tip, setTip] = useState<{ group: string; x: number; y: number; text: string } | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  const visible = rows.filter((r) => filter === "all" || r.state === filter);

  function pick(name: string, state: State) {
    if (state === "todo") return;
    setFilter("all");
    setPicked(name);
    requestAnimationFrame(() => rowRefs.current[name]?.scrollIntoView({ behavior: "smooth", block: "center" }));
    window.setTimeout(() => setPicked((p) => (p === name ? null : p)), 2400);
  }

  return (
    <>
      <section>
        <h2>The map</h2>
        <p className="sub">Each square is one problem. Hover to see it; click a solved one to jump to its log line.</p>
        <div className="keyrow">
          <span><i className="cell" />Not started</span>
          <span><i className="cell solved" />Solved, re-solves running</span>
          <span><i className="cell due" />Re-solve due</span>
          <span><i className="cell learned" />Learned</span>
        </div>
        <div className="topo">
          {groups.map((g) => (
            <div className="topo-group" key={g.name}>
              <h3>
                {g.name}
                <span>
                  {g.done}/{g.total}
                </span>
              </h3>
              <div className="cells">
                {g.problems.length
                  ? g.problems.map((p) => (
                      <button
                        key={p.name}
                        className={`cell ${p.state === "todo" ? "" : p.state} ${picked === p.name ? "picked" : ""}`}
                        aria-label={`${p.name}: ${STATE_LABEL[p.state]}`}
                        onClick={() => (p.state === "todo" ? window.open(p.url, "_blank", "noopener") : pick(p.name, p.state))}
                        onMouseEnter={(e) => setTip({ group: g.name, x: e.currentTarget.offsetLeft + 10, y: e.currentTarget.offsetTop, text: `${p.name}: ${STATE_LABEL[p.state]}` })}
                        onMouseLeave={() => setTip(null)}
                        onFocus={(e) => setTip({ group: g.name, x: e.currentTarget.offsetLeft + 10, y: e.currentTarget.offsetTop, text: `${p.name}: ${STATE_LABEL[p.state]}` })}
                        onBlur={() => setTip(null)}
                      />
                    ))
                  : Array.from({ length: g.total }, (_, i) => (
                      <span key={i} className={`cell ${g.phase > 1 ? "later" : ""}`} aria-hidden="true" />
                    ))}
                {tip && tip.group === g.name && (
                  <div className="tip" style={{ left: tip.x, top: tip.y }}>
                    {tip.text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="toolbar">
          <div>
            <h2>Problem log</h2>
            <p className="sub" style={{ margin: 0 }}>
              The pattern line is mine, written right after solving. Re-solves on day 1, 3, 7 and 21.
            </p>
          </div>
          <div className="chips" role="group" aria-label="Filter problems">
            {FILTERS.map((f) => {
              const n = f.id === "all" ? rows.length : rows.filter((r) => r.state === f.id).length;
              return (
                <button key={f.id} className="chip solid" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                  {f.label} <span className="small" style={{ color: "inherit", opacity: 0.7 }}>{n}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Problem</th>
                <th>Solved</th>
                <th>Time</th>
                <th>Hints</th>
                <th>Pattern, in my words</th>
                <th>Re-solves</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.name} ref={(el) => { rowRefs.current[p.name] = el; }} className={picked === p.name ? "flash" : ""}>
                  <td>
                    <a href={p.url}>{p.name}</a>
                    <div className="small">{p.group}</div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{fmt(p.solved)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{p.minutes != null ? `${p.minutes} min` : "–"}</td>
                  <td>{p.hints}</td>
                  <td className="pattern">{p.pattern}</td>
                  <td>
                    <div className="rs">
                      {p.resolves.map((r) => (
                        <span key={r.key} className={r.state} title={`Day ${r.key.slice(1)}: ${fmt(r.due)}`}>
                          {r.key} {r.state === "passed" ? "✓" : r.state === "failed" ? "✗" : fmt(r.due)}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <p className="empty">Nothing here yet. Change the filter to see the rest.</p>}
        </div>
      </section>
    </>
  );
}
