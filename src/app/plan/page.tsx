import { fd } from "@/lib/fmt";
import type { Metadata } from "next";
import { plan, todayIST, TRACK_LABEL } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Plan · Skill-up 2027" };

export default function PlanPage() {
  const today = todayIST();
  return (
    <>
      <h1>Four phases to the end of 2027.</h1>
      <p className="lede">
        The plan runs on a topic queue, not a calendar. Busy days do the minimum; free days go further. Each phase ends
        with a small project that proves I understand the thing.
      </p>

      <section>
        {plan.phases.map((p) => {
          const state = today > p.end ? "past" : today < p.start ? "later" : "now";
          return (
            <div key={p.id} className={`phase ${state}`}>
              <div>
                <div className="num">{p.id}</div>
                <h2 style={{ marginTop: 8 }}>{p.name}</h2>
                <div className="dates">
                  {fd(p.start, "dmy")} –{" "}
                  {fd(p.end, "dmy")}
                </div>
                {state === "now" && <div className="now"><span className="due-pill">Current phase</span></div>}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 18 }}>{p.goal}</p>
                <div className="tracks">
                  {p.tracks.map((t) => (
                    <div key={t.track}>
                      <h3>
                        <span className={`dot ${t.track}`} />
                        {TRACK_LABEL[t.track]}
                      </h3>
                      <p>{t.topics}</p>
                      <p className="small" style={{ marginTop: 6 }}>{t.where}</p>
                      <p className="done-when">Done when: {t.doneWhen}</p>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: 18 }}>
                  <b>Project:</b> {p.project}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      <section>
        <h2>The rules</h2>
        <p className="sub">They exist because the gap is real: I code well with AI and not yet without it.</p>
        <ol className="rules">
          {plan.rules.map((r) => (
            <li key={r.title}>
              <b>{r.title}</b>
              <p>{r.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Three kinds of day</h2>
        <p className="sub">Pick one each morning by how much time there is. Even a minimum day keeps the streak.</p>
        <div className="daytypes">
          {plan.dayTypes.map((d) => (
            <div className="panel" key={d.name}>
              <h3>{d.name}</h3>
              <div className="small">{d.time}</div>
              <p style={{ margin: "8px 0 0" }}>{d.what}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>When the job search widens</h2>
        <ul className="todo panel">
          {plan.jobGates.map((g) => (
            <li key={g.date}>
              <span className="box" aria-hidden="true" />
              <div>
                {g.label}
                <div className="meta">From {fd(g.date, "MY")}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
