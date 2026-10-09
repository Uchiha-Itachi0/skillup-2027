import type { Metadata } from "next";
import { ai, fmt } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "AI engineering · Skill-up 2027" };

export default function AiPage() {
  return (
    <>
      <h1>AI engineering, from the top down.</h1>
      <p className="lede">{ai.intro}</p>

      <section>
        <h2>Three things, nothing else</h2>
        <p className="sub">One video for the base, one book in order, one project that keeps growing.</p>
        <div className="spine">
          {ai.spine.map((s) => (
            <div className="sheet" key={s.title}>
              <div className="kind">{s.kind}</div>
              <h3 style={{ marginTop: 6 }}>{s.url ? <a href={s.url}>{s.title}</a> : s.title}</h3>
              <div className="small">{s.by}</div>
              <p style={{ margin: "10px 0 0" }}>{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>October to December</h2>
        <p className="sub">
          Each block ends with one interview question I should be able to answer out loud, using my own project and
          numbers.
        </p>
        <ol className="path">
          {ai.path.map((p) => (
            <li key={p.from} className={p.status}>
              <div className="when">
                {fmt(p.from)} – {fmt(p.to)}
                {p.status === "current" && (
                  <>
                    {" "}
                    <span className="mark">Now</span>
                  </>
                )}
              </div>
              <dl>
                <dt>Learn</dt>
                <dd>{p.learn}</dd>
                <dt>Build</dt>
                <dd>{p.build}</dd>
              </dl>
              <div className="q">{p.question}</div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>What I&apos;m skipping, and why</h2>
        <div className="cols" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {ai.skipped.map((s) => (
            <div key={s.what}>
              <h3>{s.what}</h3>
              <p className="small" style={{ fontSize: 16, margin: "4px 0 0" }}>
                {s.why}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
