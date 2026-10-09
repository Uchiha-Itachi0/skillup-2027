"use client";

import { fd } from "@/lib/fmt";
import { useState } from "react";

type Week = {
  from: string;
  to: string;
  learningDays: number;
  newProblems: number;
  resolvesDue: number;
  resolvesPassed: number;
  theory: number;
  posts: number;
};

const fmt = (d: string) => fd(d);

function Stat({ n, of, label, pct }: { n: number; of: string; label: string; pct: number }) {
  return (
    <div>
      <div className="n">
        {n}
        <small> / {of}</small>
      </div>
      <div className="k">{label}</div>
      <div className="bar" aria-hidden="true">
        <i style={{ width: `${Math.max(0, Math.min(100, Math.round(pct * 100)))}%` }} />
      </div>
    </div>
  );
}

export default function WeekScore({ weeks }: { weeks: Week[] }) {
  const [i, setI] = useState(weeks.length - 1);
  const w = weeks[i];
  const isCurrent = i === weeks.length - 1;
  return (
    <>
      <div className="week-head">
        <div>
          <h2>{isCurrent ? "This week" : `Week of ${fmt(w.from)}`}</h2>
          <p className="sub" style={{ margin: 0 }}>
            Targets: 5 learning days, 4 to 8 new problems, every re-solve on time, 2 theory sessions, 2 learning posts.
          </p>
        </div>
        <div className="stepper" role="group" aria-label="Choose week">
          <button onClick={() => setI(i - 1)} disabled={i === 0} aria-label="Previous week">
            ‹
          </button>
          <span aria-live="polite">
            {fmt(w.from)} – {fmt(w.to)}
          </span>
          <button onClick={() => setI(i + 1)} disabled={isCurrent} aria-label="Next week">
            ›
          </button>
        </div>
      </div>
      <div className="score">
        <Stat n={w.learningDays} of="5" label="Learning days" pct={w.learningDays / 5} />
        <Stat n={w.newProblems} of="4–8" label="New problems" pct={w.newProblems / 4} />
        <Stat
          n={w.resolvesPassed}
          of={String(w.resolvesDue)}
          label="Re-solves passed"
          pct={w.resolvesDue ? w.resolvesPassed / w.resolvesDue : 0}
        />
        <Stat n={w.theory} of="2" label="Theory sessions" pct={w.theory / 2} />
        <Stat n={w.posts} of="2" label="Learning posts" pct={w.posts / 2} />
      </div>
    </>
  );
}
