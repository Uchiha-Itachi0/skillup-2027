"use client";

import { fd } from "@/lib/fmt";
import { useState } from "react";

type Entry = { date: string; track: string; title: string; body: string };
const LABEL: Record<string, string> = { dsa: "DSA", systems: "Databases & system design", ai: "AI engineering", plan: "Plan" };
const fmt = (d: string) => fd(d, "dmy");

export default function JournalList({ entries }: { entries: Entry[] }) {
  const tracks = Array.from(new Set(entries.map((e) => e.track)));
  const [on, setOn] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const shown = entries.filter(
    (e) => (!on || e.track === on) && (!query || (e.title + " " + e.body).toLowerCase().includes(query)),
  );

  return (
    <>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filter by track">
          <button className="chip solid" aria-pressed={on === null} onClick={() => setOn(null)}>
            All {entries.length}
          </button>
          {tracks.map((t) => (
            <button key={t} className="chip solid" aria-pressed={on === t} onClick={() => setOn(on === t ? null : t)}>
              <span className={`dot ${t}`} />
              {LABEL[t] ?? t} {entries.filter((e) => e.track === t).length}
            </button>
          ))}
        </div>
        <input className="search" type="search" placeholder="Search notes" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search notes" />
      </div>
      <div className="panel" style={{ padding: "4px 24px" }}>
        <ul className="entries" aria-live="polite">
          {shown.map((e) => (
            <li className="entry" key={e.date + e.title}>
              <div className="when">
                {fmt(e.date)}
                <div className="tag">
                  <span className={`dot ${e.track}`} />
                  {LABEL[e.track] ?? e.track}
                </div>
              </div>
              <div>
                <h3>{e.title}</h3>
                <p>{e.body}</p>
              </div>
            </li>
          ))}
        </ul>
        {shown.length === 0 && <p className="empty">No notes match. Clear the search or pick another track.</p>}
      </div>
    </>
  );
}
