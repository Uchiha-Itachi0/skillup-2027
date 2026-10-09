import type { Metadata } from "next";
import { fmt, journal, TRACK_LABEL } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Journal · Skill-up 2027" };

export default function JournalPage() {
  return (
    <>
      <h1>What clicked.</h1>
      <p className="lede">
        One note each time something makes sense, written in my own words. Writing it down is how I check I really
        understood it.
      </p>
      <section>
        <ul className="entries sheet" style={{ padding: "4px 24px" }}>
          {journal.map((e) => (
            <li className="entry" key={e.date + e.title}>
              <div className="when">
                {fmt(e.date, { day: "numeric", month: "short", year: "numeric" })}
                <div className="tag">
                  <span className={`dot ${e.track}`} />
                  {TRACK_LABEL[e.track]}
                </div>
              </div>
              <div>
                <h3>{e.title}</h3>
                <p>{e.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
