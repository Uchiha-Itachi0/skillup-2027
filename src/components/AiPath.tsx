"use client";

import { fd } from "@/lib/fmt";
import { useState } from "react";

type Step = { from: string; to: string; learn: string; build: string; question: string; status: string };
const fmt = (d: string) => fd(d);

export default function AiPath({ steps }: { steps: Step[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set(steps.filter((s) => s.status === "current").map((s) => s.from)));
  const toggle = (k: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const allOpen = open.size === steps.length;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="chip" onClick={() => setOpen(allOpen ? new Set() : new Set(steps.map((s) => s.from)))}>
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <ol className="path">
        {steps.map((p) => {
          const isOpen = open.has(p.from);
          return (
            <li key={p.from} className={p.status}>
              <button className="step" aria-expanded={isOpen} onClick={() => toggle(p.from)}>
                <span>
                  <span className="when">
                    {fmt(p.from)} – {fmt(p.to)} {p.status === "current" && <span className="due-pill">Now</span>}
                    {p.status === "done" && <span className="small"> Done</span>}
                  </span>
                  <span style={{ display: "block", fontWeight: 600 }}>{p.learn}</span>
                </span>
                <span className="chev" aria-hidden="true">
                  ▾
                </span>
              </button>
              {isOpen && (
                <div className="step-body">
                  <dl>
                    <dt>Learn</dt>
                    <dd>{p.learn}</dd>
                    <dt>Build</dt>
                    <dd>{p.build}</dd>
                  </dl>
                  <div className="q">{p.question}</div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
