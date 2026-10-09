import Link from "next/link";
import MetroMap from "@/components/MetroMap";
import Heatmap from "@/components/Heatmap";
import {
  ai,
  currentPhase,
  daysBetween,
  dueResolves,
  fmt,
  journal,
  nextProblems,
  profile,
  streak,
  todayIST,
  TRACK_LABEL,
  weekScore,
} from "@/lib/data";

export const revalidate = 3600;

function Stat({ n, of, label, pct }: { n: number; of?: string; label: string; pct: number }) {
  return (
    <div>
      <div className="n">
        {n}
        {of && <small> / {of}</small>}
      </div>
      <div className="k">{label}</div>
      <div className="bar" aria-hidden="true">
        <i style={{ width: `${Math.min(100, Math.round(pct * 100))}%` }} />
      </div>
    </div>
  );
}

export default function Home() {
  const today = todayIST();
  const day = daysBetween(profile.start, today) + 1;
  const total = daysBetween(profile.start, profile.goalDate) + 1;
  const phase = currentPhase(today);
  const w = weekScore(today);
  const due = dueResolves(today);
  const next = nextProblems(2);
  const aiNow = ai.path.find((p) => p.status === "current");
  const s = streak(today);

  return (
    <>
      <h1>Learning to pass interviews without AI.</h1>
      <p className="lede">{profile.why}</p>
      <div className="hero-meta">
        <span>
          Day <b>{day}</b> of {total}
        </span>
        <span>
          Phase {phase.id}, <b>{phase.name}</b>, until {fmt(phase.end)}
        </span>
        <span>
          Streak <b>{s} {s === 1 ? "day" : "days"}</b>
        </span>
      </div>

      <MetroMap today={today} />

      <section>
        <h2>This week</h2>
        <p className="sub">
          {fmt(w.from)} to {fmt(w.to)}. Targets come from the plan: 5 learning days, 4 to 8 new problems, every re-solve on
          time, 2 theory sessions, 2 learning posts.
        </p>
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
      </section>

      <section className="cols">
        <div>
          <h2>Up next</h2>
          <p className="sub">Re-solves first, on a blank file with a timer.</p>
          <ul className="todo sheet">
            {due.map(({ problem, r }) => (
              <li key={problem.name + r.key}>
                <span className="box due" aria-hidden="true" />
                <div>
                  <a href={problem.url}>{problem.name}</a>, day {r.key.slice(1)} re-solve
                  <div className="meta">
                    {r.state === "overdue" ? `Was due ${fmt(r.due)}` : <span className="mark">Due today</span>}
                  </div>
                </div>
              </li>
            ))}
            {next.map((p) => (
              <li key={p.name}>
                <span className="box" aria-hidden="true" />
                <div>
                  <a href={p.url}>{p.name}</a>
                  <div className="meta">New problem in {p.group}</div>
                </div>
              </li>
            ))}
            {aiNow && (
              <li>
                <span className="box" aria-hidden="true" />
                <div>
                  <Link href="/ai">{aiNow.learn}</Link>
                  <div className="meta">AI engineering, until {fmt(aiNow.to)}</div>
                </div>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h2>Latest notes</h2>
          <p className="sub">
            What clicked, in my own words. <Link href="/journal">All notes</Link>
          </p>
          <ul className="entries">
            {journal.slice(0, 3).map((e) => (
              <li key={e.date + e.title} style={{ padding: "14px 0", borderTop: "1px solid var(--line)" }}>
                <div className="small">
                  <span className={`dot ${e.track}`} />
                  {TRACK_LABEL[e.track]}, {fmt(e.date)}
                </div>
                <h3 style={{ marginTop: 4 }}>{e.title}</h3>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2>Every day, start to finish</h2>
        <p className="sub">One square per day until the end of 2027. Darker squares mean more got done that day.</p>
        <Heatmap today={today} />
      </section>
    </>
  );
}
