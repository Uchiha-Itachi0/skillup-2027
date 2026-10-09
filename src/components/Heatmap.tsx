"use client";

import { fd } from "@/lib/fmt";
import { useState } from "react";

type Entry = { kind: string; title: string; detail: string };

const DAY = 86_400_000;
const t = (d: string) => Date.parse(d + "T00:00:00Z");
const add = (d: string, n: number) => new Date(t(d) + n * DAY).toISOString().slice(0, 10);
const KIND: Record<string, string> = {
  problem: "New problem",
  resolve: "Re-solve",
  theory: "Theory",
  post: "Learning post",
  anki: "Flashcards",
  mock: "Mock interview",
};

/** One square per day from the first week to the goal date. Click a day to see what got done. */
export default function Heatmap({ start, end, today, entries }: { start: string; end: string; today: string; entries: Record<string, Entry[]> }) {
  const [sel, setSel] = useState<string | null>(entries[today] ? today : null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  const dow = new Date(t(start)).getUTCDay();
  const first = add(start, -((dow + 6) % 7));
  const days: string[] = [];
  for (let d = first; d <= end; d = add(d, 1)) days.push(d);
  const weeks = Math.ceil(days.length / 7);
  const monthAt = new Map<number, string>();
  let last = "";
  for (let w = 0; w < weeks; w++) {
    const d = days[w * 7];
    if (d.slice(0, 7) !== last) {
      monthAt.set(w, fd(d, "m"));
      last = d.slice(0, 7);
    }
  }

  const count = (d: string) => entries[d]?.length ?? 0;
  const label = (d: string) => {
    const n = count(d);
    const when = fd(d, "wdm");
    if (d > today) return `${when}: ahead`;
    return `${when}: ${n ? `${n} thing${n > 1 ? "s" : ""} done` : "nothing logged"}`;
  };

  const selEntries = sel ? entries[sel] ?? [] : [];

  return (
    <div className="heat-wrap">
      <div className="heat-scroll">
        <div style={{ position: "relative", width: "max-content" }}>
          <div className="heat-months" style={{ gridTemplateColumns: `repeat(${weeks}, 13px)` }} aria-hidden="true">
            {Array.from({ length: weeks }, (_, w) => (
              <span key={w}>{monthAt.get(w) ?? ""}</span>
            ))}
          </div>
          <div className="heat" role="grid" aria-label="Learning days, October 2026 to December 2027">
            {days.map((d, idx) => {
              if (d < start) return <span key={d} className="pad" />;
              const n = count(d);
              const future = d > today;
              const cls = [
                future ? "future" : n >= 4 ? "on3" : n >= 2 ? "on2" : n >= 1 ? "on1" : "",
                d === today ? "today" : "",
                d === sel ? "sel" : "",
              ]
                .filter(Boolean)
                .join(" ");
              const col = Math.floor(idx / 7);
              const row = idx % 7;
              return (
                <button
                  key={d}
                  className={cls}
                  aria-label={label(d)}
                  aria-pressed={d === sel}
                  disabled={future}
                  onClick={() => setSel(d === sel ? null : d)}
                  onMouseEnter={() => setTip({ x: col * 16 + 6, y: row * 16 + 18, text: label(d) })}
                  onMouseLeave={() => setTip(null)}
                  onFocus={() => setTip({ x: col * 16 + 6, y: row * 16 + 18, text: label(d) })}
                  onBlur={() => setTip(null)}
                />
              );
            })}
          </div>
          {tip && (
            <div className="tip" style={{ left: tip.x, top: tip.y }}>
              {tip.text}
            </div>
          )}
        </div>
      </div>
      <div className="heat-legend" aria-hidden="true">
        Less
        <i style={{ background: "var(--surface-2)" }} />
        <i style={{ background: "color-mix(in srgb, var(--accent) 40%, var(--surface-2))" }} />
        <i style={{ background: "color-mix(in srgb, var(--accent) 70%, var(--surface-2))" }} />
        <i style={{ background: "var(--accent)" }} />
        More
      </div>
      <div className="panel day-detail" aria-live="polite">
        {sel ? (
          <>
            <h3>{fd(sel, "WDMY")}</h3>
            {selEntries.length ? (
              <ul>
                {selEntries.map((e, i) => (
                  <li key={i}>
                    <b>{KIND[e.kind] ?? e.kind}:</b> {e.title}
                    {e.detail && <span className="small"> ({e.detail})</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small" style={{ margin: "6px 0 0" }}>
                Nothing logged this day.
              </p>
            )}
          </>
        ) : (
          <p className="small" style={{ margin: 0 }}>
            Click any day to see what got done.
          </p>
        )}
      </div>
    </div>
  );
}
