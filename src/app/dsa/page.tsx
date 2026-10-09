import type { Metadata } from "next";
import { dsa, fmt, isLearned, resolveStates, todayIST, TOTAL_PROBLEMS } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "DSA · Skill-up 2027" };

type Group = { name: string; phase: number; count?: number; problems?: { name: string; url: string }[] };

export default function DsaPage() {
  const today = todayIST();
  const byName = new Map(dsa.log.map((p) => [p.name, p]));
  const solved = dsa.log.length;
  const learned = dsa.log.filter(isLearned).length;
  const groups = dsa.groups as Group[];

  function cellClass(name: string | null, phase: number) {
    if (!name) return phase > 1 ? "cell later" : "cell";
    const p = byName.get(name);
    if (!p) return "cell";
    if (isLearned(p)) return "cell learned";
    const due = resolveStates(p, today).some((r) => r.state === "due" || r.state === "overdue");
    return due ? "cell due" : "cell solved";
  }

  return (
    <>
      <h1>NeetCode 150, one square at a time.</h1>
      <p className="lede">
        {solved} of {TOTAL_PROBLEMS} solved, {learned} learned. A problem counts as learned once its day-21 re-solve
        passes in under 25 minutes, with no AI.
      </p>

      <section>
        <h2>The map</h2>
        <div className="keyrow">
          <span><i className="cell" />Not started</span>
          <span><i className="cell solved" />Solved, re-solves running</span>
          <span><i className="cell due" />Re-solve due</span>
          <span><i className="cell learned" />Learned</span>
        </div>
        <div className="topo">
          {groups.map((g) => {
            const items = g.problems ?? Array.from({ length: g.count ?? 0 }, () => null);
            const done = (g.problems ?? []).filter((p) => byName.has(p.name)).length;
            return (
              <div className="topo-group" key={g.name}>
                <h3>
                  {g.name}
                  <span>
                    {done}/{items.length}
                  </span>
                </h3>
                <div className="cells">
                  {items.map((p, i) =>
                    p ? (
                      <a key={p.name} href={p.url} className={cellClass(p.name, g.phase)} title={p.name} aria-label={p.name} />
                    ) : (
                      <span key={i} className={cellClass(null, g.phase)} aria-hidden="true" />
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2>Problem log</h2>
        <p className="sub">
          The pattern line is written by me right after solving, in my own words. Re-solves happen on day 1, 3, 7 and
          21 after the first solve.
        </p>
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
              {[...dsa.log].reverse().map((p) => (
                <tr key={p.name}>
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
                      {resolveStates(p, today).map((r) => (
                        <span
                          key={r.key}
                          className={r.state}
                          title={`Day ${r.key.slice(1)}: ${fmt(r.due)}, ${r.state}`}
                        >
                          {r.key} {r.state === "passed" ? "✓" : r.state === "failed" ? "✗" : fmt(r.due)}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
